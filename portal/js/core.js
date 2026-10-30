(() => {
const KEY = "hd_portal_v1", AUTH_KEY = "hd_portal_auth", NOTIF_KEY = "hd_portal_notifs";
const H = window.HD = {}, $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
Object.assign(H, { $, $$ });
window.HD_PORTAL = window.HD_PORTAL || { baseUrl: "" };
H.ENDPOINTS = ["GET /api/v1/products", "PATCH /api/v1/products/:id", "POST /api/v1/orders", "PATCH /api/v1/orders/:id", "POST /api/v1/claims", "PATCH /api/v1/claims/:id", "GET /api/v1/customers/:id/statement", "POST /webhooks/erp/order-status"];
H.lang = localStorage.getItem("hd_lang") || "en"; if (!window.T || !T[H.lang]) H.lang = "en";
H.t = k => (T[H.lang] && T[H.lang][k]) ?? T.en[k] ?? k;
H.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
H.money = n => Number(n).toFixed(3) + " OMR";
const day = d => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10); H.today = () => day(0);
const IMG = "../assets/images/";
const prod = a => ({ id: a[0], cat: a[1], unit: a[2], price: a[3], stock: a[4], n: { en: a[5], ar: a[6], fa: a[7] }, img: a[8] });
H.pn = p => p.n[H.lang];

H.DEMO = {
  client: { phone: "96890001111", pass: "client123", label: "Al Bustan Restaurant" },
  admin: { user: "admin", pass: "hema2026" }
};
H.session = () => { try { return JSON.parse(sessionStorage.getItem(AUTH_KEY)); } catch (e) { return null; } };
H.setSession = s => { try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(s)); } catch (e) {} };
H.clearSession = () => { try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {} };
H.loginClient = (phone, pass) => {
  const p = String(phone || "").replace(/\D/g, ""), d = H.DEMO.client;
  if (p === d.phone && pass === d.pass) { H.setSession({ role: "client", phone: d.phone, name: d.label }); return true; }
  return false;
};
H.loginAdmin = (user, pass) => {
  const d = H.DEMO.admin;
  if (String(user || "").trim() === d.user && pass === d.pass) { H.setSession({ role: "admin", user: d.user }); return true; }
  return false;
};
H.logout = () => { H.clearSession(); location.href = "index.html"; };
H.requireRole = role => {
  const s = H.session();
  if (s && s.role === role) return s;
  return null;
};

const seed = () => ({ seq: 1043, recurring: false, base: 900,
  products: [
    ["mango", "fruit", "carton", 3.2, 60, "Mango", "مانجو", "انبه", IMG + "Mango.jpg"],
    ["banana", "fruit", "carton", 5.5, 80, "Banana", "موز", "موز", IMG + "Banana.jpg"],
    ["grapes", "fruit", "carton", 6.8, 40, "Grapes", "عنب", "انگور", IMG + "Grapes.jpg"],
    ["pineapple", "fruit", "carton", 4.5, 35, "Pineapple", "أناناس", "آناناس", IMG + "Pineapple.jpg"],
    ["cabbage", "veg", "kg", .35, 400, "Cabbage", "ملفوف", "کلم", IMG + "Cabbage.png"],
    ["cauliflower", "veg", "kg", .6, 250, "Cauliflower", "قرنبيط", "گل‌کلم", IMG + "Cauliflower.jpg"],
    ["carrot", "veg", "kg", .4, 300, "Carrots", "جزر", "هویج", IMG + "Carrots.jpg"],
    ["lettuce", "greens", "basket", 1.2, 70, "Lettuce", "خس", "کاهو", IMG + "Lettuce.jpg"]
  ].map(prod),
  customer: { id: "C1", name: "Al Bustan Restaurant", limit: 5000, wallet: 320, terms: "Net 15" },
  pending: [{ id: "C2", name: "Marina Hotel Group", limit: 3000, approved: false }],
  branches: [{ id: 1, name: "Qurum", receiver: "Said Al Harthy", phone: "+968 9000 1111" }, { id: 2, name: "Al Khuwair", receiver: "Huda Al Balushi", phone: "+968 9000 2222" }],
  orders: [
    { id: "HD-1041", date: day(1), branch: "Qurum", stage: 4, driver: "Khalid", plate: "1234 AB", veh: "Cold Truck 1", lines: [{ pid: "mango", qty: 3, price: 3.2 }, { pid: "cabbage", qty: 40, price: .35 }, { pid: "lettuce", qty: 10, price: 1.2 }] },
    { id: "HD-1042", date: day(0), branch: "Al Khuwair", stage: 2, driver: "Yusuf", plate: "5521 CD", veh: "Cold Truck 2", lines: [{ pid: "grapes", qty: 6, price: 6.8 }, { pid: "carrot", qty: 25, price: .4 }] },
    { id: "HD-1043", date: day(0), branch: "Qurum", stage: 0, lines: [{ pid: "banana", qty: 4, price: 5.5 }, { pid: "pineapple", qty: 2, price: 4.5 }, { pid: "cauliflower", qty: 15, price: .6 }] }
  ],
  claims: [], daily: [11, 14, 9, 15, 18, 16, 12], sold: { mango: 210, banana: 180, pineapple: 95, cabbage: 120, lettuce: 95, grapes: 70, carrot: 88, cauliflower: 64 }, sat: [68, 22, 6, 3, 1],
  erp: [{ n: "FreshLedger ERP", ty: "REST", st: "ok", ms: 118 }, { n: "Orders webhook", ty: "Webhook", st: "ok", ms: 64 }, { n: "Invoice sync", ty: "REST", st: "standby", ms: 0 }, { n: "Stock sync", ty: "Webhook", st: "standby", ms: 0 }] });

