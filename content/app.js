/* China Trip — one cohesive day-by-day itinerary.
   Each day is a container; inside it, tabs switch between plan styles. */
const state = { data: null, files: null, packing: null, esim: null, esimUsage: null, dayPlans: {}, docQuery: "", guideOct21: null, guideOct22: null, guideOct24: null, guideOct26: null, hangzhou2Day: null, route: { page: "day", day: 0 } };
const DOC_CACHE = "ct-docs-v1";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
const $ = id => document.getElementById(id);

/* ---------------- settings (persisted on this device) ---------------- */

const SETTINGS_KEY = "ct.settings.v1";
const SETTINGS_DEFAULTS = { autoCheck: true, source: "auto", usageAuto: true, usageMins: 5, fontScale: "std", theme: "light", lang: "en", contentAuto: true };
let settings = (() => {
  try { return Object.assign({}, SETTINGS_DEFAULTS, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")); }
  catch (e) { return Object.assign({}, SETTINGS_DEFAULTS); }
})();

/* ---------------- language: app chrome + settings (day itinerary content
   itself stays as authored, with Chinese place names already in it) -------- */
const I18N = {
  en: {
    nav_itinerary: "🗓️ Itinerary", nav_esim: "📶 eSIM", nav_packing: "🎒 Packing",
    nav_docs: "📁 Documents", nav_settings: "⚙️ Settings", days: "Days",
    prev_day: "‹ Prev day", next_day: "Next day ›", tap_all_days: "tap for all days",
    tap_day: "Tap a day to open its page.", online: "Online", offline: "Offline",
    app_updates: "⬆ App updates", check_updates: "Check for updates",
    update_in_app_only: "Update checks run inside the Android app.",
    check_auto: "Check automatically when the app opens", update_source: "Update source",
    auto: "Auto (try all)", home_server: "Home server", home_wifi: "Home Wi-Fi only",
    github_only: "GitHub only", public_updates: "Public updates (recommended)",
    test_connection: "Test update connection",
    test_intro: "The test tries each update address and shows what came back.",
    esim_usage: "📶 eSIM data usage", refresh_auto: "Refresh usage automatically",
    refresh_every: "Refresh every", minutes: "minutes",
    display: "🔠 Display", text_size: "Text size", standard: "Standard",
    large_text: "Large", xl_text: "Extra large", theme: "Theme", light: "Light", dark: "Dark",
    language: "Language", app_data: "🗂 App data", reload_data: "Reload trip data",
    saved_only: "Settings are saved on this phone only. Content updates are on.",
    content_updates: "📦 Content updates", check_content: "Check for content updates",
    content_in_app_only: "Content updates run inside the Android app.",
    content_auto: "Check for content updates when the app opens",
    content_intro: "Content is the itinerary, guides, audio and documents — pulled from GitHub and cached on this phone, so most updates download only the files that changed instead of a whole new app.",
    content_checking: "Checking for content updates…",
    content_uptodate: "Content is up to date.",
    content_failed: "Content update failed: ",
    esim_na: "eSIM data not available.", pack_na: "Packing list not available.",
    docs_na: "Document list not available."
  },
  zh: {
    nav_itinerary: "🗓️ 行程", nav_esim: "📶 eSIM", nav_packing: "🎒 行李",
    nav_docs: "📁 文件", nav_settings: "⚙️ 设置", days: "日期",
    prev_day: "‹ 上一天", next_day: "下一天 ›", tap_all_days: "点击查看全部日期",
    tap_day: "点开某一天查看详情。", online: "在线", offline: "离线",
    app_updates: "⬆ 应用更新", check_updates: "检查更新",
    update_in_app_only: "更新检查仅在安卓应用内进行。",
    check_auto: "打开应用时自动检查", update_source: "更新来源",
    auto: "自动（全部尝试）", home_server: "家庭服务器", home_wifi: "仅家庭 Wi-Fi",
    github_only: "仅 GitHub", public_updates: "公开更新（推荐）",
    test_connection: "测试更新连接",
    test_intro: "测试会逐个尝试更新地址并显示结果。",
    esim_usage: "📶 eSIM 流量", refresh_auto: "自动刷新用量",
    refresh_every: "刷新间隔", minutes: "分钟",
    display: "🔠 显示", text_size: "字体大小", standard: "标准",
    large_text: "大", xl_text: "特大", theme: "主题", light: "浅色", dark: "深色",
    language: "语言", app_data: "🗂 应用数据", reload_data: "重新加载行程",
    saved_only: "设置仅保存在本机。内容更新已开启。",
    content_updates: "📦 内容更新", check_content: "检查内容更新",
    content_in_app_only: "内容更新仅在安卓应用内进行。",
    content_auto: "打开应用时自动检查内容更新",
    content_intro: "内容包括行程、导览、音频和文件——从 GitHub 拉取并缓存在本机，因此大多数更新只需下载有变化的文件，而不是整个应用。",
    content_checking: "正在检查内容更新…",
    content_uptodate: "内容已是最新。",
    content_failed: "内容更新失败：",
    esim_na: "暂无 eSIM 数据。", pack_na: "暂无行李清单。",
    docs_na: "暂无文件列表。"
  }
};
function t(k) {
  const d = I18N[settings.lang] || I18N.en;
  return d[k] || I18N.en[k] || k;
}
function applyLanguage() {
  document.documentElement.lang = settings.lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll(".drawer-link").forEach(b => { b.textContent = t("nav_" + b.dataset.go); });
  const dh = document.querySelector(".drawer-days-head");
  if (dh) dh.textContent = t("days");
  const bp = $("bb-prev"); if (bp) bp.textContent = t("prev_day");
  const bn = $("bb-next"); if (bn) bn.textContent = t("next_day");
  const nl = $("net-label");
  if (nl) nl.textContent = navigator.onLine ? t("online") : t("offline");
}

function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {} }
function applySettings() {
  document.body.classList.toggle("fs-large", settings.fontScale === "large");
  document.body.classList.toggle("fs-xl", settings.fontScale === "xl");
  document.body.classList.toggle("theme-dark", settings.theme === "dark");
  applyLanguage();
}

/* ---------------- load ---------------- */

async function load() {
  wireNet(); wireInstall(); registerSW();
  if (window.__TRIP_DATA__) {
    // Bundled build (APK / single file): all data inlined, no fetch needed.
    const d = window.__TRIP_DATA__;
    state.data = d.itineraries; state.files = d.files; state.packing = d.packing;
    state.esim = d.esim; state.esimUsage = d.esimUsage || null;
    state.guideOct21 = d.guideOct21 || null;
    state.guideOct22 = d.guideOct22 || null;
    state.guideOct24 = d.guideOct24 || null;
    state.guideOct26 = d.guideOct26 || null;
    state.hangzhou2Day = d.hangzhou2Day || null;
  } else {
    const [a, b, c, e, u, g, h, i2, j26, k2d] = await Promise.all([
      fetch("itineraries.json", {"cache":"no-cache"}).then(r => r.json()),
      fetch("files.json", {"cache":"no-cache"}).then(r => r.json()).catch(() => null),
      fetch("files/packing.json", {"cache":"no-cache"}).then(r => r.json()).catch(() => null),
      fetch("esim.json", {"cache":"no-cache"}).then(r => r.json()).catch(() => null),
      fetch("esim-usage.json", {"cache":"no-cache"}).then(r => r.json()).catch(() => null),
      fetch("guide-2026-10-21.html", {"cache":"no-cache"}).then(r => r.text()).catch(() => null),
      fetch("guide-2026-10-22.html", {"cache":"no-cache"}).then(r => r.text()).catch(() => null),
      fetch("guide-2026-10-24.html", {"cache":"no-cache"}).then(r => r.text()).catch(() => null),
      fetch("guide-2026-10-26-hangzhou.html", {"cache":"no-cache"}).then(r => r.text()).catch(() => null),
      fetch("hangzhou-2day-itinerary.html", {"cache":"no-cache"}).then(r => r.text()).catch(() => null)
    ]);
    state.data = a; state.files = b; state.packing = c; state.esim = e; state.esimUsage = u;
    state.guideOct21 = g ? guideBodyOf(g) : null;
    state.guideOct22 = h ? guideBodyOf(h) : null;
    state.guideOct24 = i2 ? guideBodyOf(i2) : null;
    state.guideOct26 = j26 ? guideBodyOf(j26) : null;
    state.hangzhou2Day = k2d ? docWithStyle(k2d) : null;
  }
  applySettings();
  buildDrawerDays();
  initRoute();
  startUsageRefresh();
  if (window.AndroidApp && settings.autoCheck) {
    setTimeout(() => { try { window.AndroidApp.checkForUpdate(settings.source); } catch (e) {} }, 20000);
  }
  if (window.AndroidContent && settings.contentAuto) {
    setTimeout(() => { try { window.__ctContentAuto = true; window.AndroidContent.checkForContentUpdate(); } catch (e) {} }, 30000);
  }
}

/* ---------------- main render: one cohesive page ---------------- */

const PLAN_SHORT = ["📸 Active", "🏛️ Culture", "🍜 Food"];

function planTabLabel(opt, i) {
  return PLAN_SHORT[i] || esc(opt.title);
}

function slotHTML(s) {
  return `<div class="slot"><span class="time">${esc(s.time)}</span><span class="nm">${esc(s.name)}</span>` +
    (s.reserve ? `<span class="tag tag-reserve">Book ahead</span>` : "") +
    (s.detail ? `<div class="dt">${esc(s.detail)}</div>` : "") + `</div>`;
}

function mealHTML(m) {
  return `<div class="meal"><span class="muted">${esc(m.type)}</span> <strong>${esc(m.name)}</strong>` +
    (m.area ? ` <span class="muted">· ${esc(m.area)}</span>` : "") +
    (m.reserve ? `<span class="tag tag-reserve">Book ahead</span>` : `<span class="tag tag-meal">walk-in ok</span>`) +
    (m.detail ? `<div class="dt">${esc(m.detail)}</div>` : "") + `</div>`;
}

function planBodyHTML(day) {
  let html = "";
  if (day.highlights && day.highlights.length)
    html += `<ul class="hl">${day.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>`;
  html += (day.activities || []).map(slotHTML).join("");
  if (day.meals && day.meals.length) html += day.meals.map(mealHTML).join("");
  return html || `<p class="muted">No details for this plan yet.</p>`;
}

function daySectionHTML(di, day0, opts) {
  const active = state.dayPlans[di] || 0;
  const tabs = opts.map((opt, i) =>
    `<button type="button" class="plan-tab${i === active ? " active" : ""}" data-day="${di}" data-plan="${i}" aria-label="${esc(opt.title)}">${planTabLabel(opt, i)}</button>`
  ).join("");
  const opt = opts[active];
  const day = opt.days[di];
  return `<article class="card day" id="day-${di}">
    <div class="day-head">
      <div class="day-date-row"><span class="day-date">${esc(day0.date)}</span><span class="day-weekday">${esc(day0.weekday)}</span></div>
      <div class="day-city">${esc(day0.city)}</div>
      <div class="day-meta">🛏 ${esc(day0.hotel)}</div>
      ${day0.transit ? `<div class="day-meta">🚄 ${esc(day0.transit)}</div>` : ""}
    </div>
    <div class="plan-tabs" role="tablist" aria-label="Plan options for ${esc(day0.date)}">${tabs}</div>
    <div class="plan-body" id="plan-body-${di}">
      <div class="plan-title-row"><strong>${esc(opt.title)}</strong><span class="muted"> · ${esc(opt.pace)}</span></div>
      ${planBodyHTML(day)}
    </div>
  </article>`;
}

/* ---------------- router + pages (multi-page: bottom nav + drawer) ---------------- */

function todayIndex() {
  const MONTHS = { oct: 9, nov: 10 };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let found = -1;
  state.data.options[0].days.forEach((d, i) => {
    const m = d.date.match(/([A-Za-z]+)\s+(\d{1,2})/);
    if (m && new Date(2026, MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]).getTime() === today.getTime()) found = i;
  });
  return found;
}

