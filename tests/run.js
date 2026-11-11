// Run from the meeting-meter folder:  jsc tests/run.js
load("lib/meter.js");
load("lib/donation.js");
load("lib/rating.js");
load("lib/validate.js");
load("selectors.js");

let pass = 0, fail = 0;
const failures = [];
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++; else { fail++; failures.push(name + ": got " + g + " want " + w); }
}
const C = MeterCalc, D = MeterDonation, V = MeterValidate;
const near = (name, got, want) => eq(name, Math.abs(got - want) < 1e-9, true);

// ---- rates, cost, qualifies
eq("rate 40000", C.hourlyRate(40000), 20);
eq("rate 100000", C.hourlyRate(100000), 50);
near("cost 1h x 1 person", C.costFor(3600, 20), 20);
near("cost 2 people 30min", C.costFor(3600, 20), 20);
near("cost zero", C.costFor(0, 20), 0);
near("cost 10 people 1h", C.costFor(36000, 20), 200);
eq("qualifies yes", C.qualifies({ seconds: 60, peak: 2 }), true);
eq("qualifies short", C.qualifies({ seconds: 59, peak: 2 }), false);
eq("qualifies alone", C.qualifies({ seconds: 600, peak: 1 }), false);
eq("qualifies null", C.qualifies(null), false);

// ---- weekStart (local time)
const lt = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h || 0, mi || 0, 0, 0).getTime();
// 2026-11-09 is a Monday
eq("weekStart monday noon", C.weekStart(lt(2026, 11, 9, 12)), lt(2026, 11, 9));
eq("weekStart monday 00:00", C.weekStart(lt(2026, 11, 9, 0, 0)), lt(2026, 11, 9));
eq("weekStart monday 00:01", C.weekStart(lt(2026, 11, 9, 0, 1)), lt(2026, 11, 9));
eq("weekStart sunday 23:59", C.weekStart(lt(2026, 11, 15, 23, 59)), lt(2026, 11, 9));
eq("weekStart sunday->monday", C.weekStart(lt(2026, 11, 16, 0, 0)), lt(2026, 11, 16));
eq("weekStart sunday 00:00", C.weekStart(lt(2026, 11, 15, 0, 0)), lt(2026, 11, 9));
eq("weekStart wednesday", C.weekStart(lt(2026, 11, 11, 15, 30)), lt(2026, 11, 9));
eq("weekStart saturday", C.weekStart(lt(2026, 11, 14, 8)), lt(2026, 11, 9));
eq("weekStart across month", C.weekStart(lt(2026, 12, 2, 10)), lt(2026, 11, 30));
eq("weekStart across year", C.weekStart(lt(2027, 1, 1, 10)), lt(2026, 12, 28));
eq("weekStart is local midnight", new Date(C.weekStart(lt(2026, 11, 12, 9))).getHours(), 0);
// DST: weeks containing a spring/autumn change (EU: 2026-03-29, 2026-10-25; US: 2026-03-08, 2026-11-01)
eq("weekStart EU spring after change", C.weekStart(lt(2026, 3, 30, 12)), lt(2026, 3, 30));
eq("weekStart EU spring Sunday of change", C.weekStart(lt(2026, 3, 29, 12)), lt(2026, 3, 23));
eq("weekStart EU autumn Sunday of change", C.weekStart(lt(2026, 10, 25, 12)), lt(2026, 10, 19));
eq("weekStart EU autumn Sunday late", C.weekStart(lt(2026, 10, 25, 23, 30)), lt(2026, 10, 19));
eq("weekStart US spring Sunday", C.weekStart(lt(2026, 3, 8, 12)), lt(2026, 3, 2));
eq("weekStart US spring Friday after", C.weekStart(lt(2026, 3, 13, 12)), lt(2026, 3, 9));
eq("weekStart US autumn Sunday", C.weekStart(lt(2026, 11, 1, 12)), lt(2026, 10, 26));
eq("weekStart DST midnight hour", new Date(C.weekStart(lt(2026, 3, 29, 12))).getHours(), 0);
eq("weekStart DST week after, hour", new Date(C.weekStart(lt(2026, 3, 31, 12))).getHours(), 0);

// ---- weekStats
const NOW = lt(2026, 11, 12, 12); // Thursday
const WS = lt(2026, 11, 9);
const mk = (o) => Object.assign({ id: "x", start: WS + 3600000, end: WS + 7200000, seconds: 3600, personSeconds: 7200,
  peak: 2, rate: 20, currency: "EUR", cost: 40, counted: true }, o);
