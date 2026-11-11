# Chrome Web Store listing: Meeting Meter (v1.0.2)

Everything below is checked against manifest.json, config.js, background.js, meet.js, calendar.js, selectors.js, popup.js, options.js, README.md and PRIVACY.md. Character counts are stated next to each limited field. Copy only what is inside the code blocks.

---

## 1. Name and short description (shipped inside the package)

From 1.0.2 the store takes the item name (limit 75) and short summary (limit 132) from the package's `_locales/<locale>/messages.json` (`extName`, `extDescription`, referenced from manifest.json as `__MSG_extName__` and `__MSG_extDescription__`). Do NOT paste them in the dashboard. They appear in the store after the 1.0.2 review. Exact strings and character counts:

| Locale | Name | Chars | Summary | Chars |
|---|---|---|---|---|
| en | Meeting Meter – Meeting Cost Calculator for Google Meet | 55 | Meeting cost calculator for Google Meet and Google Calendar. See the live cost of every meeting, based on salary and attendees. | 127 |
| ro | Meeting Meter – Calculator de cost al ședințelor pentru Google Meet | 67 | Calculator de cost pentru ședințe în Google Meet și Google Calendar. Vezi în timp real cât costă fiecare ședință. | 113 |
| de | Meeting Meter – Meeting-Kostenrechner für Google Meet | 53 | Meeting-Kostenrechner für Google Meet und Google Kalender. Sieh live, was jedes Meeting kostet – nach Gehalt und Teilnehmerzahl. | 128 |
| fr | Meeting Meter – Calculateur du coût des réunions pour Google Meet | 65 | Calculateur du coût des réunions pour Google Meet et Google Agenda. Voyez en direct le coût de chaque réunion, selon le salaire. | 128 |
| es | Meeting Meter – Calculadora del coste de reuniones para Google Meet | 67 | Calculadora del coste de reuniones para Google Meet y Google Calendar. Mira en directo cuánto cuesta cada reunión, según el salario. | 132 |

## 2. Rules for the public descriptions

Do not list or repeat brand names in the public description or summary. The Chrome Web Store flagged that as keyword spam for Wait 24h (violation 'Yellow Argon'). In the description body, Google Meet and Google Calendar (localized: Google Kalender in de, Google Agenda in fr) each appear once, in the single "works in" sentence under WHERE IT WORKS, plus the non-affiliation sentence that mentions Google. The package name and summary (section 1) name the Google products because they are functionally required. Everything else says "your video call" or "your calendar".

## 3. Detailed description (EN)

Opening paragraph replaced for 1.0.2. The Share text already mentions the extension link (it ends with the store link).

```
Meeting Meter is a meeting cost calculator that runs live in your call. See what every meeting costs, while it happens, based on salary and the number of people in it.

LIVE TICKER IN YOUR VIDEO CALL
A small ticker shows "This meeting has cost €123.45" and updates every second. It follows people joining and leaving, so the number stays honest. Drag it anywhere, minimize it, or press Share to copy a one-line summary (with a link to the extension).

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
Characters: 2161

---

## 4. Translations (paste per language in the dashboard)

### Detailed description (ro, Romanian)

```
Meeting Meter este un calculator de cost al ședințelor care rulează live în apelul tău. Vezi cât costă fiecare ședință, chiar în timp ce are loc, în funcție de salariu și de numărul de participanți.

CONTOR LIVE ÎN APELUL VIDEO
Un mic contor afișează „This meeting has cost €123.45” și se actualizează în fiecare secundă. Ține cont de cei care intră și ies, așa că suma rămâne corectă. Îl poți trage oriunde, îl poți minimiza sau poți apăsa Share ca să copiezi un rezumat de o linie (cu un link către extensie).

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
Characters: 2490

### Detailed description (de, German)

