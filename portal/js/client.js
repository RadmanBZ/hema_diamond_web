(() => {
const { t, esc, money, act, total, used, prod, pn, $, csv, printDoc, printInvoice } = HD, S = HD.S;
let tab = "order", cat = "all", cart = {}, msg = "", photo = "", loginErr = "";
const un = p => t(p.unit), TABS = ["order", "track", "fin", "br", "cl", "help"];
const cut = () => { const n = new Date(), g = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 14)); if (n >= g) g.setUTCDate(g.getUTCDate() + 1); const d = g - n; return [Math.floor(d / 36e5), Math.floor(d % 36e5 / 6e4), Math.floor(d % 6e4 / 1e3)].map(x => String(x).padStart(2, "0")).join(":"); };

const head = (title, sub) => `<div class="page-head reveal"><div><h2 class="serif">${t(title)}</h2><p>${t(sub)}</p></div></div>`;

const order = () => {
  const lines = Object.entries(cart).filter(e => e[1] > 0), tot = lines.reduce((a, [id, q]) => a + q * prod(id).price, 0);
  return `${head("n_order", "ph_order")}
  <div class="card cd card-glow reveal"><span>${t("cut")}</span><b id="cd" dir="ltr">${cut()}</b></div>
  <div class="two">
    <div>
      <div class="pills">${["all", "fruit", "veg", "greens"].map(c => `<button class="pill ${c == cat ? "on" : ""}" data-cat="${c}">${t(c)}</button>`).join("")}</div>
      <div class="grid">${S().products.filter(p => cat == "all" || p.cat == cat).map((p, i) => `
        <div class="card prod card-lift reveal" style="--d:${i * .04}s">
          <div class="pimg"><img src="${esc(p.img)}" alt="${esc(pn(p))}" loading="lazy"></div>
          <h3 class="serif">${esc(pn(p))}</h3>
          <p class="mut">${money(p.price)} / ${un(p)}${p.stock < 15 ? ` · <span class="warn">${t("low")}</span>` : ""}</p>
          <div class="step"><button data-q="${p.id}" data-d="-1" type="button">−</button><b>${cart[p.id] || 0}</b><button data-q="${p.id}" data-d="1" type="button">+</button></div>
        </div>`).join("")}</div>
    </div>
    <aside class="card side card-glow reveal" style="--d:.1s">
      <h2 class="serif">${t("cart")}</h2><div class="hr"></div>
      ${lines.length ? lines.map(([id, q]) => `<div class="row"><span>${esc(pn(prod(id)))} × ${q} ${un(prod(id))}</span><b>${money(q * prod(id).price)}</b></div>`).join("") : `<p class="mut">${t("empty")}</p>`}
      <div class="hr"></div><div class="row"><b>${t("total")}</b><b>${money(tot)}</b></div>
      <label class="lab">${t("branch")}<span class="select-wrap"><select id="br">${S().branches.map(b => `<option>${esc(b.name)}</option>`).join("")}</select></span></label>
      <label class="chk"><input type="checkbox" id="rec" ${S().recurring ? "checked" : ""}> ${t("recur")}</label>
      ${msg ? `<p class="msg">${msg}</p>` : ""}
      <div class="btns"><button class="btn btn-line" data-act="repeat" type="button">${t("repeat")}</button><button class="btn btn-dark" data-act="place" type="button">${t("place")}</button></div>
    </aside>
  </div>`;
};