const migrate = s => {
  if (!s || !Array.isArray(s.products)) return seed();
  const hasImg = s.products.every(p => p && p.img);
  const ids = s.products.map(p => p.id).join(",");
  if (!hasImg || ids.includes("tomato") || ids.includes("mint") || !ids.includes("pineapple")) {
    const next = seed();
    next.seq = s.seq || next.seq;
    next.recurring = !!s.recurring;
    next.base = s.base ?? next.base;
    next.customer = s.customer || next.customer;
    next.pending = s.pending || next.pending;
    next.branches = s.branches || next.branches;
    next.claims = s.claims || [];
    next.orders = (s.orders || []).map(o => ({
      ...o,
      lines: (o.lines || []).filter(l => next.products.some(p => p.id === l.pid)).map(l => {
        const p = next.products.find(x => x.id === l.pid);
        return { pid: l.pid, qty: l.qty, price: p ? p.price : l.price };
      })
    })).filter(o => o.lines.length);
    if (!next.orders.length) next.orders = seed().orders;
    return next;
  }
  return s;
};
const load = () => { try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return seed(); } };
let S = load();
try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
const subs = [], bc = window.BroadcastChannel ? new BroadcastChannel(KEY) : null;
const notify = () => subs.forEach(f => f());
H.S = () => S; H.sub = f => subs.push(f);
H.set = (fn, ev) => { fn(S); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { alert("Storage full"); } bc && bc.postMessage(1); notify();
  if (ev && HD_PORTAL.baseUrl) fetch(HD_PORTAL.baseUrl + ev[1], { method: ev[0], headers: { "Content-Type": "application/json" }, body: JSON.stringify(ev[2]) }).catch(() => {}); };
if (bc) bc.onmessage = () => { S = load(); notify(); };
addEventListener("storage", e => { if (e.key === KEY) { S = load(); notify(); } });
H.total = o => o.lines.reduce((a, l) => a + l.qty * l.price, 0);
H.used = () => S.base + S.orders.filter(o => !o.rej).reduce((a, o) => a + H.total(o), 0);
H.prod = id => S.products.find(p => p.id === id);

/* ── Notifications ── */
const loadNotifs = () => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || []; } catch (e) { return []; } };
let notifs = loadNotifs();
const saveNotifs = () => { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs.slice(0, 40))); } catch (e) {} };
H.notifs = () => notifs;
H.pushNotif = (title, body, type = "info") => {
  const n = { id: Date.now() + Math.random(), title, body, type, at: new Date().toISOString(), read: false };
  notifs.unshift(n); saveNotifs();
  H.toast(title, body, type);
  notify();
  return n;
};
H.markNotifsRead = (silent) => { notifs.forEach(n => n.read = true); saveNotifs(); if (!silent) notify(); };
H.unreadCount = () => notifs.filter(n => !n.read).length;

let toastHost;
const ensureToastHost = () => {
  if (!toastHost) {
    toastHost = document.createElement("div");
    toastHost.className = "toast-stack";
    document.body.appendChild(toastHost);
  }
  return toastHost;
};
H.toast = (title, body, type = "info") => {
  const host = ensureToastHost();
  const el = document.createElement("div");
  el.className = "toast " + (type === "ok" || type === "warn" ? type : "");
  el.innerHTML = `<div class="toast-ico">${type === "ok" ? "✓" : type === "warn" ? "!" : "●"}</div><div><b>${H.esc(title)}</b><span>${H.esc(body || "")}</span></div><button class="toast-x" type="button" aria-label="Close">×</button>`;
  el.querySelector(".toast-x").onclick = () => dismiss();
  host.appendChild(el);
  const dismiss = () => { el.classList.add("out"); setTimeout(() => el.remove(), 320); };
  setTimeout(dismiss, 4200);
};

H.ICO = {
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>`,
  order: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  track: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>`,
  fin: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M8 14h2"/></svg>`,
  br: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20V8l8-4 8 4v12"/><path d="M9 20v-6h6v6"/></svg>`,
  cl: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4z"/></svg>`,
  help: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8V14"/><circle cx="12" cy="17" r=".8" fill="currentColor"/></svg>`,
  hub: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`,
  fleet: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 16V8h11v8"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  cat: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h6v6H4zM14 6h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>`,
  cus: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5"/><path d="M16 11a3 3 0 1 0 0-5M21 19c0-2.5-1.5-4-4-4"/></svg>`,
  rep: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 19V5M4 19h16"/><path d="M8 15v-4M12 15V8M16 15v-7"/></svg>`,
  erp: `<svg class="tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 7h8M8 12h8M8 17h5"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`
};

