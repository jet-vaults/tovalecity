/* Toval'e City — shared UI: header, footer, cart drawer, order bar, reveal */
(function () {
  const C = window.TOVALE;
  const NIS = n => "₪" + (Math.round(n * 100) / 100).toLocaleString("he-IL");
  const page = document.body.dataset.page || "";

  /* ---------- splash intro — shown once per visit ---------- */
  if (!sessionStorage.getItem("tovale_splash")) {
    sessionStorage.setItem("tovale_splash", "1");
    const splash = document.createElement("div");
    splash.className = "splash";
    splash.setAttribute("aria-hidden", "true");
    splash.innerHTML = `
      <img src="/assets/img/logo-white.png" alt="">
      <div class="splash-dots"><span></span><span></span><span></span></div>`;
    document.body.prepend(splash);
    document.body.classList.add("no-scroll");
    const clear = () => { if (splash.isConnected) splash.remove(); document.body.classList.remove("no-scroll"); };
    splash.addEventListener("animationend", e => { if (e.animationName === "splash-out") clear(); });
    setTimeout(clear, 3200);
  }

  const NAV = [
    { href: "/", id: "home", label: "ראשי" },
    { href: "/menu", id: "menu", label: "תפריט" },
    { href: "/catering", id: "catering", label: "קייטרינג" },
    { href: "/about", id: "about", label: "אודות" },
    { href: "/reviews", id: "reviews", label: "ביקורות" },
    { href: "/contact", id: "contact", label: "צור קשר" }
  ];

  /* ---------- header ---------- */
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="/" aria-label="טובל'ה בעיר — לעמוד הבית">
        <img src="/assets/img/logo-green.png" alt="טובל'ה בעיר">
      </a>
      <nav class="main-nav" id="main-nav" aria-label="ניווט ראשי">
        ${NAV.map(n => `<a href="${n.href}" ${n.id === page ? 'aria-current="page"' : ""}>${n.label}</a>`).join("")}
      </nav>
      <div class="header-cta">
        <a class="cart-btn" href="/menu" data-cart-open role="button" aria-label="ההזמנה שלי">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>להזמנה</span>
          <span class="cart-count" data-cart-count>0</span>
        </a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="פתיחת תפריט ניווט">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
        </button>
      </div>
    </div>`;
  document.body.prepend(header);

  const skip = document.createElement("a");
  skip.className = "skip-link"; skip.href = "#main"; skip.textContent = "דילוג לתוכן הראשי";
  document.body.prepend(skip);

  const toggle = header.querySelector(".nav-toggle");
  const nav = header.querySelector(".main-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", e => { if (e.target.tagName === "A") nav.classList.remove("open"); });

  /* ---------- footer ---------- */
  const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent("שלום טובל'ה בעיר, הגעתי מהאתר שלכם :)")}`;
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/assets/img/logo-white.png" alt="">
          <p>מסעדה חלבית כשרה וקייטרינג לאירועים. מטבח איטלקי עשיר, חם ומשמח — בלב שדרות.</p>
          <span class="kosher-badge"><svg class="icon" style="width:16px;height:16px;color:currentColor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 16h15L12 3Z"/><path d="M12 21 4.5 8h15L12 21Z"/></svg> כשר — <a href="/assets/docs/kosher-certificate.jpeg" target="_blank" rel="noopener">תעודת כשרות</a></span>
          <div class="footer-social">
            <a href="${C.facebook}" target="_blank" rel="noopener" aria-label="פייסבוק"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/></svg></a>
            <a href="${C.instagram}" target="_blank" rel="noopener" aria-label="אינסטגרם"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" stroke="none"/></svg></a>
            <a href="${wa}" target="_blank" rel="noopener" aria-label="וואטסאפ"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.4 14.1c-.2.7-1.3 1.3-1.9 1.4-.5 0-1.1.2-3.7-.8a12.8 12.8 0 0 1-5.1-4.6c-.4-.6-1.1-1.7-1.1-3s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7a10 10 0 0 0 1.8 2.3 9.3 9.3 0 0 0 2.6 1.6c.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3Z"/></svg></a>
          </div>
        </div>
        <div>
          <h3>ניווט</h3>
          <ul>${NAV.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h3>שעות פתיחה</h3>
          <ul>
            ${C.hours.map(h => `<li>${h.d}: ${h.h}</li>`).join("")}
            <li style="margin-top:.6rem">${C.address}</li>
            <li><a href="${C.mapsUrl}" target="_blank" rel="noopener">ניווט בגוגל מפות</a></li>
          </ul>
        </div>
        <div>
          <h3>מידע ויצירת קשר</h3>
          <ul>
            <li><a href="tel:${C.phone.replace(/-/g, "")}">טלפון: ${C.phone}</a></li>
            <li><a href="tel:${C.phone2.replace(/-/g, "")}">טלפון: ${C.phone2}</a></li>
            <li><a href="tel:${C.cateringPhone.replace(/-/g, "")}">קייטרינג: ${C.cateringPhone}</a></li>
            <li><a href="mailto:${C.restaurantEmail}">${C.restaurantEmail}</a></li>
            <li><a href="/assets/docs/tovale-menu-2025.pdf" target="_blank" rel="noopener">תפריט PDF</a></li>
            <li><a href="/assets/docs/accessibility-statement.pdf" target="_blank" rel="noopener">הצהרת נגישות</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} טובל'ה בעיר — מסעדה חלבית וקייטרינג לאירועים</span>
        <span>לא מתבצע חיוב באתר — ההזמנה מאושרת מול צוות טובל'ה</span>
      </div>
    </div>`;
  document.body.appendChild(footer);

  /* ---------- cart drawer ---------- */
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop"; backdrop.setAttribute("data-cart-backdrop", "");
  const drawer = document.createElement("aside");
  drawer.className = "cart-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "ההזמנה שלי");
  drawer.innerHTML = `
    <div class="cart-brand">
      <img src="/assets/img/logo-white.png" alt="">
      <button class="cart-close" data-cart-close aria-label="סגירה">✕</button>
    </div>
    <div class="cart-head">
      <h2>ההזמנה שלי</h2>
    </div>
    <div class="cart-items" data-cart-items></div>
    <div class="cart-foot">
      <div class="cart-total-row"><span>סה"כ</span><span data-cart-total>₪0</span></div>
      <a class="btn btn-primary" href="/order">לסיכום ושליחת ההזמנה</a>
      <p class="no-charge">לא מתבצע חיוב באתר. ההזמנה תאושר מול צוות טובל'ה.</p>
    </div>`;
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);

  const orderBar = document.createElement("div");
  orderBar.className = "order-bar";
  orderBar.innerHTML = `<button data-cart-open aria-label="פתיחת ההזמנה שלי">
      <span>ההזמנה שלי</span><span data-bar-info></span>
    </button>`;
  document.body.appendChild(orderBar);

  const toast = document.createElement("div");
  toast.className = "toast-note"; toast.innerHTML = "<span></span>";
  document.body.appendChild(toast);
  let toastTimer;
  window.tovaleToast = msg => {
    toast.querySelector("span").textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  function openCart() {
    renderCart();
    drawer.classList.add("open"); backdrop.classList.add("open");
    document.body.classList.add("no-scroll");
  }
  function closeCart() {
    drawer.classList.remove("open"); backdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
  window.tovaleOpenCart = openCart;

  document.addEventListener("click", e => {
    const opener = e.target.closest("[data-cart-open]");
    if (opener) {
      // On menu/home pages the header button opens the drawer; elsewhere it links to /menu when cart is empty
      const snap = TovaleCart.get();
      if (opener.tagName === "A" && snap.count === 0) return; // navigate to /menu
      e.preventDefault(); openCart();
    }
    if (e.target.closest("[data-cart-close]") || e.target.closest("[data-cart-backdrop]")) closeCart();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

  function renderCart() {
    const snap = TovaleCart.get();
    const wrap = drawer.querySelector("[data-cart-items]");
    if (!snap.lines.length) {
      wrap.innerHTML = `<div class="cart-empty">
        <p class="display" style="font-size:1.3rem;margin-bottom:.4rem">ההזמנה עדיין ריקה</p>
        <p>מתחשק משהו טעים? <a href="/menu" style="color:var(--green-800);font-weight:700">לתפריט ›</a></p></div>`;
    } else {
      wrap.innerHTML = snap.lines.map(l => `
        <div class="cart-line" data-line="${l.id}">
          <div class="cart-line-top"><span class="n">${esc(l.name)}</span><span class="price">${NIS(l.unitPrice * l.qty)}</span></div>
          ${l.options && l.options.length ? `<div class="cart-line-opts">${l.options.map(o => esc(o.label)).join(" · ")}</div>` : ""}
          ${l.addons && l.addons.length ? `<div class="cart-line-opts">+ ${l.addons.map(a => esc(a.label)).join(", ")}</div>` : ""}
          ${l.note ? `<div class="cart-line-note">“${esc(l.note)}”</div>` : ""}
          <div class="cart-line-foot">
            <div class="qty-stepper">
              <button data-qminus aria-label="הפחתת כמות">−</button>
              <span class="qty-val">${l.qty}</span>
              <button data-qplus aria-label="הוספת כמות">+</button>
            </div>
            <button class="link-btn" data-qremove>הסרה</button>
          </div>
        </div>`).join("");
    }
    drawer.querySelector("[data-cart-total]").textContent = NIS(snap.total);
  }

  drawer.addEventListener("click", e => {
    const lineEl = e.target.closest("[data-line]");
    if (!lineEl) return;
    const id = lineEl.dataset.line;
    const line = TovaleCart.get().lines.find(x => x.id === id);
    if (!line) return;
    if (e.target.closest("[data-qplus]")) TovaleCart.setQty(id, line.qty + 1);
    if (e.target.closest("[data-qminus]")) TovaleCart.setQty(id, line.qty - 1);
    if (e.target.closest("[data-qremove]")) TovaleCart.remove(id);
    renderCart();
  });

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  window.tovaleEsc = esc; window.tovaleNIS = NIS;

  /* ---------- badge + bar sync ---------- */
  function sync() {
    const snap = TovaleCart.get();
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = snap.count;
      el.classList.toggle("show", snap.count > 0);
    });
    const info = orderBar.querySelector("[data-bar-info]");
    if (snap.count > 0 && page !== "order") {
      info.textContent = `${snap.count} ${snap.count === 1 ? "פריט" : "פריטים"} · ${NIS(snap.total)}`;
      orderBar.classList.add("show");
      document.body.classList.add("has-orderbar");
    } else {
      orderBar.classList.remove("show");
      document.body.classList.remove("has-orderbar");
    }
  }
  document.addEventListener("cart:change", () => { sync(); });
  sync();

  /* ---------- reveal on scroll ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 })
    : null;
  document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
})();
