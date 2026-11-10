// Service worker (module). Owns all mutations of meetings / settings.tickerPos / supporter.
import { getAll, mutate } from "./lib/store.js";

const V = globalThis.MeterValidate; // defined by lib/validate.js (imported through store.js)
const M = globalThis.MeterCalc; // defined by lib/meter.js (imported through store.js)
const FAIL = { ok: false };
const RESUME_MS = 5 * 60 * 1000;
const STALE_MS = 10 * 60 * 1000;
const round2 = (n) => Math.round(n * 100) / 100;

// Content scripts must not read or write storage: only trusted extension pages and this worker.
async function lockStorage() {
  try { await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" }); }
  catch (e) { console.warn("Meeting Meter: setAccessLevel failed", e); }
}
lockStorage();

// Stale-record cleanup is the pure V.sweepMeetings (lib/validate.js).
const sweepList = (meetings, now, keepId) => V.sweepMeetings(meetings, now, keepId, STALE_MS, RESUME_MS);
async function sweep() {
  await mutate(async () => {
    const { meetings } = await getAll();
    const next = sweepList(meetings, Date.now());
    if (next.length !== meetings.length || next.some((m, i) => m !== meetings[i])) {
      await chrome.storage.local.set({ meetings: next });
    }
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  lockStorage(); sweep();
  // Welcome page on a fresh install only, never on update/browser update.
  if (details && details.reason === "install") chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});
chrome.runtime.onStartup.addListener(() => { lockStorage(); sweep(); });

// ---- state pushed to content scripts ----
async function currentState() {
  const { settings } = await getAll();
  return { settings, rate: M.hourlyRate(settings.salary) };
}
async function broadcastState() {
  try {
    const state = await currentState();
    const tabs = await chrome.tabs.query({}); // no "tabs" permission: ids only, which is all we need
    for (const t of tabs) {
      if (t.id == null) continue;
      chrome.tabs.sendMessage(t.id, Object.assign({ type: "state" }, state)).catch(() => {});
    }
  } catch (e) { /* ignore */ }
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "settings" in changes) broadcastState();
});

// ---- meetings ----
async function meetingStart(msg, tab) {
  return mutate(async () => {
    const { settings, meetings: stored } = await getAll();
    const now = Date.now();
    const code = V.meetCode(tab.url);
    const title = settings.storeTitles ? V.cleanTitle(msg.title) : "";
    // Resume the latest record of this tab+code if it ended / ticked less than 5 minutes ago.
    let resumed = null;
    for (let i = stored.length - 1; i >= 0; i--) {
      const m = stored[i];
      if (m.tabId === tab.id && m.code === code) {
        const ref = m.end !== null ? m.end : m.lastTick;
        if (now - ref < RESUME_MS) resumed = m;
        break;
      }
    }
    let meetings = sweepList(stored, now, resumed ? resumed.id : undefined);
    // Any other record still open in this tab was abandoned (e.g. navigated to another call).
    meetings = meetings.flatMap((m) => {
      if (m.end !== null || m.tabId !== tab.id || (resumed && m.id === resumed.id)) return [m];
      return m.counted ? [Object.assign({}, m, { end: m.lastTick })] : [];
    });
    let rec;
    if (resumed) {
      rec = meetings.find((m) => m.id === resumed.id);
      rec.end = null;
      rec.lastTick = now;
      if (title) rec.title = title;
    } else {
      rec = { id: crypto.randomUUID(), code, tabId: tab.id, start: now, end: null, lastTick: now,
        seconds: 0, personSeconds: 0, peak: 1, rate: M.hourlyRate(settings.salary), currency: settings.currency,
        cost: 0, counted: false };
      if (title) rec.title = title;
      meetings = meetings.concat(rec).slice(-V.MAX_MEETINGS);
    }
    await chrome.storage.local.set({ meetings });
    // The counters are returned so a reloaded page can continue a resumed meeting instead of restarting at 0.
    return { ok: true, id: rec.id, seconds: rec.seconds, personSeconds: rec.personSeconds, peak: rec.peak };
  });
}

