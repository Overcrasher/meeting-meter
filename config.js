// Donation configuration. Fill in the placeholders before publishing.
// Stripe Payment Links in EUR (buy.stripe.com or donate.stripe.com): small = EUR 3,
// medium = EUR 5 (emphasized), large = EUR 15 (button "Buy the team a coffee").
// An empty string hides that button; if no link is set at all the popup never shows the ask.
export const DONATE_LINKS = { small: "", medium: "", large: "" };

// Optional USD set (same three links created in USD: $3 / $5 / $15). Used only if small, medium AND large
// are all non-empty AND the browser language is a US locale (region US or PR, e.g. en-US, es-US).
export const DONATE_LINKS_USD = { small: "", medium: "", large: "" };

// Static GitHub Pages thank-you page (served from docs/thanks.html).
// If the extension moves to another repo/username, change this AND the thanks.html match in
// manifest.json (content_scripts), then run tools/check_release.py.
export const THANKS_URL = "https://overcrasher.github.io/meeting-meter/thanks.html";
