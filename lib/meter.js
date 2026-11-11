// Pure meeting-cost maths. Classic script: attaches MeterCalc to globalThis. No chrome APIs.
// Used by content scripts, popup/options, the service worker (via lib/store.js) and the jsc tests.
(function (root) {
  "use strict";

  const round2 = (n) => Math.round(n * 100) / 100;
  const isNum = (n) => typeof n === "number" && isFinite(n);

  const hourlyRate = (salary) => salary / 2000;
  const costFor = (personSeconds, rate) => (personSeconds * rate) / 3600;
  const qualifies = (rec) => !!rec && rec.seconds >= 60 && rec.peak >= 2;

  // Monday 00:00 local time of the week containing nowMs. Uses calendar arithmetic (setDate), so a DST
  // change inside the week does not shift the result by an hour.
  function weekStart(nowMs) {
    const d = new Date(nowMs);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // Counted meetings of the current week. Cost (and `top`) only cover records in one currency: the one
  // passed as 3rd argument, else the most common among this week's records. count/hours cover all.
  function weekStats(meetings, nowMs, currency) {
    const ws = weekStart(nowMs);
    const week = (Array.isArray(meetings) ? meetings : []).filter((m) => m && m.counted && m.start >= ws);
    let cur = typeof currency === "string" && currency ? currency : null;
    if (!cur) {
      const tally = {};
      let best = 0;
      for (const m of week) {
        tally[m.currency] = (tally[m.currency] || 0) + 1;
        if (tally[m.currency] > best) { best = tally[m.currency]; cur = m.currency; }
      }
    }
    let seconds = 0, cost = 0, top = null;
    for (const m of week) {
      seconds += isNum(m.seconds) ? m.seconds : 0;
      if (m.currency !== cur) continue;
      cost += isNum(m.cost) ? m.cost : 0;
      if (!top || m.cost > top.cost) top = m;
    }
    return { count: week.length, hours: seconds / 3600, cost: round2(cost), currency: cur, top };
  }

  function formatMoney(amount, currency, wholeOnly, locale) {
    try {
      const opts = { style: "currency", currency };
      if (wholeOnly) opts.maximumFractionDigits = 0;
      const loc = locale || (typeof navigator !== "undefined" && navigator.language) || "en";
      return new Intl.NumberFormat(loc, opts).format(amount);
    } catch (e) {
      return (wholeOnly ? String(Math.round(amount)) : Number(amount).toFixed(2)) + " " + currency;
    }
  }

  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
  // "less than a minute", "42 minutes", "1 minute", "1 hour 5 minutes", "2 hours"
  function formatDuration(seconds) {
    if (!isNum(seconds) || seconds < 60) return "less than a minute";
    const total = Math.round(seconds / 60);
    const h = Math.floor(total / 60), m = total % 60;
    if (!h) return plural(m, "minute");
    return plural(h, "hour") + (m ? " " + plural(m, "minute") : "");
  }

  const STORE_URL = "https://chromewebstore.google.com/detail/meeting-meter/ffkniocclnaojfdcoofnjkfnihnpgnlb";
  const SHARE_URL = STORE_URL + "?utm_source=share";

  function shareText(cost, currency, seconds, locale) {
    return "This meeting cost " + formatMoney(Math.round(cost), currency, true, locale) + " and " +
      formatDuration(seconds) + " 🙃 #MeetingMeter " + SHARE_URL;
  }

  // ---- calendar time ranges ----
  const TIME = "(\\d{1,2})(?:[:.](\\d{2}))?\\s*(?:([ap])\\.?\\s?m\\.?(?![a-z]))?";
  const RANGE_RE = new RegExp("(^|[^\\d:.])" + TIME + "\\s*(?:[\\u2013\\u2014\\u2212-]|\\bto\\b|\\bpana la\\b)\\s*" + TIME + "(?![\\d:])", "i");

  function to24(h, m, mer) {
    if (m > 59) return null;
    if (mer) {
      if (h < 1 || h > 12) return null;
      return ((h % 12) + (mer === "p" ? 12 : 0)) * 60 + m;
    }
    return h > 23 ? null : h * 60 + m;
  }

  // Minutes after midnight, or null. endMin may exceed 1440 when the event crosses midnight.
  function parseTimeRange(text) {
    if (typeof text !== "string") return null;
    const s = text.replace(/[   ]/g, " ");
    const x = RANGE_RE.exec(s);
    if (!x) return null;
    const h1 = +x[2], m1 = x[3] === undefined ? 0 : +x[3], mer1 = x[4] ? x[4].toLowerCase() : null;
    const h2 = +x[5], m2 = x[6] === undefined ? 0 : +x[6], mer2 = x[7] ? x[7].toLowerCase() : null;
    let a, b;
    if (mer1 && mer2) { a = to24(h1, m1, mer1); b = to24(h2, m2, mer2); }
    else if (mer2 || mer1) {
      // One meridiem: share it with the other side when that gives start < end, else read the bare side as 24h.
      const mer = mer2 || mer1;
      if (mer2) {
        b = to24(h2, m2, mer2);
        a = to24(h1, m1, mer2);
        if (a === null || b === null || a >= b) a = to24(h1, m1, null);
      } else {
        a = to24(h1, m1, mer1);
        b = to24(h2, m2, mer);
        if (a === null || b === null || b <= a) b = to24(h2, m2, null);
      }
    } else { a = to24(h1, m1, null); b = to24(h2, m2, null); }
    if (a === null || b === null) return null;
    if (b <= a) b += 1440;
    return { startMin: a, endMin: b };
  }

  const calendarCost = (attendees, durationMinutes, rate) => attendees * (durationMinutes / 60) * rate;

  root.MeterCalc = {
    hourlyRate, costFor, qualifies, weekStart, weekStats, formatMoney, formatDuration, shareText, STORE_URL, SHARE_URL,
    parseTimeRange, calendarCost,
  };
})(globalThis);
