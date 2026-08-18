/* Toval'e City — /menu page: category nav, search, filters, sections */
(async function () {
  const esc = window.tovaleEsc;
  const menu = await window.tovaleLoadMenu();
  const catNav = document.querySelector("[data-cat-nav]");
  const launcher = document.querySelector("[data-cat-launcher]");

  /* hand-drawn line icons per category (48x48, stroke) */
  const S = 'viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const CAT_ICONS = {
    breakfast: `<svg ${S}><circle cx="21" cy="27" r="12"/><circle cx="21" cy="27" r="4.5"/><path d="M33 27h10"/><path d="M14 9c-1.5 2 1.5 3 0 5M21 8c-1.5 2 1.5 3 0 5"/></svg>`,
    starters: `<svg ${S}><path d="M9 26h30a15 15 0 0 1-30 0Z"/><path d="M18 40h12"/><path d="M19 19c-2-2.5 2-4 0-7M29 19c-2-2.5 2-4 0-7"/></svg>`,
    salads: `<svg ${S}><path d="M8 27h32a16 16 0 0 1-32 0Z"/><path d="M24 21c-1-7 3-12 10-13 .5 7-3.5 12-10 13Z"/><path d="M24 21c-4-3-9-3-12-1"/></svg>`,
    pizzas: `<svg ${S}><path d="M9 13a30 30 0 0 1 30 0L24 43Z"/><path d="M8 13.5c10-5.5 22-5.5 32 0"/><circle cx="20" cy="20" r="2.4"/><circle cx="29" cy="22" r="2.4"/><circle cx="24" cy="30" r="2.4"/></svg>`,
    focaccias: `<svg ${S}><ellipse cx="24" cy="25" rx="18" ry="11"/><path d="M17 22c.01 0 .01 0 0 0M25 20c.01 0 .01 0 0 0M31 26c.01 0 .01 0 0 0M21 29c.01 0 .01 0 0 0M28 31c.01 0 .01 0 0 0" stroke-width="3.4"/><path d="M13 12c1.5-1.5 4-1.5 5 0M25 9c1.5-1.5 4-1.5 5 0"/></svg>`,
    sandwiches: `<svg ${S}><path d="M6 27c0-3.5 2-8 7-8 1.5-2.5 6-2.5 7.5 0 1.5-2.5 6-2.5 7.5 0 1.5-2.5 6-2.5 7.5 0 4 0 6.5 4.5 6.5 8Z"/><path d="M6 27v3a5 5 0 0 0 5 5h26a5 5 0 0 0 5-5v-3"/><path d="M10 31h4m4 0h4m4 0h4m4 0h4" /></svg>`,
    toasts: `<svg ${S}><path d="M11 20c-2.5-1-3.5-4-1.5-6.5C11 11 14 10.5 16 12c1-2.5 4-4 8-4s7 1.5 8 4c2-1.5 5-1 6.5 1.5 2 2.5 1 5.5-1.5 6.5v16a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3Z"/><path d="M17 34l6-6M25 34l6-6"/></svg>`,
    pastries: `<svg ${S}><path d="M24 9 43 39H5Z"/><path d="M20 24c.01 0 .01 0 0 0M28 24c.01 0 .01 0 0 0M24 31c.01 0 .01 0 0 0M18 33c.01 0 .01 0 0 0M30 33c.01 0 .01 0 0 0" stroke-width="3.2"/></svg>`,
    pastas: `<svg ${S}><path d="M31 14c5 1 9 5 9 11 0 7-7 13-16 13S8 32 8 25c0-6 4-10 9-11"/><path d="M18 8v12M24 6v14M30 8v12"/><path d="M12 25c4-2.5 8 2.5 12 0s8 2.5 12 0"/></svg>`,
    "gluten-free": `<svg ${S}><path d="M24 8v32"/><path d="M24 16c-4 0-6-3-6-7 4 0 6 3 6 7Zm0 0c4 0 6-3 6-7-4 0-6 3-6 7ZM24 25c-4 0-6-3-6-7 4 0 6 3 6 7Zm0 0c4 0 6-3 6-7-4 0-6 3-6 7ZM24 34c-4 0-6-3-6-7 4 0 6 3 6 7Zm0 0c4 0 6-3 6-7-4 0-6 3-6 7Z"/><path d="M9 40 39 9"/></svg>`,
    desserts: `<svg ${S}><path d="M12 40V24l24-9v25"/><path d="M8 40h32"/><path d="M12 32l24-9"/><circle cx="15" cy="16" r="2.2"/><path d="M15 13.8V10"/></svg>`,
    drinks: `<svg ${S}><path d="M15 14h18l-2.5 26h-13Z"/><path d="M16 22h16.5"/><path d="M28 14l7-9"/><path d="M21 30c.01 0 .01 0 0 0M26 33c.01 0 .01 0 0 0M23 36c.01 0 .01 0 0 0" stroke-width="3"/></svg>`
  };

  if (launcher) {
    launcher.innerHTML = menu.categories.map(c => `
      <button data-goto="${c.id}" aria-label="מעבר לקטגוריית ${esc(c.name)}">
        ${CAT_ICONS[c.id] || CAT_ICONS.starters}
        <span>${esc(c.nav || c.name)}</span>
      </button>`).join("");
    launcher.addEventListener("click", e => {
      const b = e.target.closest("[data-goto]");
      if (!b) return;
      document.getElementById("cat-" + b.dataset.goto)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const sections = document.querySelector("[data-menu-sections]");
  const searchInput = document.querySelector("[data-menu-search]");
  const filterWrap = document.querySelector("[data-menu-filters]");

  /* filter chips: only tags that actually exist */
  const presentTags = [...new Set(menu.items.flatMap(i => i.tags || []))];
  const FILTERS = ["צמחוני", "ללא גלוטן", "חריף", "פופולרי"].filter(t => presentTags.includes(t));
  if (filterWrap) filterWrap.innerHTML = FILTERS.map(t => `<button class="filter-chip" data-filter="${t}">${t}</button>`).join("");

  let activeFilters = new Set();
  let query = "";

  function itemMatches(item) {
    if (query) {
      const hay = (item.name + " " + (item.description || "")).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    for (const f of activeFilters) if (!(item.tags || []).includes(f)) return false;
    return true;
  }

  function render() {
    let any = false;
    const catIds = [];
    sections.innerHTML = menu.categories.map(cat => {
      const items = menu.items.filter(i => i.categoryId === cat.id && itemMatches(i));
      if (!items.length) return "";
      any = true; catIds.push(cat.id);
      return `
        <section class="menu-cat container" id="cat-${cat.id}" aria-labelledby="h-${cat.id}">
          <div class="menu-cat-head"><h2 id="h-${cat.id}">${esc(cat.name)}</h2></div>
          ${cat.note ? `<p class="menu-cat-note">${esc(cat.note)}</p>` : ""}
          <div class="dish-grid">${items.map(window.tovaleDishCard).join("")}</div>
        </section>`;
    }).join("");

    if (!any) {
      sections.innerHTML = `<div class="menu-empty container">
        <p class="display">לא מצאנו מנות מתאימות</p>
        <p>נסו חיפוש אחר או נקו את הסינון</p></div>`;
    }

    if (catNav) catNav.innerHTML = menu.categories
      .filter(c => catIds.includes(c.id))
      .map(c => `<button data-goto="${c.id}">${esc(c.nav || c.name)}</button>`).join("");
    observeSections();
  }

  if (catNav) catNav.addEventListener("click", e => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    document.getElementById("cat-" + b.dataset.goto)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* active category highlighting while scrolling */
  let catObserver = null;
  function observeSections() {
    if (!catNav) return;
    if (catObserver) catObserver.disconnect();
    if (!("IntersectionObserver" in window)) return;
    catObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(en => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id.replace("cat-", "");
      catNav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.goto === id));
      const activeBtn = catNav.querySelector("button.active");
      if (activeBtn) activeBtn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] });
    sections.querySelectorAll(".menu-cat").forEach(s => catObserver.observe(s));
  }

  let debounce;
  if (searchInput) searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { query = searchInput.value.trim().toLowerCase(); render(); }, 180);
  });

  if (filterWrap) filterWrap.addEventListener("click", e => {
    const chip = e.target.closest("[data-filter]");
    if (!chip) return;
    const f = chip.dataset.filter;
    if (activeFilters.has(f)) activeFilters.delete(f); else activeFilters.add(f);
    chip.classList.toggle("active");
    render();
  });

  render();

  /* deep link: /menu#cat-pizzas */
  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
  }
})();
