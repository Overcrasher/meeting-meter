// Shared storage helpers (ES module, used by background, popup, options).
import "./validate.js"; // classic script: defines globalThis.MeterValidate
import "./meter.js"; // classic script: defines globalThis.MeterCalc
const V = globalThis.MeterValidate;
const M = globalThis.MeterCalc;

export const DEFAULT_SETTINGS = Object.freeze(Object.assign({}, V.DEFAULTS));
export const DEFAULT_DONATION = Object.freeze({ asked: [], lastAskAt: 0, dontAskAgain: false });
export const CURRENCIES = V.CURRENCIES.slice();

// Reads everything with defaults applied and sanitized (fresh install safe).
export async function getAll() {
  const d = await chrome.storage.local.get(["settings", "meetings", "meetingsTracked", "donation", "supporter", "rating"]);
  const n = d.meetingsTracked;
  return {
    settings: V.sanitizeSettings(d.settings, DEFAULT_SETTINGS),
    meetings: V.sanitizeMeetings(d.meetings),
    meetingsTracked: typeof n === "number" && isFinite(n) && n > 0 ? Math.floor(n) : 0,
    donation: V.sanitizeDonation(d.donation),
    supporter: d.supporter === true,
    rating: V.sanitizeRating(d.rating),
  };
}

// Serializes read-modify-write operations within one context.
let chain = Promise.resolve();
export function mutate(fn) {
  const p = chain.then(fn);
  chain = p.catch(() => {});
  return p;
}

export const formatMoney = (amount, currency, wholeOnly, locale) => M.formatMoney(amount, currency, wholeOnly, locale);