/* Tracking helpers — simulated map / ETA (no real GPS) */
H.stagePct = o => o.rej ? 0 : Math.min(100, (o.stage / 4) * 100);
H.etaText = o => {
  if (o.rej) return H.t("eta_none");
  if (o.stage >= 4) return H.t("eta_done");
  const mins = [0, 18 * 60, 10 * 60, 4 * 60, 45, 0][o.stage] ?? 90;
  if (mins >= 60) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `~${mins} ${H.t("min")}`;
};
H.driverStatus = o => {
  if (o.rej) return H.t("drv_none");
  if (o.stage >= 4) return H.t("drv_done");
  if (o.stage === 3) return H.t("drv_live");
  if (o.stage === 2) return H.t("drv_prep");
  if (o.stage >= 1) return H.t("drv_assign");
  return H.t("drv_wait");
};
H.trackMap = o => {
  const pct = H.stagePct(o);
  const path = "M40 170 C90 150,110 90,160 85 S240 120,280 100 S340 40,400 55";
  // Approximate truck position along path by stage (0–4)
  const pts = [[40, 170], [120, 110], [200, 95], [300, 95], [400, 55]];
  const i = Math.min(4, Math.max(0, o.rej ? 0 : o.stage));
  const [tx, ty] = pts[i];
  const dest = o.branch || "Muscat";
  const gid = "mg" + String(o.id || "").replace(/\W/g, "") + Math.round(pct);
  return `<div class="map-box" aria-hidden="true">
    <svg viewBox="0 0 440 220" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1a6b59"/><stop offset="1" stop-color="#070908"/></linearGradient>
        <filter id="glow${gid}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="440" height="220" fill="url(#${gid})"/>
      <g opacity=".22" stroke="#D5AD63" stroke-width=".55" fill="none">
        <path d="M0 40h440M0 80h440M0 120h440M0 160h440M0 200h440"/>
        <path d="M40 0v220M80 0v220M120 0v220M160 0v220M200 0v220M240 0v220M280 0v220M320 0v220M360 0v220M400 0v220"/>
      </g>
      <path class="route-path" d="${path}"/>
      ${o.rej ? "" : `<path class="route-active" d="${path}" pathLength="100" style="stroke-dasharray:${Math.max(2, pct)} 100"/>`}
      <circle cx="40" cy="170" r="6" fill="#D5AD63"/><text x="40" y="190" text-anchor="middle" fill="#F5F3EE" font-size="9" opacity=".8">DC</text>
      <circle cx="400" cy="55" r="6" fill="#fff"/><text x="400" y="42" text-anchor="middle" fill="#F5F3EE" font-size="9" opacity=".85">${H.esc(dest)}</text>
      ${o.rej ? "" : `<g class="truck-dot" filter="url(#glow${gid})" transform="translate(${tx},${ty})">
        <circle r="9" fill="#103F35" stroke="#D5AD63" stroke-width="2"/>
        <circle r="3.5" fill="#D5AD63"/>
      </g>`}
    </svg>
    <div class="map-overlay">
      <span class="map-chip gold">${H.t("eta")}: ${H.esc(H.etaText(o))}</span>
      <span class="map-chip">${Math.round(pct)}%</span>
    </div>
  </div>`;
};
H.timeline = o => o.rej
  ? `<span class="badge bad">${H.t("rej")}</span>`
  : `<div class="prog" aria-hidden="true"><i style="--w:${H.stagePct(o)}%"></i></div>
     <div class="tl">${[0, 1, 2, 3, 4].map(i => `<div class="st ${i <= o.stage ? "done" : ""} ${i == o.stage ? "cur" : ""}"><i>${i <= o.stage ? "✓" : i + 1}</i><span>${H.t("s" + i)}</span></div>`).join("")}</div>`;