const ms = [
  mk({ id: "a", cost: 40 }),
  mk({ id: "b", cost: 100, seconds: 1800 }),
  mk({ id: "c", cost: 5, counted: false }),
  mk({ id: "d", cost: 999, start: WS - 1000 }),
  mk({ id: "e", cost: 12.345, currency: "USD", seconds: 900 }),
  mk({ id: "f", cost: 7, currency: "EUR", seconds: 0 }),
];
let st = C.weekStats(ms, NOW);
eq("week count", st.count, 4);
eq("week currency (most common)", st.currency, "EUR");
eq("week cost eur", st.cost, 147);
near("week hours", st.hours, (3600 + 1800 + 900 + 0) / 3600);
eq("week top id", st.top.id, "b");
st = C.weekStats(ms, NOW, "USD");
eq("week usd count includes all", st.count, 4);
eq("week usd cost", st.cost, 12.35);
eq("week usd top", st.top.id, "e");
st = C.weekStats(ms, NOW, "GBP");
eq("week gbp cost", st.cost, 0);
eq("week gbp top", st.top, null);
st = C.weekStats([], NOW);
eq("week empty", st, { count: 0, hours: 0, cost: 0, currency: null, top: null });
eq("week non-array", C.weekStats(null, NOW).count, 0);
eq("week boundary exact", C.weekStats([mk({ start: WS })], NOW).count, 1);
eq("week boundary before", C.weekStats([mk({ start: WS - 1 })], NOW).count, 0);
eq("week only uncounted", C.weekStats([mk({ counted: false })], NOW).count, 0);
eq("week next-week still counts later", C.weekStats([mk({})], lt(2026, 11, 15, 23, 0)).count, 1);
eq("week next-week excluded", C.weekStats([mk({})], lt(2026, 11, 16, 0, 1)).count, 0);

// ---- formatDuration / shareText / formatMoney
eq("dur 0", C.formatDuration(0), "less than a minute");
eq("dur 59", C.formatDuration(59), "less than a minute");
eq("dur 60", C.formatDuration(60), "1 minute");
eq("dur 42m", C.formatDuration(42 * 60), "42 minutes");
eq("dur 59m", C.formatDuration(59 * 60), "59 minutes");
eq("dur 1h", C.formatDuration(3600), "1 hour");
eq("dur 1h5", C.formatDuration(3900), "1 hour 5 minutes");
eq("dur 1h1", C.formatDuration(3660), "1 hour 1 minute");
eq("dur 2h", C.formatDuration(7200), "2 hours");
eq("dur 2h30", C.formatDuration(9000), "2 hours 30 minutes");
eq("dur rounds", C.formatDuration(125), "2 minutes");
eq("dur NaN", C.formatDuration(NaN), "less than a minute");
eq("money en eur", C.formatMoney(123.45, "EUR", false, "en"), "€123.45");
eq("money en eur whole", C.formatMoney(187.4, "EUR", true, "en"), "€187");
eq("money en usd", C.formatMoney(5, "USD", false, "en-US"), "$5.00");
eq("money gbp", C.formatMoney(1234.5, "GBP", false, "en"), "£1,234.50");
eq("money bad currency fallback", C.formatMoney(5, "??", false, "en"), "5.00 ??");
eq("money bad currency whole fallback", C.formatMoney(5.4, "??", true, "en"), "5 ??");
eq("share basic", C.shareText(187, "EUR", 42 * 60, "en"), "This meeting cost €187 and 42 minutes 🙃 #MeetingMeter " + C.STORE_URL + "?utm_source=share");
eq("share rounds cost", C.shareText(187.6, "EUR", 3600, "en"), "This meeting cost €188 and 1 hour 🙃 #MeetingMeter " + C.STORE_URL + "?utm_source=share");
eq("share url exact", C.SHARE_URL, C.STORE_URL + "?utm_source=share");
eq("store url exact", C.STORE_URL, "https://chromewebstore.google.com/detail/meeting-meter/ffkniocclnaojfdcoofnjkfnihnpgnlb");
eq("share short", C.shareText(3, "USD", 30, "en"), "This meeting cost $3 and less than a minute 🙃 #MeetingMeter " + C.STORE_URL + "?utm_source=share");