function guideBodyOf(fullHtml) {
  try { return new DOMParser().parseFromString(fullHtml, "text/html").body.innerHTML; } catch (e) { return null; }
}

function scopeHangzhouCss(css) {
  // FIX (2026-10-26): the 2-day file's stylesheet was injected globally.
  // Its "body { max-width:900px; margin:0 auto; padding:18px; background:#f8f9fa;
  // color:#222 }" then shrank the whole app page, painted white margins around
  // the dark cards, and forced dark text onto the dark topbar — invisible in
  // light mode (where those colours already matched) and glaring in dark mode.
  // Scope every rule to the 2-day wrapper instead, and drop the page-level
  // body layout entirely.
  let c = css;
  c = c.replace(/\*\s*\{/g, ".hangzhou2day, .hangzhou2day * {");
  c = c.replace(/body\s*\{[^}]*\}/, ".hangzhou2day { background:transparent; color:inherit; padding:0; margin:0; max-width:none; }");
  c = c.replace(/\bh1\s*,\s*h2\s*,\s*h3\s*\{/, ".hangzhou2day h1, .hangzhou2day h2, .hangzhou2day h3 {");
  for (const cls of ["timing-box", "didi-table", "stop-block", "photo-callout", "food-section"]) {
    c = c.replace(new RegExp("\\." + cls, "g"), ".hangzhou2day ." + cls);
  }
  c = c.replace(/(?<![\w.-])a\s*\{/, ".hangzhou2day a {");
  return c;
}

function docWithStyle(fullHtml) {
  try {
    const doc = new DOMParser().parseFromString(fullHtml, "text/html");
    const styles = Array.from(doc.querySelectorAll("style")).map(s => "<style>" + scopeHangzhouCss(s.textContent) + "</style>").join("");
    return styles + '<div class="hangzhou2day">' + doc.body.innerHTML + "</div>";
  } catch (e) { return null; }
}

function buildDrawerDays() {
  const wrap = $("drawer-days");
  if (!wrap) return;
  wrap.innerHTML = state.data.options[0].days.map((d, di) =>
    `<button type="button" class="drawer-day" data-day="${di}">${esc(d.date)} · ${esc(d.weekday || "")}<span class="dd-city">${esc(d.city || "")}</span></button>`
  ).join("");
  wrap.querySelectorAll(".drawer-day").forEach(b => b.addEventListener("click", () => go("day", +b.dataset.day)));
}

let suppressHash = false;
function go(page, day) {
  state.route = { page: page, day: (day === undefined ? state.route.day : day) };
  const hash = page === "day" ? "#/day/" + state.route.day : "#/" + page;
  if (location.hash !== hash) { suppressHash = true; location.hash = hash; }
  render();
}

function routeFromHash() {
  const h = location.hash || "";
  const n = state.data.options[0].days.length;
  const m = h.match(/^#\/day\/(\d+)$/);
  if (m) return { page: "day", day: Math.max(0, Math.min(+m[1], n - 1)) };
  if (h === "#/esim") return { page: "esim", day: state.route.day };
  if (h === "#/packing") return { page: "packing", day: state.route.day };
  if (h === "#/docs") return { page: "docs", day: state.route.day };
  if (h === "#/settings") return { page: "settings", day: state.route.day };
  if (h === "#/itinerary") return { page: "itinerary", day: state.route.day };
  return null;
}

function initRoute() {
  const ti = todayIndex();
  if (ti >= 0) state.route.day = ti;
  const fromHash = routeFromHash();
  if (fromHash) state.route = fromHash;
  window.addEventListener("hashchange", () => {
    if (suppressHash) { suppressHash = false; return; }
    const r = routeFromHash();
    if (r) { state.route = r; render(); }
  });
  wireChrome();
  render();
}

function wireChrome() {
  const drawer = $("drawer"), backdrop = $("drawer-backdrop");
  const close = () => { drawer.classList.remove("open"); backdrop.hidden = true; };
  $("menu-btn").addEventListener("click", () => { drawer.classList.add("open"); backdrop.hidden = false; });
  $("drawer-close").addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.querySelectorAll(".drawer-link").forEach(b => b.addEventListener("click", () => { close(); go(b.dataset.go); }));
  $("drawer-days").addEventListener("click", close);
  $("bb-prev").addEventListener("click", () => { if (state.route.day > 0) go("day", state.route.day - 1); });
  $("bb-next").addEventListener("click", () => { if (state.route.day < state.data.options[0].days.length - 1) go("day", state.route.day + 1); });
  $("bb-label").addEventListener("click", () => go("itinerary"));
}

function updateChrome() {
  const r = state.route, days = state.data.options[0].days, day = days[r.day];
  $("bb-prev").disabled = r.day <= 0;
  $("bb-next").disabled = r.day >= days.length - 1;
  $("bb-label").innerHTML = r.page === "day"
    ? esc(day.date) + " · " + esc(day.weekday || "") + '<br><span style="font-weight:400;font-size:12px;color:var(--muted)">' + t("tap_all_days") + '</span>'
    : t("nav_" + r.page) || "China Trip";
  document.querySelectorAll(".drawer-link").forEach(b => b.classList.toggle("active", b.dataset.go === r.page));
  document.querySelectorAll(".drawer-day").forEach(b => b.classList.toggle("active", r.page === "day" && +b.dataset.day === r.day));
}

function render() {
  const view = $("view");
  if (!state.data || !state.data.options) {
    view.innerHTML = `<div class="card"><p>Trip data not available — connect once to load it.</p></div>`;
    return;
  }
  const r = state.route;
  if (r.page === "itinerary") { view.innerHTML = itineraryPageHTML(); wireItineraryPage(view); }
  else if (r.page === "esim") { view.innerHTML = esimSectionHTML(); wireEsimSection(view); }
  else if (r.page === "packing") { view.innerHTML = packingSectionHTML(); wirePackingSection(view); }
  else if (r.page === "docs") { view.innerHTML = documentsSectionHTML(); wireDocumentsSection(view); }
  else if (r.page === "settings") { view.innerHTML = settingsPageHTML(); wireSettingsPage(view); }
  else { view.innerHTML = dayPageHTML(r.day); wireDayPage(view); }
  updateChrome();
  window.scrollTo(0, 0);
}

function itineraryPageHTML() {
  const days = state.data.options[0].days, ti = todayIndex();
  return `<div class="card"><h2>${t("nav_itinerary")}</h2><p class="muted">${t("tap_day")}</p></div>` +
    days.map((d, di) => `<div class="card day-row" data-day="${di}" role="button">
      <span class="dr-date">${esc(d.date)}${di === ti ? '<span class="today-badge">TODAY</span>' : ""}</span>
      <span class="dr-main"><span class="dr-city">${esc(d.weekday || "")} · ${esc(d.city || "")} · 🛏 ${esc(d.hotel || "")}</span></span>
      <span class="dr-arrow">›</span></div>`).join("");
}

function wireItineraryPage(view) {
  view.querySelectorAll(".day-row").forEach(row => row.addEventListener("click", () => go("day", +row.dataset.day)));
}

function dayPageHTML(di) {
  const opts = state.data.options, day0 = opts[0].days[di];
  let html = daySectionHTML(di, day0, opts);
  if ((day0.date === "Oct 26" || day0.date === "Oct 27") && state.hangzhou2Day) {
    html = `<article class="card guide-doc"><div class="muted" style="margin-bottom:6px">📅 Revised Hangzhou 2-Day Itinerary — the updated plan you sent Oct 26. Day 1 (today) now peaks at Leifeng Pagoda golden hour, not Pinghu Qiuyue; Day 2 (tomorrow, Oct 27) is Maojiabu mist, Lingyin, Meijiawu tea, Xixi Wetland, Gongchen Bridge blue hour, then Holiday Inn Airport Zone. The Oct 26 audio guide below is the earlier version — use this revised plan for timings.</div>` + state.hangzhou2Day + `</article>` + html;
  }
  if (day0.date === "Oct 21" && state.guideOct21) {
    html += `<article class="card guide-doc"><div class="muted" style="margin-bottom:6px">🎧 Today's full tour guide — tap play at each stop to hear the narration.</div>` + state.guideOct21 + `</article>`;
  }
  if (day0.date === "Oct 22" && state.guideOct22) {
    html += `<article class="card guide-doc"><div class="muted" style="margin-bottom:6px">🎧 Today's full tour guide — tap play at each stop to hear the narration.</div>` + state.guideOct22 + `</article>`;
  }
  if (day0.date === "Oct 24" && state.guideOct24) {
    html += `<article class="card guide-doc"><div class="muted" style="margin-bottom:6px">🎧 Today's full tour guide — tap play at each stop to hear the narration.</div>` + state.guideOct24 + `</article>`;
  }
  if (day0.date === "Oct 26" && state.guideOct26) {
    html += `<article class="card guide-doc"><div class="muted" style="margin-bottom:6px">🎧 Today's full tour guide — Yunqi + West Lake sunset walk, with narration and built-in walk music.</div>` + state.guideOct26 + `</article>`;
  }
  return html;
}

function wireDayPage(view) {
  const opts = state.data.options;
  view.querySelectorAll(".plan-tab").forEach(btn => btn.addEventListener("click", () => {
    const di = +btn.dataset.day, pi = +btn.dataset.plan;
    state.dayPlans[di] = pi;
    const body = $("plan-body-" + di);
    const opt = opts[pi], day = opt.days[di];
    body.innerHTML = `<div class="plan-title-row"><strong>${esc(opt.title)}</strong><span class="muted"> · ${esc(opt.pace)}</span></div>` + planBodyHTML(day);
    btn.parentElement.querySelectorAll(".plan-tab").forEach(x => x.classList.toggle("active", x === btn));
  }));
}


/* ---------------- live eSIM usage refresh (every 5 min) ---------------- */

const USAGE_URLS = [
  "https://raw.githubusercontent.com/alin5647/china-trip-itineraries/main/docs/esim-usage.json",
  "https://hostapt.lhnet.qzz.io/china/esim-usage.json"
];

async function refreshUsage() {
  try {
    const urls = window.__TRIP_DATA__ ? USAGE_URLS : ["esim-usage.json"].concat(USAGE_URLS);
    let data = null;
    for (const u of urls) {
      try {
        const r = await fetch(u + "?t=" + Date.now(), { "cache": "no-store" });
        if (r.ok) { data = await r.json(); break; }
      } catch (e) { /* try the next source */ }
    }
    if (data && data.usage && JSON.stringify(data.usage) !== JSON.stringify(state.esimUsage && state.esimUsage.usage)) {
      state.esimUsage = data;
      if (state.route.page === "esim") render();
    }
  } catch (e) { /* offline: keep showing the last data */ }
}

let usageTimer = null;
function startUsageRefresh() {
  if (usageTimer) { clearInterval(usageTimer); usageTimer = null; }
  if (!settings.usageAuto) return;
  setTimeout(refreshUsage, 4000);
  usageTimer = setInterval(refreshUsage, Math.max(1, +settings.usageMins || 5) * 60 * 1000);
}

/* ---------------- settings page ---------------- */

function settingsPageHTML() {
  const inApp = !!window.AndroidApp;
  const ver = inApp
    ? "App v" + esc(window.AndroidApp.currentVersionName()) + " (build " + esc(window.AndroidApp.currentVersionCode()) + ")"
    : "Web version";
  const sel = (v, cur) => v === cur ? " selected" : "";
  const chk = b => b ? " checked" : "";
  return `<div class="card"><h2>${t("nav_settings")}</h2><p class="muted">${ver} · China Trip, Oct 18 – Nov 1</p></div>
  <div class="card"><h3>${t("app_updates")}</h3>
    <div class="set-row"><button type="button" class="set-btn" id="set-check" ${inApp ? "" : "disabled"}>${t("check_updates")}</button></div>
    ${inApp ? "" : `<p class="muted">${t("update_in_app_only")}</p>`}
    <label class="set-row"><span>${t("check_auto")}</span><input type="checkbox" id="set-autocheck"${chk(settings.autoCheck)}></label>
    <label class="set-row"><span>${t("update_source")}</span><select id="set-source">
      <option value="auto"${sel("auto", settings.source)}>${t("auto")}</option>
      <option value="server"${sel("server", settings.source)}>${t("home_server")}</option>
      <option value="lan"${sel("lan", settings.source)}>${t("home_wifi")}</option>
      <option value="github"${sel("github", settings.source)}>${t("github_only")}</option>
      <option value="public"${sel("public", settings.source)}>${t("public_updates")}</option>
    </select></label>
    <div class="set-row"><button type="button" class="set-btn ghost" id="set-test">${t("test_connection")}</button></div>
    <div id="set-test-results"><p class="muted">${t("test_intro")}</p></div>
  </div>
  <div class="card"><h3>${t("content_updates")}</h3>
    <div class="set-row"><button type="button" class="set-btn" id="set-content-check" ${inApp ? "" : "disabled"}>${t("check_content")}</button></div>
    ${inApp ? "" : `<p class="muted">${t("content_in_app_only")}</p>`}
    <label class="set-row"><span>${t("content_auto")}</span><input type="checkbox" id="set-content-auto"${chk(settings.contentAuto)}></label>
    <div id="set-content-results"><p class="muted">${t("content_intro")}</p></div>
  </div>
  <div class="card"><h3>${t("esim_usage")}</h3>
    <label class="set-row"><span>${t("refresh_auto")}</span><input type="checkbox" id="set-usage-auto"${chk(settings.usageAuto)}></label>
    <label class="set-row"><span>${t("refresh_every")}</span><select id="set-usage-mins">
      <option value="5"${sel("5", String(settings.usageMins))}>5 ${t("minutes")}</option>
      <option value="10"${sel("10", String(settings.usageMins))}>10 ${t("minutes")}</option>
      <option value="15"${sel("15", String(settings.usageMins))}>15 ${t("minutes")}</option>
    </select></label>
  </div>
  <div class="card"><h3>${t("display")}</h3>
    <label class="set-row"><span>${t("theme")}</span><select id="set-theme">
      <option value="light"${sel("light", settings.theme)}>${t("light")}</option>
      <option value="dark"${sel("dark", settings.theme)}>${t("dark")}</option>
    </select></label>
    <label class="set-row"><span>${t("language")}</span><select id="set-lang">
      <option value="en"${sel("en", settings.lang)}>English</option>
      <option value="zh"${sel("zh", settings.lang)}>中文</option>
    </select></label>
    <label class="set-row"><span>${t("text_size")}</span><select id="set-font">
      <option value="std"${sel("std", settings.fontScale)}>${t("standard")}</option>
      <option value="large"${sel("large", settings.fontScale)}>${t("large_text")}</option>
      <option value="xl"${sel("xl", settings.fontScale)}>${t("xl_text")}</option>
    </select></label>
  </div>
  <div class="card"><h3>${t("app_data")}</h3>
    <div class="set-row"><button type="button" class="set-btn ghost" id="set-reload">${t("reload_data")}</button></div>
    <p class="muted">${t("saved_only")}</p>
  </div>`;
}

function wireSettingsPage(view) {
  const inApp = !!window.AndroidApp;
  const results = view.querySelector("#set-test-results");
  window.__ctShowTestResults = rows => {
    if (!results) return;
    results.innerHTML = `<ul class="test-list">` + rows.map(r =>
      `<li class="${r.ok ? "ok" : "bad"}"><strong>${r.ok ? "✓" : "✗"} ${esc(r.name)}</strong><br>${esc(r.detail)}</li>`
    ).join("") + `</ul>`;
  };
  const runTest = () => {
    if (inApp && window.AndroidApp.testSources) {
      results.innerHTML = `<p class="muted">Testing… this can take up to ~30 seconds.</p>`;
      try { window.AndroidApp.testSources(); } catch (e) { results.innerHTML = `<p class="muted">Test failed to start.</p>`; }
    } else {
      results.innerHTML = `<p class="muted">Testing…</p>`;
      fetch("version.json?t=" + Date.now(), { "cache": "no-store" })
        .then(r => r.json())
        .then(j => window.__ctShowTestResults([{ name: "This site", ok: true, detail: "OK - latest is v" + (j.versionName || "?") + " (code " + (j.versionCode || "?") + ")" }]))
        .catch(() => window.__ctShowTestResults([{ name: "This site", ok: false, detail: "Could not load version info" }]));
    }
  };
  const contentResults = view.querySelector("#set-content-results");
  window.__ctContentUpdate = json => {
    let r;
    try { r = typeof json === "string" ? JSON.parse(json) : json; } catch (e) { return; }
    const auto = !!window.__ctContentAuto;
    window.__ctContentAuto = false;
    if (r.updated > 0) {
      const kb = r.bytes >= 1048576 ? (r.bytes / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(r.bytes / 1024)) + " KB";
      if (contentResults) contentResults.innerHTML = `<p>✓ Updated ${r.updated} file${r.updated === 1 ? "" : "s"} (${kb}) — reloading…</p>`;
      toast("Content updated (" + kb + ") — reloading…");
      setTimeout(() => location.reload(), 1200);
    } else if (r.ok) {
      if (!auto && contentResults) contentResults.innerHTML = `<p class="muted">${t("content_uptodate")}</p>`;
    } else {
      const msg = t("content_failed") + (r.error || "unknown error");
      if (contentResults) contentResults.innerHTML = `<p class="muted">${msg}</p>`;
      if (!auto) toast(msg);
    }
  };
  const contentBtn = view.querySelector("#set-content-check");
  if (contentBtn) contentBtn.addEventListener("click", () => {
    if (contentResults) contentResults.innerHTML = `<p class="muted">${t("content_checking")}</p>`;
    try { window.AndroidContent.checkForContentUpdate(); } catch (e) {}
  });
  const contentAutoEl = view.querySelector("#set-content-auto");
  if (contentAutoEl) contentAutoEl.addEventListener("change", e => { settings.contentAuto = e.target.checked; saveSettings(); });
  view.querySelector("#set-test").addEventListener("click", runTest);
  const checkBtn = view.querySelector("#set-check");
  if (checkBtn) checkBtn.addEventListener("click", () => { try { window.AndroidApp.checkForUpdate(settings.source); } catch (e) {} });
  view.querySelector("#set-autocheck").addEventListener("change", e => { settings.autoCheck = e.target.checked; saveSettings(); });
  view.querySelector("#set-source").addEventListener("change", e => { settings.source = e.target.value; saveSettings(); });
  view.querySelector("#set-usage-auto").addEventListener("change", e => { settings.usageAuto = e.target.checked; saveSettings(); startUsageRefresh(); });
  view.querySelector("#set-usage-mins").addEventListener("change", e => { settings.usageMins = +e.target.value; saveSettings(); startUsageRefresh(); });
  view.querySelector("#set-font").addEventListener("change", e => { settings.fontScale = e.target.value; saveSettings(); applySettings(); });
  view.querySelector("#set-theme").addEventListener("change", e => { settings.theme = e.target.value; saveSettings(); applySettings(); });
  view.querySelector("#set-lang").addEventListener("change", e => { settings.lang = e.target.value; saveSettings(); applySettings(); render(); });
  view.querySelector("#set-reload").addEventListener("click", () => location.reload());
  if (inApp) runTest();
}

/* Native side delivers update-source test results here. */
window.__ctSourceTest = json => {
  try { if (window.__ctShowTestResults) window.__ctShowTestResults(JSON.parse(json)); } catch (e) {}
};

/* ---------------- eSIM section ---------------- */

function copyText(text, msg) {
  const done = () => toast(msg || "Copied ✓");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, done);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove(); done();
  }
}

function esimSectionHTML() {
  const e = state.esim;
  if (!e || !e.sims) return `<section class="card" id="sec-esim"><h2>📶 eSIM</h2><p class="muted">${t("esim_na")}</p></section>`;
  let html = `<section class="card" id="sec-esim">
    <h2>📶 eSIM · China data — usage only</h2>
    <p class="muted">${esc(e.provider)} — ${esc(e.plan)} ${e.route ? "· Route " + esc(e.route) : ""}</p>
    <p class="muted">All eSIMs are already installed, so this page only tracks data progress. No QR codes, activation codes, or SIM numbers are stored in the app.</p>
  </section>`;
  e.sims.forEach(sim => {
    const u = usageFor(sim);
    html += `<section class="card esim-card">
      <h2>${esc(sim.name)}</h2>
      <p class="muted">${esc(sim.plan || e.plan)}</p>
      ${usageBarHtml(u)}
    </section>`;
  });
  return html;
}

function wireEsimSection(view) {
  setTimeout(() => {
    view.querySelectorAll(".usage-fill").forEach(f => {
      if (parseFloat(getComputedStyle(f).width) === 0) f.style.width = f.style.getPropertyValue("--pct") || "0%";
    });
  }, 500);
}

function usageFor(sim) {
  const all = state.esimUsage && state.esimUsage.usage;
  return all ? all[sim.id] || null : null;
}

function usageBarHtml(u) {
  if (!u || (u.used_gb === null || u.used_gb === undefined)) {
    return `<div class="usage">
      <div class="usage-head"><span>📊 Data used</span><span class="usage-pending">⏳ waiting for activation</span></div>
      <div class="usage-track"><div class="usage-fill" style="width:0%"></div></div>
      <p class="muted">Shows up 2–3 hours after the eSIM is installed and first used.</p>
    </div>`;
  }
  const total = u.total_gb || 10;
  const used = u.used_gb || 0;
  const pct = Math.min(100, Math.max(0, Math.round(used / total * 1000) / 10));
  const remain = u.remaining_gb !== undefined && u.remaining_gb !== null ? u.remaining_gb : (total - used);
  const warn = pct >= 80 ? " usage-warn" : "";
  const valid = u.validity_days !== undefined && u.validity_days !== null ? ` · ${esc(String(u.validity_days))}d left` : "";
  return `<div class="usage">
    <div class="usage-head"><span>📊 Data used</span><span><strong>${used.toFixed(2)} / ${total} GB</strong> · ${pct}%${valid}</span></div>
    <div class="usage-track${warn}"><div class="usage-fill${warn}" style="--pct:${pct}%"></div></div>
    <p class="muted">${remain.toFixed(2)} GB remaining ${state.esimUsage && state.esimUsage.updated ? "· updated " + esc(state.esimUsage.updated) : ""}</p>
  </div>`;
}

/* ---------------- packing section ---------------- */

const packKey = (cat, idx) => `pack:${cat}:${idx}`;
const packChecked = () => { try { return JSON.parse(localStorage.getItem("packing-checked") || "{}"); } catch { return {}; } };
const packSave = m => localStorage.setItem("packing-checked", JSON.stringify(m));

function packingSectionHTML() {
  if (!state.packing) return `<section class="card" id="sec-pack"><h2>${t("nav_packing")}</h2><p class="muted">${t("pack_na")}</p></section>`;
  const checked = packChecked();
  let total = 0;
  let html = `<section class="card" id="sec-pack"><h2>${t("nav_packing")}</h2>
    <div class="pack-progress">
      <div class="pp-track"><div class="pp-fill" id="pp-fill" style="width:0%"></div></div>
      <div class="pp-label" id="pp-label"></div>
    </div></section>`;
  state.packing.categories.forEach((cat, ci) => {
    html += `<section class="card"><h3>${esc(cat.name)}</h3><ul class="pack-list">`;
    cat.items.forEach((item, ii) => {
      const k = packKey(ci, ii), on = !!checked[k];
      total++;
      html += `<li><label class="${on ? "done" : ""}"><input type="checkbox" data-k="${esc(k)}" ${on ? "checked" : ""}> <span>${esc(item)}</span></label></li>`;
    });
    html += `</ul></section>`;
  });
  html += `<span id="pack-total" data-total="${total}" hidden></span>`;
  return html;
}

function wirePackingSection(view) {
  const totalEl = $("pack-total");
  const total = totalEl ? +totalEl.dataset.total : 0;
  const paint = () => {
    const m = packChecked(), d = Object.values(m).filter(Boolean).length;
    const fill = $("pp-fill"), label = $("pp-label");
    if (fill) fill.style.width = total ? (d / total * 100) + "%" : "0%";
    if (label) label.textContent = `${d} / ${total} packed`;
  };
  paint();
  view.querySelectorAll('#sec-pack ~ .card input[type="checkbox"], #sec-pack input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", () => {
      const m = packChecked(); m[cb.dataset.k] = cb.checked; packSave(m);
      cb.closest("label").classList.toggle("done", cb.checked);
      paint();
    });
  });
}