/* UltraMsg — notify admin WhatsApp on new client orders */
H.ultramsgCfg = () => {
  const c = window.HD_CONFIG || {};
  return {
    instanceId: String(c.ULTRAMSG_INSTANCE_ID || "").trim(),
    token: String(c.ULTRAMSG_TOKEN || "").trim(),
    to: String(c.ULTRAMSG_ADMIN || c.WHATSAPP || "").replace(/\D/g, "")
  };
};
H.orderNotifyBody = o => {
  const cust = S.customer || {};
  const sess = H.session() || {};
  const name = sess.name || cust.name || "Client";
  const items = (o.lines || []).map(l => {
    const p = H.prod(l.pid);
    const label = p ? (p.n.en || H.pn(p)) : l.pid;
    const unit = p ? H.t(p.unit) : "";
    return `• ${label}: ${l.qty}${unit ? " " + unit : ""}`;
  }).join("\n") || "—";
  const eta = H.etaText(o);
  const adminUrl = new URL("admin.html", location.href).href;
  return [
    "🛒 New Hema Diamond order",
    "",
    `Customer: ${name}`,
    `Order: ${o.id}`,
    `Branch: ${o.branch || "—"}`,
    `Date: ${o.date}`,
    `ETA / delivery: ${eta}`,
    `Total: ${H.money(H.total(o))}`,
    "",
    "Items:",
    items,
    "",
    `Review in admin: ${adminUrl}`
  ].join("\n");
};
H.sendWhatsAppAdmin = async (body, opts = {}) => {
  const { instanceId, token, to } = H.ultramsgCfg();
  if (!instanceId || !token || !to) {
    console.warn("[UltraMsg] skipped: missing ULTRAMSG_INSTANCE_ID / ULTRAMSG_TOKEN / ULTRAMSG_ADMIN in config.local.js");
    return { skipped: true };
  }
  const url = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/messages/chat`;
  const params = new URLSearchParams({
    token,
    to: opts.to || to,
    body: String(body || "").slice(0, 4096),
    priority: String(opts.priority ?? 10),
    referenceId: opts.referenceId || ""
  });
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
    if (!res.ok) console.warn("[UltraMsg] HTTP", res.status, data);
    return data;
  } catch (err) {
    console.warn("[UltraMsg] send failed", err);
    return { error: String(err && err.message || err) };
  }
};
H.notifyAdminNewOrder = o => {
  if (!o) return;
  H.sendWhatsAppAdmin(H.orderNotifyBody(o), { referenceId: o.id }).catch(() => {});
};

H.act = {
  place(lines, branch, rec) {
    const o = { id: "HD-" + (S.seq + 1), date: day(0), branch, stage: 0, lines: lines.map(l => ({ ...l, price: H.prod(l.pid).price })) };
    if (H.used() + H.total(o) > S.customer.limit) return "err_credit";
    H.set(s => { s.seq++; s.orders.unshift(o); s.recurring = rec; }, ["POST", "/api/v1/orders", o]);
    H.pushNotif(H.t("nt_order_t"), H.t("nt_order_b").replace("{id}", o.id), "ok");
    H.notifyAdminNewOrder(o);
  },
  stage(id, n) {
    H.set(s => {
      const o = s.orders.find(x => x.id === id); o.stage = n;
      if (n === 1) o.lines.forEach(l => { const p = s.products.find(q => q.id === l.pid); p.stock = Math.max(0, p.stock - l.qty); });
    }, ["PATCH", "/api/v1/orders/" + id, { stage: n }]);
    H.pushNotif(H.t("nt_stage_t"), `${id} · ${H.t("s" + n)}`, "ok");
  },
  reject(id) {
    H.set(s => { s.orders.find(x => x.id === id).rej = true; }, ["PATCH", "/api/v1/orders/" + id, { rejected: true }]);
    H.pushNotif(H.t("nt_rej_t"), id, "warn");
  },
  qty(id, i, v) { H.set(s => { s.orders.find(x => x.id === id).lines[i].qty = Math.max(0, +v || 0); }, ["PATCH", "/api/v1/orders/" + id, { line: i, qty: v }]); },
  fleet(id, k, v) { H.set(s => { s.orders.find(x => x.id === id)[k] = v; }); },
  branch(b) { H.set(s => { s.branches.push({ id: Date.now(), ...b }); }); H.pushNotif(H.t("nt_br_t"), b.name, "ok"); },
  claim(c) {
    H.set(s => { s.claims.unshift({ id: "CL-" + (s.claims.length + 1), date: day(0), ...c }); }, ["POST", "/api/v1/claims", c]);
    H.pushNotif(H.t("nt_claim_t"), c.order, "warn");
  },
  resolve(id, r) {
    H.set(s => { s.claims.find(x => x.id === id).res = r; }, ["PATCH", "/api/v1/claims/" + id, { res: r }]);
    H.pushNotif(H.t("nt_res_t"), `${id} · ${H.t("res_" + r)}`, "ok");
  },
  price(id, v) { H.set(s => { H.prod(id).price = +v || 0; }, ["PATCH", "/api/v1/products/" + id, { price: v }]); },
  stock(id, v) { H.set(s => { H.prod(id).stock = +v || 0; }, ["PATCH", "/api/v1/products/" + id, { stock: v }]); },
  addProduct(p) {
    const base = String(p.name || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
    let id = base, n = 2;
    while (H.prod(id)) id = base + "-" + n++;
    const name = String(p.name || "").trim();
    const item = {
      id, cat: p.cat || "fruit", unit: p.unit || "carton",
      price: +p.price || 0, stock: +p.stock || 0,
      n: { en: name, ar: (p.nameAr || name).trim(), fa: (p.nameFa || name).trim() },
      img: p.img || ""
    };
    H.set(s => { s.products.push(item); }, ["POST", "/api/v1/products", item]);
    H.pushNotif(H.t("nt_prod_t"), name, "ok");
    return item;
  },
  updateProduct(id, p) {
    const item = H.prod(id);
    if (!item) return;
    const name = String(p.name || "").trim();
    if (!name) return;
    H.set(s => {
      const x = s.products.find(q => q.id === id);
      if (!x) return;
      x.cat = p.cat || x.cat;
      x.unit = p.unit || x.unit;
      x.price = +p.price || 0;
      x.stock = +p.stock || 0;
      x.n = { en: name, ar: (p.nameAr || name).trim(), fa: (p.nameFa || name).trim() };
      if (p.img) x.img = p.img;
    }, ["PATCH", "/api/v1/products/" + id, p]);
    H.pushNotif(H.t("nt_prod_u"), name, "ok");
  },
  removeProduct(id) {
    const item = H.prod(id);
    if (!item) return;
    const name = item.n?.en || id;
    H.set(s => {
      s.products = s.products.filter(p => p.id !== id);
      s.orders.forEach(o => { o.lines = (o.lines || []).filter(l => l.pid !== id); });
      if (s.sold && s.sold[id] != null) delete s.sold[id];
    }, ["DELETE", "/api/v1/products/" + id, {}]);
    H.pushNotif(H.t("nt_prod_d"), name, "warn");
  },
  limit(v) { H.set(s => { s.customer.limit = +v || 0; }); },
  terms(v) { H.set(s => { s.customer.terms = v; }); },
  approve(id) { H.set(s => { s.pending.find(x => x.id === id).approved = true; }); H.pushNotif(H.t("nt_ap_t"), id, "ok"); },
  ping() { H.set(s => s.erp.forEach(e => { if (e.st === "ok") e.ms = 40 + Math.floor(Math.random() * 120); e.at = new Date().toLocaleTimeString(); })); H.pushNotif(H.t("nt_ping_t"), H.t("nt_ping_b"), "ok"); }
};

const notifPanel = () => {
  const list = H.notifs();
  const unread = H.unreadCount();
  return `<div class="dd" id="notifDd">
    <button class="notif-btn" type="button" data-dd="notif" aria-label="${H.t("notifs")}">${H.ICO.bell}${unread ? `<span class="nbadge">${unread > 9 ? "9+" : unread}</span>` : ""}</button>
    <div class="dd-menu" role="menu">
      <div class="dd-head"><b>${H.t("notifs")}</b>${list.length ? `<button class="btn btn-line sm" type="button" data-act="nread">${H.t("mark_read")}</button>` : ""}</div>
      ${list.length ? list.slice(0, 8).map(n => `<button class="dd-item" type="button"><b>${H.esc(n.title)}</b><span>${H.esc(n.body)}</span></button>`).join("") : `<div class="dd-empty">${H.t("no_notifs")}</div>`}
    </div>
  </div>`;
};

const tabBtn = (x, cur, pre, shortPre) => {
  const full = H.t(pre + x);
  const short = shortPre ? H.t(shortPre + x) : full;
  return `<button class="tab ${x == cur ? "on" : ""}" data-tab="${x}" type="button">` +
    `<span class="tab-ico-wrap" aria-hidden="true">${H.ICO[x] || ""}</span>` +
    `<span class="tab-lbl"><span class="lbl-full">${full}</span><span class="lbl-short">${short}</span></span></button>`;
};

const CHEV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12.5 10 17l9-10"/></svg>`;

const ensureFselLayer = () => {
  let layer = $("#fselLayer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "fselLayer";
    layer.className = "fsel-layer";
    layer.innerHTML = `<button type="button" class="fsel-scrim" aria-label="Close"></button><div class="fsel-pop" role="listbox"></div>`;
    document.body.appendChild(layer);
    layer.querySelector(".fsel-scrim").addEventListener("click", () => H.closeFancySelects());
  }
  return layer;
};

H.closeFancySelects = () => {
  $$(".fsel.open").forEach(el => {
    el.classList.remove("open");
    const b = el.querySelector(".fsel-btn");
    if (b) b.setAttribute("aria-expanded", "false");
  });
  const layer = $("#fselLayer");
  if (layer) {
    layer.classList.remove("show", "sheet");
    const pop = layer.querySelector(".fsel-pop");
    if (pop) { pop.innerHTML = ""; pop.onclick = null; pop.removeAttribute("style"); }
  }
  document.body.classList.remove("fsel-active");
};

H.enhanceSelects = (root = document) => {
  const layer = ensureFselLayer();
  const pop = layer.querySelector(".fsel-pop");

  const openSelect = (wrap, sel, btn) => {
    H.closeFancySelects();
    wrap.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("fsel-active");

    pop.innerHTML = [...sel.options].map((o, i) =>
      `<button class="fsel-opt ${o.selected ? "on" : ""} ${o.value === "" ? "fsel-placeholder" : ""}" type="button" role="option" data-i="${i}" aria-selected="${o.selected}">` +
      `<span>${H.esc(o.textContent)}</span><span class="fsel-check" aria-hidden="true">${CHECK}</span></button>`
    ).join("");

    const mobile = window.matchMedia("(max-width:979px)").matches;
    layer.classList.toggle("sheet", mobile);
    layer.classList.add("show");

    if (!mobile) {
      const r = btn.getBoundingClientRect();
      const maxH = Math.min(280, window.innerHeight * .45);
      const spaceBelow = window.innerHeight - r.bottom - 16;
      const openUp = spaceBelow < 160 && r.top > spaceBelow;
      pop.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - r.width - 12))}px`;
      pop.style.width = `${r.width}px`;
      pop.style.maxHeight = `${maxH}px`;
      if (openUp) {
        pop.style.top = "auto";
        pop.style.bottom = `${window.innerHeight - r.top + 8}px`;
      } else {
        pop.style.top = `${r.bottom + 8}px`;
        pop.style.bottom = "auto";
      }
    } else {
      pop.removeAttribute("style");
    }

    pop.onclick = e => {
      const optBtn = e.target.closest(".fsel-opt");
      if (!optBtn) return;
      e.preventDefault();
      e.stopPropagation();
      const i = +optBtn.dataset.i;
      if (!Number.isNaN(i) && sel.options[i]) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        const valEl = btn.querySelector(".fsel-val");
        if (valEl) valEl.textContent = sel.options[i].textContent;
        btn.classList.toggle("is-placeholder", sel.options[i].value === "");
      }
      H.closeFancySelects();
    };
  };

  $$(".select-wrap", root).forEach(wrap => {
    if (wrap.classList.contains("fsel-ready")) return;
    const sel = wrap.querySelector("select");
    if (!sel) return;
    wrap.classList.add("fsel", "fsel-ready");
    sel.classList.add("fsel-native");
    sel.setAttribute("tabindex", "-1");
    sel.setAttribute("aria-hidden", "true");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fsel-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `<span class="fsel-val"></span><span class="fsel-chev" aria-hidden="true">${CHEV}</span>`;

    const sync = () => {
      const opt = sel.options[sel.selectedIndex];
      btn.querySelector(".fsel-val").textContent = opt ? opt.textContent : "";
      btn.classList.toggle("is-placeholder", !!(opt && opt.value === ""));
    };
    sync();

    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      if (wrap.classList.contains("open")) H.closeFancySelects();
      else openSelect(wrap, sel, btn);
    });

    wrap.appendChild(btn);
    sel._fselSync = sync;
  });
};

H.whoLabel = sess => {
  if (!sess) return "";
  if (sess.role === "admin") return sess.user || "";
  return String(sess.name || sess.phone || "").replace(/\s+Restaurant\s*$/i, "").trim();
};

H.shell = (title, tabs, cur, pre, home, opts = {}) => {
  const sess = H.session();
  const who = H.whoLabel(sess);
  const admin = opts.admin;
  const bot = opts.bottomNav;
  if (bot) document.body.classList.add("has-bot"); else document.body.classList.remove("has-bot");
  if (admin) document.body.classList.add("is-admin"); else document.body.classList.remove("is-admin");
  const shortPre = admin ? "as_" : null;
  const tabsHtml = tabs ? tabs.map(x => tabBtn(x, cur, pre, shortPre)).join("") : "";
  return `<header class="top"><div class="wrap bar">
    <a class="logo" href="${home || "index.html"}"><img class="logo-img" src="../assets/images/logo.png" alt="Hema Diamond"><b class="serif">Hema Diamond</b></a>
    <span class="ttl serif">${H.t(title)}</span>
    <div class="bar-end">
      <div class="lg" dir="ltr">${["en", "ar", "fa"].map(l => `<button class="lb ${l == H.lang ? "on" : ""}" data-lang="${l}">${l.toUpperCase()}</button>`).join("")}</div>
      ${sess ? notifPanel() : ""}
      ${sess ? `<button class="btn btn-line sm logout" data-logout="1" type="button">${H.t("logout")}${who ? ` · ${H.esc(who)}` : ""}</button>` : ""}
    </div>
  </div>
  ${tabs && !admin ? `<div class="wrap tabs tabs-top">${tabsHtml}</div>` : ""}
  ${tabs && admin && !bot ? `<div class="wrap tabs tabs-mobile tabs-top">${tabsHtml}</div>` : ""}
  </header>
  ${bot && tabs ? `<nav class="bot-nav ${admin ? "bot-nav-admin" : ""}" aria-label="Primary"><div class="tabs">${tabsHtml}</div></nav>` : ""}`;
};

H.adminLayout = (sideTabs, cur, pre, content) =>
  `<div class="layout-admin"><nav class="side-nav" aria-label="Admin">${sideTabs.map(x => tabBtn(x, cur, pre)).join("")}</nav><div class="page-main page">${content}</div></div>`;

H.loginScreen = (role, err) => {
  const client = role === "client";
  return `<main class="auth-wrap"><div class="auth-card card card-glow"><div class="auth-brand"><img src="../assets/images/logo.png" alt=""><div><p class="mut">${H.t("pc")}</p><h1 class="serif">${H.t(client ? "tc" : "ta")}</h1></div></div>
  <form class="form auth-form" id="loginForm" autocomplete="on">
  ${client
    ? `<label class="lab">${H.t("phone")}<input id="authId" name="phone" type="tel" inputmode="tel" dir="ltr" placeholder="96890001111" required></label><label class="lab">${H.t("pass")}<input id="authPass" name="password" type="password" required></label>`
    : `<label class="lab">${H.t("user")}<input id="authId" name="username" autocomplete="username" required></label><label class="lab">${H.t("pass")}<input id="authPass" name="password" type="password" autocomplete="current-password" required></label>`}
  ${err ? `<p class="auth-err">${H.esc(err)}</p>` : ""}
  <button class="btn btn-dark" type="submit">${H.t("signin")}</button>
  </form>
  <p class="mut auth-hint" dir="ltr">${client ? "Demo · 96890001111 / client123" : "Demo · admin / hema2026"}</p>
  <a class="auth-back" href="index.html">${H.t("site")}</a>
  </div></main>`;
};

H.mount = (render, onTab) => {
  const app = $("#app");
  const draw = () => {
    document.documentElement.lang = H.lang;
    document.documentElement.dir = H.lang === "en" ? "ltr" : "rtl";
    const f = document.activeElement, id = f && f.id;
    H.closeFancySelects();
    app.innerHTML = render();
    H.enhanceSelects(app);
    if (id) { const n = $("#" + id); n && n.focus(); }
  };
  app.addEventListener("click", e => {
    const l = e.target.closest("[data-lang]"), tb = e.target.closest("[data-tab]"), out = e.target.closest("[data-logout]");
    const ddBtn = e.target.closest("[data-dd]"), nread = e.target.closest("[data-act=nread]");
    if (l) { H.lang = l.dataset.lang; localStorage.setItem("hd_lang", H.lang); draw(); }
    if (tb) { onTab(tb.dataset.tab); draw(); }
    if (out) { e.preventDefault(); H.logout(); }
    if (ddBtn) {
      e.stopPropagation();
      H.closeFancySelects();
      const box = ddBtn.closest(".dd");
      const open = box.classList.contains("open");
      $$(".dd.open").forEach(d => d.classList.remove("open"));
      if (!open) { box.classList.add("open"); H.markNotifsRead(true); ddBtn.querySelector(".nbadge")?.remove(); }
    }
    if (nread) { H.markNotifsRead(); draw(); }
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".dd")) $$(".dd.open").forEach(d => d.classList.remove("open"));
    if (!e.target.closest(".fsel") && !e.target.closest(".fsel-layer")) H.closeFancySelects();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { H.closeFancySelects(); $$(".dd.open").forEach(d => d.classList.remove("open")); }
  });
  addEventListener("resize", () => { if (document.body.classList.contains("fsel-active")) H.closeFancySelects(); });
  H.sub(() => { if (!document.activeElement || !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) draw(); });
  draw();
  return draw;
};

H.csv = (name, rows) => { const b = new Blob(["\ufeff" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); };

H.invoiceNo = o => {
  const ym = String(o.date || "").replace(/-/g, "").slice(0, 6) || new Date().toISOString().slice(0, 7).replace("-", "");
  const n = String(o.id || "").replace(/\D/g, "").padStart(4, "0").slice(-4);
  return `INV-${ym}-${n}`;
};

H.omr = n => Number(n || 0).toFixed(3);

H.printInvoice = o => {
  if (!o) return;
  const w = open("", "_blank"); if (!w) return;
  const dir = H.lang === "en" ? "ltr" : "rtl";
  const cust = S.customer || {};
  const phone = H.DEMO.client.phone ? ("00" + H.DEMO.client.phone) : "";
  const inv = H.invoiceNo(o);
  const sub = H.total(o);
  const paid = !o.rej && o.stage >= 4;
  const status = o.rej ? H.t("rej") : (paid ? H.t("paid") : H.t("unpaid"));
  const rows = (o.lines || []).map(l => {
    const p = H.prod(l.pid);
    const unit = p ? H.t(p.unit) : "";
    const name = p ? H.pn(p) : l.pid;
    const line = l.qty * l.price;
    return `<tr>
      <td class="c-prod">${H.esc(name)}</td>
      <td class="c-num" dir="ltr">${H.omr(l.qty)} ${H.esc(unit)}</td>
      <td class="c-num" dir="ltr">${H.omr(l.price)}</td>
      <td class="c-num" dir="ltr">${H.omr(line)}</td>
    </tr>`;
  }).join("");

  w.document.write(`<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><title>${H.esc(inv)} · Hema Diamond</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{--navy:#0A1628;--cyan:#00A8CC;--ink:#111827;--mut:#6B7280;--line:#E5E7EB}
  *{box-sizing:border-box}
  body{margin:0;background:#E8EDF2;font-family:Inter,Vazirmatn,system-ui,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
  .page{max-width:860px;margin:28px auto;background:#fff;box-shadow:0 24px 60px -28px rgba(10,22,40,.45);overflow:hidden}
  .hero{
    background:linear-gradient(135deg,#0A1628 0%,#12243f 55%,#0B1A30 100%);
    color:#fff;padding:28px 36px 30px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap;
    border-bottom:4px solid var(--cyan);
  }
  .brand{display:flex;align-items:center;gap:16px;min-width:0}
  .brand img{
    width:72px;height:72px;border-radius:50%;object-fit:cover;background:#fff;
    box-shadow:0 0 0 3px rgba(0,168,204,.55),0 12px 28px -10px #000;
  }
  .brand h1{margin:0;font-size:1.85rem;font-weight:800;letter-spacing:-.02em;line-height:1.15}
  .brand p{margin:6px 0 0;font-size:.82rem;opacity:.78;font-weight:500;max-width:28rem;line-height:1.45}
  .meta{text-align:end;flex:none}
  .meta .inv-no{font-size:1.15rem;font-weight:800;letter-spacing:.02em;margin:0}
  .meta .inv-date{margin:8px 0 0;font-size:.92rem;opacity:.8;font-weight:500}
  .body{padding:28px 36px 36px}
  .info{display:flex;justify-content:space-between;gap:28px;flex-wrap:wrap;margin-bottom:26px}
  .bill h3{margin:0 0 8px;font-size:.95rem;font-weight:800}
  .bill .name{margin:0;font-size:1.02rem;font-weight:600}
  .bill .phone{margin:4px 0 0;font-size:.95rem;color:var(--ink);font-variant-numeric:tabular-nums}
  .pay{text-align:end;font-size:.95rem;line-height:1.7;font-weight:500}
  .pay b{font-weight:700}
  table{width:100%;border-collapse:collapse;margin:0}
  thead th{
    background:var(--cyan);color:#fff;font-size:.92rem;font-weight:700;
    padding:12px 14px;text-align:start;border:0;
  }
  thead th.c-num{text-align:end}
  tbody td{padding:14px;border-bottom:1px solid var(--line);font-size:.95rem;vertical-align:middle}
  tbody tr:last-child td{border-bottom:1px solid #CBD5E1}
  .c-prod{font-weight:500}
  .c-num{text-align:end;font-variant-numeric:tabular-nums;font-weight:500}
  .totals{margin-top:22px;display:flex;justify-content:flex-end}
  .totals-box{min-width:min(100%,280px);text-align:end;padding-top:4px}
  .totals-box .line{display:flex;justify-content:flex-end;gap:18px;padding:5px 0;font-size:.98rem}
  .totals-box .line span:first-child{color:var(--ink);font-weight:500}
  .totals-box .due{font-size:1.12rem;font-weight:800;margin-top:4px}
  .totals-box .bal{color:var(--mut);font-size:.9rem;font-weight:500}
  .foot{margin-top:40px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.78rem;color:var(--mut)}
  @media print{
    body{background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact}
    .page{margin:0;max-width:none;box-shadow:none}
    .hero,thead th{print-color-adjust:exact;-webkit-print-color-adjust:exact}
  }
  @media(max-width:640px){
    .page{margin:0}.hero,.body{padding:20px 18px}
    .brand img{width:56px;height:56px}.brand h1{font-size:1.4rem}
    .meta{text-align:start}.pay{text-align:start}
  }
</style></head><body>
  <div class="page">
    <header class="hero">
      <div class="brand">
        <img src="../assets/images/logo.png" alt="Hema Diamond">
        <div>
          <h1>Hema Diamond</h1>
          <p>${H.esc(H.t("inv_tagline"))}</p>
        </div>
      </div>
      <div class="meta">
        <p class="inv-no">${H.esc(H.t("inv_tag"))} ${H.esc(inv)}</p>
        <p class="inv-date">${H.esc(H.t("inv_date"))}: ${H.esc(o.date || "")}</p>
      </div>
    </header>
    <div class="body">
      <div class="info">
        <div class="bill">
          <h3>${H.esc(H.t("bill_to"))}:</h3>
          <p class="name">${H.esc(cust.name || "")}</p>
          ${phone ? `<p class="phone" dir="ltr">${H.esc(phone)}</p>` : ""}
          ${o.branch ? `<p class="phone">${H.esc(o.branch)}</p>` : ""}
        </div>
        <div class="pay">
          <div>${H.esc(H.t("payment"))}: <b>${H.esc(H.t("pay_credit"))}</b></div>
          <div>${H.esc(H.t("status"))}: <b>${H.esc(status)}</b></div>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>${H.esc(H.t("col_prod"))}</th>
          <th class="c-num">${H.esc(H.t("col_qty"))}</th>
          <th class="c-num">${H.esc(H.t("col_unit"))}</th>
          <th class="c-num">${H.esc(H.t("col_tot"))}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals"><div class="totals-box">
        <div class="line"><span>${H.esc(H.t("sub"))}:</span><span dir="ltr">OMR ${H.omr(sub)}</span></div>
        <div class="line due"><span>${H.esc(H.t("total_due"))}:</span><span dir="ltr">OMR ${H.omr(sub)}</span></div>
        <div class="line bal"><span>${H.esc(H.t("balance"))}:</span><span dir="ltr">OMR ${H.omr(paid ? 0 : sub)}</span></div>
      </div></div>
      <div class="foot"><span>Hema Diamond · Muscat</span><span dir="ltr">${H.esc(inv)}</span></div>
    </div>
  </div>
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 480);
};

H.printDoc = (html, title) => {
  const w = open("", "_blank"); if (!w) return;
  const dir = H.lang === "en" ? "ltr" : "rtl";
  w.document.write(`<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><title>${H.esc(title || "Hema Diamond")}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@600;700&family=Vazirmatn:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  :root{--g:#103F35;--gold:#D5AD63;--k:#070908;--cream:#F5F3EE}
  *{box-sizing:border-box}body{margin:0;font-family:Inter,Vazirmatn,sans-serif;color:var(--k);background:#fff}
  .sheet{max-width:800px;margin:auto;padding:36px 40px}
  .ph{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:18px;border-bottom:2px solid var(--gold);margin-bottom:24px}
  .ph img{width:56px;height:56px;border-radius:50%;object-fit:cover}
  .ph h1{font-family:"Playfair Display",Vazirmatn,serif;font-size:1.6rem;color:var(--g);margin:0}
  .ph p{margin:4px 0 0;color:#5b6660;font-size:.85rem}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:#5b6660;text-align:start;padding:8px;border-bottom:2px solid var(--gold)}
  td{padding:10px 8px;border-bottom:1px solid rgba(213,173,99,.35);text-align:start}
  .sum{margin-top:20px;padding:16px 18px;background:linear-gradient(135deg,#F5F3EE,#EEF2EF);border:1px solid rgba(213,173,99,.45);border-radius:14px}
  .sum .row{display:flex;justify-content:space-between;padding:4px 0}
  .sum .tot{font-weight:700;font-size:1.15rem;color:var(--g);border-top:1px solid rgba(213,173,99,.4);margin-top:8px;padding-top:10px}
  .foot{margin-top:36px;padding-top:14px;border-top:1px solid rgba(213,173,99,.35);font-size:.78rem;color:#5b6660;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.sheet{padding:0}}
</style></head><body><div class="sheet">
  <div class="ph"><div style="display:flex;align-items:center;gap:14px"><img src="../assets/images/logo.png" alt=""><div><h1>Hema Diamond</h1><p>${H.esc(title || H.t("inv"))}</p></div></div><div style="text-align:end;font-size:.85rem;color:#5b6660">${new Date().toLocaleString(H.lang)}</div></div>
  ${html}
  <div class="foot"><span>Hema Diamond · Muscat</span><span dir="ltr">hema-diamond</span></div>
</div></body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 450);
};
})();