// ---- parseTimeRange
const R = (t) => C.parseTimeRange(t);
const rng = (a, b) => ({ startMin: a, endMin: b });
eq("tr en dash", R("10:00 – 11:00"), rng(600, 660));
eq("tr end am", R("10:00 – 11:30am"), rng(600, 690));
eq("tr both am no minutes", R("10am – 11:30am"), rng(600, 690));
eq("tr pm end only", R("9:30 – 10:15 PM"), rng(21 * 60 + 30, 22 * 60 + 15));
eq("tr 24h no spaces", R("14:00–15:30"), rng(840, 930));
eq("tr hyphen", R("10:00 - 11:00"), rng(600, 660));
eq("tr a.m.", R("10:00 a.m. – 11:00 a.m."), rng(600, 660));
eq("tr p.m.", R("1:00 p.m. – 2:30 p.m."), rng(780, 870));
eq("tr romanian", R("10:00 – 11:00"), rng(600, 660));
eq("tr weekday date en", R("Monday, November 10⋅10:00 – 11:00am"), rng(600, 660));
eq("tr weekday date ro", R("luni, 10 noiembrie⋅10:00–11:00"), rng(600, 660));
eq("tr bare hour start", R("10 – 11:30am"), rng(600, 690));
eq("tr 11:30 - 1pm", R("11:30 – 1pm"), rng(690, 780));
eq("tr noon", R("11:30am – 12:30pm"), rng(690, 750));
eq("tr 12am start", R("12:00am – 1:00am"), rng(0, 60));
eq("tr 12pm", R("12pm – 1pm"), rng(720, 780));
eq("tr crosses midnight 24h", R("23:00 – 00:30"), rng(1380, 1470));
eq("tr crosses midnight pm-am", R("11:00pm – 1:00am"), rng(1380, 1500));
eq("tr end == start", R("10:00 – 10:00"), rng(600, 2040));
eq("tr nbsp", R("10:00 – 11:00"), rng(600, 660));
eq("tr narrow nbsp pm", R("9:30 – 10:15 PM"), rng(1290, 1335));
eq("tr em dash", R("10:00—11:00"), rng(600, 660));
eq("tr word to", R("10:00 to 11:00"), rng(600, 660));
eq("tr uppercase AM", R("9:00 AM – 10:00 AM"), rng(540, 600));
eq("tr pm both", R("2pm – 3:30pm"), rng(840, 930));
eq("tr extra text after", R("Tuesday, November 11⋅9:00 – 9:45am⋅Weekly"), rng(540, 585));
eq("tr all-day", R("All day"), null);
eq("tr all-day with date", R("Monday, November 10"), null);
eq("tr empty", R(""), null);
eq("tr null", R(null), null);
eq("tr number", R(5), null);
eq("tr single time", R("10:00"), null);
eq("tr bad hour", R("25:00 – 26:00"), null);
eq("tr bad minute", R("10:75 – 11:00"), null);
eq("tr 13pm invalid", R("13pm – 14pm"), null);

// ---- calendarCost
near("cal 4 x 1h x 20", C.calendarCost(4, 60, 20), 80);
near("cal 3 x 30m x 50", C.calendarCost(3, 30, 50), 75);
near("cal 0 attendees", C.calendarCost(0, 60, 20), 0);
near("cal 10 x 90m x 20", C.calendarCost(10, 90, 20), 300);

// ---- MeterDonation
const DAY = 86400000, T0 = 1700000000000;
const fresh = () => ({ supporter: false, dontAskAgain: false, asked: [], lastAskAt: 0 });
eq("milestones", D.MILESTONES, [10, 50, 200]);
eq("fresh below 10", D.pickAsk(fresh(), 9, T0), null);
eq("at 10", D.pickAsk(fresh(), 10, T0), 10);
let ds = D.applyAsk(fresh(), 10, T0);
eq("applyAsk asked", ds.asked, [10]);
eq("applyAsk lastAskAt", ds.lastAskAt, T0);
eq("same milestone again", D.pickAsk(ds, 49, T0 + 100 * DAY), null);
eq("next within 30 days", D.pickAsk(ds, 60, T0 + 10 * DAY), null);
eq("gap exactly 30 days", D.pickAsk(ds, 60, T0 + 30 * DAY), 50);
eq("gap 29 days", D.pickAsk(ds, 60, T0 + 29 * DAY), null);
eq("next after 30 days", D.pickAsk(ds, 60, T0 + 31 * DAY), 50);
let ds2 = D.applyAsk(ds, 50, T0 + 31 * DAY);
eq("asked 10,50", ds2.asked, [10, 50]);
eq("200 after gap", D.pickAsk(ds2, 250, T0 + 100 * DAY), 200);
eq("200 not yet", D.pickAsk(ds2, 199, T0 + 100 * DAY), null);
let j = D.applyAsk(fresh(), D.pickAsk(fresh(), 300, T0), T0);
eq("jump to 300 picks 200", D.pickAsk(fresh(), 300, T0), 200);
eq("jump marks lower asked", j.asked, [10, 50, 200]);
eq("after jump nothing", D.pickAsk(j, 999, T0 + 365 * DAY), null);
eq("supporter never", D.pickAsk(Object.assign(fresh(), { supporter: true }), 600, T0), null);
eq("dontAskAgain never", D.pickAsk(Object.assign(fresh(), { dontAskAgain: true }), 600, T0), null);
eq("pickAsk null state", D.pickAsk(null, 10, T0), 10);
eq("applyAsk keeps other fields", D.applyAsk({ dontAskAgain: false, asked: [], lastAskAt: 0, x: 1 }, 10, 5).x, 1);
eq("keys", D.availableKeys({ small: "a", medium: "", large: "c", custom: "d" }), ["small", "large", "custom"]);
eq("keys custom only", D.availableKeys({ small: "", medium: "", large: "", custom: "d" }), ["custom"]);
eq("keys all", D.availableKeys({ small: "a", medium: "b", large: "c", custom: "d" }), ["small", "medium", "large", "custom"]);
eq("keys none", D.availableKeys({ small: "", medium: "", large: "", custom: "" }), []);
eq("keys null", D.availableKeys(null), []);
eq("hasAnyLink no", D.hasAnyLink({ small: "", medium: "", large: "", custom: "" }), false);
eq("hasAnyLink yes", D.hasAnyLink({ small: "", medium: "x", large: "" }), true);
eq("usd en-US", D.isUsdLocale("en-US"), true);
eq("usd es-US", D.isUsdLocale("es-US"), true);
eq("usd en-PR", D.isUsdLocale("en-PR"), true);
eq("usd zh-Hans-US", D.isUsdLocale("zh-Hans-US"), true);
eq("usd underscore", D.isUsdLocale("en_US"), true);
eq("usd en-GB", D.isUsdLocale("en-GB"), false);
eq("usd en", D.isUsdLocale("en"), false);
eq("usd ro-RO", D.isUsdLocale("ro-RO"), false);
eq("usd non-string", D.isUsdLocale(undefined), false);
const EUR = { small: "e1", medium: "e2", large: "e3", custom: "e4" };
const USD = { small: "u1", medium: "u2", large: "u3", custom: "u4" };
eq("select usd", D.selectLinks("en-US", EUR, USD), { currency: "USD", symbol: "$", links: USD });
eq("select eur non-us", D.selectLinks("en-GB", EUR, USD).currency, "EUR");
eq("select eur if usd incomplete", D.selectLinks("en-US", EUR, { small: "u1", medium: "", large: "u3" }).currency, "EUR");
eq("select usd without custom", D.selectLinks("en-US", EUR, { small: "u1", medium: "u2", large: "u3", custom: "" }).currency, "USD");
eq("select eur if usd empty", D.selectLinks("en-US", EUR, { small: "", medium: "", large: "" }).symbol, "€");

