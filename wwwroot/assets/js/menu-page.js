/* Toval'e City — /menu page: category nav, search, filters, sections */
(async function () {
  const esc = window.tovaleEsc;
  const menu = await window.tovaleLoadMenu();
  const catNav = document.querySelector("[data-cat-nav]");
  const sections = document.querySelector("[data-menu-sections]");
  const searchInput = document.querySelector("[data-menu-search]");
  const filterWrap = document.querySelector("[data-menu-filters]");

  /* filter chips: only tags that actually exist */
  const presentTags = [...new Set(menu.items.flatMap(i => i.tags || []))];
  const FILTERS = ["צמחוני", "ללא גלוטן", "חריף", "פופולרי"].filter(t => presentTags.includes(t));
  filterWrap.innerHTML = FILTERS.map(t => `<button class="filter-chip" data-filter="${t}">${t}</button>`).join("");

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

    catNav.innerHTML = menu.categories
      .filter(c => catIds.includes(c.id))
      .map(c => `<button data-goto="${c.id}">${esc(c.nav || c.name)}</button>`).join("");
    observeSections();
  }

  catNav.addEventListener("click", e => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    document.getElementById("cat-" + b.dataset.goto)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* active category highlighting while scrolling */
  let catObserver = null;
  function observeSections() {
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
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { query = searchInput.value.trim().toLowerCase(); render(); }, 180);
  });

  filterWrap.addEventListener("click", e => {
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
