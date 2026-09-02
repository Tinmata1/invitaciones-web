/* ============================================================================
   NAVEGACIÓN — un hilo, no una barra.
   ----------------------------------------------------------------------------
   De fondo: una línea de progreso finísima arriba y, en pantallas grandes, un
   riel con las horas de la noche. Al alcance: un botón que abre la lista de
   capítulos. Nadie tiene que ver un menú para recorrer la invitación, pero
   quien busca la ubicación o el RSVP los encuentra en un toque.
   ============================================================================ */

import { el, qs, qsa, prefersReduced } from "./dom.js";

export function initNav(cfg) {
  const gsap = window.gsap;
  const reduce = prefersReduced();

  // Sólo los capítulos que existen de verdad en la página
  const chapters = cfg.chapters.filter((c) => document.getElementById(c.id));
  if (!chapters.length) return null;

  /* ---------------- Línea de progreso ---------------- */
  const progress = el("div.progress", { "aria-hidden": "true" }, el("span.progress__fill"));
  const fill = qs(".progress__fill", progress);

  /* ---------------- Riel de horas (pantallas grandes) ---------------- */
  const rail = el("nav.hour-rail", { "aria-label": "Capítulos" },
    ...chapters.map((c) =>
      el("a.hour-rail__dot", { href: `#${c.id}`, "data-chapter": c.id },
        el("span.hour-rail__name", c.name),
        el("span.hour-rail__tick", { "aria-hidden": "true" }),
        el("span.visually-hidden", `${c.name}, ${c.hour}`),
      )),
  );

  /* ---------------- Hoja de capítulos ---------------- */
  const sheet = el("nav.nav-sheet#navSheet", { "aria-label": "Índice de la invitación", "data-open": "false" },
    ...chapters.map((c) =>
      el("a.nav-sheet__item", { href: `#${c.id}`, "data-chapter-link": c.id },
        el("span.nav-sheet__hour.num", c.hour),
        el("span", c.name),
      )),
  );

  const toggle = el("button.nav-toggle#navToggle", {
    type: "button", "aria-expanded": "false", "aria-controls": "navSheet",
    "aria-label": "Abrir índice de la invitación",
  }, el("span.nav-toggle__bars", { "aria-hidden": "true" }));

  document.body.append(progress, rail, sheet, toggle);

  /* ---------------- Apertura y cierre ---------------- */
  let open = false;
  let lastFocus = null;
  const items = qsa(".nav-sheet__item", sheet);

  function setOpen(next) {
    if (next === open) return;
    open = next;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar índice" : "Abrir índice de la invitación");
    sheet.dataset.open = String(open);

    if (open) {
      lastFocus = document.activeElement;
      gsap.to(sheet, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(items, { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.035, delay: 0.06 });
      items[0]?.focus({ preventScroll: true });
    } else {
      gsap.to(sheet, { opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(items, { opacity: 0, duration: 0.2 });
      (lastFocus === sheet || !lastFocus ? toggle : lastFocus)?.focus?.({ preventScroll: true });
    }
  }

  toggle.addEventListener("click", () => setOpen(!open));

  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") { setOpen(false); toggle.focus(); return; }
    if (e.key !== "Tab") return;
    // Mientras la hoja está abierta, el tabulador no se escapa detrás de ella
    const focusables = [toggle, ...items];
    const i = focusables.indexOf(document.activeElement);
    const nextIndex = e.shiftKey ? i - 1 : i + 1;
    if (i === -1 || nextIndex < 0 || nextIndex >= focusables.length) {
      e.preventDefault();
      focusables[e.shiftKey ? focusables.length - 1 : 0].focus();
    }
  });

  /* ---------------- Ir a un capítulo ---------------- */
  function goTo(hash) {
    const target = document.getElementById(hash.replace("#", ""));
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }

  [...items, ...qsa(".hour-rail__dot", rail)].forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setOpen(false);
      goTo(link.getAttribute("href"));
    });
  });

  /* ---------------- Estado actual ---------------- */
  const dots = new Map(qsa(".hour-rail__dot", rail).map((d) => [d.dataset.chapter, d]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      dots.forEach((dot, cid) => dot.setAttribute("aria-current", String(cid === entry.target.id)));
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  chapters.forEach((c) => io.observe(document.getElementById(c.id)));

  /* ---------------- Progreso ---------------- */
  window.ScrollTrigger.create({
    trigger: document.body, start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: (self) => { fill.style.transform = `scaleX(${self.progress})`; },
  });

  return {
    /** La navegación no existe hasta que el sobre se abre. */
    reveal() {
      gsap.to(progress, { opacity: 1, duration: 0.8, delay: 0.2 });
      gsap.to(toggle, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)", delay: 0.5 });
      if (cfg.flags.hourRail) gsap.to(rail, { opacity: 1, duration: 0.9, delay: 0.7 });
    },
    goTo,
  };
}