// ---- MeterValidate: settings
const DEF = { salary: 40000, currency: "EUR", tickerCorner: "bottom-right", tickerPos: null, minParticipants: 2,
  storeTitles: false, meetEnabled: true, calendarEnabled: true };
eq("settings undefined", V.sanitizeSettings(undefined, DEF), DEF);
eq("settings array", V.sanitizeSettings([], DEF), DEF);
eq("settings no defaults arg", V.sanitizeSettings({}), DEF);
eq("settings kept", V.sanitizeSettings({ salary: 90000, currency: "USD", tickerCorner: "top-left", tickerPos: { x: 0.5, y: 0.25 },
  minParticipants: 5, storeTitles: true, meetEnabled: false, calendarEnabled: false }, DEF),
  { salary: 90000, currency: "USD", tickerCorner: "top-left", tickerPos: { x: 0.5, y: 0.25 }, minParticipants: 5,
    storeTitles: true, meetEnabled: false, calendarEnabled: false });
eq("settings salary zero", V.sanitizeSettings({ salary: 0 }, DEF).salary, 40000);
eq("settings salary negative", V.sanitizeSettings({ salary: -5 }, DEF).salary, 40000);
eq("settings salary huge", V.sanitizeSettings({ salary: 10000001 }, DEF).salary, 40000);
eq("settings salary max", V.sanitizeSettings({ salary: 10000000 }, DEF).salary, 10000000);
eq("settings salary min", V.sanitizeSettings({ salary: 1 }, DEF).salary, 1);
eq("settings salary string", V.sanitizeSettings({ salary: "5" }, DEF).salary, 40000);
eq("settings salary NaN", V.sanitizeSettings({ salary: NaN }, DEF).salary, 40000);
eq("settings currency lower", V.sanitizeSettings({ currency: "eur" }, DEF).currency, "EUR");
eq("settings currency unknown", V.sanitizeSettings({ currency: "XYZ" }, DEF).currency, "EUR");
eq("settings currency RON", V.sanitizeSettings({ currency: "RON" }, DEF).currency, "RON");
eq("settings corner bad", V.sanitizeSettings({ tickerCorner: "middle" }, DEF).tickerCorner, "bottom-right");
eq("settings pos out of range", V.sanitizeSettings({ tickerPos: { x: 1.5, y: 0.5 } }, DEF).tickerPos, null);
eq("settings pos negative", V.sanitizeSettings({ tickerPos: { x: -0.1, y: 0.5 } }, DEF).tickerPos, null);
eq("settings pos strings", V.sanitizeSettings({ tickerPos: { x: "0.5", y: 0.5 } }, DEF).tickerPos, null);
eq("settings pos edge", V.sanitizeSettings({ tickerPos: { x: 0, y: 1, z: 9 } }, DEF).tickerPos, { x: 0, y: 1 });
eq("settings minPart float", V.sanitizeSettings({ minParticipants: 2.5 }, DEF).minParticipants, 2);
eq("settings minPart zero", V.sanitizeSettings({ minParticipants: 0 }, DEF).minParticipants, 2);
eq("settings minPart 51", V.sanitizeSettings({ minParticipants: 51 }, DEF).minParticipants, 2);
eq("settings minPart 50", V.sanitizeSettings({ minParticipants: 50 }, DEF).minParticipants, 50);
eq("settings minPart 1", V.sanitizeSettings({ minParticipants: 1 }, DEF).minParticipants, 1);
eq("settings bool coerced", V.sanitizeSettings({ storeTitles: "yes", meetEnabled: 0, calendarEnabled: null }, DEF),
  Object.assign({}, DEF));