```
Meeting Meter ist ein Meeting-Kostenrechner, der live in deinem Call läuft. Sieh, was jedes Meeting kostet, während es stattfindet – nach Gehalt und Teilnehmerzahl.

LIVE-ZÄHLER IN DEINEM VIDEOANRUF
Ein kleiner Zähler zeigt „This meeting has cost €123.45“ und aktualisiert sich jede Sekunde. Er berücksichtigt, wer beitritt und wer geht, damit die Zahl ehrlich bleibt. Ziehe ihn, wohin du willst, minimiere ihn oder drücke „Share“, um eine einzeilige Zusammenfassung zu kopieren (mit einem Link zur Erweiterung).

SCHÄTZUNG IN DEINEM KALENDER
Öffne einen Termin und du siehst eine Zeile wie „Estimated cost: €240 · 6 people × 2 h“: Gäste × Dauer × Stundensatz.

DIESE WOCHE AUF EINEN BLICK
Das Popup addiert deine Woche: Gesamtkosten, Anzahl der Meetings, Stunden und dein teuerstes Meeting.

SO FUNKTIONIERT ES
• Lege in den Optionen dein Jahresgehalt und deine Währung fest. Der Stundensatz ist das Gehalt ÷ 2000 Stunden. Das ist ein einfacher Durchschnitt pro Person, keine echte Gehaltsabrechnung.
• Ein Meeting zählt in deinem Verlauf erst nach mindestens 60 Sekunden mit mindestens 2 Personen.
• Der Zähler bleibt ausgeblendet, wenn weniger als N Personen anwesend sind (du wählst N). Du kannst den Zähler oder die Kalenderschätzung auch ausschalten.

WO ES FUNKTIONIERT
Funktioniert in Google Meet und Google Kalender. Meeting Meter ist ein unabhängiges Projekt und nicht mit Google verbunden.

DATENSCHUTZ
• Alles bleibt auf deinem Gerät, im lokalen Erweiterungsspeicher deines Browsers.
• Keine Werbung, kein Tracking, keine Analysen, keine Konten und keine Netzwerkanfragen der Erweiterung.
• Sie liest oder speichert nie, was in einem Call gesagt oder geschrieben wird, weder Chatnachrichten noch Terminbeschreibungen, und sie zeichnet weder Audio noch Video auf.
• Meeting-Titel werden nur gespeichert, wenn du das einschaltest (standardmäßig aus). Lösche deinen Verlauf jederzeit in den Optionen.

FREIWILLIGE UNTERSTÜTZUNG
Meeting Meter ist kostenlos und von einem einzelnen Entwickler gebaut. Wenn es dir hilft, kannst du es mit einer einmaligen Zahlung unterstützen (3 €, 5 €, 10 € oder einem Betrag deiner Wahl) über Stripe, das sich in einem neuen Tab öffnet. Die Bitte erscheint im Popup nur nach deinem 10., 50. und 200. erfassten Meeting, höchstens einmal pro Schwelle und mit 30 Tagen Abstand. Wähle „Don't ask again“, und sie hört für immer auf. Dieselben Links findest du immer in den Optionen. Die Zahlung läuft auf der Seite von Stripe; die Erweiterung sieht sie nie.

Die Oberfläche der Erweiterung ist auf Englisch.
```
Characters: 2543

### Detailed description (fr, French)

```
Meeting Meter est un calculateur du coût des réunions qui fonctionne en direct pendant votre appel. Voyez ce que coûte chaque réunion, pendant qu'elle a lieu, selon le salaire et le nombre de participants.

COMPTEUR EN DIRECT DANS VOTRE APPEL VIDÉO
Un petit compteur affiche « This meeting has cost €123.45 » et se met à jour chaque seconde. Il suit les personnes qui arrivent et qui partent, pour que le chiffre reste honnête. Déplacez-le où vous voulez, réduisez-le, ou appuyez sur « Share » pour copier un résumé d'une ligne (avec un lien vers l'extension).

ESTIMATION DANS VOTRE AGENDA
Ouvrez un événement et vous voyez une ligne comme « Estimated cost: €240 · 6 people × 2 h » : invités × durée × taux horaire.

LA SEMAINE EN UN COUP D'ŒIL
La fenêtre de l'extension additionne votre semaine : coût total, nombre de réunions, heures et votre réunion la plus chère.

COMMENT ÇA MARCHE
• Indiquez votre salaire annuel et votre devise dans les Options. Le taux horaire est le salaire ÷ 2000 heures. C'est une moyenne simple par personne, pas un chiffre de paie réel.
• Une réunion n'entre dans votre historique qu'après au moins 60 secondes avec au moins 2 personnes.
• Le compteur reste masqué quand il y a moins de N personnes (vous choisissez N). Vous pouvez aussi désactiver le compteur ou l'estimation de l'agenda.

OÙ ÇA FONCTIONNE
Fonctionne dans Google Meet et Google Agenda. Meeting Meter est un projet indépendant, sans affiliation avec Google.

CONFIDENTIALITÉ
• Tout reste sur votre appareil, dans le stockage local de l'extension de votre navigateur.
• Aucune publicité, aucun suivi, aucune analyse, aucun compte et aucune requête réseau de l'extension.
• Elle ne lit ni ne stocke jamais ce qui est dit ou écrit pendant un appel, ni les messages du chat, ni les descriptions d'événements, et n'enregistre ni audio ni vidéo.
• Les titres de réunion ne sont enregistrés que si vous l'activez (désactivé par défaut). Effacez votre historique à tout moment dans les Options.

SOUTIEN FACULTATIF
Meeting Meter est gratuit et conçu par un seul développeur. S'il vous est utile, vous pouvez le soutenir par un paiement unique (3 €, 5 €, 10 € ou un montant de votre choix) via Stripe, qui s'ouvre dans un nouvel onglet. La demande n'apparaît dans la fenêtre de l'extension qu'après votre 10e, 50e et 200e réunion suivie, au plus une fois par palier et à 30 jours d'intervalle. Choisissez « Don't ask again » et elle s'arrête définitivement. Les mêmes liens sont toujours dans les Options. Le paiement se fait sur la page de Stripe ; l'extension ne le voit jamais.

L'interface de l'extension est en anglais.
```
Characters: 2614

