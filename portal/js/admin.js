(() => {
const { t, esc, money, act, total, prod, pn, $, $$ } = HD, S = HD.S;
let tab = "hub", loginErr = "", newImg = "", editId = null;
const TABS = ["hub", "fleet", "cl", "cat", "cus", "rep", "erp"], VEH = ["Cold Truck 1", "Cold Truck 2", "Cold Truck 3"];
const CATS = ["fruit", "veg", "greens"], UNITS = ["carton", "kg", "basket"];
const bars = (rows, max) => rows.map(r => `<div class="hb"><span>${r[0]}</span><div class="meter"><i style="width:${Math.max(3, r[1] / max * 100)}%"></i></div><b>${r[1]}</b></div>`).join("");
const head = (title, sub) => `<div class="page-head reveal"><div><h2 class="serif">${t(title)}</h2>${sub ? `<p>${t(sub)}</p>` : ""}</div></div>`;
const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#103F35"/><stop offset="1" stop-color="#070908"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)"/><text x="240" y="185" text-anchor="middle" fill="#D5AD63" font-family="Georgia,serif" font-size="28">Hema Diamond</text></svg>');
const clearProdForm = () => { editId = null; newImg = ""; };

const kpis = () => {
  const s = S(), td = HD.today();
  const pending = s.orders.filter(o => !o.rej && o.stage === 0).length;
  const active = s.orders.filter(o => !o.rej && o.stage > 0 && o.stage < 4).length;
  const todayOrders = s.orders.filter(o => o.date === td && !o.rej);
  const rev = todayOrders.reduce((a, o) => a + total(o), 0);
  const low = s.products.filter(p => p.stock < 15).length;
  const claims = s.claims.filter(c => !c.res).length;
  const items = [
    ["kpi_pending", pending, ""],
    ["kpi_active", active, ""],
    ["kpi_today", todayOrders.length, ""],
    ["kpi_rev", money(rev), "kpi-accent"],
    ["kpi_low", low, low ? "kpi-accent" : ""],
    ["kpi_claims", claims, claims ? "kpi-accent" : ""]
  ];
  return `<div class="stat-row">${items.map(([k, v, cls], i) => `
    <div class="card kpi ${cls} reveal" style="--d:${i * .04}s">
      <span class="kpi-l">${t(k)}</span>
      <span class="kpi-v">${v}</span>
    </div>`).join("")}</div>`;
};

const hub = () => {
  const cards = [...S().orders].sort((a, b) => (a.rej || a.stage == 4) - (b.rej || b.stage == 4)).map((o, idx) => {
    const low = o.lines.some(l => l.qty > prod(l.pid).stock && o.stage < 1);
    return `<div class="card order-card card-lift reveal" style="--d:${.08 + idx * .04}s">
      <div class="row order-top">
        <div><b class="serif" style="font-size:1.15rem">${o.id}</b><div class="mut" style="font-size:.86rem">${esc(S().customer.name)} · ${esc(o.branch)} · ${o.date}</div></div>
        ${low ? `<span class="badge bad">${t("low")}</span>` : o.rej ? `<span class="badge bad">${t("rej")}</span>` : `<span class="badge okb">${t("s" + o.stage)}</span>`}
      </div>
      <table>${o.lines.map((l, i) => {
        const p = prod(l.pid);
        return `<tr><td><div class="cat-cell"><img class="cat-thumb" src="${esc(p.img)}" alt=""><span>${esc(pn(p))}</span></div></td>
          <td><input class="qty" type="number" min="0" step="0.5" value="${l.qty}" data-oid="${o.id}" data-i="${i}" ${o.rej || o.stage > 1 ? "disabled" : ""}> ${t(p.unit)}</td>
          <td>${money(l.qty * l.price)}</td></tr>`;
      }).join("")}</table>
      <div class="row"><b>${t("total")}: ${money(total(o))}</b>
        <span class="btns" style="margin:0">${o.rej ? `<span class="badge bad">${t("rej")}</span>`
          : o.stage == 0 ? `<button class="btn btn-line sm" data-act="rej" data-id="${o.id}" type="button">${t("reject")}</button> <button class="btn btn-dark sm" data-act="ok" data-id="${o.id}" type="button">${t("approve")}</button>`
          : o.stage < 4 ? `<button class="btn btn-dark sm" data-act="nx" data-id="${o.id}" type="button">${t("next")}</button>`
          : `<span class="badge okb">${t("s4")}</span>`}</span>
      </div>
    </div>`;
  }).join("");
  return `${head("dash", "ph_hub")}${kpis()}
    <div class="page-head" style="margin-top:8px"><div><h2 class="serif" style="font-size:1.25rem">${t("orders_list")}</h2></div></div>
    ${cards || `<div class="card mut">${t("empty")}</div>`}`;
};

const fleet = () => {
  const act1 = S().orders.filter(o => !o.rej && o.stage >= 1 && o.stage <= 2), sum = {};
  act1.forEach(o => o.lines.forEach(l => sum[l.pid] = (sum[l.pid] || 0) + l.qty));
  return `${head("a_fleet")}
  <div class="card reveal"><div class="row"><h3 class="serif">${t("pick")}</h3><button class="btn btn-line sm" data-act="pk" type="button">${t("print")}</button></div>
    <table><thead><tr><th>${t("order")}</th><th>${t("stock")}</th></tr></thead>
    <tbody>${Object.entries(sum).map(([id, q]) => `<tr><td>${esc(pn(prod(id)))}</td><td><b>${q}</b> ${t(prod(id).unit)}</td></tr>`).join("") || `<tr><td class="mut" colspan="2">${t("empty")}</td></tr>`}</tbody></table>
  </div>
  ${S().orders.filter(o => !o.rej && o.stage >= 1 && o.stage <= 3).map((o, i) => `
    <div class="card form reveal" style="--d:${i * .05}s"><b class="serif">${o.id} · ${esc(o.branch)}</b>
      <span class="select-wrap"><select data-fo="${o.id}" data-k="veh"><option value="">${t("veh")}</option>${VEH.map(v => `<option ${o.veh == v ? "selected" : ""}>${v}</option>`).join("")}</select></span>
      <input data-fo="${o.id}" data-k="driver" placeholder="${t("driver")}" value="${esc(o.driver || "")}">
      <input data-fo="${o.id}" data-k="plate" placeholder="${t("plate")}" value="${esc(o.plate || "")}">
    </div>`).join("")}`;
};

const cl = () => `${head("a_cl")}
  ${S().claims.map((c, i) => `<div class="card reveal" style="--d:${i * .05}s"><div class="row"><b>${c.id} · ${c.order}</b><span class="badge ${c.res ? "okb" : ""}">${c.res ? t("res_" + c.res) : t("pend")}</span></div>
    <p class="mut">${t(c.type)} · ${esc(c.note)}</p>${c.photo ? `<img class="thumb" src="${c.photo}" alt="">` : ""}
    ${c.res ? "" : `<div class="btns"><button class="btn btn-line sm" data-act="rs" data-id="${c.id}" data-r="credit" type="button">${t("res_credit")}</button><button class="btn btn-dark sm" data-act="rs" data-id="${c.id}" data-r="repl" type="button">${t("res_repl")}</button></div>`}
  </div>`).join("") || `<div class="card mut">${t("empty")}</div>`}`;

const cat = () => {
  const ed = editId ? prod(editId) : null;
  const preview = newImg || (ed && ed.img) || "";
  return `${head("a_cat")}
  <div class="card form add-prod reveal ${ed ? "is-editing" : ""}">
    <h3 class="serif">${ed ? t("edit_prod") : t("add_prod")}</h3>
    <p class="mut" style="margin:0">${t("pdetails")}${ed ? ` · <b>${esc(ed.id)}</b>` : ""}</p>
    <div class="add-prod-grid">
      <label class="lab">${t("pname")}<input id="np_name" value="${esc(ed ? ed.n.en : "")}" placeholder="${t("pname")}" autocomplete="off"></label>
      <label class="lab">${t("pname_ar")}<input id="np_ar" value="${esc(ed ? (ed.n.ar || "") : "")}" placeholder="${t("pname_ar")}" autocomplete="off"></label>
      <label class="lab">${t("pname_fa")}<input id="np_fa" value="${esc(ed ? (ed.n.fa || "") : "")}" placeholder="${t("pname_fa")}" autocomplete="off"></label>
      <label class="lab">${t("pcat")}<span class="select-wrap"><select id="np_cat">${CATS.map(c => `<option value="${c}" ${ed && ed.cat === c ? "selected" : ""}>${t(c)}</option>`).join("")}</select></span></label>
      <label class="lab">${t("punit")}<span class="select-wrap"><select id="np_unit">${UNITS.map(u => `<option value="${u}" ${ed && ed.unit === u ? "selected" : ""}>${t(u)}</option>`).join("")}</select></span></label>
      <label class="lab">${t("price")}<input id="np_price" type="number" step="0.05" min="0" value="${ed ? ed.price : 1}"></label>
      <label class="lab">${t("stock")}<input id="np_stock" type="number" min="0" value="${ed ? ed.stock : 50}"></label>
      <label class="lab">${t("pimg")}<input id="np_img" type="file" accept="image/*"></label>
    </div>
    ${preview ? `<img class="thumb add-prod-preview" src="${preview}" alt="">` : ""}
    <div class="btns">
      <button class="btn btn-dark" data-act="addprod" type="button">${ed ? t("update_prod") : t("save_prod")}</button>
      ${ed ? `<button class="btn btn-line" data-act="canceledit" type="button">${t("cancel")}</button>` : ""}
    </div>
  </div>
  <div class="card reveal" style="--d:.06s"><table><thead><tr><th></th><th>${t("price")}</th><th>${t("stock")}</th><th>${t("actions")}</th></tr></thead>
  <tbody>${S().products.map(p => `<tr class="${editId === p.id ? "row-editing" : ""}">
    <td><div class="cat-cell"><img class="cat-thumb" src="${esc(p.img)}" alt=""><span><b>${esc(pn(p))}</b><br><span class="mut">${t(p.cat)} · ${t(p.unit)}</span></span></div></td>
    <td><label class="lab">${t("price")}<input type="number" step="0.05" min="0" value="${p.price}" data-pp="${p.id}"></label></td>
    <td><label class="lab">${t("stock")}<input type="number" min="0" value="${p.stock}" data-ps="${p.id}"></label></td>
    <td><span class="btns cat-acts" style="margin:0">
      <button class="btn btn-line sm" data-act="editprod" data-id="${p.id}" type="button">${t("edit")}</button>
      <button class="btn btn-line sm cat-del" data-act="delprod" data-id="${p.id}" type="button">${t("del")}</button>
    </span></td>
  </tr>`).join("")}</tbody></table></div>`;
};

const cus = () => {
  const c = S().customer;
  return `${head("a_cus")}
  <div class="card form reveal"><h3 class="serif">${esc(c.name)}</h3>
    <label class="lab">${t("limit")}<input type="number" min="0" step="100" value="${c.limit}" data-lim="1"></label>
    <label class="lab">${t("terms")}<span class="select-wrap"><select data-terms="1">${["Net 7", "Net 15", "Net 30"].map(x => `<option ${c.terms == x ? "selected" : ""}>${x}</option>`).join("")}</select></span></label>
    <p class="mut">${t("used")}: ${money(HD.used())}</p>
  </div>
  ${S().pending.map(p => `<div class="card row reveal"><div><b>${esc(p.name)}</b><br><span class="mut">${p.approved ? t("approved") : t("pending")}</span></div>${p.approved ? "" : `<button class="btn btn-dark sm" data-act="ap" data-id="${p.id}" type="button">${t("approve")}</button>`}</div>`).join("")}`;
};

const rep = () => {
  const s = S(), td = HD.today(), d = [...s.daily, s.orders.filter(o => o.date == td).length];
  const lb = d.map((_, i) => i == 7 ? t("today") : new Date(Date.now() - (7 - i) * 864e5).toLocaleDateString(HD.lang, { weekday: "short" }));
  const mx = Math.max(...d, 1), top = {};
  Object.entries(s.sold).forEach(([k, v]) => top[k] = v);
  s.orders.filter(o => !o.rej).forEach(o => o.lines.forEach(l => top[l.pid] = (top[l.pid] || 0) + l.qty));
  const tp = Object.entries(top).filter(([k]) => prod(k)).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => [esc(pn(prod(k))), Math.round(v)]);
  const avg = (s.sat.reduce((a, v, i) => a + v * (5 - i), 0) / 100).toFixed(1);
  const revWeek = s.orders.filter(o => !o.rej).reduce((a, o) => a + total(o), 0);
  return `${head("a_rep", "ph_rep")}
  <div class="stat-row">
    <div class="card kpi reveal"><span class="kpi-l">${t("kpi_today")}</span><span class="kpi-v">${d[7]}</span></div>
    <div class="card kpi kpi-accent reveal" style="--d:.05s"><span class="kpi-l">${t("kpi_rev")}</span><span class="kpi-v">${money(revWeek)}</span></div>
    <div class="card kpi reveal" style="--d:.1s"><span class="kpi-l">${t("r_sat")}</span><span class="kpi-v">${avg}</span><span class="kpi-s">/ 5</span></div>
  </div>
  <div class="grid">
    <div class="card reveal"><h3 class="serif">${t("r_daily")}</h3><div class="cols">${d.map((v, i) => `<div><i style="height:${Math.max(6, v / mx * 100)}%"></i><b>${v}</b><span>${lb[i]}</span></div>`).join("")}</div></div>
    <div class="card reveal" style="--d:.06s"><h3 class="serif">${t("r_top")}</h3>${bars(tp, tp[0] ? tp[0][1] : 1)}</div>
    <div class="card reveal" style="--d:.1s"><h3 class="serif">${t("r_sat")}</h3><p class="big">${avg} / 5</p>${bars(s.sat.map((v, i) => ["★" + (5 - i), v]), 100)}</div>
  </div>`;
};

const erp = () => `${head("a_erp")}
  <div class="card reveal"><div class="row"><h3 class="serif">ERP</h3><button class="btn btn-dark sm" data-act="pg" type="button">${t("ping")}</button></div>
    <table>${S().erp.map(e => `<tr><td><b>${e.n}</b><br><span class="mut">${e.ty}</span></td><td><span class="dot ${e.st}"></span>${t(e.st)}</td><td dir="ltr">${e.st == "ok" ? e.ms + " ms" : "—"}</td><td class="mut" dir="ltr">${e.at ? t("last") + " " + e.at : ""}</td></tr>`).join("")}</table>
  </div>
  <div class="card reveal" style="--d:.06s"><h3 class="serif">${t("endp")}</h3><pre dir="ltr">${HD.ENDPOINTS.join("\n")}</pre><p class="mut">${t("erp_later")}</p></div>`;

const V = { hub, fleet, cl, cat, cus, rep, erp };
const draw = HD.mount(() => {
  if (!HD.requireRole("admin")) return HD.shell("ta", null, "", "", "index.html") + HD.loginScreen("admin", loginErr);
  return HD.shell("ta", TABS, tab, "a_", "../index.html", { admin: true, bottomNav: true }) + HD.adminLayout(TABS, tab, "a_", V[tab]());
}, x => { if (x !== "cat") clearProdForm(); tab = x; });

const app = $("#app");
app.addEventListener("submit", e => {
  if (e.target.id !== "loginForm") return;
  e.preventDefault();
  const id = $("#authId")?.value || "", pass = $("#authPass")?.value || "";
  if (HD.loginAdmin(id, pass)) { loginErr = ""; HD.toast(t("ta"), t("signin"), "ok"); draw(); }
  else { loginErr = t("bad_login"); draw(); }
});
app.addEventListener("click", e => {
  if (!HD.requireRole("admin")) return;
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const d = b.dataset, o = S().orders.find(x => x.id == d.id);
  if (d.act == "ok") act.stage(d.id, 1);
  if (d.act == "rej") act.reject(d.id);
  if (d.act == "nx") { if (o.stage == 2 && !(o.driver && o.plate && o.veh)) { HD.toast(t("err_drv"), "", "warn"); return; } act.stage(d.id, o.stage + 1); }
  if (d.act == "rs") act.resolve(d.id, d.r);
  if (d.act == "ap") act.approve(d.id);
  if (d.act == "pg") act.ping();
  if (d.act == "pk") {
    const rows = $$("#app table")[0];
    HD.printDoc(`<h2 style="color:#103F35;font-family:Playfair Display,serif">${t("pick")}</h2>${rows ? rows.outerHTML : ""}`, t("pick"));
  }
  if (d.act == "editprod") {
    editId = d.id;
    newImg = "";
    draw();
    $("#np_name")?.focus();
    return;
  }
  if (d.act == "canceledit") { clearProdForm(); draw(); return; }
  if (d.act == "delprod") {
    if (!confirm(t("confirm_del"))) return;
    if (editId === d.id) clearProdForm();
    act.removeProduct(d.id);
    draw();
    return;
  }
  if (d.act == "addprod") {
    const name = ($("#np_name")?.value || "").trim();
    if (!name) { HD.toast(t("err_prod"), "", "warn"); return; }
    const payload = {
      name,
      nameAr: ($("#np_ar")?.value || "").trim(),
      nameFa: ($("#np_fa")?.value || "").trim(),
      cat: $("#np_cat")?.value || "fruit",
      unit: $("#np_unit")?.value || "carton",
      price: $("#np_price")?.value,
      stock: $("#np_stock")?.value,
      img: newImg || undefined
    };
    if (editId) {
      if (!payload.img && prod(editId)?.img) payload.img = prod(editId).img;
      if (!payload.img) payload.img = PLACEHOLDER_IMG;
      act.updateProduct(editId, payload);
    } else {
      payload.img = payload.img || PLACEHOLDER_IMG;
      act.addProduct(payload);
    }
    clearProdForm();
    draw();
  }
});
app.addEventListener("change", e => {
  if (!HD.requireRole("admin")) return;
  const x = e.target, d = x.dataset;
  if (x.id === "np_img" && x.files && x.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"), k = Math.min(1, 720 / im.width);
        c.width = im.width * k; c.height = im.height * k;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        newImg = c.toDataURL("image/jpeg", .78);
        draw();
      };
      im.src = r.result;
    };
    r.readAsDataURL(x.files[0]);
    return;
  }
  if (d.oid) act.qty(d.oid, +d.i, x.value);
  if (d.fo) act.fleet(d.fo, d.k, x.value);
  if (d.pp) act.price(d.pp, x.value);
  if (d.ps) act.stock(d.ps, x.value);
  if (d.lim) act.limit(x.value);
  if (d.terms) act.terms(x.value);
  if (d.oid || d.fo || d.pp || d.ps || d.lim || d.terms) draw();
});
})();
