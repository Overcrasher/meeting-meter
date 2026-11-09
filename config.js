// Donation configuration. Fill in the placeholders before publishing.
// Stripe Payment Links in EUR (buy.stripe.com or donate.stripe.com): small = EUR 3,
// medium = EUR 5 (emphasized), large = EUR 10, custom = EUR 1 product with adjustable quantity
// (the "Pick your own amount" button).
// An empty string hides that button; if no link is set at all the popup never shows the ask.
export const DONATE_LINKS = { small: "", medium: "", large: "", custom: "" };

// Optional USD set (same four links created in USD: $3 / $5 / $10 / $1 x quantity). Used only if small, medium AND large
// are all non-empty AND the browser language is a US locale (region US or PR, e.g. en-US, es-US).
export const DONATE_LINKS_USD = { small: "", medium: "", large: "", custom: "" };

// Static GitHub Pages thank-you page (served from docs/thanks.html).
// Stripe redirect for every Payment Link: https://overcrasher.github.io/meeting-meter/thanks.html?session_id={CHECKOUT_SESSION_ID}
// If the extension moves to another repo/username, change this AND the thanks.html match in
// manifest.json (content_scripts), then run tools/check_release.py.
export const THANKS_URL = "https://overcrasher.github.io/meeting-meter/thanks.html";
