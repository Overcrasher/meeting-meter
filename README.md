# Meeting Meter

**Install:** [Chrome Web Store](https://chromewebstore.google.com/detail/meeting-meter/ffkniocclnaojfdcoofnjkfnihnpgnlb)

A Manifest V3 Chrome extension that shows what meetings cost. In **Google Meet** a small draggable ticker shows
"This meeting has cost €123.45", updating every second. In **Google Calendar**, an open event shows
"Estimated cost: €X". The popup summarises the week. Plain JavaScript, no build step, no libraries, no network requests.

## Install

1. **Recommended:** install from the [Chrome Web Store](https://chromewebstore.google.com/detail/meeting-meter/ffkniocclnaojfdcoofnjkfnihnpgnlb).
2. For development, load it unpacked:

   1. Open `chrome://extensions`, enable **Developer mode**.
   2. Click **Load unpacked** and pick this `meeting-meter` folder.
   3. Open Options and set your yearly salary and currency, then join a Meet call.

## How costs are computed

- `hourlyRate = salary / 2000` (defaults: salary 40000, EUR).
- Meet: cost accrues per second as `participants_now x hourlyRate / 3600`, integrated over time, so people joining
  and leaving are reflected. The stored `personSeconds` is the integral of participants over time; `cost = personSeconds x rate / 3600`.
- Calendar: `attendees x durationHours x hourlyRate`.
- A meeting counts (history, milestones) once it lasted at least 60 seconds with at least 2 participants.
- The week starts Monday 00:00 local time.

All calculations are pure functions in `lib/meter.js` (`globalThis.MeterCalc`).

## Files

| File | Purpose |
|------|---------|
| `manifest.json`, `config.js` | MV3 manifest; donation links and `THANKS_URL` |
| `background.js` | Service worker: validates every message, owns all storage writes |
| `selectors.js` | ALL Google DOM selectors (`globalThis.MeterSelectors`) |
| `meet.js`, `calendar.js` | Content scripts (ticker, calendar estimate) |
| `thanks.js` | Marks the user as a supporter on the thank-you page |
| `lib/meter.js`, `lib/validate.js`, `lib/donation.js` | Classic scripts: calculations, validation, donation rules |
| `lib/store.js`, `lib/support.js` | ES modules for extension pages: storage helpers, donate buttons |
| `popup.*`, `options.*` | Extension pages |
| `icons/`, `tools/make_icons.py` | Icons and the stdlib generator |
| `tools/check_release.py`, `tools/package.py` | Release checks and zip builder |
| `docs/` | GitHub Pages site: homepage, thank-you and privacy pages |
| `tests/run.js` | Unit tests |

## Selectors and what to do when Google changes the DOM

Google changes Meet and Calendar markup without notice. Every selector lives in `selectors.js`. When a selector
stops matching, the extension degrades gracefully: the ticker hides or the calendar line is not injected, and it logs
one `Meeting Meter: ...` warning in the page console and never throws.

To fix it: open the Meet call (or an event panel) in Chrome, inspect the element (participant count badge, in-call
indicator, event time and guest list), prefer stable attributes (`aria-label`, `data-*`, `role`) over generated class
names, update the arrays in `selectors.js` (they are tried in order), reload the extension and the tab, and check the
console for the warning.

## Tests

From this folder:

```
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/run.js
```

## Publishing the thank-you and privacy pages

The pages live in `docs/`. In the repo `Overcrasher/meeting-meter` go to **Settings -> Pages**, choose
**Deploy from a branch -> `main` -> `/docs`**. That gives:

- `https://overcrasher.github.io/meeting-meter/` (homepage)
- `https://overcrasher.github.io/meeting-meter/thanks.html`
- `https://overcrasher.github.io/meeting-meter/privacy.html`

If the repo or username changes, update `THANKS_URL` in `config.js`, the thanks match in `manifest.json`
(`content_scripts`, not a host permission) and the URL in `lib/validate.js`; `check_release.py` verifies all three.

## Stripe setup

Create 4 Payment Links in Stripe (EUR; optionally again in USD for `DONATE_LINKS_USD`). Stripe may issue them on
`buy.stripe.com` or `donate.stripe.com`; both are accepted.

The `custom` link is a 1 (EUR or USD) one-time product with **Let customers adjust quantity** enabled (min 1, max 100):
the donor sets quantity N on Stripe's page to pay N.

| Key | Type | Button |
|-----|------|--------|
| `small` | fixed price, 3 | "3" |
| `medium` | fixed price, 5 | "5" (emphasized) |
| `large` | fixed price, 10 | "10" |
| `custom` | 1 one-time product, adjustable quantity | "Pick your own amount" |

For every link, under **After payment** choose *Don't show confirmation page* and set the redirect to:

```
https://overcrasher.github.io/meeting-meter/thanks.html?session_id={CHECKOUT_SESSION_ID}
```

`thanks.js` does not touch storage: it sends `{type: "supporter", sessionId}` to the service worker, which sets
`supporter: true` only if the sender page is exactly the thanks URL and the id matches `^cs_(live|test)_[A-Za-z0-9]{20,}$`.
Asks happen after the 10th, 50th and 200th tracked meeting, once per milestone, at least 30 days apart, never for
supporters or after "Don't ask again". The supporter flag is cosmetic and works on the honour system.

## Security model

Meeting Meter is a convenience tool, not a security control.

- The service worker validates every message. Extension pages are recognised by origin; content scripts by `sender.tab`.
  The site is taken from the sender's tab URL, never from the message: Meet messages only from `meet.google.com`, calendar
  only from `calendar.google.com`, supporter only from the thanks URL. Tick/end numbers must be finite, non-decreasing
  and plausible for the elapsed time.
- `chrome.storage.local` is restricted to trusted contexts (`setAccessLevel`); content scripts never touch storage and
  get settings via messages.
- Injected UI uses a closed shadow DOM with hardened host styles; page data is only ever written with `textContent`,
  never `innerHTML`.
- Donation links must be on Stripe origins; links are only opened if http(s).
- Strict extension-page CSP, no remote code, no network requests, no `tabs` permission.
- Permissions: `storage`; host access to `https://meet.google.com/*` and `https://calendar.google.com/*`. Clipboard
  writes use `navigator.clipboard.writeText` inside the Share click (a user gesture), so no `clipboardWrite`.

## Before publishing

1. Fill the four EUR links in `config.js`.
2. `python3 tools/check_release.py --release` (without `--release` the emptiness check is skipped). It fails on non-Stripe
   links, `test_` / `TODO` / `PLACEHOLDER`, a wrong `THANKS_URL`, a missing manifest thanks match, or a thanks URL missing
   from `lib/validate.js`.
3. Run the tests.
4. `python3 tools/package.py` builds `dist/meeting-meter-<version>.zip` containing exactly the runtime files and verifies
   that manifest, HTML and import references exist (it runs the release check first; `--skip-release-check` is for test builds only).
5. Upload the zip in the Chrome Web Store dashboard; use the GitHub Pages homepage as the website and `privacy.html` as the privacy policy.

See `PRIVACY.md`: no data leaves the device.
