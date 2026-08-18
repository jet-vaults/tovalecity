/* Toval'e City - /order page: summary, details form, submission (email via Web3Forms + WhatsApp) */
(function () {
  const C = window.TOVALE;
  const NIS = window.tovaleNIS, esc = window.tovaleEsc;

  const summaryEl = document.querySelector("[data-order-summary]");
  const form = document.querySelector("[data-order-form]");
  const emptyEl = document.querySelector("[data-order-empty]");
  const layoutEl = document.querySelector("[data-order-layout]");

  function renderSummary() {
    const snap = TovaleCart.get();
    if (!snap.lines.length) {
      layoutEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }
    layoutEl.style.display = "";
    emptyEl.style.display = "none";
    summaryEl.innerHTML = `
      <h2>סיכום ההזמנה</h2>
      ${snap.lines.map(l => `
        <div class="sum-line">
          <div>
            <div><strong>${l.qty} ×</strong> ${esc(l.name)}</div>
            ${l.options && l.options.length ? `<div class="d">${l.options.map(o => esc(o.label)).join(" · ")}</div>` : ""}
            ${l.addons && l.addons.length ? `<div class="d">+ ${l.addons.map(a => esc(a.label)).join(", ")}</div>` : ""}
            ${l.note ? `<div class="d">“${esc(l.note)}”</div>` : ""}
          </div>
          <span class="price">${NIS(l.unitPrice * l.qty)}</span>
        </div>`).join("")}
      <div class="sum-total"><span>סה"כ להזמנה</span><span>${NIS(snap.total)}</span></div>
      <p style="margin-top:.8rem;font-size:.88rem;color:var(--ink-soft)">
        <a href="/menu" style="color:var(--green-800);font-weight:700">חזרה לתפריט לעריכה ›</a>
      </p>`;
  }
  renderSummary();
  document.addEventListener("cart:change", renderSummary);

  /* pickup / delivery toggle */
  const deliveryFields = form.querySelector("[data-delivery-fields]");
  form.querySelectorAll('[name="fulfill"]').forEach(r => {
    r.addEventListener("change", () => {
      const delivery = form.querySelector('[name="fulfill"]:checked').value === "delivery";
      deliveryFields.style.display = delivery ? "" : "none";
      deliveryFields.querySelectorAll("input").forEach(i => { i.required = delivery && i.dataset.req === "1"; });
      form.querySelectorAll(".fulfill-toggle .choice").forEach(l =>
        l.classList.toggle("checked", l.querySelector("input").checked));
    });
  });

  /* date min = today */
  const dateInput = form.querySelector('[name="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  function orderNumber() {
    const d = new Date();
    const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TV-${ymd}-${rand}`;
  }

  function buildOrderText(data, snap, orderNo) {
    const L = [];
    L.push(`הזמנה חדשה מהאתר - טובל'ה בעיר`);
    L.push(`מספר בקשה: ${orderNo}`);
    L.push(``);
    snap.lines.forEach(l => {
      L.push(`▪ ${l.qty} × ${l.name} - ${NIS(l.unitPrice * l.qty)}`);
      (l.options || []).forEach(o => L.push(`   ${o.label}`));
      (l.addons || []).forEach(a => L.push(`   + ${a.label}${a.price ? ` (+${NIS(a.price)})` : ""}`));
      if (l.note) L.push(`   הערה: ${l.note}`);
    });
    L.push(``);
    L.push(`סה"כ: ${NIS(snap.total)} (לתשלום במסעדה - לא בוצע חיוב באתר)`);
    L.push(``);
    L.push(`פרטי הלקוח/ה:`);
    L.push(`שם: ${data.name}`);
    L.push(`טלפון: ${data.phone}`);
    if (data.email) L.push(`אימייל: ${data.email}`);
    L.push(`אופן קבלה: ${data.fulfill === "delivery" ? "משלוח" : "איסוף עצמי"}`);
    if (data.fulfill === "delivery") L.push(`כתובת: ${data.address}, ${data.city || "שדרות"}`);
    if (data.date) L.push(`תאריך מבוקש: ${data.date}`);
    if (data.time) L.push(`שעה מבוקשת: ${data.time}`);
    if (data.notes) L.push(`הערות: ${data.notes}`);
    return L.join("\n");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const snap = TovaleCart.get();
    if (!snap.lines.length) { location.href = "/menu"; return; }

    /* validate */
    let valid = true;
    form.querySelectorAll(".field").forEach(f => {
      const input = f.querySelector("input, textarea, select");
      if (!input) return;
      const bad = input.required && !input.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad) valid = false;
    });
    const phoneInput = form.querySelector('[name="phone"]');
    const phoneDigits = phoneInput.value.replace(/[\s-]/g, "");
    if (phoneDigits && !/^0\d{8,9}$/.test(phoneDigits)) {
      phoneInput.closest(".field").classList.add("invalid");
      valid = false;
    }
    if (!valid) {
      form.querySelector(".field.invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const orderNo = orderNumber();
    const text = buildOrderText(data, snap, orderNo);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "שולחים את ההזמנה...";

    let emailOk = false;
    if (C.web3formsKey) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: C.web3formsKey,
            subject: `הזמנה חדשה ${orderNo} - ${data.name}`,
            from_name: "אתר טובל'ה בעיר",
            message: text,
            replyto: data.email || undefined
          })
        });
        emailOk = (await res.json()).success === true;
      } catch { emailOk = false; }
    }

    /* stash for the confirmation page */
    sessionStorage.setItem("tovale_last_order", JSON.stringify({
      orderNo, text, emailOk, total: snap.total, count: snap.count, name: data.name
    }));
    TovaleCart.clear();
    location.href = "/order-received";
  });
})();