const trackCard = (o, i) => {
  const lines = o.lines.map(l => {
    const p = prod(l.pid);
    return `<div class="ship-line"><img src="${esc(p.img)}" alt=""><div><b>${esc(pn(p))}</b><span>${l.qty} ${un(p)}</span></div><b>${money(l.qty * l.price)}</b></div>`;
  }).join("");
  const initial = (o.driver || "?").slice(0, 1).toUpperCase();
  return `<article class="card track-card card-lift reveal" style="--d:${i * .06}s">
    <div class="track-head">
      <div><b class="serif" style="font-size:1.2rem">${o.id}</b>
        <div class="track-meta">${o.date} · ${esc(o.branch)} · ${money(total(o))}</div>
      </div>
      ${o.rej ? `<span class="badge bad">${t("rej")}</span>` : `<span class="badge okb">${t("s" + o.stage)}</span>`}
    </div>
    <div class="track-body">
      ${HD.timeline(o)}
      <div class="track-grid">
        <div class="track-map-col">
          <p class="eta-label" style="margin:0 0 8px">${t("approx_map")}</p>
          ${HD.trackMap(o)}
        </div>
        <div class="track-side-col">
          <div class="eta-card">
            <span class="eta-label">${t("eta")}</span>
            <div class="eta-big">${esc(HD.etaText(o))}</div>
            <span class="mut">${t("live_track")}</span>
          </div>
          <div class="driver-card">
            <div class="driver-av">${esc(initial)}</div>
            <div style="flex:1;min-width:0">
              <b>${esc(o.driver || t("driver"))}</b>
              <div class="mut" style="font-size:.82rem">${esc(o.veh || "—")}${o.plate ? ` · ${esc(o.plate)}` : ""}</div>
              <div class="live"><i></i>${esc(HD.driverStatus(o))}</div>
            </div>
          </div>
          <div>
            <p class="eta-label" style="margin:0 0 8px">${t("ship")}</p>
            <div class="ship-lines">${lines}</div>
          </div>
        </div>
      </div>
    </div>
  </article>`;
};

const track = () => {
  const orders = S().orders;
  return `${head("n_track", "ph_track")}
  <div class="track-list">${orders.length ? orders.map(trackCard).join("") : `<div class="card mut">${t("empty")}</div>`}</div>`;
};

const fin = () => {
  const c = S().customer, u = used(), pc = Math.min(100, u / c.limit * 100);
  return `${head("n_fin", "ph_fin")}
  <div class="grid">
    <div class="card reveal"><h3 class="serif">${t("credit")}</h3><div class="meter"><i style="width:${pc}%"></i></div>
      <div class="row"><span>${t("used")}</span><b>${money(u)}</b></div>
      <div class="row"><span>${t("left")}</span><b>${money(c.limit - u)}</b></div>
      <div class="row"><span>${t("limit")}</span><b>${money(c.limit)}</b></div>
    </div>
    <div class="card card-dark reveal" style="--d:.06s"><h3 class="serif">${t("wallet")}</h3><p class="big" style="color:var(--gold)">${money(c.wallet)}</p>
      <p class="mut">${t("terms")}: ${esc(c.terms)}</p>
      <button class="btn btn-gold" data-act="xls" type="button">${t("xls")}</button>
    </div>
  </div>
  <div class="card reveal" style="--d:.1s">
    <table><thead><tr><th>ID</th><th>${t("today")}</th><th>${t("total")}</th><th></th></tr></thead>
    <tbody>${S().orders.filter(o => !o.rej).map(o => `<tr><td><b>${o.id}</b></td><td>${o.date}</td><td>${money(total(o))}</td><td><button class="btn btn-line sm" data-act="inv" data-id="${o.id}" type="button">${t("inv")}</button></td></tr>`).join("")}</tbody>
    </table>
  </div>`;
};

const br = () => `<div class="page-head"><div><h2 class="serif">${t("n_br")}</h2></div></div>
  <div class="grid">${S().branches.map((b, i) => `<div class="card card-lift reveal" style="--d:${i * .05}s"><h3 class="serif">${esc(b.name)}</h3><p class="mut">${t("recv")}: ${esc(b.receiver)}<br><span dir="ltr">${esc(b.phone)}</span></p></div>`).join("")}</div>
  <div class="card form reveal"><input id="bn" placeholder="${t("bname")}"><input id="bv" placeholder="${t("recv")}"><input id="bp" placeholder="${t("phone")}"><button class="btn btn-dark" data-act="addbr" type="button">${t("add")}</button></div>`;

