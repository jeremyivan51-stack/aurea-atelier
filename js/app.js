(function () {
  const STORAGE_KEY = "aurea-atelier-content-v1";
  const defaults = window.AUREA_CONTENT;
  const content = loadContent();
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function loadContent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(defaults);
      return deepMerge(structuredClone(defaults), JSON.parse(saved));
    } catch {
      return structuredClone(defaults);
    }
  }
  function deepMerge(base, extra) {
    if (typeof extra !== "object" || extra === null) return extra ?? base;
    if (Array.isArray(extra)) return extra.length ? extra : base;
    Object.keys(extra).forEach((key) => { base[key] = deepMerge(base[key], extra[key]); });
    return base;
  }
  function saveContent(next) { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  function getPath(obj, path) { return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj); }
  function setPath(obj, path, value) {
    const parts = path.split(".");
    const last = parts.pop();
    const target = parts.reduce((acc, key) => acc[key], obj);
    target[last] = value;
  }
  function escapeHtml(str = "") {
    return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  function render() {
    document.title = `${content.brand.name} ${content.brand.studio} — ${content.brand.tagline}`;
    $$("[data-text]").forEach((el) => {
      const value = getPath(content, el.dataset.text);
      if (value != null) el.textContent = value;
    });
    const maps = $("[data-maps]"); if (maps) maps.href = content.contact.maps;
    const mail = $("[data-email-link]"); if (mail) mail.href = `mailto:${content.contact.email}`;
    renderHighlights(); renderBeans(); renderFoods(); renderExperience();
  }

  function sunIcon() { return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8c5a1e" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>`; }
  function cupIcon() { return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8c5a1e" stroke-width="1.7"><path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 4c.5 1 0 2 0 2M12 4c.5 1 0 2 0 2"/></svg>`; }
  function plateIcon() { return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8c5a1e" stroke-width="1.7"><circle cx="12" cy="13" r="7"/><circle cx="12" cy="13" r="3"/><path d="M8 5h8"/></svg>`; }
  function sparkIcon() { return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8c5a1e" stroke-width="1.7"><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><circle cx="12" cy="12" r="2.4"/></svg>`; }

  function renderHighlights() {
    const root = $("#highlight-grid"); if (!root) return;
    const icons = { origin: sunIcon(), sip: cupIcon(), bite: plateIcon(), ritual: sparkIcon() };
    root.innerHTML = content.highlights.map((item) => `<article class="card"><div class="icon-blob">${icons[item.icon] || sparkIcon()}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join("");
  }
  function renderBeans() {
    const nav = $("#bean-nav"); const stage = $("#bean-stage");
    if (!nav || !stage) return;
    nav.innerHTML = content.beans.map((bean, i) => `<button type="button" data-bean="${bean.id}" class="${i === 0 ? "active" : ""}"><small>${escapeHtml(bean.region)}</small>${escapeHtml(bean.name)}</button>`).join("");
    paintBean(content.beans[0]);
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-bean]"); if (!btn) return;
      $$("#bean-nav button").forEach((b) => b.classList.toggle("active", b === btn));
      paintBean(content.beans.find((b) => b.id === btn.dataset.bean));
    });
  }
  function paintBean(bean) {
    const stage = $("#bean-stage"); if (!bean || !stage) return;
    stage.innerHTML = `<p class="eyebrow">${escapeHtml(bean.region)} · ${escapeHtml(bean.process)} · ${escapeHtml(bean.roast)}</p><h3 style="font-family:var(--font-display);font-size:clamp(28px,4vw,44px);margin:0 0 10px;letter-spacing:-0.03em;">${escapeHtml(bean.name)}</h3><div class="notes">${bean.notes.map((n) => `<span class="chip">${escapeHtml(n)}</span>`).join("")}</div><p class="muted">${escapeHtml(bean.story)}</p><p style="margin-top:18px;"><strong>${escapeHtml(bean.pairing)}</strong></p>`;
  }
  function renderFoods() {
    const root = $("#food-grid"); if (!root) return;
    const palettes = [["#c45c3e", "#5a2318"],["#6f8f78", "#24342a"],["#8c5a1e", "#2a160c"],["#d4a24a", "#6b3b12"],["#7a4b3a", "#1a120b"],["#b76e4d", "#3d2b1f"]];
    root.innerHTML = content.foods.map((food, i) => {
      const [c1, c2] = palettes[i % palettes.length];
      return `<button class="food-card" type="button" data-food="${food.id}"><div class="food-visual" style="--c1:${c1};--c2:${c2}"><span>${escapeHtml(food.course)}</span></div><div class="body"><h3>${escapeHtml(food.name)}</h3><p class="muted">${escapeHtml(food.text)}</p></div></button>`;
    }).join("");
    root.addEventListener("click", (e) => {
      const card = e.target.closest("[data-food]"); if (!card) return;
      const food = content.foods.find((f) => f.id === card.dataset.food);
      openModal(food.name, `${food.text} ${food.detail}`);
    });
  }
  function renderExperience() {
    const root = $("#timeline"); if (!root) return;
    root.innerHTML = content.experience.map((step) => `<article class="step"><b>${escapeHtml(step.step)}</b><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></article>`).join("");
  }

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => t.classList.toggle("active", t === tab));
      $$(".panel-block").forEach((p) => p.classList.toggle("active", p.id === tab.dataset.target));
    });
  });

  const burger = $("#burger"); const links = $("#nav-links");
  burger?.addEventListener("click", () => links.classList.toggle("open"));
  links?.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });

  const video = $("#hero-video"); const videoBtn = $("#video-toggle");
  if (video) {
    video.addEventListener("playing", () => video.classList.add("is-live"));
    video.addEventListener("error", () => video.classList.remove("is-live"));
    video.play?.().catch(() => {});
  }
  videoBtn?.addEventListener("click", () => {
    if (!video) return;
    video.muted = !video.muted;
    if (video.muted === false) video.play?.();
    videoBtn.textContent = video.muted ? "♪" : "✕";
  });

  const modal = $("#modal");
  function openModal(title, text) {
    $("#modal-title").textContent = title;
    $("#modal-text").textContent = text;
    modal.classList.add("open");
  }
  $("#modal-close")?.addEventListener("click", () => modal.classList.remove("open"));
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

  $("#visit-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Saved locally — connect this form to your inbox when you go live.");
    e.target.reset();
  });

  const editor = $("#editor-panel");
  $("#editor-fab")?.addEventListener("click", () => editor.classList.add("open"));
  $("#editor-close")?.addEventListener("click", () => editor.classList.remove("open"));
  const fields = [
    ["brand.name", "House name"], ["brand.studio", "Second word"], ["brand.tagline", "Tagline"], ["brand.promise", "Promise line"],
    ["hero.kicker", "Hero kicker"], ["hero.title", "Hero title"], ["hero.subtitle", "Hero subtitle"],
    ["mission.text", "Mission"], ["vision.text", "Vision"], ["manifesto", "Manifesto"],
    ["contact.address", "Address"], ["contact.hours", "Hours"], ["contact.phone", "Phone"], ["contact.email", "Email"]
  ];
  const editorBody = $("#editor-body");
  if (editorBody) {
    editorBody.innerHTML = fields.map(([path, label]) => {
      const long = path.includes("mission") || path.includes("vision") || path === "manifesto" || path.includes("subtitle");
      const tag = long ? "textarea" : "input";
      return `<label for="f-${path}">${label}</label><${tag} id="f-${path}" data-path="${path}"></${tag}>`;
    }).join("");
    fields.forEach(([path]) => {
      const field = document.getElementById(`f-${path}`);
      if (field) field.value = getPath(content, path) || "";
    });
  }
  $("#editor-save")?.addEventListener("click", () => {
    $$("#editor-body [data-path]").forEach((field) => setPath(content, field.dataset.path, field.value));
    saveContent(content); render(); toast("Changes saved in this browser."); editor.classList.remove("open");
  });
  $("#editor-reset")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    toast("Reset to defaults. Refreshing…");
    setTimeout(() => location.reload(), 700);
  });
  function toast(message) {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2600);
  }
  render();
})();