eq("settings field-by-field", V.sanitizeSettings({ salary: 50000, currency: "bad", minParticipants: 3 }, DEF).salary, 50000);
eq("settings drops unknown keys", Object.keys(V.sanitizeSettings({ evil: 1 }, DEF)).length, 8);

// ---- MeterValidate: meetings
const rec = { id: "a1", code: "abc-defg-hij", tabId: 7, start: 1000, end: null, lastTick: 2000, seconds: 60, personSeconds: 120,
  peak: 2, rate: 20, currency: "EUR", cost: 0.67, counted: true };
eq("meeting keeps good", V.sanitizeMeetings([rec]), [rec]);
eq("meeting title cleaned", V.sanitizeMeetings([Object.assign({}, rec, { title: "  Weekly‮ sync​\n" })])[0].title, "Weekly sync");
eq("meeting empty title dropped", "title" in V.sanitizeMeetings([Object.assign({}, rec, { title: "  ​ " })])[0], false);
eq("meeting non-string title", "title" in V.sanitizeMeetings([Object.assign({}, rec, { title: 5 })])[0], false);
eq("meeting bad code blanked", V.sanitizeMeetings([Object.assign({}, rec, { code: "<x>" })])[0].code, "");
eq("meeting bad tabId nulled", V.sanitizeMeetings([Object.assign({}, rec, { tabId: "7" })])[0].tabId, null);
eq("meeting missing id", V.sanitizeMeetings([Object.assign({}, rec, { id: "" })]), []);
eq("meeting numeric id", V.sanitizeMeetings([Object.assign({}, rec, { id: 5 })]), []);
eq("meeting bad start", V.sanitizeMeetings([Object.assign({}, rec, { start: "1" })]), []);
eq("meeting NaN seconds", V.sanitizeMeetings([Object.assign({}, rec, { seconds: NaN })]), []);
eq("meeting negative cost", V.sanitizeMeetings([Object.assign({}, rec, { cost: -1 })]), []);
eq("meeting bad currency", V.sanitizeMeetings([Object.assign({}, rec, { currency: "xx" })]), []);
eq("meeting float peak", V.sanitizeMeetings([Object.assign({}, rec, { peak: 2.5 })]), []);
eq("meeting huge peak", V.sanitizeMeetings([Object.assign({}, rec, { peak: 1001 })]), []);
eq("meeting end before start", V.sanitizeMeetings([Object.assign({}, rec, { end: 500 })]), []);
eq("meeting end ok", V.sanitizeMeetings([Object.assign({}, rec, { end: 3000 })])[0].end, 3000);
eq("meeting end undefined -> null", V.sanitizeMeetings([Object.assign({}, rec, { end: undefined })])[0].end, null);
eq("meeting lastTick missing", V.sanitizeMeetings([Object.assign({}, rec, { lastTick: undefined })])[0].lastTick, 1000);
eq("meeting counted coerced", V.sanitizeMeetings([Object.assign({}, rec, { counted: "yes" })])[0].counted, false);
eq("meeting null / junk entries", V.sanitizeMeetings([null, 5, "x", [], rec]).length, 1);
eq("meetings non-array", V.sanitizeMeetings({}), []);
eq("meetings undefined", V.sanitizeMeetings(undefined), []);
const many = [];
for (let i = 0; i < 600; i++) many.push(Object.assign({}, rec, { id: "m" + i }));
const capped = V.sanitizeMeetings(many);
eq("meetings capped at 500", capped.length, 500);
eq("meetings cap keeps newest", capped[0].id, "m100");
eq("meetings cap last", capped[499].id, "m599");
eq("meetings drops extra keys", Object.keys(V.sanitizeMeetings([Object.assign({}, rec, { evil: 1 })])[0]).includes("evil"), false);

// ---- title cleaning
eq("title plain", V.cleanTitle("Standup"), "Standup");
eq("title ctrl", V.cleanTitle("a\u0000b\u0007c"), "a b c");
eq("title bidi", V.cleanTitle("a‮b⁦c"), "a b c");
eq("title zero-width", V.cleanTitle("a​b﻿c"), "a b c");
eq("title whitespace", V.cleanTitle("  a \n\t b  "), "a b");
eq("title max 200", V.cleanTitle("x".repeat(300)).length, 200);
eq("title non-string", V.cleanTitle(null), "");
eq("title trims after slice", V.cleanTitle("x".repeat(199) + " yyy"), "x".repeat(199));