// Shared by meetingTick / meetingEnd.
async function meetingUpdate(msg, tab, ending) {
  if (typeof msg.id !== "string" || !msg.id || msg.id.length > 100) return FAIL;
  return mutate(async () => {
    const { settings, meetings, meetingsTracked } = await getAll();
    const idx = meetings.findIndex((m) => m.id === msg.id);
    if (idx < 0) return FAIL;
    const rec = meetings[idx];
    if (rec.end !== null) return ending ? { ok: true } : FAIL; // already ended
    const now = Date.now();
    const fields = V.validateTick(rec, msg, now, tab.id);
    if (!fields) return FAIL;
    const newlyCounted = !rec.counted && fields.counted;
    if (settings.storeTitles && typeof msg.title === "string") {
      const t = V.cleanTitle(msg.title);
      if (t) fields.title = t;
    }
    let next = meetings.slice();
    const updated = Object.assign({}, rec, fields);
    if (ending) {
      updated.end = now; // uncounted records are kept so a reload can resume them; sweepList prunes them later
    }
    next[idx] = updated;
    await chrome.storage.local.set({ meetings: next, meetingsTracked: meetingsTracked + (newlyCounted ? 1 : 0) });
    return { ok: true };
  });
}

async function setTickerPos(msg) {
  let pos = null;
  if (msg.pos !== null) {
    pos = V.cleanPos(msg.pos);
    if (!pos) return FAIL;
  }
  return mutate(async () => {
    const { settings } = await getAll();
    await chrome.storage.local.set({ settings: Object.assign({}, settings, { tickerPos: pos }) });
    return { ok: true };
  });
}

// ---- messages ----
// Sender classes: "extension" (popup/options pages, sender.url on our origin) and "content"
// (content scripts: sender.tab set, web url). Anything else is rejected.
function classify(sender) {
  if (!sender || sender.id !== chrome.runtime.id) return null;
  if (typeof sender.url === "string" && sender.url.startsWith("chrome-extension://" + chrome.runtime.id + "/")) {
    return { kind: "extension" };
  }
  if (sender.tab && typeof sender.tab.url === "string") return { kind: "content", tab: sender.tab, tabUrl: sender.tab.url };
  return null;
}

async function handleContent(msg, ctx) {
  if (msg.type === "supporter") {
    // Cosmetic flag, honour system: only from the real thank-you page with a Stripe-shaped session id.
    if (!V.isThanksUrl(ctx.tabUrl) || !V.validSession(msg.sessionId)) return FAIL;
    await mutate(() => chrome.storage.local.set({ supporter: true }));
    return { ok: true };
  }
  // The site comes from the sender's tab, never from the message.
  const onMeet = V.isMeetUrl(ctx.tabUrl), onCal = V.isCalendarUrl(ctx.tabUrl);
  if (!onMeet && !onCal) return FAIL;
  if (msg.type === "getState") return Object.assign({ ok: true }, await currentState());
  if (!onMeet || typeof ctx.tab.id !== "number") return FAIL;
  switch (msg.type) {
    case "meetingStart": return meetingStart(msg, ctx.tab);
    case "meetingTick": return meetingUpdate(msg, ctx.tab, false);
    case "meetingEnd": return meetingUpdate(msg, ctx.tab, true);
    case "setTickerPos": return setTickerPos(msg);
    default: return FAIL;
  }
}

async function handle(msg, sender) {
  const ctx = classify(sender);
  if (!ctx || !msg || typeof msg !== "object" || typeof msg.type !== "string") return FAIL;
  return ctx.kind === "content" ? handleContent(msg, ctx) : FAIL; // extension pages use lib/store.js directly
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handle(msg, sender).then(sendResponse).catch(() => sendResponse(FAIL));
  return true;
});