### Detailed description (es, Spanish)

```
Meeting Meter es una calculadora del coste de reuniones que funciona en directo durante tu llamada. Mira cuánto cuesta cada reunión mientras sucede, según el salario y el número de personas que participan.

CONTADOR EN DIRECTO EN TU VIDEOLLAMADA
Un pequeño contador muestra «This meeting has cost €123.45» y se actualiza cada segundo. Tiene en cuenta a quienes entran y salen, así que la cifra se mantiene honesta. Arrástralo donde quieras, minimízalo o pulsa «Share» para copiar un resumen de una línea (con un enlace a la extensión).

ESTIMACIÓN EN TU CALENDARIO
Abre un evento y verás una línea como «Estimated cost: €240 · 6 people × 2 h»: invitados × duración × tarifa por hora.

LA SEMANA DE UN VISTAZO
La ventana de la extensión suma tu semana: coste total, número de reuniones, horas y tu reunión más cara.

CÓMO FUNCIONA
• Indica tu salario anual y tu moneda en Opciones. La tarifa por hora es el salario ÷ 2000 horas. Es un promedio simple por persona, no una cifra real de nómina.
• Una reunión cuenta en tu historial solo después de al menos 60 segundos con al menos 2 personas.
• El contador permanece oculto cuando hay menos de N personas (tú eliges N). También puedes desactivar el contador o la estimación del calendario.

DÓNDE FUNCIONA
Funciona en Google Meet y Google Calendar. Meeting Meter es un proyecto independiente y no está afiliado a Google.

PRIVACIDAD
• Todo se queda en tu dispositivo, en el almacenamiento local de extensiones de tu navegador.
• Sin anuncios, sin seguimiento, sin analítica, sin cuentas y sin solicitudes de red por parte de la extensión.
• Nunca lee ni guarda lo que se dice o se escribe en una llamada, ni los mensajes del chat ni las descripciones de los eventos, y no graba audio ni vídeo.
• Los títulos de las reuniones solo se guardan si lo activas (desactivado por defecto). Borra tu historial cuando quieras en Opciones.

APOYO OPCIONAL
Meeting Meter es gratuita y la ha creado un solo desarrollador. Si te resulta útil, puedes apoyarla con un pago único (3 €, 5 €, 10 € o el importe que elijas) a través de Stripe, que se abre en una pestaña nueva. La petición aparece en la ventana de la extensión solo después de tu reunión registrada número 10, 50 y 200, como máximo una vez por hito y con 30 días de separación. Elige «Don't ask again» y se detiene para siempre. Los mismos enlaces están siempre en Opciones. El pago se hace en la página de Stripe; la extensión nunca lo ve.

La interfaz de la extensión está en inglés.
```
Characters: 2480

---

## 5. Category and language

- Category: Productivity › Workflow & Planning ("Workflow & Planning" under Productivity; if the 2026 dashboard shows a different taxonomy, plain Productivity is the fallback). Justification: it is a tool for people who run and attend meetings.
- Languages: English (default); Romanian (ro), German (de), French (fr) and Spanish (es) as added localized listings (new in 1.0.2).

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
- [ ] Paste the detailed description in each language (EN, RO, DE, FR, ES; name and short summary come from the package), category, single purpose, permission justifications, data disclosures and reviewer notes.
- [ ] Tick the three certification statements and set remote code to No.
- [ ] Set visibility (Public) and distribution regions, then submit for review.

Published store URL: https://chromewebstore.google.com/detail/meeting-meter/ffkniocclnaojfdcoofnjkfnihnpgnlb

## 13. 1.0.2 submission steps

- [ ] Upload `dist/meeting-meter-1.0.2.zip` (Package tab, upload new package).
- [ ] In Store listing, choose each language from the language dropdown (English, Romanian, German, French, Spanish) and paste its detailed description from sections 3 and 4. Name and summary are not pasted: they come from `_locales` in the package.
- [ ] Add the YouTube promo video URL if available.
- [ ] In Account, set the publisher name to Quantumbyte Labs.
- [ ] Submit for review.