// ---- donation / misc sanitizers
eq("donation default", V.sanitizeDonation(undefined), { asked: [], lastAskAt: 0, dontAskAgain: false });
eq("donation good", V.sanitizeDonation({ asked: [10, 50], lastAskAt: 5, dontAskAgain: true }), { asked: [10, 50], lastAskAt: 5, dontAskAgain: true });
eq("donation junk", V.sanitizeDonation({ asked: [10, "x", NaN, -1], lastAskAt: "5", dontAskAgain: "yes" }), { asked: [10], lastAskAt: 0, dontAskAgain: false });
eq("donation asked non-array", V.sanitizeDonation({ asked: "10" }).asked, []);

// ---- meet code / urls / session / thanks
eq("code basic", V.meetCode("https://meet.google.com/abc-defg-hij"), "abc-defg-hij");
eq("code query", V.meetCode("https://meet.google.com/abc-defg-hij?authuser=1"), "abc-defg-hij");
eq("code trailing slash", V.meetCode("https://meet.google.com/abc-defg-hij/"), "abc-defg-hij");
eq("code /meet/ form", V.meetCode("https://meet.google.com/meet/abc-defg-hij"), "abc-defg-hij");
eq("code /meet/ query", V.meetCode("https://meet.google.com/meet/abc-defg-hij?authuser=1#x"), "abc-defg-hij");
eq("code /meet/ trailing", V.meetCode("https://meet.google.com/meet/abc-defg-hij/"), "abc-defg-hij");
eq("code /meet/ only", V.meetCode("https://meet.google.com/meet/"), "");
eq("code landing", V.meetCode("https://meet.google.com/landing"), "");
eq("code root", V.meetCode("https://meet.google.com/"), "");
eq("code too long", V.meetCode("https://meet.google.com/abc-defg-hijk"), "");
eq("code uppercase", V.meetCode("https://meet.google.com/ABC-DEFG-HIJ"), "");
eq("code other host", V.meetCode("https://evil.example/abc-defg-hij"), "");
eq("code lookalike host", V.meetCode("https://meet.google.com.evil.example/abc-defg-hij"), "");
eq("code http", V.meetCode("http://meet.google.com/abc-defg-hij"), "");
eq("code garbage", V.meetCode("nope"), "");
eq("code non-string", V.meetCode(null), "");
eq("isMeetUrl", V.isMeetUrl("https://meet.google.com/abc-defg-hij"), true);
eq("isMeetUrl calendar", V.isMeetUrl("https://calendar.google.com/"), false);
eq("isMeetUrl http", V.isMeetUrl("http://meet.google.com/"), false);
eq("isMeetUrl lookalike", V.isMeetUrl("https://meet.google.com.evil.example/"), false);
eq("isCalendarUrl", V.isCalendarUrl("https://calendar.google.com/calendar/u/0/r"), true);
eq("isCalendarUrl meet", V.isCalendarUrl("https://meet.google.com/x"), false);
eq("session ok test", V.validSession("cs_test_" + "a1B2".repeat(10)), true);
eq("session ok live", V.validSession("cs_live_" + "Z".repeat(20)), true);
eq("session short", V.validSession("cs_test_123"), false);
eq("session bogus", V.validSession("bogus"), false);
eq("session charset", V.validSession("cs_test_" + "a".repeat(19) + "-"), false);
eq("session non-string", V.validSession(12345), false);
eq("session trailing newline", V.validSession("cs_test_" + "a".repeat(20) + "\n"), false);
eq("thanks ok", V.isThanksUrl("https://overcrasher.github.io/meeting-meter/thanks.html?session_id=x"), true);
eq("thanks bare", V.isThanksUrl("https://overcrasher.github.io/meeting-meter/thanks.html"), true);
eq("thanks other path", V.isThanksUrl("https://overcrasher.github.io/meeting-meter/other.html"), false);
eq("thanks sister project", V.isThanksUrl("https://overcrasher.github.io/wait-24h/thanks.html"), false);
eq("thanks other origin", V.isThanksUrl("https://evil.github.io/meeting-meter/thanks.html"), false);
eq("thanks http", V.isThanksUrl("http://overcrasher.github.io/meeting-meter/thanks.html"), false);
eq("thanks non-string", V.isThanksUrl(undefined), false);
eq("thanks const", V.THANKS_PAGE, "https://overcrasher.github.io/meeting-meter/thanks.html");

// ---- cleanPos
eq("pos ok", V.cleanPos({ x: 0.1, y: 0.9 }), { x: 0.1, y: 0.9 });
eq("pos null", V.cleanPos(null), null);
eq("pos Infinity", V.cleanPos({ x: Infinity, y: 0 }), null);
eq("pos missing", V.cleanPos({ x: 0.5 }), null);
eq("pos array", V.cleanPos([0.5, 0.5]), null);

// ---- tick validation
const base = { id: "a", tabId: 7, start: 1000000, end: null, lastTick: 1000000, seconds: 0, personSeconds: 0, peak: 1, rate: 20,
  currency: "EUR", cost: 0, counted: false };