/* ---------------- documents section ---------------- */

const extIcon = { pdf: "📄", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", md: "📝", html: "🌐", json: "🧾" };
const fmtSize = kb => kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : Math.max(1, Math.round(kb)) + " KB";

async function isSavedOffline(path) {
  try {
    if (!("caches" in window)) return false;
    const cache = await caches.open(DOC_CACHE);
    return !!(await cache.match(path));
  } catch { return false; }
}

async function toggleOffline(path, btn) {
  btn.disabled = true;
  try {
    const cache = await caches.open(DOC_CACHE);
    if (await cache.match(path)) {
      await cache.delete(path);
      btn.classList.remove("saved"); btn.textContent = "⬇"; btn.title = "Save for offline";
    } else {
      btn.textContent = "…";
      await cache.add(path);
      btn.classList.add("saved"); btn.textContent = "✓"; btn.title = "Saved offline — tap to remove";
      toast("Saved for offline use ✓");
    }
  } catch (e) {
    toast("Couldn't save — are you online?");
  }
  btn.disabled = false;
}

function documentsInnerHTML() {
  if (!state.files) return `<section class="card" id="sec-docs"><h2>${t("nav_docs")}</h2><p class="muted">${t("docs_na")}</p></section>`;
  const isLocal = location.protocol === "file:"; // APK / single file: files are on-device (or unavailable)
  const q = state.docQuery.trim().toLowerCase();
  let html = `<section class="card" id="sec-docs"><h2>${t("nav_docs")}</h2>
    <div class="searchbar"><input id="doc-search" type="search" placeholder="🔍 Search documents…" value="${esc(state.docQuery)}" aria-label="Search documents"></div>` +
    (isLocal
      ? `<p class="muted" style="margin:0 2px 4px">Tap any file to open it, no internet needed.</p>`
      : `<p class="muted" style="margin:0 2px 4px">Tap a file to open it. Tap <strong>⬇</strong> to keep it on this device for offline use.</p>`) +
    `</section>`;
  let shown = 0;
  for (const cat of state.files.categories) {
    const files = cat.files.filter(f => !q || f.name.toLowerCase().includes(q));
    if (!files.length) continue;
    shown += files.length;
    html += `<section class="card"><div class="doc-cat">${esc(cat.title)} · ${files.length}</div>` +
      files.map(f => `<div class="file-row">
        <span class="fi">${extIcon[f.ext] || "📎"}</span>
        <a class="file-link" href="${esc(f.path)}"${isLocal ? "" : ` target="_blank" rel="noopener"`}>
          <span class="fn">${esc(f.name)}</span><span class="fs">${fmtSize(f.size_kb)}</span>
        </a>
        ${isLocal ? "" : `<button type="button" class="off-btn" data-path="${esc(f.path)}" title="Save for offline" aria-label="Save ${esc(f.name)} for offline">⬇</button>`}
      </div>`).join("") + `</section>`;
  }
  if (!shown) html += `<div class="card"><p>No documents match “${esc(state.docQuery)}”.</p></div>`;
  return html;
}

function documentsSectionHTML() {
  return `<div id="docs-wrap">${documentsInnerHTML()}</div>`;
}

function wireDocumentsSection(view) {
  const input = $("doc-search");
  if (!input) return;
  input.addEventListener("input", () => {
    state.docQuery = input.value;
    $("docs-wrap").innerHTML = documentsInnerHTML();
    wireDocumentsSection(view);
    const el = $("doc-search");
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  });
  view.querySelectorAll(".off-btn").forEach(async btn => {
    if (await isSavedOffline(btn.dataset.path)) { btn.classList.add("saved"); btn.textContent = "✓"; btn.title = "Saved offline — tap to remove"; }
    btn.addEventListener("click", () => toggleOffline(btn.dataset.path, btn));
  });
}

/* ---------------- net status / toast ---------------- */

function wireNet() {
  const paint = () => {
    const on = navigator.onLine;
    $("net").classList.toggle("offline", !on);
    $("net").classList.toggle("online", on);
    $("net-label").textContent = on ? t("online") : t("offline");
  };
  window.addEventListener("online", () => { paint(); toast("Back online ✓"); });
  window.addEventListener("offline", () => { paint(); toast("You're offline — saved content still works"); });
  paint();
}

let toastTimer = null;
function toast(msg, action) {
  const t = $("toast");
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button type="button" id="toast-btn">${esc(action.label)}</button>` : "");
  t.hidden = false;
  if (action) $("toast-btn").addEventListener("click", () => { action.fn(); t.hidden = true; });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, action ? 12000 : 4000);
}

/* ---------------- PWA: service worker + install ---------------- */

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          toast("A new version is ready.", { label: "Update", fn: () => nw.postMessage({ type: "SKIP_WAITING" }) });
        }
      });
    });
  }).catch(() => {});
  if (navigator.serviceWorker.addEventListener) {
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
  }
}

let deferredPrompt = null;
function wireInstall() {
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem("install-dismissed")) $("install-banner").hidden = false;
  });
  $("install-btn").addEventListener("click", async () => {
    $("install-banner").hidden = true;
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
  });
  $("install-dismiss").addEventListener("click", () => {
    $("install-banner").hidden = true;
    localStorage.setItem("install-dismissed", "1");
  });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (isIOS && !isStandalone && !localStorage.getItem("ios-hint-dismissed")) {
    $("ios-hint").hidden = false;
  }
  $("ios-dismiss").addEventListener("click", () => {
    $("ios-hint").hidden = true;
    localStorage.setItem("ios-hint-dismissed", "1");
  });
  window.addEventListener("appinstalled", () => { $("install-banner").hidden = true; toast("App installed ✓"); });
}

load().catch(e => {
  $("view").innerHTML = `<div class="card"><p>Could not load trip data — ${esc(e.message)}. Check your connection and reopen.</p></div>`;
});
