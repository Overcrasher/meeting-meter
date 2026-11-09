// Content script for Google Meet: tracks the call and shows the floating cost ticker.
// All Google DOM knowledge is in selectors.js; storage is owned by the service worker (we only message it).
(() => {
  "use strict";
  const S = globalThis.MeterSelectors, C = globalThis.MeterCalc;
  if (!S || !C) return;
  if (globalThis.__meetingMeterMeet) return; // never run twice in one page
  globalThis.__meetingMeterMeet = true;

  const POLL_MS = 1000, TICK_MS = 15000, UNKNOWN_AFTER_MS = 10000;
  const DT_CAP_S = 5, DT_CAP_HIDDEN_S = 70; // hidden tabs get throttled timers, so allow longer gaps there
  const WARN = "Meeting Meter: couldn't read the participant count — Google Meet may have changed; the ticker is hidden.";

  let settings = { currency: "EUR", tickerCorner: "bottom-right", tickerPos: null, minParticipants: 2, storeTitles: false, meetEnabled: true, calendarEnabled: true };
  let rate = 20;
  let ready = false, dead = false, warned = false;

  // call state
  let pos = 0, neg = 0;            // consecutive positive / negative in-call checks
  let active = false, starting = false, id = null;
  let seconds = 0, personSeconds = 0, peak = 1;
  let lastTs = 0, lastCount = 0, lastCountTs = 0, countUnknown = false, wasHidden = false;
  let nextTickAt = 0, nextStartAt = 0;
  let timer = null;

  // ---------- messaging ----------
  function shutdown() {
    if (dead) return;
    dead = true;
    if (timer) clearInterval(timer);
    removeTicker();
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
    renderTicker();
  }

  // ---------- accounting ----------
  const clampPeak = (n) => Math.max(1, Math.min(1000, Math.floor(n)));
  function counters(extra) {
    const o = { id, seconds, personSeconds, peak };
    if (settings.storeTitles) { const t = S.meet.title(document); if (t) o.title = t; }
    return Object.assign(o, extra);
  }
  function seed(r) {
    seconds = Number(r.seconds) || 0;
    personSeconds = Number(r.personSeconds) || 0;
    peak = clampPeak(Number(r.peak) || 1);
  }

  async function start() {
    if (starting || active || Date.now() < nextStartAt) return;
    starting = true;
    try {
      const msg = { type: "meetingStart" };
      if (settings.storeTitles) { const t = S.meet.title(document); if (t) msg.title = t; }
      const r = await send(msg);
      if (dead) return;
      if (!r || !r.ok || typeof r.id !== "string") { nextStartAt = Date.now() + 5000; return; }
      id = r.id;
      seed(r);
      const now = Date.now();
      lastTs = now; lastCount = 0; lastCountTs = now; countUnknown = false; wasHidden = document.hidden;
      nextTickAt = now + TICK_MS;
      active = true;
      neg = 0;
    } finally { starting = false; }
  }

  async function tick() {
    if (!active || !id) return;
    nextTickAt = Date.now() + TICK_MS;
    const r = await send(Object.assign({ type: "meetingTick" }, counters()));
    if (dead || !active) return;
    if (r && r.ok === false) { // SW does not know / accept this record: start again and re-seed from its answer
      active = false; id = null;
      await start();
    }
  }

  function end() {
    if (!active || !id) { active = false; id = null; return; }
    const msg = Object.assign({ type: "meetingEnd" }, counters());
    active = false; id = null;
    seconds = 0; personSeconds = 0; peak = 1; lastCount = 0;
    send(msg);
    renderTicker();
  }

  // ---------- poll ----------
  function poll() {
    if (dead) return;
    try {
      const now = Date.now();
      const inCall = S.meet.inCall(document, location);
      if (inCall) { pos++; neg = 0; } else { neg++; pos = 0; }

      if (!active) {
        if (pos >= 2 && ready && settings.meetEnabled) start();
        renderTicker();
        return;
      }
      if (neg >= 3 || !settings.meetEnabled) {
        end();
        return;
      }

      const dt = Math.max(0, Math.min((now - lastTs) / 1000, (document.hidden || wasHidden) ? DT_CAP_HIDDEN_S : DT_CAP_S));
      lastTs = now; wasHidden = document.hidden;

      // Accrue with the count we knew during the elapsed interval, then read the new one.
      if (!countUnknown && lastCount > 0 && dt > 0) {
        seconds += dt;
        personSeconds += lastCount * dt;
      }
      const c = S.meet.participantCount(document);
      if (c) {
        lastCount = c; lastCountTs = now; countUnknown = false;
        peak = Math.max(peak, clampPeak(c));
      } else if (now - lastCountTs > UNKNOWN_AFTER_MS) {
        countUnknown = true;
        lastCount = 0;
        if (!warned) { warned = true; try { console.warn(WARN); } catch (e) { /* ignore */ } }
      }
      if (now >= nextTickAt) tick();
      renderTicker();
    } catch (e) { /* never throw out of the poll */ }
  }

  // ---------- ticker ----------
  let host = null, shadow = null, els = null, collapsed = false;

  const HOST_STYLE = "all: initial !important; position: fixed !important; z-index: 2147483647 !important; " +
    "display: block !important; width: max-content !important; height: auto !important; margin: 0 !important; padding: 0 !important; " +
    "border: 0 !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; " +
    "transform: none !important; contain: none !important; filter: none !important;";

  const CSS = `
    :host { all: initial; }
    .pill { box-sizing: border-box; background: #14213D; color: #fff; border-radius: 14px; padding: 10px 12px 10px 14px;
      font: 13px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; font-variant-numeric: tabular-nums;
      box-shadow: 0 6px 20px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.4); cursor: grab; user-select: none; -webkit-user-select: none;
      touch-action: none; display: flex; align-items: center; gap: 12px; min-width: 0; }
    .pill.dragging { cursor: grabbing; }
    .pill.min { padding: 6px 12px; cursor: pointer; }
    .txt { display: flex; flex-direction: column; gap: 2px; }
    .l1 { white-space: nowrap; }
    .amt { color: #F5A524; font-weight: 700; font-size: 15px; margin-left: 4px; }
    .l2 { font-size: 11px; opacity: .75; white-space: nowrap; }
    .btns { display: flex; align-items: center; gap: 6px; }
    button { all: initial; box-sizing: border-box; font: 600 11px/1 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #fff;
      background: rgba(255,255,255,.14); border-radius: 8px; padding: 6px 9px; cursor: pointer; white-space: nowrap; }
    button:hover { background: rgba(255,255,255,.26); }
    button:focus-visible { outline: 2px solid #F5A524; outline-offset: 1px; }
    .min .lead, .min .l2, .min .btns { display: none !important; }
    .min .amt { margin: 0; }
    .hide { display: none !important; }
  `;

  function mk(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildTicker() {
    host = document.createElement("div");
    host.setAttribute("data-meeting-meter", "");
    shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = CSS;
    const pill = mk("div", "pill");
    const txt = mk("div", "txt");
    const l1 = mk("div", "l1");
    const lead = mk("span", "lead", "This meeting has cost");
    const amt = mk("span", "amt", "");
    l1.append(lead, amt);
    const l2 = mk("div", "l2", "");
    txt.append(l1, l2);
    const btns = mk("div", "btns");
    const share = mk("button", "", "Share");
    share.type = "button";
    share.setAttribute("aria-label", "Copy a shareable summary of this meeting's cost");
    const min = mk("button", "", "–");
    min.type = "button";
    min.setAttribute("aria-label", "Minimize the ticker");
    btns.append(share, min);
    pill.append(txt, btns);
    shadow.append(style, pill);
    els = { pill, amt, l2, share, min, lead };

    let shareTimer = null;
    share.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const flash = (t) => {
        share.textContent = t;
        clearTimeout(shareTimer);
        shareTimer = setTimeout(() => { share.textContent = "Share"; }, 1500);
      };
      try {
        const text = C.shareText(C.costFor(personSeconds, rate), settings.currency, seconds);
        navigator.clipboard.writeText(text).then(() => flash("Copied!"), () => flash("Copy failed"));
      } catch (e) { flash("Copy failed"); }
    });
    min.addEventListener("click", (ev) => { ev.stopPropagation(); collapsed = true; renderTicker(); });

    // Drag by the pill body (buttons excluded). A click without movement on the collapsed pill expands it.
    let drag = null;
    pill.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0 || (ev.target && ev.target.closest && ev.target.closest("button"))) return;
      const r = host.getBoundingClientRect();
      drag = { dx: ev.clientX - r.left, dy: ev.clientY - r.top, sx: ev.clientX, sy: ev.clientY, moved: false };
      try { pill.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
    });
    pill.addEventListener("pointermove", (ev) => {
      if (!drag) return;
      if (!drag.moved && Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) < 4) return;
      drag.moved = true;
      pill.classList.add("dragging");
      place(ev.clientX - drag.dx, ev.clientY - drag.dy);
    });
    const finish = (ev) => {
      if (!drag) return;
      const d = drag; drag = null;
      pill.classList.remove("dragging");
      try { pill.releasePointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
      if (d.moved) {
        const r = host.getBoundingClientRect();
        const p = { x: clamp01(r.left / innerWidth), y: clamp01(r.top / innerHeight) };
        settings = Object.assign({}, settings, { tickerPos: p });
        send({ type: "setTickerPos", pos: p });
      } else if (collapsed) { collapsed = false; renderTicker(); }
    };
    pill.addEventListener("pointerup", finish);
    pill.addEventListener("pointercancel", finish);
  }

  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)));

  function place(left, top) {
    const w = host.offsetWidth || 200, h = host.offsetHeight || 50;
    const l = clamp(left, 0, innerWidth - w), t = clamp(top, 0, innerHeight - h);
    host.style.setProperty("left", l + "px", "important");
    host.style.setProperty("top", t + "px", "important");
  }

  function position() {
    const w = host.offsetWidth || 200, h = host.offsetHeight || 50;
    const p = settings.tickerPos;
    if (p && typeof p.x === "number" && typeof p.y === "number") return place(p.x * innerWidth, p.y * innerHeight);
    const corner = String(settings.tickerCorner || "bottom-right");
    const left = corner.endsWith("left") ? 16 : innerWidth - w - 16;
    const top = corner.startsWith("top") ? 16 : innerHeight - h - 88;
    place(left, top);
  }

  function removeTicker() {
    try { if (host && host.parentNode) host.parentNode.removeChild(host); } catch (e) { /* ignore */ }
    host = null; shadow = null; els = null;
  }

  const pad = (n) => (n < 10 ? "0" : "") + n;
  function clock(s) {
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? h + ":" + pad(m) + ":" + pad(sec) : pad(m) + ":" + pad(sec);
  }

  function shouldShow() {
    return active && settings.meetEnabled && !countUnknown && lastCount > 0 &&
      lastCount >= (Number(settings.minParticipants) || 1);
  }

  function renderTicker() {
    if (dead) return;
    try {
      if (!shouldShow()) {
        if (host) host.style.setProperty("display", "none", "important");
        return;
      }
      if (!host || !els) buildTicker();
      if (!host.isConnected) (document.documentElement || document.body).appendChild(host); // self-heal
      host.style.cssText = HOST_STYLE; // undo anything the page did to the host's inline style
      els.pill.classList.toggle("min", collapsed);
      els.amt.textContent = C.formatMoney(C.costFor(personSeconds, rate), settings.currency);
      els.l2.textContent = lastCount + (lastCount === 1 ? " person" : " people") + " · " + clock(seconds);
      els.min.setAttribute("aria-label", "Minimize the ticker");
      position();
    } catch (e) { /* never throw */ }
  }

  // ---------- lifecycle ----------
  function init() {
    try {
      chrome.runtime.onMessage.addListener((msg, sender) => {
        if (!sender || sender.id !== chrome.runtime.id || sender.tab) return; // only from our service worker
        if (msg && msg.type === "state") applyState(msg);
      });
    } catch (e) { shutdown(); return; }
    send({ type: "getState" }).then((r) => { if (r && r.ok) applyState(r); });

    timer = setInterval(poll, POLL_MS);

    document.addEventListener("visibilitychange", () => {
      if (dead) return;
      if (document.hidden) { if (active) tick(); } else poll();
    });
    window.addEventListener("pagehide", () => {
      if (dead) return;
      if (active && id) { end(); } // final counters, fire and forget
    });
    window.addEventListener("pageshow", (ev) => { if (ev.persisted) { pos = 0; neg = 0; } });
    window.addEventListener("resize", () => { if (host && els && shouldShow()) position(); });
    try {
      // Self-heal if the page removes our host element (cheap: direct children of <html> only).
      new MutationObserver(() => {
        if (!dead && host && !host.isConnected) renderTicker();
      }).observe(document.documentElement, { childList: true });
    } catch (e) { /* ignore */ }
  }

  init();
})();