const at = (sec) => 1000000 + sec * 1000;
let t = V.validateTick(base, { seconds: 15, personSeconds: 30, peak: 2 }, at(15), 7);
eq("tick ok", t, { seconds: 15, personSeconds: 30, peak: 2, lastTick: at(15), cost: 0.17, counted: false });
t = V.validateTick(base, { seconds: 60, personSeconds: 120, peak: 2 }, at(60), 7);
eq("tick qualifies", t.counted, true);
eq("tick cost rounded", t.cost, 0.67);
eq("tick lastTick", t.lastTick, at(60));
eq("tick alone not counted", V.validateTick(base, { seconds: 300, personSeconds: 300, peak: 1 }, at(300), 7).counted, false);
eq("tick short not counted", V.validateTick(base, { seconds: 59, personSeconds: 118, peak: 2 }, at(59), 7).counted, false);
const counted = Object.assign({}, base, { seconds: 60, personSeconds: 120, peak: 2, counted: true });
eq("tick stays counted", V.validateTick(counted, { seconds: 70, personSeconds: 130, peak: 2 }, at(70), 7).counted, true);
eq("tick no tabId arg skips check", V.validateTick(base, { seconds: 10, personSeconds: 10, peak: 1 }, at(10)) !== null, true);
eq("tick wrong tab", V.validateTick(base, { seconds: 10, personSeconds: 10, peak: 1 }, at(10), 8), null);
eq("tick null tab record vs tab", V.validateTick(Object.assign({}, base, { tabId: null }), { seconds: 10, personSeconds: 10, peak: 1 }, at(10), 7), null);
eq("tick seconds decreasing", V.validateTick(counted, { seconds: 59, personSeconds: 130, peak: 2 }, at(70), 7), null);
eq("tick personSeconds decreasing", V.validateTick(counted, { seconds: 70, personSeconds: 119, peak: 2 }, at(70), 7), null);
eq("tick peak decreasing", V.validateTick(counted, { seconds: 70, personSeconds: 70, peak: 1 }, at(70), 7), null);
eq("tick equal values ok", V.validateTick(counted, { seconds: 60, personSeconds: 120, peak: 2 }, at(70), 7) !== null, true);
eq("tick seconds in future", V.validateTick(base, { seconds: 100, personSeconds: 100, peak: 1 }, at(10), 7), null);
eq("tick seconds slack 5s", V.validateTick(base, { seconds: 15, personSeconds: 15, peak: 1 }, at(10), 7) !== null, true);
eq("tick seconds slack exceeded", V.validateTick(base, { seconds: 15.5, personSeconds: 15, peak: 1 }, at(10), 7), null);
eq("tick personSeconds too high", V.validateTick(base, { seconds: 10, personSeconds: 50, peak: 2 }, at(10), 7), null);
eq("tick personSeconds slack +1", V.validateTick(base, { seconds: 10, personSeconds: 21, peak: 2 }, at(10), 7) !== null, true);
eq("tick peak zero", V.validateTick(base, { seconds: 10, personSeconds: 0, peak: 0 }, at(10), 7), null);
eq("tick peak 1001", V.validateTick(base, { seconds: 10, personSeconds: 10, peak: 1001 }, at(10), 7), null);
eq("tick peak 1000", V.validateTick(base, { seconds: 10, personSeconds: 10, peak: 1000 }, at(10), 7) !== null, true);
eq("tick peak float", V.validateTick(base, { seconds: 10, personSeconds: 10, peak: 1.5 }, at(10), 7), null);
eq("tick NaN seconds", V.validateTick(base, { seconds: NaN, personSeconds: 0, peak: 1 }, at(10), 7), null);
eq("tick Infinity", V.validateTick(base, { seconds: Infinity, personSeconds: 0, peak: 1 }, at(10), 7), null);
eq("tick string seconds", V.validateTick(base, { seconds: "10", personSeconds: 10, peak: 1 }, at(10), 7), null);
eq("tick negative", V.validateTick(base, { seconds: -1, personSeconds: 0, peak: 1 }, at(10), 7), null);
eq("tick missing fields", V.validateTick(base, {}, at(10), 7), null);
eq("tick null payload", V.validateTick(base, null, at(10), 7), null);
eq("tick null record", V.validateTick(null, { seconds: 1, personSeconds: 1, peak: 1 }, at(10), 7), null);
eq("tick bad now", V.validateTick(base, { seconds: 1, personSeconds: 1, peak: 1 }, NaN, 7), null);
eq("tick fields only", Object.keys(V.validateTick(base, { seconds: 10, personSeconds: 10, peak: 1, evil: 1 }, at(10), 7)).sort(),
  ["cost", "counted", "lastTick", "peak", "personSeconds", "seconds"]);

