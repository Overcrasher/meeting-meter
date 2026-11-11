// Pure validators / sanitizers. Classic script: attaches MeterValidate to globalThis.
// Used by the service worker (via lib/store.js), the extension pages and the jsc tests.
(function (root) {
  "use strict";

  const CURRENCIES = ["EUR", "USD", "GBP", "RON", "PLN", "SEK", "NOK", "DKK", "CZK", "HUF", "CHF", "CAD", "AUD", "JPY", "INR", "MXN", "BRL", "TRY"];
  const CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const SESSION_RE = /^cs_(live|test)_[A-Za-z0-9]{20,}$/;
  const CODE_RE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  const CODE_PATH_RE = /^\/(?:meet\/)?([a-z]{3}-[a-z]{4}-[a-z]{3})(?:$|[/?#])/;
  const THANKS_PAGE = "https://overcrasher.github.io/meeting-meter/thanks.html";
  const MAX_TITLE = 200, MAX_URL = 2048, MAX_MEETINGS = 500, MAX_PEAK = 1000;
  const MAX_SALARY = 10000000;
  // Control chars, line/paragraph separators, zero-width and bidi override characters.
  const BAD_CHARS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;

  const isObj = (o) => !!o && typeof o === "object" && !Array.isArray(o);
  const isNum = (n) => typeof n === "number" && isFinite(n);
  const isInt = (n) => isNum(n) && Math.floor(n) === n;
  const round2 = (n) => Math.round(n * 100) / 100;

  function cleanTitle(s) {
    if (typeof s !== "string") return "";
    return s.replace(BAD_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, MAX_TITLE).trim();
  }
  const validCurrency = (c) => typeof c === "string" && CURRENCIES.includes(c);
  const validSession = (s) => typeof s === "string" && SESSION_RE.test(s);

  // WHATWG URL where available (browsers); minimal http(s)-only fallback for engines without it (jsc tests).
  function parseUrl(u) {
    if (typeof URL === "function") return new URL(u);
    const m = /^(https?:)\/\/([^\/?#:@\s]+)(:\d+)?(\/[^?#\s]*)?(\?[^#\s]*)?(#\S*)?$/i.exec(u);
    if (!m) throw new Error("bad url");
    const proto = m[1].toLowerCase(), host = m[2].toLowerCase(), path = m[4] || "/";
    return { protocol: proto, hostname: host, pathname: path, origin: proto + "//" + host + (m[3] || ""),
      href: proto + "//" + host + (m[3] || "") + path + (m[5] || "") + (m[6] || "") };
  }
  function parseHttps(u) {
    if (typeof u !== "string" || u.length > MAX_URL) return null;
    try {
      const x = parseUrl(u);
      return x.protocol === "https:" ? x : null;
    } catch (e) { return null; }
  }
  function isThanksUrl(u) {
    const x = parseHttps(u);
    return !!x && x.origin + x.pathname === THANKS_PAGE;
  }
  const hostIs = (u, host) => { const x = parseHttps(u); return !!x && x.hostname === host; };
  const isMeetUrl = (u) => hostIs(u, "meet.google.com");
  const isCalendarUrl = (u) => hostIs(u, "calendar.google.com");
  // "abc-defg-hij" from https://meet.google.com/abc-defg-hij?x=1, else "".
  function meetCode(u) {
    const x = parseHttps(u);
    if (!x || x.hostname !== "meet.google.com") return "";
    const m = CODE_PATH_RE.exec(x.pathname);
    return m ? m[1] : "";
  }

  // {x,y} with x,y finite in 0..1 -> {x,y}; anything else -> null.
  function cleanPos(p) {
    if (!isObj(p) || !isNum(p.x) || !isNum(p.y)) return null;
    if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return null;
    return { x: p.x, y: p.y };
  }

  const DEFAULTS = { salary: 40000, currency: "EUR", tickerCorner: "bottom-right", tickerPos: null,
    minParticipants: 2, storeTitles: false, meetEnabled: true, calendarEnabled: true };

  // Field-by-field fallback to defaults.
  function sanitizeSettings(s, defaults) {
    const d = Object.assign({}, DEFAULTS, defaults || {});
    s = isObj(s) ? s : {};
    return {
      salary: isNum(s.salary) && s.salary >= 1 && s.salary <= MAX_SALARY ? s.salary : d.salary,
      currency: validCurrency(s.currency) ? s.currency : d.currency,
      tickerCorner: CORNERS.includes(s.tickerCorner) ? s.tickerCorner : d.tickerCorner,
      tickerPos: cleanPos(s.tickerPos),
      minParticipants: isInt(s.minParticipants) && s.minParticipants >= 1 && s.minParticipants <= 50 ? s.minParticipants : d.minParticipants,
      storeTitles: typeof s.storeTitles === "boolean" ? s.storeTitles : d.storeTitles,
      meetEnabled: typeof s.meetEnabled === "boolean" ? s.meetEnabled : d.meetEnabled,
      calendarEnabled: typeof s.calendarEnabled === "boolean" ? s.calendarEnabled : d.calendarEnabled,
    };
  }

  function meetingRecord(m) {
    if (!isObj(m) || typeof m.id !== "string" || !m.id || m.id.length > 100) return null;
    if (!isNum(m.start) || m.start < 0) return null;
    if (!(m.end === null || m.end === undefined || (isNum(m.end) && m.end >= m.start))) return null;
    if (!isNum(m.seconds) || m.seconds < 0 || !isNum(m.personSeconds) || m.personSeconds < 0) return null;
    if (!isInt(m.peak) || m.peak < 0 || m.peak > MAX_PEAK) return null;
    if (!isNum(m.rate) || m.rate < 0 || !isNum(m.cost) || m.cost < 0 || !validCurrency(m.currency)) return null;
    const out = {
      id: m.id,
      code: typeof m.code === "string" && CODE_RE.test(m.code) ? m.code : "",
      tabId: isInt(m.tabId) ? m.tabId : null,
      start: m.start,
      end: m.end === undefined ? null : m.end,
      lastTick: isNum(m.lastTick) && m.lastTick >= m.start ? m.lastTick : m.start,
      seconds: m.seconds, personSeconds: m.personSeconds, peak: m.peak,
      rate: m.rate, currency: m.currency, cost: m.cost,
      counted: m.counted === true,
    };
    const t = cleanTitle(m.title);
    if (t) out.title = t;
    return out;
  }
  // Malformed records are dropped; at most the newest 500 are kept.
  function sanitizeMeetings(list) {
    return (Array.isArray(list) ? list : []).map(meetingRecord).filter(Boolean).slice(-MAX_MEETINGS);
  }

  function sanitizeDonation(d) {
    d = isObj(d) ? d : {};
    return {
      asked: Array.isArray(d.asked) ? d.asked.filter((n) => isNum(n) && n > 0) : [],
      lastAskAt: isNum(d.lastAskAt) && d.lastAskAt > 0 ? d.lastAskAt : 0,
      dontAskAgain: d.dontAskAgain === true,
    };
  }

  function sanitizeRating(d) {
    d = isObj(d) ? d : {};
    return d.shown === true ? { shown: true, at: isNum(d.at) && d.at > 0 ? d.at : 0 } : { shown: false, at: 0 };
  }

  // Pure tick check. rec: stored record; p: untrusted payload {seconds, personSeconds, peak};
  // now: ms; tabId (optional): sender tab id that must match rec.tabId.
  // Returns the fields to merge into the record, or null if the tick is invalid.
  function validateTick(rec, p, now, tabId) {
    if (!isObj(rec) || !isObj(p) || !isNum(now)) return null;
    if (tabId !== undefined && rec.tabId !== tabId) return null;
    const { seconds, personSeconds, peak } = p;
    if (!isNum(seconds) || !isNum(personSeconds) || seconds < 0 || personSeconds < 0) return null;
    if (!isInt(peak) || peak < 1 || peak > MAX_PEAK) return null;
    if (seconds < rec.seconds || personSeconds < rec.personSeconds || peak < rec.peak) return null;
    if (seconds > (now - rec.start) / 1000 + 5) return null;
    if (personSeconds > seconds * peak + 1) return null;
    const rate = isNum(rec.rate) ? rec.rate : 0;
    return {
      seconds, personSeconds, peak, lastTick: now,
      cost: round2((personSeconds * rate) / 3600),
      counted: rec.counted === true || (seconds >= 60 && peak >= 2),
    };
  }

  // Pure cleanup. Open records (end null) idle longer than staleMs are closed at lastTick (dropped if never
  // qualified); uncounted ENDED records older than resumeMs can no longer be resumed and are dropped.
  // The record `keepId` is never touched. Unchanged records keep their identity.
  function sweepMeetings(meetings, now, keepId, staleMs, resumeMs) {
    const out = [];
    for (const m of meetings) {
      if (m.id === keepId) out.push(m);
      else if (m.end === null && now - m.lastTick > staleMs) { if (m.counted) out.push(Object.assign({}, m, { end: m.lastTick })); }
      else if (m.end !== null && !m.counted && now - m.end > resumeMs) continue;
      else out.push(m);
    }
    return out;
  }

  root.MeterValidate = {
    sweepMeetings,
    CURRENCIES, CORNERS, DEFAULTS, MAX_TITLE, MAX_MEETINGS, THANKS_PAGE,
    cleanTitle, validCurrency, validSession, isThanksUrl, isMeetUrl, isCalendarUrl, meetCode, cleanPos,
    sanitizeSettings, sanitizeMeetings, meetingRecord, sanitizeDonation, sanitizeRating, validateTick,
  };
})(globalThis);
