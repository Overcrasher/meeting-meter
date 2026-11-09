// ALL Google Meet / Google Calendar DOM knowledge lives here (classic script, globalThis.MeterSelectors).
// Everything is ordered fallbacks; nothing here was verified against a live page, so every helper returns
// null / false instead of throwing. Helpers take a `doc` / root element so they can be exercised on fixtures.
// Pure text helpers (no DOM) are covered by tests/run.js.
(function (root) {
  "use strict";

  const norm = (s) => String(s == null ? "" : s).replace(/[      ]/g, " ");

  // ---------- pure text helpers ----------

  // Calendar time text: unify the separators Google uses so the time-range parser sees "Monday, November 10 10:00 - 11:30am".
  function normalizeTimeText(s) {
    return norm(s)
      .replace(/[⋅·•∙・]/g, " ")
      .replace(/[‒–—―−]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  // "Meet - Weekly sync" / "Meet – Weekly sync" -> "Weekly sync". Anything else (or just a code) -> null.
  function cleanMeetTitle(s) {
    let t = norm(s).replace(/\s+/g, " ").trim();
    if (!t) return null;
    const m = /^Meet\s*[-–—]\s*(.+)$/i.exec(t);
    if (m) t = m[1].trim();
    else if (/^(google\s+)?meet$/i.test(t)) return null;
    if (!t || /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(t)) return null;
    return t.slice(0, 200);
  }

  // Guest identifier from data-hovercard-id / data-email: real people only (no rooms, no dial-ins).
  function guestId(v) {
    const id = norm(v).trim().toLowerCase();
    if (!id || id.indexOf("@") < 0) return null;
    if (/@resource\.calendar\.google\.com$/.test(id)) return null;
    if (/^\d+@/.test(id)) return null;
    return id;
  }

  // "5 guests" / "12 invitați" style summary line -> 5. Deliberately a word list so "10 minutes before" never matches.
  const GUEST_WORDS = /^(\d{1,4})\s+(guests?|attendees?|participants?|people|persons?|invita\S*|invit\S*|gaste|gäste|invitados?|convidados?|osoby|osob|vendeg\S*|ospiti)\b/i;
  function guestSummary(s) {
    const m = GUEST_WORDS.exec(norm(s).trim());
    return m ? +m[1] : null;
  }

  // Digits-only badge text -> integer >= 1 (else null).
  function badgeNumber(s) {
    const m = /^\s*(\d{1,4})\s*$/.exec(norm(s));
    return m && +m[1] >= 1 ? +m[1] : null;
  }

  function hasTimeRange(text) {
    const C = root.MeterCalc;
    const t = normalizeTimeText(text);
    if (C && C.parseTimeRange) return C.parseTimeRange(t) !== null;
    return /\d{1,2}(:\d{2})?\s*(am|pm)?\s*-\s*\d{1,2}(:\d{2})?\s*(am|pm)?/i.test(t) && /:|am|pm/i.test(t);
  }

  // ---------- Meet ----------
  const ICON_SEL = ".google-symbols, .material-icons, .material-icons-extended, .material-symbols-outlined, .material-symbols-rounded, .google-material-icons";
  const IN_CALL_ONLY = ["chat", "closed_caption_off", "closed_caption", "translate_cc", "present_to_all", "back_hand", "mood"];
  const CODE_PATH = /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:$|[/?#])/;

  function iconSet(doc) {
    const set = new Set();
    let n = 0;
    for (const el of doc.querySelectorAll(ICON_SEL)) {
      if (++n > 400) break;
      const t = (el.textContent || "").trim();
      if (t && t.length < 40) set.add(t);
    }
    return set;
  }

  // Which strategy says we are in a call: "icons" | "label" | "tiles" | null.
  function meetInCallVia(doc, loc) {
    try {
      const icons = iconSet(doc);
      if (icons.has("call_end") && IN_CALL_ONLY.some((n) => icons.has(n))) return "icons";
      // Label fallback only when the call_end ligature is absent entirely (icon font changed): call_end without
      // an in-call-only icon is the lobby, and the lobby may carry the same label.
      if (!icons.has("call_end")) try {
        if (doc.querySelector('button[aria-label*="Leave call" i], [role="button"][aria-label*="Leave call" i]')) return "label";
      } catch (e) { /* bad selector in old engines */ }
      if (icons.has("call_end") || doc.querySelector("[data-call-ended]")) return null;
      const path = loc && loc.pathname ? loc.pathname : "";
      if (CODE_PATH.test(path) && doc.querySelector("[data-participant-id]")) return "tiles";
      return null;
    } catch (e) { return null; }
  }
  const meetInCall = (doc, loc) => meetInCallVia(doc, loc) !== null;

  // Root of the open People panel (null when closed / unknown).
  function peoplePanel(doc) {
    try {
      return doc.querySelector('[data-panel-id="1"]') || doc.querySelector('[role="tabpanel"]') || null;
    } catch (e) { return null; }
  }

  function countPanelRows(doc) {
    const panel = peoplePanel(doc);
    if (!panel) return null;
    const ids = new Set();
    for (const row of panel.querySelectorAll('[role="listitem"]')) {
      const id = row.getAttribute("data-participant-id") || row.getAttribute("aria-label");
      if (id) ids.add(id);
    }
    return ids.size || null;
  }

  function countBadge(doc) {
    for (const ic of doc.querySelectorAll(ICON_SEL)) {
      if ((ic.textContent || "").trim() !== "people") continue;
      const btn = ic.closest('button, [role="button"]');
      if (!btn) continue;
      for (const scope of [btn, btn.parentElement]) {
        if (!scope) continue;
        for (const el of scope.querySelectorAll("*")) {
          if (el.children.length) continue;
          const n = badgeNumber(el.textContent);
          if (n) return n;
        }
      }
    }
    return null;
  }

  function countTiles(doc) {
    const panel = peoplePanel(doc);
    const ids = new Set();
    for (const el of doc.querySelectorAll("[data-participant-id]")) {
      if (panel && panel.contains(el)) continue;
      ids.add(el.getAttribute("data-participant-id"));
    }
    return ids.size || null;
  }

  // Never opens the people panel. Returns an integer >= 1 or null.
  function meetParticipantCount(doc) {
    for (const f of [countPanelRows, countBadge, countTiles]) {
      try { const n = f(doc); if (n) return n; } catch (e) { /* next strategy */ }
    }
    return null;
  }

  function meetTitle(doc) {
    try {
      const el = doc.querySelector("[data-meeting-title]");
      if (el) {
        const t = norm(el.getAttribute("data-meeting-title") || el.textContent).replace(/\s+/g, " ").trim();
        if (t && !/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(t)) return t.slice(0, 200);
      }
    } catch (e) { /* next */ }
    try {
      const el = doc.querySelector(".u6vdEc");
      const t = el && norm(el.textContent).replace(/\s+/g, " ").trim();
      if (t && !/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(t)) return t.slice(0, 200);
    } catch (e) { /* next */ }
    try { return cleanMeetTitle(doc.title); } catch (e) { return null; }
  }

  // ---------- Calendar ----------
  const QUICK_CREATE = '[role="tabpanel"][aria-labelledby="tabEvent"]';
  const EVENT_MARKERS = "[data-hovercard-id], [data-email], #xDetDlg, #xDetDlgWhen, #xDetDlgAtt";

  function isQuickCreate(dlg) {
    try { return !!dlg.querySelector(QUICK_CREATE); } catch (e) { return false; }
  }

  // Deepest element whose own text holds a time range; then climb <= 3 levels (while the text stays short)
  // so the date part ("Monday, November 10") is included. Returns {el, text} or null.
  function timeElement(dlg) {
    try {
      let best = null;
      const all = dlg.querySelectorAll("*");
      let n = 0;
      for (const el of all) {
        if (++n > 3000) break;
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
        const t = el.textContent || "";
        if (t.length > 160 || !hasTimeRange(t)) continue;
        let deeper = false;
        for (const c of el.children) { if (hasTimeRange(c.textContent || "")) { deeper = true; break; } }
        if (!deeper) { best = el; break; }
      }
      if (!best) return null;
      let el = best;
      for (let i = 0; i < 3; i++) {
        const p = el.parentElement;
        if (!p || p === dlg || !dlg.contains(p) || (p.textContent || "").length > 100) break;
        el = p;
      }
      return { el, text: normalizeTimeText(el.textContent) };
    } catch (e) { return null; }
  }

  // The event-details dialog: a [role=dialog] with a parseable time range that is not the quick-create dialog,
  // else #xDetDlg. Returns {dialog, time} or null.
  function calendarDialog(doc) {
    try {
      for (const d of doc.querySelectorAll('[role="dialog"]')) {
        if (isQuickCreate(d)) continue;
        const time = timeElement(d);
        if (time) return { dialog: d, time };
      }
      const x = doc.querySelector("#xDetDlg");
      if (x) {
        const time = timeElement(x);
        if (time) return { dialog: x, time };
      }
    } catch (e) { /* fall through */ }
    return null;
  }

  // True when a dialog that looks like an event popover is open but we could not read a time from it
  // (used for the single "Google Calendar may have changed" warning).
  function calendarUnreadableDialog(doc) {
    try {
      for (const d of doc.querySelectorAll('[role="dialog"]')) {
        if (isQuickCreate(d)) continue;
        if (d.querySelector(EVENT_MARKERS) && !timeElement(d)) return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  // Number of real attendees (organizer and viewer included) or null when unknown.
  function calendarGuestCount(dlg) {
    try {
      const ids = new Set();
      for (const el of dlg.querySelectorAll("[data-hovercard-id], [data-email]")) {
        const id = guestId(el.getAttribute("data-hovercard-id")) || guestId(el.getAttribute("data-email"));
        if (id) ids.add(id);
      }
      if (ids.size) return ids.size;
    } catch (e) { /* next */ }
    try {
      const att = dlg.querySelector("#xDetDlgAtt") || (dlg.id === "xDetDlgAtt" ? dlg : null);
      if (att && att.children.length) return att.children.length;
    } catch (e) { /* next */ }
    try {
      for (const el of dlg.querySelectorAll("div, span")) {
        if (el.children.length) continue;
        const n = guestSummary(el.textContent);
        if (n) return n;
      }
    } catch (e) { /* null */ }
    return null;
  }

  root.MeterSelectors = {
    // pure helpers
    normalizeTimeText, cleanMeetTitle, guestId, guestSummary, badgeNumber, hasTimeRange,
    meet: { inCall: meetInCall, inCallVia: meetInCallVia, participantCount: meetParticipantCount, title: meetTitle },
    calendar: { dialog: calendarDialog, timeElement, guestCount: calendarGuestCount, unreadableDialog: calendarUnreadableDialog },
  };
})(globalThis);