// ---- selectors.js pure helpers
const MS = MeterSelectors;
eq("normalizeTimeText", MS.normalizeTimeText("Monday, November 10\u22c5 10:00\u202f\u2013\u202f11:30am"), "Monday, November 10 10:00 - 11:30am");
eq("normalized parses", C.parseTimeRange(MS.normalizeTimeText("Monday, November 10\u22c510:00\u2009\u2013\u200911:30am")), { startMin: 600, endMin: 690 });
eq("title strip hyphen", MS.cleanMeetTitle("Meet - Weekly sync"), "Weekly sync");
eq("title strip en dash", MS.cleanMeetTitle("Meet \u2013 Weekly sync"), "Weekly sync");
eq("title code only", MS.cleanMeetTitle("Meet - abc-defg-hij"), null);
eq("title plain Meet", MS.cleanMeetTitle("Meet"), null);
eq("title other", MS.cleanMeetTitle("Inbox (3)"), "Inbox (3)");
eq("title empty", MS.cleanMeetTitle(""), null);
eq("guest real", MS.guestId("Ana@Example.com"), "ana@example.com");
eq("guest room", MS.guestId("room@resource.calendar.google.com"), null);
eq("guest dial-in", MS.guestId("123456@zoom.us"), null);
eq("guest no at", MS.guestId("abc"), null);
eq("guest summary", MS.guestSummary("5 guests"), 5);
eq("guest summary ro", MS.guestSummary("12 invita\u021bi"), 12);
eq("guest summary not minutes", MS.guestSummary("10 minutes before"), null);
eq("badge", MS.badgeNumber(" 4 "), 4);
eq("badge zero", MS.badgeNumber("0"), null);
eq("badge text", MS.badgeNumber("4 people"), null);
eq("hasTimeRange yes", MS.hasTimeRange("10:00 \u2013 11:30am"), true);
eq("hasTimeRange no", MS.hasTimeRange("Monday, November 10"), false);

// ---- sweepMeetings
const sw = (o) => Object.assign({}, rec, o);
const SN = 10000000, ST = 600000, RT = 300000;
eq("sweep stale open counted closed", V.sweepMeetings([sw({ lastTick: SN - ST - 1, counted: true })], SN, undefined, ST, RT)[0].end, SN - ST - 1);
eq("sweep stale open uncounted dropped", V.sweepMeetings([sw({ lastTick: SN - ST - 1, counted: false })], SN, undefined, ST, RT), []);
eq("sweep fresh open kept", V.sweepMeetings([sw({ lastTick: SN - 1000, counted: false })], SN, undefined, ST, RT).length, 1);
eq("sweep ended uncounted recent kept", V.sweepMeetings([sw({ end: SN - RT + 1000, counted: false })], SN, undefined, ST, RT).length, 1);
eq("sweep ended uncounted old dropped", V.sweepMeetings([sw({ end: SN - RT - 1, counted: false })], SN, undefined, ST, RT), []);
eq("sweep ended counted old kept", V.sweepMeetings([sw({ end: 1, counted: true })], SN, undefined, ST, RT).length, 1);
eq("sweep keepId protected", V.sweepMeetings([sw({ end: 1, counted: false })], SN, "a1", ST, RT).length, 1);
eq("weekStats ignores uncounted ended", C.weekStats([mk({ counted: false })], NOW).count, 0);

// ---- rating prompt
const RT5 = MeterRating.RATING_THRESHOLD;
eq("rating threshold is 5", RT5, 5);
eq("rating below threshold", MeterRating.shouldAskRating(undefined, 4, 5), false);
eq("rating at threshold", MeterRating.shouldAskRating(undefined, 5, 5), true);
eq("rating above threshold", MeterRating.shouldAskRating({ shown: false, at: 0 }, 99, 5), true);
eq("rating already shown", MeterRating.shouldAskRating({ shown: true, at: 5 }, 99, 5), false);
eq("rating malformed string state", MeterRating.shouldAskRating("shown", 5, 5), true);
eq("rating null state", MeterRating.shouldAskRating(null, 5, 5), true);
eq("rating NaN count", MeterRating.shouldAskRating(undefined, NaN, 5), false);
eq("rating string count", MeterRating.shouldAskRating(undefined, "9", 5), false);
eq("rating bad threshold", MeterRating.shouldAskRating(undefined, 9, undefined), false);
eq("sanitizeRating undefined", V.sanitizeRating(undefined), { shown: false, at: 0 });
eq("sanitizeRating good", V.sanitizeRating({ shown: true, at: 123 }), { shown: true, at: 123 });
eq("sanitizeRating junk", V.sanitizeRating({ shown: "yes", at: "x" }), { shown: false, at: 0 });
eq("sanitizeRating bad at", V.sanitizeRating({ shown: true, at: -4 }), { shown: true, at: 0 });
eq("sanitizeRating array", V.sanitizeRating([1]), { shown: false, at: 0 });

print("passed " + pass + ", failed " + fail);
failures.forEach((f) => print("FAIL " + f));
if (fail) throw new Error(fail + " test(s) failed");
