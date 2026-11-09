// Content script for Google Calendar: adds an "Estimated cost" line to the open event-details popover.
// All Google DOM knowledge is in selectors.js; storage is owned by the service worker (we only message it).
(() => {
  "use strict";
  const S = globalThis.MeterSelectors, C = globalThis.MeterCalc;
  if (!S || !C) return;
  if (globalThis.__meetingMeterCal) return;
  globalThis.__meetingMeterCal = true;

  const THROTTLE_MS = 300;
  const WARN = "Meeting Meter: couldn't read this event's details — Google Calendar may have changed.";

  let settings = { currency: "EUR", calendarEnabled: true };
  let rate = 20;
  let ready = false, dead = false, warned = false, misses = 0;
  let current = null; // { host, anchor, key, parts }
  let observer = null, pending = null, lastRun = 0;

  function shutdown() {
    if (dead) return;
    dead = true;
    try { if (observer) observer.disconnect(); } catch (e) { /* ignore */ }
    if (pending) clearTimeout(pending);
    removeLine();
  }
  function send(msg) {
    try {
      if (!chrome.runtime || !chrome.runtime.id) { shutdown(); return Promise.resolve(null); }
      return chrome.runtime.sendMessage(msg).catch((e) => {
        if (/context invalidated/i.test(String(e && e.message))) shutdown();
        return null;
      });
    } catch (e) {
      if (/context invalidated/i.test(String(e && e.message))) shutdown();
      return Promise.resolve(null);
    }
  }
  function applyState(d) {
    if (!d || typeof d !== "object") return;
    if (d.settings && typeof d.settings === "object") settings = Object.assign({}, settings, d.settings);
    if (typeof d.rate === "number" && isFinite(d.rate)) rate = d.rate;
    ready = true;
    schedule();
  }

  // ---------- injected line ----------
  const HOST_STYLE = "display: block !important; position: static !important; float: none !important; margin: 4px 0 !important; " +
    "padding: 0 !important; width: auto !important; height: auto !important; max-height: none !important; overflow: visible !important; " +
    "opacity: 1 !important; visibility: visible !important; transform: none !important; background: none !important; border: 0 !important;";
  const CSS = `
    .line { display: flex; align-items: baseline; gap: 8px; font: inherit; color: inherit; line-height: 1.4; }
    .dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: #F5A524; align-self: center; }
    .money { font-weight: 600; }
    .muted { opacity: .65; }
  `;

  function mk(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildLine() {
    const host = document.createElement("div");
    host.setAttribute("data-meeting-meter", "");
    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = CSS;
    const line = mk("div", "line");
    const dot = mk("span", "dot");
    const text = mk("span", "");
    const money = mk("span", "money", "");
    const muted = mk("span", "muted", "");
    text.append(money, muted);
    line.append(dot, text);
    shadow.append(style, line);
    host.style.cssText = HOST_STYLE;
    return { host, money, muted };
  }

  function removeLine() {
    try { if (current && current.host.parentNode) current.host.parentNode.removeChild(current.host); } catch (e) { /* ignore */ }
    current = null;
  }

  function duration(min) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    if (!h) return m + " min";
    return h + " h" + (m ? " " + m + " min" : "");
  }

  function show(anchor, cost, guests, minutes) {
    const key = [cost.toFixed(4), guests, minutes, settings.currency].join("|");
    const intact = current && current.host.isConnected && current.anchor === anchor && anchor.nextSibling === current.host;
    if (intact && current.key === key) return;
    if (!intact) {
      removeLine();
      const b = buildLine();
      current = { host: b.host, anchor, key: "", money: b.money, muted: b.muted };
      anchor.insertAdjacentElement("afterend", b.host);
    }
    current.key = key;
    current.host.style.cssText = HOST_STYLE;
    current.money.textContent = "Estimated cost: " + C.formatMoney(cost, settings.currency, cost >= 100);
    current.muted.textContent = " · " + guests + (guests === 1 ? " person" : " people") + " × " + duration(minutes);
  }

  // ---------- scan ----------
  function run() {
    pending = null;
    lastRun = Date.now();
    if (dead) return;
    try {
      if (!ready || !settings.calendarEnabled) { removeLine(); return; }
      const found = S.calendar.dialog(document);
      if (!found) {
        removeLine();
        if (S.calendar.unreadableDialog(document)) {
          if (++misses >= 5 && !warned) { warned = true; try { console.warn(WARN); } catch (e) { /* ignore */ } }
        } else misses = 0;
        return;
      }
      misses = 0;
      const range = C.parseTimeRange(found.time.text);
      if (!range) { removeLine(); return; } // all-day / multi-day: normal, say nothing
      const minutes = range.endMin - range.startMin;
      if (!(minutes > 0)) { removeLine(); return; }
      const guests = Math.max(1, S.calendar.guestCount(found.dialog) || 1);
      show(found.time.el, C.calendarCost(guests, minutes, rate), guests, minutes);
    } catch (e) { /* never throw */ }
  }

  function schedule() {
    if (dead || pending) return;
    const wait = Math.max(0, THROTTLE_MS - (Date.now() - lastRun));
    pending = setTimeout(run, wait);
  }

  function init() {
    try {
      chrome.runtime.onMessage.addListener((msg, sender) => {
        if (!sender || sender.id !== chrome.runtime.id || sender.tab) return;
        if (msg && msg.type === "state") applyState(msg);
      });
    } catch (e) { shutdown(); return; }
    send({ type: "getState" }).then((r) => { if (r && r.ok) applyState(r); });
    try {
      observer = new MutationObserver(schedule);
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
    } catch (e) { /* ignore */ }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });
  }

  init();
})();
