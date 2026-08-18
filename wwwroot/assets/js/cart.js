/* Toval'e City — cart state (localStorage), shared by all pages */
(function () {
  const KEY = "tovale_cart_v1";

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : null;
      return data && Array.isArray(data.lines) ? data : { lines: [] };
    } catch { return { lines: [] }; }
  }
  function write(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
    document.dispatchEvent(new CustomEvent("cart:change", { detail: snapshot() }));
  }

  function lineTotal(line) { return line.unitPrice * line.qty; }

  function snapshot() {
    const s = read();
    const count = s.lines.reduce((n, l) => n + l.qty, 0);
    const total = s.lines.reduce((n, l) => n + lineTotal(l), 0);
    return { lines: s.lines, count, total };
  }

  window.TovaleCart = {
    get: snapshot,
    /* line: {itemId, name, unitPrice, qty, options:[{name,label}], addons:[{label,price}], note} */
    add(line) {
      const s = read();
      // merge identical configurations
      const sig = JSON.stringify([line.itemId, line.options, line.addons, line.note || ""]);
      const existing = s.lines.find(l => l._sig === sig);
      if (existing) existing.qty += line.qty;
      else s.lines.push(Object.assign({ _sig: sig, id: "l" + Math.random().toString(36).slice(2, 9) }, line));
      write(s);
    },
    setQty(lineId, qty) {
      const s = read();
      const l = s.lines.find(x => x.id === lineId);
      if (!l) return;
      l.qty = Math.max(0, qty);
      s.lines = s.lines.filter(x => x.qty > 0);
      write(s);
    },
    remove(lineId) {
      const s = read();
      s.lines = s.lines.filter(x => x.id !== lineId);
      write(s);
    },
    clear() { write({ lines: [] }); }
  };
})();
