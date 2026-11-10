# Chrome Web Store listing: Meeting Meter (v1.0.0)

Everything below is checked against manifest.json, config.js, background.js, meet.js, calendar.js, selectors.js, popup.js, options.js, README.md and PRIVACY.md. Character counts are stated next to each limited field. Copy only what is inside the code blocks.

---

## 1. Name (limit 75)

```
Meeting Meter – See what meetings cost
```
Characters: 38

## 2. Short description / summary (limit 132)

No brand names here.

```
A live cost ticker for your video calls and a cost estimate on calendar events. See what your meetings really cost.
```
Characters: 115

## 3. Detailed description (EN)

Do not list or repeat brand names in the public description or short description. The Chrome Web Store flagged that as keyword spam for Wait 24h (violation 'Yellow Argon'). Google Meet and Google Calendar appear once each, in one plain sentence under WHERE IT WORKS, because that is functionally required. Everything else says "your video call" or "your calendar".

```
Meeting Meter shows what your meetings cost, in plain numbers, while they happen.

LIVE TICKER IN YOUR VIDEO CALL
A small ticker shows "This meeting has cost €123.45" and updates every second. It follows people joining and leaving, so the number stays honest. Drag it anywhere, minimize it, or press Share to copy a one-line summary.

ESTIMATE ON YOUR CALENDAR
Open an event and you see a line like "Estimated cost: €240 · 6 people × 2 h": guests × duration × the hourly rate.

THIS WEEK AT A GLANCE
The popup adds up your week: total cost, number of meetings, hours, and your most expensive meeting.

HOW IT WORKS
• Set your yearly salary and currency in Options. The hourly rate is salary ÷ 2000 hours. It is a simple average per person, not a real payroll figure.
• A meeting counts in your history only after at least 60 seconds with at least 2 people.
• The ticker stays hidden when fewer than N people are present (you choose N). You can also turn the ticker or the calendar estimate off.

WHERE IT WORKS
Works in Google Meet and Google Calendar. Meeting Meter is an independent project, not affiliated with Google.

PRIVACY
• Everything stays on your device, in your browser's local extension storage.
• No ads, no tracking, no analytics, no accounts, and no network requests by the extension.
• It never reads or stores what is said or written in a call, chat messages or event descriptions, and it does not record audio or video.
• Meeting titles are saved only if you switch that on (off by default). Clear your history anytime in Options.

OPTIONAL SUPPORT
Meeting Meter is free and built by one developer. If it helps, you can support it with a one-time payment (€3, €5, €10, or pick your own amount) through Stripe, which opens in a new tab. The ask appears in the popup only after your 10th, 50th and 200th tracked meeting, at most once per milestone and 30 days apart. Choose "Don't ask again" and it stops for good. The same links are always available in Options. Payments happen on Stripe's page; the extension never sees them.
```
Characters: 2044 (target 1,200–1,800)

---

## 4. Romanian translation (ro)

### Name
```
Meeting Meter – Vezi cât costă ședințele
```
Characters: 40

### Short description
```
Un contor live al costului pentru apelurile video și o estimare pentru evenimentele din calendar. Vezi cât costă ședințele tale.
```
Characters: 128

### Detailed description
```
Meeting Meter îți arată, în cifre simple, cât costă ședințele tale chiar în timp ce au loc.

CONTOR LIVE ÎN APELUL VIDEO
Un mic contor afișează „This meeting has cost €123.45” și se actualizează în fiecare secundă. Ține cont de cei care intră și ies, așa că suma rămâne corectă. Îl poți trage oriunde, îl poți minimiza sau poți apăsa Share ca să copiezi un rezumat de o linie.

ESTIMARE ÎN CALENDAR
Deschide un eveniment și vezi o linie de tipul „Estimated cost: €240 · 6 people × 2 h”: invitați × durată × tariful pe oră.

SĂPTĂMÂNA ÎNTR-O PRIVIRE
Fereastra extensiei adună săptămâna (de luni până duminică): costul total, numărul de ședințe, orele petrecute în ședințe și cea mai scumpă ședință a ta.

CUM FUNCȚIONEAZĂ
• Îți setezi salariul anual și moneda în Opțiuni. Tariful pe oră este salariul ÷ 2000 de ore. Este o medie simplă pe persoană, nu o cifră reală de salarizare.
• O ședință intră în istoric doar după cel puțin 60 de secunde cu cel puțin 2 persoane.
• Contorul rămâne ascuns când sunt mai puțin de N persoane (tu alegi N). Poți opri separat contorul sau estimarea din calendar.
• Titlurile ședințelor se salvează doar dacă activezi opțiunea (dezactivată implicit).

UNDE FUNCȚIONEAZĂ
Funcționează în Google Meet și în Google Calendar. Meeting Meter este un proiect independent și nu este afiliat cu Google.

CONFIDENȚIALITATE
• Totul rămâne pe dispozitivul tău, în spațiul local de stocare al extensiei.
• Fără reclame, fără urmărire, fără analiză, fără conturi și fără cereri de rețea din partea extensiei.
• Nu citește și nu stochează ce se spune sau se scrie într-un apel, mesajele din chat sau descrierile evenimentelor și nu înregistrează audio sau video.
• Permisiuni: storage, plus acces doar la cele două site-uri. Îți poți șterge istoricul oricând din Opțiuni.

SUSȚINERE OPȚIONALĂ
Meeting Meter este gratuită și făcută de un singur dezvoltator. Dacă ți-a fost de folos, o poți susține printr-o plată unică (3 €, 5 €, 10 € sau o sumă aleasă de tine), prin Stripe, care se deschide într-o filă nouă. Propunerea apare în fereastra extensiei doar după a 10-a, a 50-a și a 200-a ședință urmărită, cel mult o dată pe prag, la minimum 30 de zile distanță. Cu „Don't ask again” se oprește definitiv. Aceleași linkuri sunt mereu în Opțiuni. Plata se face pe pagina Stripe; extensia nu o vede.

Interfața extensiei este în limba engleză.
```
Characters: 2355