const cl = () => `<div class="page-head"><div><h2 class="serif">${t("n_cl")}</h2></div></div>
  <div class="card form claim-form reveal"><h3 class="serif">${t("claim")}</h3>
    <label class="lab">${t("order")}<span class="select-wrap"><select id="co">${S().orders.map(o => `<option>${o.id}</option>`).join("")}</select></span></label>
    <label class="lab">${t("claim")}<span class="select-wrap"><select id="ct"><option value="damaged">${t("damaged")}</option><option value="short">${t("short")}</option></select></span></label>
    <label class="lab">${t("note")}<textarea id="cn" placeholder="${t("note")}" rows="3"></textarea></label>
    <label class="lab">${t("photo")}<input type="file" id="cp" accept="image/*"></label>
    ${photo ? `<img class="thumb" src="${photo}" alt="">` : ""}
    <button class="btn btn-dark" data-act="claim" type="button">${t("send")}</button>
  </div>
  ${S().claims.map(c => `<div class="card reveal"><div class="row"><b>${c.id} · ${c.order}</b><span class="badge ${c.res ? "okb" : ""}">${c.res ? t("res_" + c.res) : t("pend")}</span></div><p class="mut">${t(c.type)} · ${esc(c.note)}</p>${c.photo ? `<img class="thumb" src="${c.photo}" alt="">` : ""}</div>`).join("")}`;

const help = () => {
  const wa = (window.HD_CONFIG && HD_CONFIG.WHATSAPP) || "96895120868";
  return `<div class="page-head"><div><h2 class="serif">${t("n_help")}</h2></div></div>
  <div class="card reveal" style="text-align:center;padding:36px 24px">
    <a class="btn btn-gold" target="_blank" rel="noopener" href="https://wa.me/${wa}">${t("wa")}</a>
    <p class="mut" style="margin-top:16px">${t("demo")}</p>
  </div>`;
};

const V = { order, track, fin, br, cl, help };
const draw = HD.mount(() => {
  if (!HD.requireRole("client")) return HD.shell("tc", null, "", "", "index.html") + HD.loginScreen("client", loginErr);
  return HD.shell("tc", TABS, tab, "n_", "../index.html", { bottomNav: true }) + `<main class="wrap page">${V[tab]()}</main>`;
}, x => { tab = x; msg = ""; });

setInterval(() => { const e = $("#cd"); if (e) e.textContent = cut(); }, 1000);
const app = $("#app");
app.addEventListener("submit", e => {
  if (e.target.id !== "loginForm") return;
  e.preventDefault();
  const id = $("#authId")?.value || "", pass = $("#authPass")?.value || "";
  if (HD.loginClient(id, pass)) { loginErr = ""; HD.toast(t("tc"), t("signin"), "ok"); draw(); }
  else { loginErr = t("bad_login"); draw(); }
});
app.addEventListener("click", e => {
  if (!HD.requireRole("client")) return;
  const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
  if (d.cat) { cat = d.cat; draw(); }
  if (d.q) { cart[d.q] = Math.max(0, (cart[d.q] || 0) + +d.d); draw(); }
  if (d.act == "repeat") { const o = S().orders.find(x => x.date < HD.today() && !x.rej); if (o) { cart = {}; o.lines.forEach(l => cart[l.pid] = l.qty); draw(); } }
  if (d.act == "place") {
    const lines = Object.entries(cart).filter(x => x[1] > 0).map(([pid, qty]) => ({ pid, qty }));
    if (!lines.length) return;
    const r = act.place(lines, $("#br").value, $("#rec").checked);
    if (r) { msg = t(r); } else { cart = {}; msg = t("placed"); tab = "track"; }
    draw();
  }
  if (d.act == "inv") {
    const o = S().orders.find(x => x.id == d.id);
    if (o) printInvoice(o);
  }
  if (d.act == "xls") csv("hema-diamond-statement.csv", [["ID", "Date", "Branch", "Total Due (OMR)", "Status"], ...S().orders.filter(o => !o.rej).map(o => [o.id, o.date, o.branch, total(o).toFixed(3), o.stage >= 4 ? "Paid" : "Unpaid"])]);
  if (d.act == "addbr") { const n = $("#bn").value.trim(); if (n) act.branch({ name: n, receiver: $("#bv").value, phone: $("#bp").value }); }
  if (d.act == "claim") { act.claim({ order: $("#co").value, type: $("#ct").value, note: $("#cn").value, photo }); photo = ""; }
});
app.addEventListener("change", e => {
  if (e.target.id !== "cp" || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"), k = Math.min(1, 480 / im.width);
      c.width = im.width * k; c.height = im.height * k;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      photo = c.toDataURL("image/jpeg", .7); draw();
    };
    im.src = r.result;
  };
  r.readAsDataURL(e.target.files[0]);
});
})();
