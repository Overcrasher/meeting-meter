import { getAll, mutate, DEFAULT_SETTINGS, CURRENCIES, formatMoney } from "./lib/store.js";
import { renderDonateButtons } from "./lib/support.js";

const ALLOWED_LINKS = [globalThis.MeterCalc.STORE_URL, "https://chromewebstore.google.com/detail/wait-24h/pkgdjohoemjkejcbfbkfobbbjcpdabme"];
function bindLink(id, url) {
  $(id).href = url;
  $(id).addEventListener("click", (e) => {
    e.preventDefault();
    if (ALLOWED_LINKS.includes(url)) chrome.tabs.create({ url });
  });
}

const $ = (id) => document.getElementById(id);
const SALARY_MIN = 1, SALARY_MAX = 10000000, MIN_P = 1, MAX_P = 50;
let settings;
let savedTimer, numTimer, clearTimer;

async function applyChange(patch) {
  await mutate(async () => {
    const { settings: cur } = await getAll();
    await chrome.storage.local.set({ settings: Object.assign({}, DEFAULT_SETTINGS, cur, patch) });
  });
  settings = Object.assign({}, settings, patch);
  const el = $("saved");
  el.classList.add("show");
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => el.classList.remove("show"), 1400);
}

function validSalary(v) { return Number.isFinite(v) && v >= SALARY_MIN && v <= SALARY_MAX; }
function validMin(v) { return Number.isInteger(v) && v >= MIN_P && v <= MAX_P; }

function renderRate() {
  const v = parseFloat($("salary").value);
  const cur = $("currency").value;
  $("rate").textContent = validSalary(v)
    ? "≈ " + formatMoney(v / 2000, cur, false) + " per hour per person"
    : "";
}

function debounceNumber(fn) {
  clearTimeout(numTimer);
  numTimer = setTimeout(fn, 400);
}

function onSalary() {
  renderRate();
  const v = parseFloat($("salary").value);
  const ok = validSalary(v);
  $("salary").setAttribute("aria-invalid", String(!ok));
  $("salaryErr").textContent = ok ? "" : "Enter a yearly salary between 1 and 10,000,000.";
  if (ok) debounceNumber(() => applyChange({ salary: v }));
}

function onMin() {
  const v = Number($("minParticipants").value);
  const ok = $("minParticipants").value !== "" && validMin(v);
  $("minParticipants").setAttribute("aria-invalid", String(!ok));
  $("minErr").textContent = ok ? "" : "Enter a whole number between 1 and 50.";
  if (ok) debounceNumber(() => applyChange({ minParticipants: v }));
}

function disarmClear() {
  clearTimeout(clearTimer);
  $("clear").classList.remove("armed");
  $("clear").textContent = "Clear meeting history";
}

async function init() {
  bindLink("rate-link", globalThis.MeterCalc.STORE_URL);
  bindLink("wait24-link", "https://chromewebstore.google.com/detail/wait-24h/pkgdjohoemjkejcbfbkfobbbjcpdabme");
  const state = await getAll();
  settings = Object.assign({}, DEFAULT_SETTINGS, state.settings);

  for (const c of CURRENCIES) {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    $("currency").appendChild(o);
  }
  $("currency").value = settings.currency;
  $("salary").value = String(settings.salary);
  $("minParticipants").value = String(settings.minParticipants);
  $("meetEnabled").checked = !!settings.meetEnabled;
  $("calendarEnabled").checked = !!settings.calendarEnabled;
  $("storeTitles").checked = !!settings.storeTitles;
  for (const r of document.querySelectorAll('input[name="corner"]')) r.checked = r.value === settings.tickerCorner;
  renderRate();

  $("salary").addEventListener("input", onSalary);
  $("minParticipants").addEventListener("input", onMin);
  $("currency").addEventListener("change", () => { renderRate(); applyChange({ currency: $("currency").value }); });
  for (const id of ["meetEnabled", "calendarEnabled", "storeTitles"]) {
    $(id).addEventListener("change", () => applyChange({ [id]: $(id).checked }));
  }
  for (const r of document.querySelectorAll('input[name="corner"]')) {
    r.addEventListener("change", () => { if (r.checked) applyChange({ tickerCorner: r.value, tickerPos: null }); });
  }
  $("resetPos").addEventListener("click", () => applyChange({ tickerPos: null }));

  $("clear").addEventListener("click", async () => {
    if (!$("clear").classList.contains("armed")) {
      $("clear").classList.add("armed");
      $("clear").textContent = "Click again to confirm";
      $("clearNote").textContent = "";
      clearTimer = setTimeout(disarmClear, 5000);
      return;
    }
    disarmClear();
    await mutate(async () => { await chrome.storage.local.set({ meetings: [] }); });
    $("clearNote").textContent = "History cleared.";
  });

  $("thanks").hidden = !state.supporter;
  const shown = renderDonateButtons($("donate"), $("donate-note"));
  if (!shown) $("donate-note").textContent = "Donation links not configured yet";
}
init();
