/* FeelGood app logic. Plain JavaScript, no build step. Data stays on this device (localStorage). */
(function () {
  "use strict";
  const KEY = "feelgood.v1";
  const main = document.getElementById("main");
  let ST = load();
  let unlocked = false;
  let G = null;            // current game state
  let timers = [];         // intervals/timeouts to clear on navigation
  let ui = { part: "all", cat: "all", editId: null, delId: null, resetAsk: false, flash: "" };

  // ---------- storage ----------
  function mkProfile(id, name, age, lang, mob) {
    return { id, name, age, lang, mob, allowFloor: false, familiar: [], hidden: [], log: [], brain: [], lvl: {}, ack: false, plans: {}, walk: {} };
  }
  function seed() {
    const m = mkProfile("p1", "Mamma", 78, "it", "support");
    const p = mkProfile("p2", "Papà", 80, "it", "support");
    const v = mkProfile("p3", "Val", 50, "it", "independent");
    const custom = [
      { id: "c-bastone", cat: "custom", part: "shoulders", s: true, c: false, f: false, min: 2, for: ["p1", "p2"], example: true,
        text: { n: "Bastone sopra la testa (esempio)", d: "Seduti, tenete un bastone o il manico di una scopa con le mani alla larghezza delle spalle. Alzatelo lentamente sopra la testa e riportatelo giù.", r: "10 volte" } },
      { id: "c-torsione", cat: "custom", part: "back", s: true, c: false, f: false, min: 2, for: ["p1", "p2"], example: true,
        text: { n: "Torsione con bastone (esempio)", d: "Seduti, bastone appoggiato sulle spalle dietro la nuca. Ruotate lentamente il busto a destra e a sinistra, bacino fermo.", r: "8 per lato" } }
    ];
    m.familiar = ["c-bastone", "c-torsione", "p1", "p2", "b1", "s1"];
    p.familiar = ["c-bastone", "c-torsione", "p1", "p2", "b1"];
    return { v: 1, active: null, pin: null, size: 1, profiles: [m, p, v], custom, example: true };
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); if (d && d.profiles) return d; } } catch (e) {}
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }

  // ---------- helpers ----------
  const P = () => ST.profiles.find(p => p.id === ST.active) || null;
  const L = () => (P() ? P().lang : (ST.lang || "it"));
  const t = (k, vars) => { let s = T[L()][k]; if (s === undefined) s = T.it[k]; if (vars) for (const v in vars) s = String(s).replace("{" + v + "}", vars[v]); return s; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const dstr = dt => dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
  const today = () => dstr(new Date());
  const dayNum = ds => { const [y, m, d] = ds.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
  const fromNum = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); };
  const dow = ds => new Date(dayNum(ds) * 864e5).getUTCDay();
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(arr, r) { r = r || Math.random; const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const uid = () => Math.random().toString(36).slice(2, 8);
  function clearTimers() { timers.forEach(x => { clearInterval(x); clearTimeout(x); }); timers = []; try { speechSynthesis.cancel(); } catch (e) {} }

  // ---------- exercises & eligibility ----------
  const allEx = () => EXERCISES.concat(ST.custom || []);
  const exById = id => allEx().find(e => e.id === id);
  const txt = (ex, k) => ex.cat === "custom" ? ex.text[k] : ex[L()][k];
  function floorOK(p) { return p.allowFloor || (p.age < 75 && p.mob === "independent"); }
  function ok(ex, p, ignoreHidden) {
    if (!ignoreHidden && p.hidden.includes(ex.id)) return false;
    if (ex.cat === "custom") return (ex.for || []).includes(p.id);
    if (FLOOR_CATS.includes(ex.cat) && !floorOK(p)) return false;
    if (ex.f && !floorOK(p)) return false;
    if (p.mob === "seated" && !ex.s) return false;
    return true;
  }
  const pool = p => allEx().filter(e => ok(e, p));

  // ---------- daily plan ----------
  function walkGoal(p) { return p.age >= 75 ? 15 : p.age >= 65 ? 20 : 30; }
  function planFor(p, ds) {
    if (p.plans[ds]) return p.plans[ds];
    const n = dayNum(ds), wd = dow(ds), r = rng(hash(p.id + ds));
    const all = pool(p);
    const fam = new Set(p.familiar.concat(all.filter(e => e.cat === "custom").map(e => e.id)));
    const recent = new Set();
    p.log.forEach(l => { const k = n - dayNum(l.d); if (k > 0 && k <= 4) recent.add(l.id); });
    for (let k = 1; k <= 3; k++) { const pd = p.plans[fromNum(n - k)]; if (pd) pd.items.forEach(i => recent.add(i)); }
    const used = new Set(), items = [];
    function pick(filter, count, preferFam) {
      let c = shuffle(all.filter(e => !used.has(e.id) && filter(e)), r);
      const sc = e => (recent.has(e.id) ? 2 : 0) - (preferFam && fam.has(e.id) ? 1.5 : 0);
      c.sort((a, b) => sc(a) - sc(b));
      c.slice(0, count).forEach(e => { used.add(e.id); items.push(e.id); });
    }
    // Focus body part rotates day by day, offset per person so siblings/parents differ
    let focus = PARTS[(n + hash(p.id)) % PARTS.length];
    for (let i = 0; i < PARTS.length; i++) {
      const cand = PARTS[(n + hash(p.id) + i) % PARTS.length];
      if (all.filter(e => e.part === cand && e.cat !== "warm").length >= 2) { focus = cand; break; }
    }
    pick(e => e.cat === "warm", 1);
    const balanceCount = p.age >= 75 ? 2 : p.age >= 65 ? 1 : ([1, 3, 5].includes(wd) ? 1 : 0); // WHO: balance 3+ days/week from 65
    pick(e => e.cat === "balance", balanceCount);
    pick(e => e.part === focus && !["warm", "balance"].includes(e.cat) && !FLOOR_CATS.includes(e.cat), 3, true);
    const strengthDay = p.age >= 65 ? [1, 3, 5].includes(wd) : [1, 4].includes(wd); // WHO: strength 2+ days/week
    if (strengthDay) pick(e => e.cat === "strength" && e.part !== focus, 2);
    if (floorOK(p)) {
      const flow = { 2: "pilates", 4: "yoga", 6: "jivamukti", 0: "yoga" }[wd];
      if (flow) pick(e => e.cat === flow, flow === "jivamukti" ? 3 : 2);
    }
    if (fam.size && !items.some(i => fam.has(i))) pick(e => fam.has(e.id), 1);
    pick(e => e.cat === "stretch", 1);
    const g = GAMES[(n + hash(p.id)) % GAMES.length].id;
    const plan = { focus, items, game: g };
    p.plans[ds] = plan;
    Object.keys(p.plans).forEach(k => { if (n - dayNum(k) > 14) delete p.plans[k]; });
    save();
    return plan;
  }
  function swapItem(p, idx) {
    const ds = today(), plan = planFor(p, ds), cur = exById(plan.items[idx]);
    if (!cur) return;
    const inPlan = new Set(plan.items);
    let c = pool(p).filter(e => !inPlan.has(e.id) && e.cat === cur.cat);
    if (!c.length) c = pool(p).filter(e => !inPlan.has(e.id) && e.part === cur.part && e.cat !== "warm");
    if (!c.length) return;
    plan.items[idx] = shuffle(c)[0].id;
    save();
  }
  const isDone = (p, id, ds) => p.log.some(l => l.d === (ds || today()) && l.id === id);
  function toggleDone(p, id) {
    const ds = today();
    if (isDone(p, id, ds)) p.log = p.log.filter(l => !(l.d === ds && l.id === id));
    else { const ex = exById(id); p.log.push({ d: ds, id, min: ex ? ex.min : 2, cat: ex ? ex.cat : "" }); }
    save();
  }

  // ---------- speech ----------
  function speak(text) {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = L() === "it" ? "it-IT" : "en-GB"; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {}
  }

  // ---------- icons ----------
  const IC = {
    today: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',
    exercises: '<circle cx="12" cy="5" r="2"/><path d="M12 8v6m0 0-4 6m4-6 4 6M6 11h12"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.5 1.5-5 3-5s4 1.5 4 5"/>',
    check: '<path d="M5 12l5 5L20 7"/>', star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>', speak: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', chair: '<path d="M7 3v18M7 12h10v9M17 12V3"/>', walk: '<circle cx="13" cy="4" r="2"/><path d="M11 21l2-7-3-3 1-4 4 3 3 1M10 11l-3 2v4"/>'
  };
  const icon = (k, cls) => '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + "</svg>";

  // ---------- shell ----------
  function applySize() { document.documentElement.style.setProperty("--scale", [1, 1.15, 1.32][ST.size || 0]); document.documentElement.lang = L(); }
  function nav(active) {
    const tabs = ["today", "exercises", "brain", "progress", "family"];
    document.getElementById("tabs").innerHTML = tabs.map(k =>
      '<a href="#' + k + '" class="tab' + (k === active ? " on" : "") + '"' + (k === active ? ' aria-current="page"' : "") + ">" + icon(k) + "<span>" + esc(t(k)) + "</span></a>").join("");
    const p = P();
    document.getElementById("who").innerHTML = p ? '<a href="#who" class="whobtn">' + esc(p.name) + "</a>" : "";
  }

  function route() {
    clearTimers();
    const h = (location.hash || "").slice(1);
    if (!P() && h !== "family") return render("who");
    if (h.startsWith("ex-")) return render("detail", h.slice(3));
    if (h.startsWith("game-")) return render("game", h.slice(5));
    render(["today", "exercises", "brain", "progress", "family", "who"].includes(h) ? h : "today");
  }
  function render(view, arg) {
    applySize();
    const base = view === "detail" ? "exercises" : view === "game" ? "brain" : view;
    nav(base);
    const html = VIEWS[view](arg);
    if (html !== undefined) main.innerHTML = html;
    if (view !== "game") window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);

  // ---------- views ----------
  const VIEWS = {};

  VIEWS.who = () => {
    return '<section class="stack"><h1>' + esc(t("whoUses")) + '</h1><p class="muted">' + esc(t("whoSub")) + "</p>" +
      '<div class="people">' + ST.profiles.map(p => '<button class="person" data-act="pick" data-id="' + p.id + '"><span class="avatar">' + esc(p.name.slice(0, 1)) + '</span><span><b>' + esc(p.name) + "</b><small>" + p.age + " " + (p.lang === "it" ? "anni" : "years") + "</small></span></button>").join("") + "</div>" +
      (ST.example ? '<p class="note">' + esc(t("exampleNote")) + "</p>" : "") + "</section>";
  };

  function exCard(p, id, idx) {
    const ex = exById(id); if (!ex) return "";
    const done = isDone(p, id);
    const famStar = p.familiar.includes(id) || ex.cat === "custom";
    return '<li class="excard' + (done ? " done" : "") + '">' +
      '<div class="exhead"><span class="chip cat-' + ex.cat + '">' + esc(T[L()].cats[ex.cat]) + "</span>" + (famStar ? '<span class="fam" title="' + esc(t("familiar")) + '">' + icon("star") + "</span>" : "") + (ex.c ? '<span class="sup" title="' + esc(t("holdOn")) + '">' + icon("chair") + "</span>" : "") + "</div>" +
      '<a class="exname" href="#ex-' + ex.id + '">' + esc(txt(ex, "n")) + "</a>" +
      '<p class="dose">' + esc(txt(ex, "r")) + "</p>" +
      '<div class="row">' +
      '<button class="btn ' + (done ? "ok" : "primary") + '" data-act="done" data-id="' + ex.id + '" aria-pressed="' + done + '">' + icon("check") + esc(done ? t("done") : t("markDone")) + "</button>" +
      '<a class="btn ghost" href="#ex-' + ex.id + '">' + esc(t("open")) + "</a>" +
      (idx !== undefined && !done ? '<button class="btn ghost" data-act="swap" data-i="' + idx + '" aria-label="' + esc(t("swap")) + '">' + icon("swap") + esc(t("swap")) + "</button>" : "") +
      "</div></li>";
  }

  VIEWS.today = () => {
    const p = P(), ds = today(), plan = planFor(p, ds);
    const hr = new Date().getHours(), hello = T[L()].hello[hr < 13 ? 0 : hr < 18 ? 1 : 2];
    const dateTxt = new Date().toLocaleDateString(L() === "it" ? "it-IT" : "en-GB", { weekday: "long", day: "numeric", month: "long" });
    const doneN = plan.items.filter(i => isDone(p, i)).length, total = plan.items.length;
    const walked = p.walk[ds] || 0, wg = walkGoal(p);
    const tips = TIPS[L()], tip = tips[dayNum(ds) % tips.length];
    const game = GAMES.find(g => g.id === plan.game);
    let h = '<section class="stack">';
    h += '<header class="hello"><p class="date">' + esc(dateTxt) + "</p><h1>" + esc(hello) + ", " + esc(p.name) + "</h1></header>";
    if (!p.ack) {
      h += '<div class="safety" role="note"><h2>' + esc(t("safetyTitle")) + "</h2><p>" + esc(t("safetyBody")) + '</p><p class="stop">' + esc(t("safetyStop")) + "</p><p>" + esc(t("safetyHow")) + '</p><button class="btn primary big" data-act="ack">' + esc(t("understood")) + "</button></div>";
    }
    h += '<div class="summary"><div><p class="eyebrow">' + esc(t("focus")) + '</p><p class="focus">' + esc(T[L()].parts[plan.focus]) + '</p></div><div class="meter" role="img" aria-label="' + doneN + "/" + total + '"><b>' + doneN + "</b><span>" + esc(t("ofDone", { n: total })) + '</span><i style="--p:' + (total ? doneN / total : 0) + '"></i></div></div>';
    h += "<h2>" + esc(t("planTitle")) + '</h2><ol class="exlist">' + plan.items.map((id, i) => exCard(p, id, i)).join("") + "</ol>";
    h += '<div class="card walk"><div class="exhead">' + icon("walk") + "<h3>" + esc(t("walk")) + "</h3></div><p>" + esc(t("walkGoal", { n: wg })) + '</p><p class="walked"><b>' + walked + "</b> / " + wg + " " + esc(t("minutes")) + '</p><div class="bar"><i style="width:' + Math.min(100, walked / wg * 100) + '%"></i></div><div class="row"><button class="btn ghost" data-act="walk" data-n="5">+5 ' + esc(t("minutes")) + '</button><button class="btn ghost" data-act="walk" data-n="10">+10 ' + esc(t("minutes")) + '</button>' + (walked ? '<button class="btn ghost" data-act="walk" data-n="-5">−5</button>' : "") + "</div></div>";
    const playedToday = p.brain.some(b => b.d === ds);
    h += '<a class="card gamecard" href="#game-' + game.id + '"><p class="eyebrow">' + esc(t("gameOfDay")) + "</p><h3>" + esc(game[L()][0]) + "</h3><p>" + esc(game[L()][1]) + '</p><span class="btn primary">' + (playedToday ? icon("check") + esc(t("bestToday")) : esc(t("play"))) + "</span></a>";
    h += '<div class="card tip"><p class="eyebrow">' + esc(t("tip")) + "</p><h3>" + esc(tip[0]) + "</h3><p>" + esc(tip[1]) + "</p></div>";
    return h + "</section>";
  };

  VIEWS.detail = id => {
    const p = P(), ex = exById(id);
    if (!ex) { location.hash = "#exercises"; return ""; }
    const done = isDone(p, id);
    const sayText = txt(ex, "n") + ". " + txt(ex, "d") + ". " + txt(ex, "r") + (ex.c ? ". " + t("holdOn") : "");
    let h = '<section class="stack detail"><button class="btn ghost backbtn" data-act="back">' + icon("back") + esc(t("back")) + "</button>";
    h += '<div class="exhead"><span class="chip cat-' + ex.cat + '">' + esc(T[L()].cats[ex.cat]) + '</span><span class="chip plain">' + esc(T[L()].parts[ex.part]) + "</span>" + (ex.s ? '<span class="chip plain">' + esc(t("seatedOk")) + "</span>" : "") + "</div>";
    h += "<h1>" + esc(txt(ex, "n")) + "</h1>";
    if (ex.c) h += '<p class="warnline">' + icon("chair") + esc(t("holdOn")) + "</p>";
    if (ex.f) h += '<p class="warnline">' + esc(t("floorNote")) + "</p>";
    h += '<p class="how">' + esc(txt(ex, "d")) + "</p>";
    h += '<div class="dosebox"><p class="eyebrow">' + esc(t("dose")) + "</p><p>" + esc(txt(ex, "r")) + "</p></div>";
    h += '<div class="timer" id="timer" hidden><b id="tleft">60</b></div>';
    h += '<div class="row wrap"><button class="btn ghost" data-act="say" data-text="' + esc(sayText) + '">' + icon("speak") + esc(t("readAloud")) + '</button><button class="btn ghost" data-act="timer" id="tbtn">' + esc(t("timer")) + "</button></div>";
    h += '<button class="btn big ' + (done ? "ok" : "primary") + '" data-act="done" data-id="' + ex.id + '" aria-pressed="' + done + '">' + icon("check") + esc(done ? t("done") : t("markDone")) + "</button>";
    h += '<p class="small muted">' + esc(t("safetyStop")) + "</p>";
    return h + "</section>";
  };

  VIEWS.exercises = () => {
    const p = P(), list = pool(p);
    const parts = ["all"].concat(PARTS.filter(pt => list.some(e => e.part === pt)));
    const cats = ["all"].concat(Object.keys(T.it.cats).filter(c => list.some(e => e.cat === c)));
    if (!parts.includes(ui.part)) ui.part = "all";
    if (!cats.includes(ui.cat)) ui.cat = "all";
    const shown = list.filter(e => (ui.part === "all" || e.part === ui.part) && (ui.cat === "all" || e.cat === ui.cat));
    let h = '<section class="stack"><h1>' + esc(t("exercises")) + "</h1>";
    h += '<div class="filters" role="group" aria-label="' + esc(t("exPart")) + '">' + parts.map(pt => '<button class="fchip' + (ui.part === pt ? " on" : "") + '" data-act="fpart" data-v="' + pt + '" aria-pressed="' + (ui.part === pt) + '">' + esc(pt === "all" ? t("allParts") : T[L()].parts[pt]) + "</button>").join("") + "</div>";
    h += '<div class="filters" role="group">' + cats.map(c => '<button class="fchip' + (ui.cat === c ? " on" : "") + '" data-act="fcat" data-v="' + c + '" aria-pressed="' + (ui.cat === c) + '">' + esc(c === "all" ? t("allCats") : T[L()].cats[c]) + "</button>").join("") + "</div>";
    if (!floorOK(p)) h += '<p class="note">' + esc(t("hiddenFloor")) + "</p>";
    h += '<ol class="exlist">' + shown.map(e => exCard(p, e.id)).join("") + "</ol>";
    return h + "</section>";
  };

  VIEWS.brain = () => {
    const p = P(), ds = today();
    let h = '<section class="stack"><h1>' + esc(t("brain")) + '</h1><div class="games">';
    GAMES.forEach(g => {
      const lv = p.lvl[g.id] || startLvl(p), played = p.brain.some(b => b.d === ds && b.g === g.id);
      h += '<a class="card game" href="#game-' + g.id + '"><span class="chip plain">' + esc(g[L()][2]) + "</span><h3>" + esc(g[L()][0]) + "</h3><p>" + esc(g[L()][1]) + '</p><p class="lv">' + esc(t("level")) + " " + lv + (played ? ' · <span class="okt">' + icon("check") + esc(t("bestToday")) + "</span>" : "") + "</p></a>";
    });
    return h + "</div></section>";
  };

  VIEWS.progress = () => {
    const p = P(), n = dayNum(today());
    const days = [];
    for (let k = 6; k >= 0; k--) {
      const ds = fromNum(n - k), logs = p.log.filter(l => l.d === ds);
      const cat = id => { const e = exById(id); return e ? e.cat : ""; };
      days.push({ ds, min: logs.reduce((a, l) => a + (l.min || 2), 0) + (p.walk[ds] || 0), bal: logs.some(l => cat(l.id) === "balance"), str: logs.some(l => cat(l.id) === "strength" || cat(l.id) === "pilates"), br: p.brain.filter(b => b.d === ds).length });
    }
    const tot = days.reduce((a, d) => a + d.min, 0), sd = days.filter(d => d.str).length, bd = days.filter(d => d.bal).length, bs = days.reduce((a, d) => a + d.br, 0);
    let streak = 0;
    for (let k = 0; k < 365; k++) { const ds = fromNum(n - k); const any = p.log.some(l => l.d === ds) || (p.walk[ds] || 0) > 0 || p.brain.some(b => b.d === ds); if (any) streak++; else if (k > 0) break; }
    const mx = Math.max(30, ...days.map(d => d.min));
    const stat = (label, val, goal, unit) => '<div class="stat"><p class="eyebrow">' + esc(label) + '</p><p class="num"><b>' + val + "</b>" + (goal ? "<span> / " + goal + (unit || "") + "</span>" : "") + "</p>" + (goal ? '<div class="bar"><i style="width:' + Math.min(100, val / goal * 100) + '%"></i></div>' : "") + "</div>";
    let h = '<section class="stack"><h1>' + esc(t("progress")) + "</h1><h2>" + esc(t("weekTitle")) + "</h2>";
    h += '<div class="stats">' + stat(t("minutesActive"), tot, 150) + stat(t("strengthDays"), sd, 2) + (p.age >= 65 ? stat(t("balanceDays"), bd, 3) : "") + stat(t("brainSessions"), bs, 5) + stat(t("streak"), streak) + "</div>";
    h += '<div class="card"><div class="chart" role="img" aria-label="' + esc(t("minutesActive")) + '">' + days.map(d => '<div class="col"><span class="v">' + (d.min || "") + '</span><i style="height:' + (d.min / mx * 100) + '%"></i><span class="d">' + T[L()].days[dow(d.ds)] + "</span></div>").join("") + "</div></div>";
    h += '<div class="card guide"><h2>' + esc(t("guideTitle")) + "</h2><p>" + esc(t("guide1")) + "</p><p>" + esc(t("guide2")) + "</p></div>";
    return h + "</section>";
  };

  VIEWS.family = () => {
    const p = P();
    let h = '<section class="stack"><h1>' + esc(t("family")) + "</h1>";
    h += '<div class="card"><h3>' + esc(t("switchUser")) + '</h3><div class="row wrap">' + ST.profiles.map(q => '<button class="btn ' + (p && q.id === p.id ? "primary" : "ghost") + '" data-act="pick" data-id="' + q.id + '">' + esc(q.name) + "</button>").join("") + "</div></div>";
    h += '<div class="card"><h3>' + esc(t("textSize")) + '</h3><div class="row wrap">' + T[L()].sizes.map((s, i) => '<button class="btn ' + ((ST.size || 0) === i ? "primary" : "ghost") + '" data-act="size" data-v="' + i + '" style="font-size:' + [1, 1.15, 1.32][i] + 'em">' + esc(s) + "</button>").join("") + "</div>";
    if (p) h += "<h3>" + esc(t("language")) + '</h3><div class="row"><button class="btn ' + (p.lang === "it" ? "primary" : "ghost") + '" data-act="lang" data-v="it">Italiano</button><button class="btn ' + (p.lang === "en" ? "primary" : "ghost") + '" data-act="lang" data-v="en">English</button></div>';
    h += "</div>";
    h += '<div class="card care"><h2>' + esc(t("caregiver")) + '</h2><p class="muted">' + esc(t("caregiverSub")) + "</p>";
    if (!unlocked) {
      h += '<form data-form="pin" class="stack"><label for="pin">' + esc(ST.pin ? t("pin") : t("setPin")) + '</label><input id="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required><button class="btn primary">' + esc(ST.pin ? t("unlock") : t("savePin")) + "</button>" + (ui.flash ? '<p class="err">' + esc(ui.flash) + "</p>" : "") + "</form></div></section>";
      ui.flash = "";
      return h;
    }
    h += caregiverHTML() + "</div></section>";
    return h;
  };

  function caregiverHTML() {
    const ed = ST.profiles.find(q => q.id === ui.editId) || P() || ST.profiles[0];
    ui.editId = ed.id;
    const Lc = L();
    let h = '<button class="btn ghost" data-act="lock">' + esc(t("lock")) + "</button>";
    if (ui.flash) { h += '<p class="flash" role="status">' + esc(ui.flash) + "</p>"; ui.flash = ""; }
    // profile picker
    h += "<h3>" + esc(t("profiles")) + '</h3><div class="row wrap">' + ST.profiles.map(q => '<button class="btn ' + (q.id === ed.id ? "primary" : "ghost") + '" data-act="edit" data-id="' + q.id + '">' + esc(q.name) + " (" + q.age + ")</button>").join("") + "</div>";
    // edit form
    h += '<form data-form="profile" class="stack formbox"><div class="grid2"><div><label for="pf-name">' + esc(t("name")) + '</label><input id="pf-name" name="name" value="' + esc(ed.name) + '" required></div><div><label for="pf-age">' + esc(t("age")) + '</label><input id="pf-age" name="age" type="number" min="18" max="110" value="' + ed.age + '" required></div></div>';
    h += '<label for="pf-lang">' + esc(t("language")) + '</label><select id="pf-lang" name="lang"><option value="it"' + (ed.lang === "it" ? " selected" : "") + '>Italiano</option><option value="en"' + (ed.lang === "en" ? " selected" : "") + ">English</option></select>";
    h += "<fieldset><legend>" + esc(t("mobility")) + "</legend>" + ["independent", "support", "seated"].map(m => '<label class="radio"><input type="radio" name="mob" value="' + m + '"' + (ed.mob === m ? " checked" : "") + "> " + esc(t("mob_" + m)) + "</label>").join("") + "</fieldset>";
    h += '<label class="radio"><input type="checkbox" name="allowFloor"' + (ed.allowFloor ? " checked" : "") + "> <span>" + esc(t("allowFloor")) + "<small>" + esc(t("allowFloorSub")) + "</small></span></label>";
    h += '<button class="btn primary">' + esc(t("save")) + "</button></form>";
    // familiar / hidden
    h += "<h3>" + esc(t("manageEx")) + " · " + esc(ed.name) + '</h3><p class="muted small">' + esc(t("manageSub")) + "</p>";
    const cats = Object.keys(T.it.cats);
    cats.forEach(c => {
      const list = allEx().filter(e => e.cat === c && ok(e, ed, true));
      if (!list.length) return;
      h += '<details class="mgr"' + (c === "custom" || c === "posture" ? " open" : "") + "><summary>" + esc(T[Lc].cats[c]) + " (" + list.length + ")</summary><ul>";
      list.forEach(e => {
        const f = ed.familiar.includes(e.id), hd = ed.hidden.includes(e.id);
        h += '<li><span class="mname' + (hd ? " struck" : "") + '">' + esc(txt(e, "n")) + '</span><span class="row">' +
          '<button class="mini' + (f ? " on" : "") + '" data-act="fam" data-id="' + e.id + '" aria-pressed="' + f + '">' + icon("star") + esc(t("familiar")) + "</button>" +
          '<button class="mini' + (hd ? " on warn" : "") + '" data-act="hide" data-id="' + e.id + '" aria-pressed="' + hd + '">' + esc(hd ? t("hidden") : t("hide")) + "</button>" +
          (e.cat === "custom" ? (ui.delId === e.id ? '<button class="mini warn on" data-act="delc" data-id="' + e.id + '">' + esc(t("confirmDel")) + "</button>" : '<button class="mini" data-act="askdel" data-id="' + e.id + '">' + esc(t("del")) + "</button>") : "") +
          "</span></li>";
      });
      h += "</ul></details>";
    });
    // add custom
    h += '<form data-form="custom" class="stack formbox"><h3>' + esc(t("addEx")) + '</h3><label for="cx-n">' + esc(t("exName")) + '</label><input id="cx-n" name="n" required><label for="cx-d">' + esc(t("exHow")) + '</label><textarea id="cx-d" name="d" rows="3"></textarea><label for="cx-r">' + esc(t("exDose")) + '</label><input id="cx-r" name="r">';
    h += '<div class="grid2"><div><label for="cx-part">' + esc(t("exPart")) + '</label><select id="cx-part" name="part">' + PARTS.concat(["full"]).map(pt => '<option value="' + pt + '">' + esc(T[Lc].parts[pt]) + "</option>").join("") + '</select></div><div><label for="cx-pos">' + esc(t("exPos")) + '</label><select id="cx-pos" name="pos"><option value="s">' + esc(t("pos_s")) + '</option><option value="c">' + esc(t("pos_c")) + '</option><option value="free">' + esc(t("pos_free")) + '</option><option value="f">' + esc(t("pos_f")) + "</option></select></div></div>";
    h += "<fieldset><legend>" + esc(t("forWho")) + "</legend>" + ST.profiles.map(q => '<label class="radio"><input type="checkbox" name="for" value="' + q.id + '"' + (q.id === ed.id ? " checked" : "") + "> " + esc(q.name) + "</label>").join("") + "</fieldset>";
    h += '<button class="btn primary">' + esc(t("add")) + "</button></form>";
    // add profile
    h += '<form data-form="newprofile" class="stack formbox"><h3>' + esc(t("newProfile")) + '</h3><div class="grid2"><div><label for="np-n">' + esc(t("name")) + '</label><input id="np-n" name="name" required></div><div><label for="np-a">' + esc(t("age")) + '</label><input id="np-a" name="age" type="number" min="18" max="110" required></div></div><button class="btn primary">' + esc(t("add")) + "</button></form>";
    // transfer
    const code = exportCode();
    h += '<div class="stack formbox"><h3>' + esc(t("transfer")) + '</h3><p class="muted small">' + esc(t("transferSub")) + '</p><textarea id="exp" rows="3" readonly>' + esc(code) + '</textarea><button class="btn ghost" data-act="copy">' + esc(t("copy")) + '</button><form data-form="import" class="stack"><label for="imp">' + esc(t("importLabel")) + '</label><textarea id="imp" name="code" rows="3"></textarea><button class="btn ghost">' + esc(t("importBtn")) + "</button></form></div>";
    h += ui.resetAsk ? '<button class="btn warn" data-act="reset2">' + esc(t("confirmReset")) + "</button>" : '<button class="btn ghost" data-act="reset1">' + esc(t("reset")) + "</button>";
    return h;
  }
  function exportCode() {
    const d = JSON.parse(JSON.stringify(ST)); d.active = null;
    try { return "FG1:" + btoa(unescape(encodeURIComponent(JSON.stringify(d)))); } catch (e) { return ""; }
  }

  // ---------- games ----------
  function startLvl(p) { return p.age >= 75 ? 1 : 2; }
  function finishGame(score, verdict, detail) {
    const p = P(), g = G.id;
    let lv = p.lvl[g] || startLvl(p);
    if (verdict > 0) lv = Math.min(5, lv + 1); else if (verdict < 0) lv = Math.max(1, lv - 1);
    p.lvl[g] = lv;
    p.brain.push({ d: today(), g, s: score });
    if (p.brain.length > 500) p.brain = p.brain.slice(-500);
    save();
    G.over = true;
    gameBox('<div class="result"><p class="eyebrow">' + esc(t("score")) + '</p><p class="big-num">' + esc(detail) + "</p><p>" + esc(verdict > 0 ? t("great") : verdict < 0 ? t("easier") : t("good")) + '</p><div class="row wrap"><button class="btn primary" data-act="again">' + esc(t("again")) + '</button><a class="btn ghost" href="#brain">' + esc(t("backToGames")) + "</a></div></div>");
  }
  function gameBox(html) { const el = document.getElementById("gamebox"); if (el) el.innerHTML = html; }

  VIEWS.game = id => {
    const g = GAMES.find(x => x.id === id);
    if (!g) { location.hash = "#brain"; return ""; }
    const p = P(), lv = p.lvl[id] || startLvl(p);
    G = { id, lv };
    setTimeout(() => GAME[id].init(), 0);
    return '<section class="stack"><a class="btn ghost backbtn" href="#brain">' + icon("back") + esc(t("backToGames")) + '</a><div class="gtitle"><h1>' + esc(g[L()][0]) + '</h1><span class="chip plain">' + esc(t("level")) + " " + lv + '</span></div><p class="muted">' + esc(g[L()][1]) + '</p><div id="gamebox" class="gamebox" aria-live="polite"></div></section>';
  };

  const SYMS = ["🍎", "🌻", "🐱", "🚲", "☕", "🎵", "⚽", "🏠", "🌙", "🐟", "🍋", "🔑", "🎈", "🐦", "🍇", "⛵"];
  const GAME = {};
  GAME.memory = {
    init() { const pairs = [4, 6, 8, 8, 10][G.lv - 1]; const s = shuffle(SYMS).slice(0, pairs); Object.assign(G, { pairs, cards: shuffle(s.concat(s)).map(x => ({ s: x, open: false, done: false })), first: null, lock: false, moves: 0, found: 0 }); this.draw(); },
    draw() {
      const cols = G.pairs <= 4 ? 4 : G.pairs <= 8 ? 4 : 5;
      gameBox('<p class="gstat">' + esc(t("moves")) + ": <b>" + G.moves + '</b></p><div class="memgrid" style="--cols:' + cols + '">' + G.cards.map((c, i) => '<button class="mcard' + (c.open || c.done ? " up" : "") + (c.done ? " matched" : "") + '" data-act="mem" data-i="' + i + '" aria-label="' + (c.open || c.done ? c.s : "?") + '">' + (c.open || c.done ? c.s : "") + "</button>").join("") + "</div>");
    },
    tap(i) {
      const c = G.cards[i]; if (G.lock || G.over || c.open || c.done) return;
      c.open = true;
      if (G.first === null) { G.first = i; this.draw(); return; }
      G.moves++;
      const a = G.cards[G.first];
      if (a.s === c.s) { a.done = c.done = true; a.open = c.open = false; G.first = null; G.found++; this.draw(); if (G.found === G.pairs) setTimeout(() => { const v = G.moves <= G.pairs * 1.6 ? 1 : G.moves > G.pairs * 3 ? -1 : 0; finishGame(G.moves, v, G.moves + " " + t("moves").toLowerCase()); }, 500); return; }
      G.lock = true; this.draw();
      timers.push(setTimeout(() => { a.open = c.open = false; G.first = null; G.lock = false; this.draw(); }, 1100));
    }
  };
  GAME.anagram = {
    init() {
      const rng5 = [[3, 5], [5, 6], [6, 7], [7, 8], [8, 12]][G.lv - 1];
      let words = WORDS[L()].filter(w => w.length >= rng5[0] && w.length <= rng5[1]);
      Object.assign(G, { words: shuffle(words).slice(0, 5), i: 0, right: 0 });
      this.next();
    },
    next() {
      if (G.i >= G.words.length) { const v = G.right >= 4 ? 1 : G.right <= 1 ? -1 : 0; return finishGame(G.right, v, G.right + " / " + G.words.length); }
      const w = G.words[G.i]; let letters;
      do { letters = shuffle(w.split("")); } while (letters.join("") === w && new Set(w).size > 1);
      Object.assign(G, { w, tiles: letters.map(ch => ({ ch, used: false })), built: [], msg: "" });
      this.draw();
    },
    draw() {
      gameBox('<p class="gstat">' + (G.i + 1) + " / " + G.words.length + '</p><div class="slots">' + G.w.split("").map((_, k) => '<span class="slot">' + (G.built[k] !== undefined ? G.tiles[G.built[k]].ch : "") + "</span>").join("") + '</div><p class="msg" role="status">' + esc(G.msg) + '</p><div class="tiles">' + G.tiles.map((x, k) => '<button class="tile" data-act="ana" data-i="' + k + '"' + (x.used ? " disabled" : "") + ">" + x.ch + "</button>").join("") + '</div><div class="row wrap"><button class="btn ghost" data-act="anadel">' + esc(t("clear")) + '</button><button class="btn ghost" data-act="anahint">' + esc(t("hint")) + '</button><button class="btn ghost" data-act="anaskip">' + esc(t("skip")) + "</button></div>");
    },
    tap(k) {
      if (G.over || G.tiles[k].used) return;
      G.tiles[k].used = true; G.built.push(k); G.msg = "";
      if (G.built.length === G.w.length) {
        const guess = G.built.map(b => G.tiles[b].ch).join("");
        if (guess === G.w) { G.msg = "✓ " + G.w; G.right++; G.i++; this.draw(); timers.push(setTimeout(() => this.next(), 1000)); return; }
        G.msg = t("tryAgain"); G.built.forEach(b => G.tiles[b].used = false); G.built = [];
      }
      this.draw();
    },
    del() { const b = G.built.pop(); if (b !== undefined) G.tiles[b].used = false; this.draw(); },
    hint() { G.built.forEach(b => G.tiles[b].used = false); G.built = []; const k = G.tiles.findIndex(x => x.ch === G.w[0]); G.tiles[k].used = true; G.built.push(k); this.draw(); },
    skip() { G.msg = ""; G.i++; this.next(); }
  };
  GAME.math = {
    init() { Object.assign(G, { q: 0, right: 0, total: 10 }); this.next(); },
    make() {
      const lv = G.lv, R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      let a, b, op, ans;
      const kind = lv <= 1 ? "+" : lv === 2 ? shuffle(["+", "-"])[0] : lv === 3 ? shuffle(["+", "-", "×"])[0] : shuffle(["+", "-", "×", "×"])[0];
      if (kind === "+") { const m = [10, 20, 50, 100, 200][lv - 1]; a = R(1, m); b = R(1, m); ans = a + b; }
      else if (kind === "-") { const m = [10, 30, 50, 100, 200][lv - 1]; a = R(5, m); b = R(1, a); ans = a - b; }
      else { const m = lv === 3 ? 5 : 10; a = R(2, m); b = R(2, lv === 5 ? 12 : 10); ans = a * b; }
      op = kind;
      const opts = new Set([ans]);
      while (opts.size < 3) { const d = R(1, Math.max(3, Math.round(ans * 0.2))) * (Math.random() < 0.5 ? -1 : 1); if (ans + d >= 0) opts.add(ans + d); }
      return { text: a + " " + op + " " + b, ans, opts: shuffle([...opts]) };
    },
    next() { if (G.q >= G.total) { const v = G.right >= 9 ? 1 : G.right <= 5 ? -1 : 0; return finishGame(G.right, v, G.right + " / " + G.total); } G.cur = this.make(); G.msg = ""; this.draw(); },
    draw() { gameBox('<p class="gstat">' + (G.q + 1) + " / " + G.total + '</p><p class="sum">' + G.cur.text + ' = ?</p><p class="msg" role="status">' + esc(G.msg) + '</p><div class="opts">' + G.cur.opts.map(o => '<button class="btn opt" data-act="mathans" data-v="' + o + '"' + (G.wait ? " disabled" : "") + ">" + o + "</button>").join("") + "</div>"); },
    ans(v) { if (G.wait || G.over) return; const okk = +v === G.cur.ans; if (okk) G.right++; G.msg = okk ? "✓" : "✗ " + G.cur.text + " = " + G.cur.ans; G.q++; G.wait = true; this.draw(); timers.push(setTimeout(() => { G.wait = false; this.next(); }, okk ? 600 : 1600)); }
  };
  GAME.colors = {
    cols: ["red", "blue", "green", "yellow"],
    names: { it: { red: "ROSSO", blue: "BLU", green: "VERDE", yellow: "GIALLO" }, en: { red: "RED", blue: "BLUE", green: "GREEN", yellow: "YELLOW" } },
    init() { Object.assign(G, { q: 0, right: 0, total: 12, times: [] }); this.next(); },
    next() {
      if (G.q >= G.total) { const avg = G.times.length ? (G.times.reduce((a, b) => a + b, 0) / G.times.length / 1000).toFixed(1) : "-"; const v = G.right >= 11 ? 1 : G.right <= 7 ? -1 : 0; return finishGame(G.right, v, G.right + " / " + G.total + " · " + avg + " s"); }
      const congruentP = [0.5, 0.35, 0.25, 0.15, 0.1][G.lv - 1];
      const word = shuffle(this.cols)[0]; let ink = word;
      if (Math.random() > congruentP) ink = shuffle(this.cols.filter(c => c !== word))[0];
      G.cur = { word, ink }; G.t0 = Date.now(); G.msg = ""; this.draw();
    },
    draw() { const N = this.names[L()]; gameBox('<p class="gstat">' + (G.q + 1) + " / " + G.total + '</p><p class="muted">' + esc(t("whichInk")) + '</p><p class="stroop" style="color:var(--c-' + G.cur.ink + ')">' + N[G.cur.word] + '</p><p class="msg" role="status">' + esc(G.msg) + '</p><div class="opts two">' + this.cols.map(c => '<button class="btn opt" data-act="colans" data-v="' + c + '"' + (G.wait ? " disabled" : "") + ">" + N[c] + "</button>").join("") + "</div>"); },
    ans(c) { if (G.wait || G.over) return; G.times.push(Date.now() - G.t0); const okk = c === G.cur.ink; if (okk) G.right++; G.msg = okk ? "✓" : "✗ " + this.names[L()][G.cur.ink]; G.q++; G.wait = true; this.draw(); timers.push(setTimeout(() => { G.wait = false; this.next(); }, okk ? 500 : 1300)); }
  };
  GAME.sequence = {
    init() { Object.assign(G, { len: 2 + G.lv, round: 0, rounds: 5, best: 0, startLen: 2 + G.lv }); this.show(); },
    show() {
      if (G.round >= G.rounds) { const v = G.best >= G.startLen + 1 ? 1 : G.best < G.startLen ? -1 : 0; return finishGame(G.best, v, G.best + " " + t("length").toLowerCase()); }
      G.seq = Array.from({ length: G.len }, () => 1 + Math.floor(Math.random() * 9)); G.input = []; G.phase = "show";
      const speed = G.lv >= 4 ? 800 : 1100; let k = 0;
      const step = () => {
        if (k < G.seq.length) { gameBox('<p class="muted">' + esc(t("watch")) + '</p><p class="digit">' + G.seq[k] + '</p><p class="gstat">' + (k + 1) + " / " + G.seq.length + "</p>"); timers.push(setTimeout(() => { gameBox('<p class="muted">' + esc(t("watch")) + '</p><p class="digit"> </p><p class="gstat">&nbsp;</p>'); k++; timers.push(setTimeout(step, 250)); }, speed)); }
        else { G.phase = "input"; this.draw(); }
      };
      timers.push(setTimeout(step, 600));
    },
    draw(msg) { gameBox('<p class="muted">' + esc(t("typeSeq")) + '</p><div class="slots">' + G.seq.map((_, k) => '<span class="slot">' + (G.input[k] || "") + "</span>").join("") + '</div><p class="msg" role="status">' + esc(msg || "") + '</p><div class="pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => '<button class="tile" data-act="seq" data-v="' + d + '">' + d + "</button>").join("") + '<button class="tile wide" data-act="seqdel">' + esc(t("clear")) + "</button></div>"); },
    tap(d) {
      if (G.phase !== "input" || G.over) return;
      G.input.push(+d);
      if (G.input.length === G.seq.length) {
        const okk = G.input.join() === G.seq.join(); G.phase = "wait";
        if (okk) { G.best = Math.max(G.best, G.len); G.len++; } else G.len = Math.max(2, G.len - 1);
        G.round++;
        this.draw(okk ? "✓" : "✗ " + G.seq.join(" "));
        timers.push(setTimeout(() => this.show(), okk ? 900 : 2200));
        return;
      }
      this.draw();
    },
    del() { if (G.phase === "input") { G.input.pop(); this.draw(); } }
  };
  GAME.words = {
    init() {
      const cats = CATEGORIES[L()], c = cats[Math.floor(Math.random() * cats.length)];
      const letter = G.lv >= 3 ? LETTERS[L()][Math.floor(Math.random() * LETTERS[L()].length)] : "";
      Object.assign(G, { cat: c, letter, count: 0, left: 60, running: false });
      this.draw();
    },
    draw() {
      gameBox('<p class="muted">' + esc(t("sayWords")) + '</p><p class="catname">' + esc(G.cat) + (G.letter ? '<small>' + esc(t("startingWith")) + " <b>" + G.letter + "</b></small>" : "") + '</p><p class="digit small-digit">' + G.left + ' s</p><p class="gstat">' + esc(t("words")) + ": <b>" + G.count + "</b></p>" +
        (G.running ? '<button class="btn primary huge" data-act="wplus">+1</button><p class="muted small">' + esc(t("tapEach")) + "</p>" : '<button class="btn primary big" data-act="wstart">' + esc(t("start")) + "</button>"));
    },
    start() { if (G.running) return; G.running = true; this.draw(); const iv = setInterval(() => { G.left--; if (G.left <= 0) { clearInterval(iv); G.running = false; const goal = G.letter ? 8 : 12; const v = G.count >= goal ? 1 : G.count < goal / 2 ? -1 : 0; finishGame(G.count, v, G.count + " " + t("words").toLowerCase()); } else this.draw(); }, 1000); timers.push(iv); },
    plus() { if (G.running) { G.count++; this.draw(); } }
  };

  // ---------- actions ----------
  const ACT = {
    pick: el => { ST.active = el.dataset.id; save(); location.hash = "#today"; route(); },
    ack: () => { P().ack = true; save(); route(); },
    done: el => { toggleDone(P(), el.dataset.id); const y = window.scrollY; route(); window.scrollTo(0, y); },
    swap: el => { swapItem(P(), +el.dataset.i); const y = window.scrollY; route(); window.scrollTo(0, y); },
    walk: el => { const p = P(), ds = today(); p.walk[ds] = Math.max(0, (p.walk[ds] || 0) + +el.dataset.n); save(); const y = window.scrollY; route(); window.scrollTo(0, y); },
    back: () => { if (history.length > 1) history.back(); else location.hash = "#today"; },
    say: el => speak(el.dataset.text),
    timer: () => {
      const box = document.getElementById("timer"), out = document.getElementById("tleft"), btn = document.getElementById("tbtn");
      if (!box.hidden) { clearTimers(); box.hidden = true; btn.textContent = t("timer"); return; }
      let left = 60; box.hidden = false; out.textContent = left; btn.textContent = t("stopTimer");
      const iv = setInterval(() => { left--; out.textContent = left; if (left <= 0) { clearInterval(iv); out.textContent = "✓"; btn.textContent = t("timer"); try { navigator.vibrate && navigator.vibrate(300); } catch (e) {} } }, 1000);
      timers.push(iv);
    },
    fpart: el => { ui.part = el.dataset.v; route(); },
    fcat: el => { ui.cat = el.dataset.v; route(); },
    size: el => { ST.size = +el.dataset.v; save(); route(); },
    lang: el => { P().lang = el.dataset.v; save(); route(); },
    lock: () => { unlocked = false; route(); },
    edit: el => { ui.editId = el.dataset.id; route(); },
    fam: el => { const p = ST.profiles.find(q => q.id === ui.editId), id = el.dataset.id; p.familiar = p.familiar.includes(id) ? p.familiar.filter(x => x !== id) : p.familiar.concat(id); p.plans = {}; save(); keepScroll(); },
    hide: el => { const p = ST.profiles.find(q => q.id === ui.editId), id = el.dataset.id; p.hidden = p.hidden.includes(id) ? p.hidden.filter(x => x !== id) : p.hidden.concat(id); p.plans = {}; save(); keepScroll(); },
    askdel: el => { ui.delId = el.dataset.id; keepScroll(); },
    delc: el => { const id = el.dataset.id; ST.custom = ST.custom.filter(c => c.id !== id); ST.profiles.forEach(p => { p.familiar = p.familiar.filter(x => x !== id); p.hidden = p.hidden.filter(x => x !== id); p.plans = {}; }); ui.delId = null; save(); keepScroll(); },
    copy: () => { const ta = document.getElementById("exp"); const done = () => { ui.flash = t("copied"); keepScroll(); }; try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); }); } catch (e) { ta.select(); } },
    reset1: () => { ui.resetAsk = true; keepScroll(); },
    reset2: () => { ST = seed(); save(); ui = { part: "all", cat: "all", editId: null, delId: null, resetAsk: false, flash: "" }; unlocked = false; location.hash = "#who"; route(); },
    again: () => { route(); },
    mem: el => GAME.memory.tap(+el.dataset.i),
    ana: el => GAME.anagram.tap(+el.dataset.i), anadel: () => GAME.anagram.del(), anahint: () => GAME.anagram.hint(), anaskip: () => GAME.anagram.skip(),
    mathans: el => GAME.math.ans(el.dataset.v), colans: el => GAME.colors.ans(el.dataset.v),
    seq: el => GAME.sequence.tap(el.dataset.v), seqdel: () => GAME.sequence.del(),
    wstart: () => GAME.words.start(), wplus: () => GAME.words.plus()
  };
  function keepScroll() { const y = window.scrollY; route(); window.scrollTo(0, y); }
  document.addEventListener("click", e => { const el = e.target.closest("[data-act]"); if (!el) return; e.preventDefault(); const f = ACT[el.dataset.act]; if (f) f(el); });

  const FORMS = {
    pin: f => {
      const v = f.pin.value.trim();
      if (!/^\d{4}$/.test(v)) { ui.flash = t("wrongPin"); return route(); }
      if (!ST.pin) { ST.pin = v; save(); unlocked = true; }
      else if (v === ST.pin) unlocked = true;
      else ui.flash = t("wrongPin");
      route();
    },
    profile: f => {
      const p = ST.profiles.find(q => q.id === ui.editId);
      p.name = f.name.value.trim() || p.name; p.age = Math.max(18, Math.min(110, +f.age.value || p.age)); p.lang = f.lang.value;
      p.mob = (f.querySelector("input[name=mob]:checked") || {}).value || p.mob; p.allowFloor = f.allowFloor.checked; p.plans = {};
      ST.example = false; save(); ui.flash = t("saved"); keepScroll();
    },
    custom: f => {
      const pos = f.pos.value, ids = [...f.querySelectorAll("input[name=for]:checked")].map(x => x.value);
      const name = f.n.value.trim(); if (!name) return;
      const ex = { id: "c-" + uid(), cat: "custom", part: f.part.value, s: pos === "s", c: pos === "c", f: pos === "f", min: 2, for: ids, text: { n: name, d: f.d.value.trim(), r: f.r.value.trim() } };
      ST.custom.push(ex);
      ST.profiles.forEach(p => { if (ids.includes(p.id)) { p.familiar.push(ex.id); p.plans = {}; } });
      ST.example = false; save(); ui.flash = t("added"); keepScroll();
    },
    newprofile: f => {
      const name = f.name.value.trim(), age = +f.age.value; if (!name || !age) return;
      const p = mkProfile("p" + uid(), name, Math.max(18, Math.min(110, age)), L(), age >= 75 ? "support" : "independent");
      ST.profiles.push(p); ui.editId = p.id; ST.example = false; save(); keepScroll();
    },
    import: f => {
      try {
        const raw = f.code.value.trim(); if (!raw.startsWith("FG1:")) throw 0;
        const d = JSON.parse(decodeURIComponent(escape(atob(raw.slice(4)))));
        if (!d.profiles) throw 0;
        d.active = null; ST = d; save(); unlocked = false; ui.editId = null; location.hash = "#who"; route();
      } catch (e) { ui.flash = t("importBad"); keepScroll(); }
    }
  };
  document.addEventListener("submit", e => { const f = e.target.closest("[data-form]"); if (!f) return; e.preventDefault(); FORMS[f.dataset.form](f); });

  // ---------- boot ----------
  if (ST.active && !P()) ST.active = null;
  route();
  // Offline support when hosted (GitHub Pages). Ignored where service workers are unavailable.
  try { if ("serviceWorker" in navigator && location.protocol === "https:" && !/claude/.test(location.hostname)) navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) {}
})();
