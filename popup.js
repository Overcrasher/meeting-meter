import { getAll } from "./lib/store.js";
import { renderDonateButtons, hasDonateLinks } from "./lib/support.js";

const $ = (id) => document.getElementById(id);
const M = globalThis.MeterCalc;
const D = globalThis.MeterDonation;
const LIVE_MS = 30000;
let state = null;
let bannerShown = false;

function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

function hoursText(h) {
  const v = Math.round(h * 10) / 10;
  return (Number.isInteger(v) ? String(v) : v.toFixed(1)) + " h";
}

function render() {
  const s = state;
  const now = Date.now();
  $("supporter").hidden = !s.supporter;
  const currency = s.settings.currency;
  const w = M.weekStats(s.meetings, now, currency);
  $("total").textContent = M.formatMoney(w.cost, w.currency || currency);
  $("summary").textContent = plural(w.count, "meeting", "meetings") + " · " + hoursText(w.hours);

  const ws = M.weekStart(now);
  const other = s.meetings.filter((r) => r && (r.counted || M.qualifies(r)) && r.start >= ws && r.currency !== currency).length;
  $("currencyNote").hidden = !other;
  if (other) $("currencyNote").textContent = "Cost covers meetings in " + currency + " only (" + other + " in other currencies).";

  const top = w.top;
  $("topBox").hidden = !top;
  $("empty").hidden = !!top;
  if (top) {
    const d = new Date(top.start);
    const day = d.toLocaleDateString(undefined, { weekday: "short" });
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    $("topCost").textContent = M.formatMoney(top.cost, top.currency || currency);
    $("topMeta").textContent = day + " " + time + " · " + M.formatDuration(top.seconds);
    const t = typeof top.title === "string" ? top.title.trim() : "";
    $("topTitle").hidden = !t;
    $("topTitle").textContent = t;
  }

  const live = s.meetings.find((r) => r && r.end === null && now - r.lastTick <= LIVE_MS);
  $("live").hidden = !live;
  if (live) $("liveText").textContent = "Live now: " + M.formatMoney(live.cost || 0, live.currency || currency) + " so far";
}

async function maybeShowBanner() {
  if (bannerShown || state.supporter) return;
  const now = Date.now();
  const dstate = Object.assign({}, state.donation, { supporter: state.supporter });
  const milestone = D.pickAsk(dstate, state.meetingsTracked, now);
  if (!milestone) return;
  if (!hasDonateLinks()) return;   // unconfigured build: don't burn the milestone
  bannerShown = true;
  const next = D.applyAsk(state.donation, milestone, now);
  state.donation = next;
  await chrome.storage.local.set({ donation: next });
  $("banner-text").textContent = "You've tracked " + state.meetingsTracked +
    " meetings with Meeting Meter. Built by one developer, no ads, no tracking. If this helped, a coffee keeps it going.";
  renderDonateButtons($("banner-buttons"), $("banner-note"));
  $("banner").hidden = false;
}

async function refresh() {
  state = await getAll();
  render();
  await maybeShowBanner();
}

function init() {
  $("banner-close").addEventListener("click", () => { $("banner").hidden = true; });
  $("banner-dismiss").addEventListener("click", () => { $("banner").hidden = true; });
  $("banner-never").addEventListener("click", async () => {
    const donation = Object.assign({}, state.donation, { dontAskAgain: true });
    state.donation = donation;
    await chrome.storage.local.set({ donation });
    $("banner").hidden = true;
  });
  $("optionsLink").addEventListener("click", () => { chrome.runtime.openOptionsPage(); window.close(); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") refresh();
  });
  setInterval(() => { if (state) render(); }, 15000);
  refresh();
}
init();
