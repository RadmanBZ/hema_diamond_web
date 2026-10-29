(() => {
const C = window.HD_CONFIG, T = window.HD_I18N, $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
const preT0 = performance.now();
let preGone = false;
const hidePre = () => {
  if (preGone) return;
  preGone = true;
  const pre = document.getElementById("pre");
  if (!pre) return;
  pre.classList.add("done");
  setTimeout(() => { pre.classList.add("off"); pre.setAttribute("aria-hidden", "true"); }, 280);
};
addEventListener("load", () => setTimeout(hidePre, Math.max(0, 2100 - (performance.now() - preT0))));
setTimeout(hidePre, 4600);
let lang = "en", cat = "all";
try { lang = localStorage.getItem("hd_lang") || (navigator.language || "").slice(0, 2); } catch (e) {}
if (!T[lang]) lang = "en";
const P = [["cabbage","veg",10,"assets/images/Cabbage.png"],["lettuce","veg",5,"assets/images/Lettuce.jpg"],["cauliflower","veg",8,"assets/images/Cauliflower.jpg"],["carrot","veg",10,"assets/images/Carrots.jpg"],["mango","tropical",4,"assets/images/Mango.jpg"],["pineapple","tropical",12,"assets/images/Pineapple.jpg"],["banana","tropical",13,"assets/images/Banana.jpg"],["grapes","fruit",8,"assets/images/Grapes.jpg"]];
const t = k => T[lang][k] || T.en[k];
function renderProducts() {
  $("#grid").innerHTML = P.filter(p => cat === "all" || p[1] === cat).map((p, i) => `<article class="card rounded-2xl overflow-hidden flex flex-col reveal in" style="--d:${i * 60}ms">
    <div class="stage${p[3] ? " photo" : " noimg"}">${p[3] ? `<img src="${p[3]}" alt="${t("p_" + p[0])}" loading="lazy">` : `<svg class="ph" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 4 58 26 32 60 6 26Z"/><path d="M6 26h52"/></svg>`}</div>
    <div class="p-5 flex flex-col gap-3 flex-1"><div><h3 class="serif text-lg font-semibold">${t("p_" + p[0])}</h3><p class="text-sm muted mt-1">${t("pack").replace("{n}", p[2])}</p></div>
    <button class="btn btn-ghost btn-ask mt-auto" data-ask="${t("p_" + p[0])}">${t("req")}</button></div></article>`).join("");
}
function setLang(l) {
  lang = l; try { localStorage.setItem("hd_lang", l); } catch (e) {}
  document.documentElement.lang = l; document.documentElement.dir = l === "en" ? "ltr" : "rtl";
  $$("[data-i18n]").forEach(e => e.textContent = t(e.dataset.i18n));
  $$("[data-ask-key]").forEach(e => { e.dataset.ask = t(e.dataset.askKey); });
  $$("[data-ph]").forEach(e => e.placeholder = t(e.dataset.ph));
  $$("[data-i18n-aria]").forEach(e => e.setAttribute("aria-label", t(e.dataset.i18nAria)));
  $$(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
  syncMap(l);
  renderProducts();
  const first = $("#msgs .msg.bot[data-w]"); if (first) first.textContent = t("chat_welcome");
  paintFoot();
  paintClients();
}
function paintFoot() {
  const mail = $("#ftMail");
  if (mail && C.EMAIL) { mail.href = "mailto:" + C.EMAIL; mail.textContent = C.EMAIL; }
  const ig = $("#ftIg");
  if (ig && C.INSTAGRAM) ig.href = C.INSTAGRAM;
  const phone = $("#ftPhone");
  if (!phone) return;
  const n = String(C.WHATSAPP || "");
  phone.textContent = /^\d{8,15}$/.test(n)
    ? (n.startsWith("968") && n.length >= 11 ? "+968 " + n.slice(3, 7) + " " + n.slice(7) : "+" + n)
    : t("ft_wa");
}
function syncMap(l) {
  const frame = $("#locMap");
  if (!frame) return;
  const hl = l === "ar" || l === "fa" ? l : "en";
  if (frame.dataset.hl === hl) return;
  frame.dataset.hl = hl;
  frame.src = "https://maps.google.com/maps?q=23.59165,58.22429&z=14&hl=" + hl + "&output=embed";
}
$$(".lang-btn").forEach(b => b.onclick = () => setLang(b.dataset.lang));
$$(".tab").forEach(b => b.onclick = () => { cat = b.dataset.cat; $$(".tab").forEach(x => x.classList.toggle("active", x === b)); renderProducts(); });
// smooth scroll
let lenis = null;
try {
  if (window.Lenis && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    lenis = new Lenis({
      lerp: .09,
      prevent: node => !!(node && (node.closest?.("#chat") || node.closest?.("#msgs") || node.id === "msgs" || node.id === "chat"))
    });
    (function r(ts) { lenis.raf(ts); requestAnimationFrame(r); })(0);
  }
} catch (e) {}
const goTo = sel => { const el = $(sel); if (!el) return; lenis ? lenis.scrollTo(el, { offset: -8 }) : el.scrollIntoView({ behavior: "smooth" }); };
document.addEventListener("click", e => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute("href").length > 1) { e.preventDefault(); goTo(a.getAttribute("href")); } });
// hero slideshow
const hs = $$(".hs"), dots = $$(".hero-dot");
let hi = 0, heroTimer = 0;
function paintHero(next, dir) {
  if (!hs.length) return;
  next = (next + hs.length) % hs.length;
  if (next === hi) return;
  const prev = hi;
  hs.forEach((s, i) => {
    s.classList.remove("on", "from-left", "from-right", "leave-left", "leave-right");
    if (i === prev) s.classList.add(dir >= 0 ? "leave-left" : "leave-right");
  });
  const el = hs[next];
  el.classList.remove("leave-left", "leave-right");
  el.classList.add(dir >= 0 ? "from-right" : "from-left");
  void el.offsetWidth;
  el.classList.remove("from-left", "from-right");
  el.classList.add("on");
  hi = next;
  dots.forEach((d, i) => d.classList.toggle("on", i === hi));
}
function armHero() {
  clearInterval(heroTimer);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  heroTimer = setInterval(() => paintHero(hi + 1, 1), 7000);
}
const prevBtn = $("#heroPrev"), nextBtn = $("#heroNext");
if (prevBtn) prevBtn.onclick = () => { paintHero(hi - 1, -1); armHero(); };
if (nextBtn) nextBtn.onclick = () => { paintHero(hi + 1, 1); armHero(); };
dots.forEach((d, i) => d.onclick = () => { paintHero(i, i > hi ? 1 : -1); armHero(); });
const quotes = $$(".voices-lead"), qdots = $$(".voices-dot");
let qi = 0;
function showQuote(n) {
  if (!quotes.length) return;
  qi = (n + quotes.length) % quotes.length;
  quotes.forEach((q, i) => { const on = i === qi; q.classList.toggle("on", on); q.setAttribute("aria-hidden", on ? "false" : "true"); });
  qdots.forEach((d, i) => d.classList.toggle("on", i === qi));
}
const qPrev = $("#voicesPrev"), qNext = $("#voicesNext");
if (qPrev) qPrev.onclick = () => showQuote(qi - 1);
if (qNext) qNext.onclick = () => showQuote(qi + 1);
qdots.forEach((d, i) => d.onclick = () => showQuote(i));
const qStage = $(".voices-stage");
if (qStage) {
  let tx = 0;
  qStage.addEventListener("touchstart", e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  qStage.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) < 42) return;
    const rtl = document.documentElement.dir === "rtl";
    showQuote(qi + ((dx < 0) === rtl ? -1 : 1));
  }, { passive: true });
}
addEventListener("keydown", e => {
  if (e.target.closest("input, textarea")) return;
  const inVoices = e.target.closest("#voices");
  if (inVoices && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    e.preventDefault();
    const rtl = document.documentElement.dir === "rtl";
    const forward = e.key === "ArrowRight" ? !rtl : rtl;
    showQuote(qi + (forward ? 1 : -1));
    return;
  }
  if (e.key === "ArrowRight") { e.preventDefault(); paintHero(hi + 1, 1); armHero(); }
  if (e.key === "ArrowLeft") { e.preventDefault(); paintHero(hi - 1, -1); armHero(); }
});
armHero();
// parallax
const pars = $$("[data-par]");
function par() { const h = innerHeight; pars.forEach(im => { const r = im.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return; im.style.transform = `translate3d(0,${(r.top + r.height / 2 - h / 2) * -.12}px,0)`; }); }
addEventListener("scroll", par, { passive: true }); par();
// whatsapp
const wa = txt => `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent(txt)}`;
$$(".wa").forEach(a => a.href = wa("Hello Hema Diamond"));
document.addEventListener("click", e => {
  const b = e.target.closest("[data-ask]"); if (!b) return;
  $("#f_product").value = b.dataset.ask; goTo("#contact"); setTimeout(() => $("#f_qty").focus({ preventScroll: true }), 700);
});
$("#qform").onsubmit = e => {
  e.preventDefault(); const f = new FormData(e.target);
  const msg = ["B2B inquiry – Hema Diamond", `Name: ${f.get("name")}`, `Company: ${f.get("company")}`, `Phone: ${f.get("phone")}`, `Product: ${f.get("product")}`, `Weekly quantity: ${f.get("qty")}`, `Details: ${f.get("msg")}`].join("\n");
  window.open(wa(msg), "_blank", "noopener");
};
// reveal
const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .12 });
$$(".reveal").forEach(el => io.observe(el));
const statsEl = $("#stats");
if (statsEl) {
  const lives = $$(".stat-live", statsEl);
  const panel = $(".stats-panel", statsEl);
  lives.forEach(el => {
    const g = el.previousElementSibling;
    if (g) g.textContent = el.dataset.count || "0";
    el.textContent = "0";
    el.closest(".stat").style.setProperty("--p", "0");
  });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = t => 1 - Math.pow(1 - t, 1.45);
  let started = false;
  const runStats = () => {
    if (started) return;
    started = true;
    statsEl.classList.add("play");
    lives.forEach((el, i) => {
      const to = +el.dataset.count || 0;
      const card = el.closest(".stat");
      el.textContent = "0";
      card.style.setProperty("--p", "0");
      if (reduce) { el.textContent = String(to); card.style.setProperty("--p", "1"); return; }
      const delay = 90 + i * 55;
      const dur = 1200;
      const t0 = performance.now() + delay;
      const tick = now => {
        const p = Math.min(1, Math.max(0, (now - t0) / dur));
        const e = ease(p);
        el.textContent = String(Math.round(to * e));
        card.style.setProperty("--p", e.toFixed(4));
        if (p < 1) requestAnimationFrame(tick);
        else {
          el.textContent = String(to);
          card.style.setProperty("--p", "1");
          card.classList.add("land");
        }
      };
      requestAnimationFrame(tick);
    });
  };
  const inView = () => {
    if (!panel) return false;
    const r = panel.getBoundingClientRect();
    if (r.height < 8) return false;
    const vh = innerHeight || 1;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visible / r.height < 0.72) return false;
    const mid = r.top + r.height / 2;
    return mid > vh * 0.2 && mid < vh * 0.84;
  };
  const watch = () => { if (!started && preGone && inView()) runStats(); };
  if (reduce) {
    const boot = () => preGone ? runStats() : setTimeout(boot, 80);
    boot();
  } else if (panel) {
    addEventListener("scroll", watch, { passive: true });
    const sio = new IntersectionObserver(watch, { threshold: [0.35, 0.6, 0.85] });
    sio.observe(panel);
    const boot = () => { if (preGone) watch(); else setTimeout(boot, 80); };
    boot();
  }
}
// header
const hd = $("#hd");
const paintHd = () => hd.classList.toggle("solid", scrollY > 48);
paintHd();
addEventListener("scroll", paintHd, { passive: true });
if (lenis) lenis.on("scroll", paintHd);
const tabItems = $$(".tabbar-item");
const tabSecs = ["home", "about", "products", "quality", "contact"].map(id => document.getElementById(id)).filter(Boolean);
const paintTab = () => {
  if (!tabItems.length || !tabSecs.length) return;
  const mark = scrollY + innerHeight * 0.34;
  let current = tabSecs[0];
  tabSecs.forEach(s => { if (s.offsetTop <= mark) current = s; });
  tabItems.forEach(a => {
    const on = a.getAttribute("href") === "#" + current.id;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
};
paintTab();
addEventListener("scroll", paintTab, { passive: true });
if (lenis) lenis.on("scroll", paintTab);
// cursor
if (matchMedia("(pointer:fine)").matches) {
  const dot = $(".cur-dot"), ring = $(".cur-ring"); let x = 0, y = 0, rx = 0, ry = 0;
  addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
  (function loop() { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  document.addEventListener("mouseover", e => ring.classList.toggle("big", !!e.target.closest("a,button,.card,.why-item,.stat,.pf,.client-card,input,textarea")));
}
// chat
const win = $("#chat"), msgs = $("#msgs"), hist = [];
["wheel", "touchmove"].forEach(ev => msgs.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
$("#chatBtn").onclick = () => { win.classList.toggle("open"); $("#chatBtn").classList.toggle("on", win.classList.contains("open")); if (win.classList.contains("open")) $("#chatIn").focus(); };
$("#chatClose").onclick = () => { win.classList.remove("open"); $("#chatBtn").classList.remove("on"); };
function add(role, text) { const d = document.createElement("div"); d.className = "msg " + role; d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
function addTyping() {
  const d = document.createElement("div");
  d.className = "msg bot typing";
  d.setAttribute("aria-label", "…");
  d.innerHTML = "<i></i><i></i><i></i>";
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}
add("bot", ""); msgs.lastChild.dataset.w = 1;
$("#chatForm").onsubmit = async e => {
  e.preventDefault();
  const inp = $("#chatIn"), q = inp.value.trim(), sendBtn = $("#chatForm button");
  if (!q || sendBtn?.disabled) return;
  inp.value = "";
  add("me", q);
  if (!C.GEMINI_API_KEY || C.GEMINI_API_KEY.startsWith("YOUR_")) return add("bot", t("chat_nokey"));
  hist.push({ role: "user", parts: [{ text: q }] });
  const wait = addTyping();
  sendBtn.disabled = true;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${C.MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": C.GEMINI_API_KEY },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: C.SYSTEM_PROMPT }] },
        contents: hist.slice(-12),
        generationConfig: { thinkingConfig: { thinkingLevel: "low" } }
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((data.error && data.error.message) || String(r.status));
    const parts = ((((data.candidates || [])[0] || {}).content || {}).parts || []).filter(p => !p.thought);
    const a = parts.map(p => p.text || "").filter(Boolean).join("").trim();
    if (!a) throw new Error("empty");
    hist.push({ role: "model", parts: parts.length ? parts : [{ text: a }] });
    wait.classList.remove("typing");
    wait.removeAttribute("aria-label");
    wait.textContent = a;
  } catch (err) {
    hist.pop();
    wait.classList.remove("typing");
    wait.removeAttribute("aria-label");
    wait.textContent = t("chat_err");
  } finally {
    clearTimeout(timer);
    sendBtn.disabled = false;
    msgs.scrollTop = msgs.scrollHeight;
  }
};
let paintClients = () => {};
(() => {
  const view = $("#clientsView"), track = $("#clientsTrack");
  if (!view || !track) return;
  const cards = $$(".client-card", track), prev = $("#clientsPrev"), next = $("#clientsNext");
  let index = 0;
  const step = () => {
    const card = cards[0];
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };
  const maxIndex = () => {
    const s = step();
    if (!s) return 0;
    return Math.max(0, cards.length - Math.round(view.clientWidth / s));
  };
  paintClients = () => {
    const s = step();
    index = Math.max(0, Math.min(index, maxIndex()));
    const x = (document.documentElement.dir === "rtl" ? 1 : -1) * index * s;
    track.style.transform = `translateX(${x}px)`;
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= maxIndex();
  };
  if (prev) prev.onclick = () => { index -= 1; paintClients(); };
  if (next) next.onclick = () => { index += 1; paintClients(); };
  addEventListener("resize", paintClients);
})();
setLang(lang);
})();
