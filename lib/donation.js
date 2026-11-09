// Pure donation logic. Classic script on globalThis (popup/options <script> tag + jsc tests).
(function (root) {
  "use strict";

  const MILESTONES = [10, 50, 200]; // tracked meetings
  const MIN_GAP_MS = 30 * 24 * 60 * 60 * 1000;
  // Locales that use USD links (in addition to any locale whose region is US or PR).
  const USD_LOCALES = ["en-US", "es-US", "en-PR", "es-PR"];
  const KEYS = ["small", "medium", "large"];

  // state: { supporter, dontAskAgain, asked: number[], lastAskAt: number|0 }
  // Returns the milestone to ask about, or null.
  function pickAsk(state, meetingsTracked, now) {
    state = state || {};
    if (state.supporter || state.dontAskAgain) return null;
    const asked = state.asked || [];
    if (state.lastAskAt && now - state.lastAskAt < MIN_GAP_MS) return null;
    let best = null;
    for (const m of MILESTONES) {
      if (meetingsTracked >= m && !asked.includes(m)) best = m; // highest reached, unasked
    }
    return best;
  }

  // Returns a new state with `milestone` and all lower ones marked as asked.
  function applyAsk(state, milestone, now) {
    const asked = new Set((state && state.asked) || []);
    for (const m of MILESTONES) if (m <= milestone) asked.add(m);
    return Object.assign({}, state, { asked: [...asked].sort((a, b) => a - b), lastAskAt: now });
  }

  function hasAnyLink(links) {
    return !!links && Object.values(links).some((v) => typeof v === "string" && v !== "");
  }

  const filled = (links, k) => !!links && typeof links[k] === "string" && links[k] !== "";
  // Keys of `links` that have a non-empty URL (buttons for the others are hidden).
  function availableKeys(links) {
    return KEYS.filter((k) => filled(links, k));
  }

  function isUsdLocale(language) {
    if (typeof language !== "string") return false;
    const lang = language.replace("_", "-");
    if (USD_LOCALES.includes(lang)) return true;
    const region = lang.split("-").slice(1).find((p) => /^[A-Za-z]{2}$/.test(p));
    return !!region && ["US", "PR"].includes(region.toUpperCase());
  }

  // Chooses the link set: USD only if small, medium AND large USD links are set and the locale is USD.
  function selectLinks(language, eurLinks, usdLinks) {
    if (KEYS.every((k) => filled(usdLinks, k)) && isUsdLocale(language)) {
      return { currency: "USD", symbol: "$", links: usdLinks };
    }
    return { currency: "EUR", symbol: "€", links: eurLinks };
  }

  root.MeterDonation = {
    MILESTONES, MIN_GAP_MS, USD_LOCALES, KEYS, pickAsk, applyAsk, isUsdLocale, selectLinks, hasAnyLink, availableKeys,
  };
})(globalThis);
