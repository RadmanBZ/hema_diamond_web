(() => {
const C = window.HD_CONFIG, T = window.HD_I18N;
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
let lang = "en";
try { lang = localStorage.getItem("hd_lang") || (navigator.language || "").slice(0, 2); } catch (e) {}
if (!T[lang]) lang = "en";
const t = k => T[lang][k] || T.en[k] || "";

const waHref = txt => `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent(txt)}`;
function syncWa() {
  $$(".wa").forEach(a => {
    const key = a.dataset.waMsg;
    a.href = waHref(key ? (t(key) || "Hello Hema Diamond") : "Hello Hema Diamond");
  });
}
function setLang(l) {
  lang = l;
  try { localStorage.setItem("hd_lang", l); } catch (e) {}
  document.documentElement.lang = l;
  document.documentElement.dir = l === "en" ? "ltr" : "rtl";
  $$("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$("[data-ph]").forEach(e => { e.placeholder = t(e.dataset.ph); });
  $$("[data-i18n-aria]").forEach(e => e.setAttribute("aria-label", t(e.dataset.i18nAria)));
  $$(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
  paintFoot();
  paintCatalogLabels();
  syncWa();
  const welcome = $("#msgs .msg.bot[data-w]");
  if (welcome) welcome.textContent = t("chat_welcome");
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
function paintCatalogLabels() {
  $$("[data-prod-name]").forEach(el => {
    const key = el.dataset.prodName;
    el.textContent = t(key);
  });
  $$("[data-pack]").forEach(el => {
    el.textContent = t("pack").replace("{n}", el.dataset.pack);
  });
  $$("[data-ask-label]").forEach(el => { el.textContent = t("req"); });
}

$$(".lang-btn").forEach(b => { b.onclick = () => setLang(b.dataset.lang); });

let lenis = null;
try {
  if (window.Lenis && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    lenis = new Lenis({ lerp: .09 });
    (function r(ts) { lenis.raf(ts); requestAnimationFrame(r); })(0);
  }
} catch (e) {}
const goTo = sel => {
  const el = $(sel);
  if (!el) return;
  lenis ? lenis.scrollTo(el, { offset: -8 }) : el.scrollIntoView({ behavior: "smooth" });
};
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (a && a.getAttribute("href").length > 1) {
    e.preventDefault();
    goTo(a.getAttribute("href"));
  }
});

const io = new IntersectionObserver(es => es.forEach(x => {
  if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
}), { threshold: .12 });
$$(".reveal").forEach(el => io.observe(el));
const hero = $(".sx-hero");
if (hero) requestAnimationFrame(() => hero.classList.add("in"));

const hd = $("#hd");
const paintHd = () => { if (hd) hd.classList.toggle("solid", scrollY > 36); };
paintHd();
addEventListener("scroll", paintHd, { passive: true });
if (lenis) lenis.on("scroll", paintHd);

const sample = $("#sampleForm");
if (sample) {
  sample.onsubmit = e => {
    e.preventDefault();
    const f = new FormData(sample);
    const msg = [
      t("hx_sample_wa_title") || "Hotel sample batch request – Hema Diamond",
      `${t("hx_f_hotel")}: ${f.get("hotel")}`,
      `${t("f_name")}: ${f.get("name")}`,
      `${t("f_phone")}: ${f.get("phone")}`,
      `${t("hx_f_covers")}: ${f.get("covers")}`,
      `${t("hx_f_items")}: ${f.get("items")}`,
      `${t("hx_f_date")}: ${f.get("date")}`,
      `${t("f_msg")}: ${f.get("msg")}`
    ].join("\n");
    window.open(waHref(msg), "_blank", "noopener");
  };
}

let cat = "all";
const filters = $$(".sx-filter");
const products = $$(".sx-prod");
filters.forEach(b => {
  b.onclick = () => {
    cat = b.dataset.cat;
    filters.forEach(x => x.classList.toggle("active", x === b));
    products.forEach(p => {
      const show = cat === "all" || p.dataset.cat === cat;
      p.classList.toggle("hide", !show);
    });
  };
});
document.addEventListener("click", e => {
  const card = e.target.closest(".sx-prod[data-ask]");
  if (!card) return;
  const name = t(card.dataset.ask) || card.dataset.ask;
  window.open(waHref(`B2B inquiry – ${name}`), "_blank", "noopener");
});

if (matchMedia("(pointer:fine)").matches) {
  const dot = $(".cur-dot"), ring = $(".cur-ring");
  if (dot && ring) {
    let x = 0, y = 0, rx = 0, ry = 0;
    addEventListener("mousemove", e => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px,${y}px)`;
    });
    (function loop() {
      rx += (x - rx) * .16; ry += (y - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", e =>
      ring.classList.toggle("big", !!e.target.closest("a,button,.sx-glass,.sx-prod,input,textarea")));
  }
}

const win = $("#chat"), msgs = $("#msgs");
if (win && msgs && $("#chatBtn")) {
  $("#chatBtn").onclick = () => {
    win.classList.toggle("open");
    $("#chatBtn").classList.toggle("on", win.classList.contains("open"));
  };
  if ($("#chatClose")) $("#chatClose").onclick = () => {
    win.classList.remove("open");
    $("#chatBtn").classList.remove("on");
  };
  const bot = document.createElement("div");
  bot.className = "msg bot";
  bot.dataset.w = "1";
  bot.textContent = t("chat_welcome");
  msgs.appendChild(bot);
  if ($("#chatForm")) {
    $("#chatForm").onsubmit = e => {
      e.preventDefault();
      const inp = $("#chatIn");
      const q = (inp && inp.value || "").trim();
      if (!q) return;
      inp.value = "";
      window.open(waHref(q), "_blank", "noopener");
    };
  }
}

setLang(lang);
})();
