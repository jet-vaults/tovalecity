/* Toval'e City — menu data loading, rendering, item customization sheet */
(function () {
  const NIS = window.tovaleNIS, esc = window.tovaleEsc;
  let MENU = null;

  window.tovaleLoadMenu = async function () {
    if (MENU) return MENU;
    const res = await fetch(window.TOVALE.menuDataUrl, { cache: "no-cache" });
    MENU = await res.json();
    return MENU;
  };

  /* min price incl. required options with delta 0 base */
  function hasVariablePrice(item) {
    return (item.options || []).some(o => o.required && o.choices.some(c => c.priceDelta > 0));
  }

  window.tovaleDishCard = function (item) {
    const tags = (item.tags || []).map(t =>
      `<span class="tag${t === "חריף" ? " hot" : ""}">${esc(t)}</span>`).join("");
    const media = item.image
      ? `<div class="dish-media"><img src="/${item.image}" alt="${esc(item.name)}" loading="lazy" width="640" height="480"></div>`
      : `<div class="dish-media no-photo" aria-hidden="true"><span class="np-name">${esc(item.name)}</span></div>`;
    return `
    <article class="dish-card${item.available === false ? " dish-unavailable" : ""}" data-item="${item.id}">
      ${media}
      <div class="dish-body">
        ${tags ? `<div class="tag-row">${tags}</div>` : ""}
        <h3 class="dish-name">${esc(item.name)}</h3>
        ${item.description ? `<p class="dish-desc">${esc(item.description)}</p>` : ""}
        <div class="dish-foot">
          <span class="price">${hasVariablePrice(item) ? '<span class="from">החל מ־</span>' : ""}${NIS(item.price)}</span>
          <button class="add-btn" data-add="${item.id}" ${item.available === false ? "disabled" : ""} aria-label="הוספת ${esc(item.name)} להזמנה">
            ${item.available === false ? "אזל" : "הוסף להזמנה +"}
          </button>
        </div>
      </div>
    </article>`;
  };

  /* ---------- item sheet ---------- */
  let sheetEl = null, sheetBackdrop = null;

  function buildSheet() {
    if (sheetEl) return;
    sheetBackdrop = document.createElement("div");
    sheetBackdrop.className = "sheet-backdrop";
    sheetEl = document.createElement("div");
    sheetEl.className = "sheet";
    sheetEl.setAttribute("role", "dialog");
    sheetEl.setAttribute("aria-modal", "true");
    document.body.appendChild(sheetBackdrop);
    document.body.appendChild(sheetEl);
    sheetBackdrop.addEventListener("click", closeSheet);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  }

  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.classList.remove("open");
    sheetBackdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  function addonList(item) {
    if (!item.addons && !item.addonGroup) return null;
    if (item.addonGroup && MENU.addonGroups && MENU.addonGroups[item.addonGroup]) {
      const g = MENU.addonGroups[item.addonGroup];
      return { name: g.name, items: g.items.map(x => ({ label: x.label, price: x.price })), max: g.max || null, sized: false };
    }
    const a = item.addons;
    const labels = a.source === "toppings" ? MENU.toppings : a.source === "toast-toppings" ? MENU.toastToppings : (a.items || []).map(x => x.label);
    const sized = !!a.priceBySize;
    return {
      name: a.name, max: a.max || null, sized,
      items: labels.map(l => ({ label: l, price: sized ? null : (a.price != null ? a.price : 0) })),
      priceBySize: a.priceBySize || null
    };
  }

  window.tovaleOpenItem = function (item) {
    buildSheet();
    const addons = addonList(item);
    const opts = item.options || [];

    sheetEl.innerHTML = `
      <div class="sheet-grip" aria-hidden="true"></div>
      <button class="sheet-close" aria-label="סגירה">✕</button>
      ${item.imageLg ? `<div class="sheet-media"><img src="/${item.imageLg}" alt=""></div>` : ""}
      <div class="sheet-scroll">
        <h2>${esc(item.name)}</h2>
        ${item.description ? `<p class="sheet-desc">${esc(item.description)}</p>` : ""}
        ${opts.map(o => `
          <fieldset class="opt-group" data-opt="${o.id}">
            <legend>${esc(o.name)}${o.required ? ' <span class="req">חובה</span>' : ""}</legend>
            <div class="choice-list">
              ${o.choices.map((c, i) => `
                <label class="choice${o.required && i === 0 ? " checked" : ""}">
                  <input type="radio" name="opt-${o.id}" value="${c.id}" ${o.required && i === 0 ? "checked" : ""}>
                  <span>${esc(c.label)}</span>
                  ${c.priceDelta ? `<span class="delta">+${NIS(c.priceDelta)}</span>` : ""}
                </label>`).join("")}
            </div>
          </fieldset>`).join("")}
        ${addons ? `
          <fieldset class="opt-group" data-addons>
            <legend>${esc(addons.name)}${addons.max ? ` <span class="req">עד ${addons.max}</span>` : ""}</legend>
            <div class="choice-list">
              ${addons.items.map((a, i) => `
                <label class="choice">
                  <input type="checkbox" value="${i}">
                  <span>${esc(a.label)}</span>
                  <span class="delta" data-addon-price="${i}"></span>
                </label>`).join("")}
            </div>
          </fieldset>` : ""}
        <div class="opt-group">
          <h3>הערות למנה</h3>
          <textarea data-note placeholder="הערות למנה... (לא חובה)" maxlength="200"></textarea>
        </div>
      </div>
      <div class="sheet-foot">
        <div class="qty-stepper">
          <button data-minus aria-label="הפחתת כמות">−</button>
          <span class="qty-val" data-qty>1</span>
          <button data-plus aria-label="הוספת כמות">+</button>
        </div>
        <button class="btn btn-primary" data-confirm>
          <span>הוסף להזמנה</span><span data-total></span>
        </button>
      </div>`;

    let qty = 1;

    function selectedOptions() {
      return (item.options || []).map(o => {
        const input = sheetEl.querySelector(`[name="opt-${o.id}"]:checked`);
        if (!input) return null;
        const choice = o.choices.find(c => c.id === input.value);
        return { optId: o.id, name: o.name, id: choice.id, label: `${o.name}: ${choice.label}`, priceDelta: choice.priceDelta || 0 };
      }).filter(Boolean);
    }
    function addonUnitPrice(a) {
      if (!addons) return 0;
      if (addons.sized) {
        const sizeSel = selectedOptions().find(s => s.optId === "size");
        const sizeId = sizeSel ? sizeSel.id : "s";
        return addons.priceBySize[sizeId] != null ? addons.priceBySize[sizeId] : 0;
      }
      return a.price || 0;
    }
    function selectedAddons() {
      if (!addons) return [];
      return [...sheetEl.querySelectorAll("[data-addons] input:checked")].map(inp => {
        const a = addons.items[+inp.value];
        return { label: a.label, price: addonUnitPrice(a) };
      });
    }
    function unitPrice() {
      const base = item.price + selectedOptions().reduce((n, o) => n + o.priceDelta, 0);
      return base + selectedAddons().reduce((n, a) => n + a.price, 0);
    }
    function refresh() {
      // choice highlight
      sheetEl.querySelectorAll(".choice").forEach(l => {
        const inp = l.querySelector("input");
        l.classList.toggle("checked", inp.checked);
      });
      // addon prices (sized addons depend on chosen size)
      if (addons) addons.items.forEach((a, i) => {
        const el = sheetEl.querySelector(`[data-addon-price="${i}"]`);
        const p = addonUnitPrice(a);
        el.textContent = p ? `+${NIS(p)}` : "חינם";
      });
      // enforce max addons
      if (addons && addons.max) {
        const checked = sheetEl.querySelectorAll("[data-addons] input:checked").length;
        sheetEl.querySelectorAll("[data-addons] input:not(:checked)").forEach(inp => {
          inp.disabled = checked >= addons.max;
          inp.closest(".choice").style.opacity = inp.disabled ? 0.45 : 1;
        });
      }
      sheetEl.querySelector("[data-qty]").textContent = qty;
      sheetEl.querySelector("[data-total]").textContent = NIS(unitPrice() * qty);
    }

    sheetEl.addEventListener("change", refresh);
    sheetEl.querySelector("[data-plus]").addEventListener("click", () => { qty++; refresh(); });
    sheetEl.querySelector("[data-minus]").addEventListener("click", () => { qty = Math.max(1, qty - 1); refresh(); });
    sheetEl.querySelector(".sheet-close").addEventListener("click", closeSheet);
    sheetEl.querySelector("[data-confirm]").addEventListener("click", () => {
      TovaleCart.add({
        itemId: item.id,
        name: item.name,
        unitPrice: unitPrice(),
        qty,
        options: selectedOptions().map(o => ({ name: o.name, label: o.label })),
        addons: selectedAddons(),
        note: sheetEl.querySelector("[data-note]").value.trim()
      });
      closeSheet();
      window.tovaleToast(`${item.name} נוסף להזמנה 🎉`);
    });

    refresh();
    requestAnimationFrame(() => {
      sheetEl.classList.add("open");
      sheetBackdrop.classList.add("open");
      document.body.classList.add("no-scroll");
    });
  };

  /* quick add: items without options/addons skip the sheet */
  window.tovaleQuickAdd = function (item) {
    const needsSheet = (item.options && item.options.length) || item.addons || item.addonGroup;
    if (needsSheet) { window.tovaleOpenItem(item); return; }
    TovaleCart.add({ itemId: item.id, name: item.name, unitPrice: item.price, qty: 1, options: [], addons: [], note: "" });
    window.tovaleToast(`${item.name} נוסף להזמנה 🎉`);
  };

  /* delegate add buttons anywhere on the page */
  document.addEventListener("click", async e => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const menu = await window.tovaleLoadMenu();
    const item = menu.items.find(i => i.id === btn.dataset.add);
    if (item) window.tovaleQuickAdd(item);
  });
})();