---

## 5. Category and language

- Category: Productivity › Workflow & Planning ("Workflow & Planning" under Productivity; if the 2026 dashboard shows a different taxonomy, plain Productivity is the fallback). Justification: it is a tool for people who run and attend meetings.
- Language: English (default); Romanian (ro) as an added localized listing.

## 6. Single purpose statement (Privacy practices tab)

```
Meeting Meter has one purpose: to show what meetings cost. It displays a live cost ticker during a video call, adds an estimated-cost line to an open calendar event, and keeps a local weekly summary of meeting time and cost based on a salary the user enters.
```

## 7. Permission justifications

### storage
```
Stores the user's settings (yearly salary, currency, ticker position and corner, minimum number of people, on/off switches, optional "Store meeting titles"), the local meeting history (start and end times, duration, participant counts, computed cost, the meeting code used to resume a call after a short disconnect, and optional titles), the count of tracked meetings and the state of the optional support prompt. All of it is kept in chrome.storage.local on the device and is never transmitted.
```

### Host permissions
```
https://meet.google.com/* : a content script reads whether the user is in a call and the number of participants shown on the page, to display the live cost ticker and record the meeting locally. It reads nothing else on the page (no chat, captions, audio or video).
https://calendar.google.com/* : a content script reads the time range and the number of guests of an event only while its details panel is open, to show an "Estimated cost" line. Guest addresses visible on the page are used only in memory to avoid counting the same guest twice; they are never stored or sent. Event descriptions are not read.
No other sites are accessed and no tabs permission is used.
```

### Content script on the thank-you page
```
Meeting Meter declares a third, very narrow content-script match: https://overcrasher.github.io/meeting-meter/thanks.html?session_id=* . This static page is where Stripe sends a donor after an optional, voluntary payment. A tiny script there sends the Stripe session id to the extension's service worker, which accepts it only from that exact page and only if the id matches the expected format, and then sets a cosmetic local "supporter" flag (it hides the support prompts and shows a thank-you). It reads nothing else and cannot access extension storage. It is not a host permission.
```

### Are you using remote code?
Answer: **No**
```
No. All JavaScript is bundled in the extension package. It does not load or evaluate remote scripts, remote modules or WebAssembly, uses no eval, and its extension-page CSP is script-src 'self'. It makes no network requests of its own.
```

## 8. Data usage disclosures (Privacy practices tab)

Recommended answers. Reasoning: CWS defines "collect" as data transmitted off the user's device or handled by the developer. Meeting Meter never transmits anything and has no server, so strictly nothing is collected. The page content it reads (participant count, event time, guest count) is processed and stored on the device only.

Recommended checkboxes:
- Personally identifiable information: leave unchecked. Verified in selectors.js and calendar.js: guest addresses found in the open event are lower-cased into an in-memory Set purely to count unique guests (calendarGuestCount); only the resulting number is used. No name or email is written to storage, put in a message to the service worker, or sent anywhere. The Meet side reads only a participant count.
- Health information: leave unchecked
- Financial and payment information: leave unchecked (the extension never sees payment details; Stripe handles them on its own page). The user-entered salary stays local and is only used to compute the hourly rate.
- Authentication information: leave unchecked
- Personal communications: leave unchecked (chat, captions and event descriptions are not read)
- Location: leave unchecked
- Web history: leave unchecked (the only URL-derived value is the Meet meeting code, stored locally to resume a call; no browsing history is read or sent)
- User activity: leave unchecked
- Website content: TICK (participant counts, in-call state, event times and guest counts are derived from the page content; this is the honest, low-risk disclosure)

If asked, explain for "Website content": participant count, in-call state, event time and guest count are read from the page, processed on-device only, never transmitted, and used only to show the ticker and the estimate and to keep the local history. The privacy policy describes this.

Certifications (tick all three):
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

## 9. URLs

