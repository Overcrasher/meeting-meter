// Shared renderer for the donation buttons (used by popup banner and options page). ES module.
import { DONATE_LINKS, DONATE_LINKS_USD } from "../config.js";
import { formatMoney } from "./store.js";

const D = globalThis.MeterDonation; // classic script lib/donation.js, loaded by the page before this module

// Only Stripe Payment Link origins are ever opened (mirrored in tools/check_release.py).
export const ALLOWED_DONATION_ORIGINS = ["https://buy.stripe.com", "https://donate.stripe.com"];

const selected = () => D.selectLinks(navigator.language, DONATE_LINKS, DONATE_LINKS_USD);

// True if the selected link set has at least one non-empty link.
export function hasDonateLinks() {
  return D.availableKeys(selected().links).length > 0;
}

// Opens the link in a new tab; returns true if it was opened. Only Stripe Payment Links are ever opened.
function openLink(url) {
  if (!url) return false;
  let ok = false;
  try { ok = ALLOWED_DONATION_ORIGINS.includes(new URL(url).origin); } catch (e) { /* invalid */ }
  if (!ok) { console.warn("Meeting Meter: refusing to open a non-Stripe donation link"); return false; }
  chrome.tabs.create({ url });
  return true;
}

// Renders the buttons that have a link (3 fixed amounts + "Pick your own amount") into `container`.
// `note` is an element that receives the "choose the quantity" hint after the custom link is opened.
// Returns the number of buttons rendered.
export function renderDonateButtons(container, note) {
  const sel = selected();
  const sym = sel.symbol;
  const have = D.availableKeys(sel.links);
  container.textContent = "";
  const defs = [["small", 3, ""], ["medium", 5, " emphasized"], ["large", 10, ""]];
  for (const [key, amt, cls] of defs) {
    if (!have.includes(key)) continue;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "donate" + cls;
    b.textContent = sym + amt;
    b.addEventListener("click", () => openLink(sel.links[key]));
    container.appendChild(b);
  }
  if (have.includes("custom")) {
    const c = document.createElement("button");
    c.type = "button";
    c.className = "donate custom";
    c.textContent = "Pick your own amount";
    c.addEventListener("click", () => {
      if (openLink(sel.links.custom) && note) {
        note.textContent = "On the next page, choose the quantity (" + sym + "1 each).";
      }
    });
    container.appendChild(c);
  }
  return container.children.length;
}

export { formatMoney };
