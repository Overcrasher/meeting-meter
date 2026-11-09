# Privacy Policy – Meeting Meter

**No data leaves your device.**

Meeting Meter stores everything (your settings, meeting history and donation state) in your
browser's local extension storage (`chrome.storage.local`) on your device.

## What the extension reads

- On `meet.google.com`: whether you are in a call, and the number of participants. This is used
  to show the running cost ticker while you are in a call.
- On `calendar.google.com`: the time range and the number of guests of an event, only while an
  event details panel is open, to show an estimated cost.

## What it stores (on your device only)

- Meeting start and end times, duration, participant counts, and the computed cost.
- The Meet meeting code (for example `abc-defg-hij`), used to resume a meeting after a short disconnect.
- Meeting titles, only if you turn on "Store meeting titles" in Options (off by default).
- Your settings (salary, currency, ticker position and similar) and donation state.

## What it does not do

- No analytics, no tracking, no ads, no accounts.
- Nothing is sent to any server. The extension makes no network requests of its own.
- It does not read or store the content of calls, chats or event descriptions, and it does not record audio or video.

## Donations

Donation links open in a normal browser tab, at your request. Payments are handled entirely by
Stripe on its own checkout page, a separate site; the extension never sees payment details. The
optional thank-you page (hosted on GitHub Pages, so visiting it contacts GitHub) only lets the
extension learn that a checkout completed: it sets a "supporter" flag stored on your device.

## Permissions

- `storage`: keeps your settings and history on your device.
- Access to `meet.google.com` and `calendar.google.com`: needed to show the ticker and the cost
  estimate on those pages. No other sites are accessed.

You can erase your history in Options ("Clear meeting history") or all data by removing the extension.

Questions: open an issue on the project's GitHub page, https://github.com/Overcrasher/meeting-meter/issues