- Privacy policy URL: https://overcrasher.github.io/meeting-meter/privacy.html
- Homepage URL: https://overcrasher.github.io/meeting-meter/
- Support URL: https://github.com/Overcrasher/meeting-meter/issues (if GitHub is slow, the homepage can also be used as the support URL)

## 10. Screenshots, promo tiles and icon (upload order)

The Chrome Web Store has no per-screenshot caption field. This section documents the upload order of the files in store/images/ (produced separately).

1. screenshot-1-ticker.png: the live cost ticker in a video call
2. screenshot-2-calendar.png: the "Estimated cost" line in an open calendar event
3. screenshot-3-popup.png: the weekly summary in the popup
4. screenshot-4-options.png: the Options page (salary, ticker, calendar, history)
5. screenshot-5-privacy.png: privacy summary (everything stays on your device)

All screenshots are 1280×800.

Promo tiles: promo-small-440x280.png (440×280) and promo-marquee-1400x560.png (1400×560).

Store icon: store-icon-128.png (128×128).

## 11. Notes for the reviewer

```
Meeting Meter shows a cost ticker in Google Meet and a cost estimate in Google Calendar. No account or login is needed and nothing is sent anywhere.

Testing without a meeting partner (about 3 minutes):
1. Load the extension and pin it. Open Options (right-click the icon, Options) and set "Hide the ticker when fewer than N people" to 1. By default the ticker is hidden when fewer than 2 people are present, so a solo test shows nothing until you do this. Optionally set a yearly salary.
2. Start an instant meeting at https://meet.google.com/new (or join any call). Once you are in the call (not the pre-join screen), a small draggable ticker "This meeting has cost ..." appears within a few seconds and updates every second, with "Share" and minimize buttons. With one person the cost grows at one person's hourly rate; with N=2 (default) it appears only when someone else joins.
3. A meeting is saved to the history and counted in the popup only after at least 60 seconds with at least 2 people present, so a solo test with N=1 shows the ticker but does not add to the weekly total or the meeting counter. Anyone can verify the counting with a second browser profile or device joining the same call for a minute.
4. Calendar: open https://calendar.google.com, click any timed event to open its details panel. An "Estimated cost: €X · N people × duration" line appears under the event time (guests × duration × hourly rate). All-day and multi-day events show nothing by design. Toggle it in Options ("Show the estimate in Google Calendar").
5. The toolbar popup shows this week's total, meeting count, hours and the most expensive meeting.

Optional support: the extension is free. In the popup, a small support banner appears only after the 10th, 50th and 200th tracked meeting, at most once per milestone, at least 30 days apart, and never after "Don't ask again". To see the links without tracking 10 meetings, open Options and scroll to "Support this project": Stripe Payment Links (€3, €5, €10, "Pick your own amount") open on donate.stripe.com in a normal tab; the extension never handles payment data.

Why there is a content script on overcrasher.github.io: after a voluntary payment, Stripe redirects the donor to https://overcrasher.github.io/meeting-meter/thanks.html?session_id=... . The manifest matches only that exact URL pattern. thanks.js sends the session id to the service worker, which checks that the message comes from that exact page and that the id matches ^cs_(live|test)_[A-Za-z0-9]{20,}$, then sets a cosmetic local "supporter" flag. It is not a host permission and the script reads nothing else.

Privacy: guest addresses visible in an open calendar event are used only in memory to avoid double-counting; only the count is used. Meeting titles are stored only if the user enables "Store meeting titles" (off by default).

Permissions: storage; host access to meet.google.com and calendar.google.com. No tabs permission, no remote code, no network requests by the extension. If Google changes its page markup, the ticker or the calendar line simply does not appear (a console warning is logged); nothing breaks.
```

## 12. Pre-submission checklist

- [ ] Run `python3 tools/check_release.py --release` and confirm it exits 0 (Stripe links valid and non-test, THANKS_URL matches the manifest).
- [ ] Run the unit tests (see README) and load the unpacked folder one last time; test the ticker in a real call and the calendar line on an event.
- [ ] Run `python3 tools/package.py`, which runs the release check and writes dist/meeting-meter-<version>.zip; upload that zip.
- [ ] Confirm the manifest version is correct (1.0.0 for the first upload; bump for every later upload).
- [ ] Register a Chrome Web Store developer account (one-time US$5 fee) and verify the contact email.
- [ ] Confirm GitHub Pages is live: https://overcrasher.github.io/meeting-meter/ , privacy.html and thanks.html all open.
- [ ] Upload 5 screenshots (1280x800) in the order above, plus the small promo tile (440x280) and the marquee tile (1400x560).
- [ ] Paste name, short description, detailed description (EN and RO), category, single purpose, permission justifications, data disclosures and reviewer notes.
- [ ] Tick the three certification statements and set remote code to No.
- [ ] Set visibility (Public) and distribution regions, then submit for review.

Published store URL: https://chromewebstore.google.com/detail/meeting-meter/ffkniocclnaojfdcoofnjkfnihnpgnlb
