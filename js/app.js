/* ============================================================================
   APP — el orden de las cosas.
   1. se dibuja la invitación desde la configuración
   2. se prepara el movimiento (pero nada se mueve todavía)
   3. el invitado abre el sobre → entra la música y arranca la película
   ============================================================================ */

import { WEDDING } from "./config.js";
import { qs, qsa, prefersReduced } from "./dom.js";
import { renderAll, renderCurtain } from "./render.js";
import { initMotion, playHeroIntro, drawMonogram } from "./motion.js";
import { Ambient } from "./ambient.js";
import { Music } from "./audio.js";
import { initNav } from "./nav.js";
import { initCountdown } from "./countdown.js";
import { attachRsvp, attachSong } from "./rsvp.js";

const gsap = window.gsap;
const reduce = prefersReduced();

/* ------------------------------------------------------------------------- */
/* Metadatos                                                                 */
/* ------------------------------------------------------------------------- */
function syncMeta(cfg) {
  const m = cfg.meta || {};
  if (m.title) document.title = m.title;
  const set = (sel, value) => { const n = qs(sel); if (n && value) n.setAttribute("content", value); };
  set('meta[name="description"]', m.description);
  set('meta[property="og:title"]', m.title);
  set('meta[property="og:description"]', m.description);
  set('meta[property="og:image"]', m.image);
  set('meta[property="og:url"]', m.url);
}

/* ------------------------------------------------------------------------- */
/* Acordeón de preguntas                                                     */
/* ------------------------------------------------------------------------- */
function initAccordion() {
  qsa(".accordion__trigger").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      if (reduce) {
        panel.style.height = isOpen ? "0px" : "auto";
        return;
      }
      gsap.to(panel, {
        height: isOpen ? 0 : "auto",
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => window.ScrollTrigger?.refresh(),
      });
    });
  });
}

/* ------------------------------------------------------------------------- */
/* Botón de música                                                           */
/* ------------------------------------------------------------------------- */
function initAudioButton(playing) {
  const btn = qs("#audioBtn");
  if (!btn) return;
  btn.setAttribute("aria-pressed", String(playing));
  gsap.to(btn, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)", delay: 0.6 });
  btn.addEventListener("click", () => {
    const on = Music.toggle();
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Silenciar música" : "Activar música");
  });
}

/* ------------------------------------------------------------------------- */
/* El sobre                                                                  */
/* ------------------------------------------------------------------------- */
function initCurtain(cfg, nav) {
  const curtain = qs("#curtain");
  const heroVideo = qs("#heroVideo");
  const pendingHash = window.location.hash;

  const startVideo = () => {
    if (!heroVideo) return;
    if (!heroVideo.src && heroVideo.dataset.src) heroVideo.src = heroVideo.dataset.src;
    heroVideo.preload = "auto";
    heroVideo.play().catch(() => {});
  };

  if (!curtain) {
    document.body.classList.remove("is-sealed");
    startVideo();
    playHeroIntro(reduce);
    nav?.reveal();
    return;
  }

  const content = qs(".curtain__content", curtain);
  const mono = qs(".monogram", curtain);
  const line = qs(".curtain__line", curtain);
  const btn = qs("#openBtn", curtain);

  /* --- Entrada del sobre --- */
  const pieces = Array.from(content.children).filter((n) => n !== mono);
  gsap.set(pieces, { opacity: 0, y: 12 });
  gsap.set(mono, { opacity: 0 });

  const intro = gsap.timeline({ delay: 0.15 });
  if (reduce) {
    intro.set([mono, ...pieces], { opacity: 1, y: 0 });
    qsa("path, line, circle", mono).forEach((s) => gsap.set(s, { strokeDashoffset: 0 }));
    gsap.set(line, { width: "min(160px,40vw)" });
  } else {
    intro
      .to(mono, { opacity: 1, duration: 0.6 })
      .add(drawMonogram(mono, { duration: 1.4 }), "-=0.4")
      .to(pieces, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09 }, "-=0.95")
      .to(line, { width: "min(160px,40vw)", duration: 0.9, ease: "power4.inOut" }, "-=0.6");
  }

  // Empezamos a traer el video mientras el invitado lee el sobre: cuando pulse,
  // el hero ya está listo y la transición no espera a la red.
  setTimeout(() => {
    if (heroVideo && !heroVideo.src && heroVideo.dataset.src) {
      heroVideo.src = heroVideo.dataset.src;
      heroVideo.preload = "auto";
    }
  }, 700);

  btn?.focus({ preventScroll: true });

  /* --- Apertura --- */
  let opened = false;
  async function open() {
    if (opened) return;
    opened = true;
    btn.disabled = true;

    const playing = await Music.start();
    initAudioButton(playing);
    startVideo();

    const tl = gsap.timeline({
      onComplete: () => {
        curtain.remove();
        document.body.classList.remove("is-sealed");
        window.ScrollTrigger?.refresh();
        nav?.reveal();
        if (pendingHash) setTimeout(() => nav?.goTo(pendingHash), 120);
      },
    });

    if (reduce) {
      tl.to(curtain, { opacity: 0, duration: 0.4 })
        .add(() => playHeroIntro(reduce));
      return;
    }

    // El sobre se abre por su propia línea dorada: arriba sube, abajo baja.
    tl.to(content, { opacity: 0, y: -16, duration: 0.42, ease: "power2.in" })
      .to(".curtain__panel.is-top", { yPercent: -100, duration: 1.0, ease: "power4.inOut" }, "-=0.06")
      .to(".curtain__panel.is-bottom", { yPercent: 100, duration: 1.0, ease: "power4.inOut" }, "<")
      .add(playHeroIntro(reduce), "-=0.55");
  }

  btn?.addEventListener("click", open);
}

/* ------------------------------------------------------------------------- */
/* Arranque                                                                  */
/* ------------------------------------------------------------------------- */
function boot() {
  const cfg = WEDDING;
  syncMeta(cfg);

  const stage = qs("#stage");
  renderAll(cfg, stage);

  if (cfg.flags.curtain) {
    document.body.classList.add("is-sealed");
    document.body.appendChild(renderCurtain(cfg));
  }

  Ambient.init({ particleCap: cfg.flags.particleCap, ambient: cfg.flags.ambient });
  Music.configure(cfg.audio);

  initMotion();
  initCountdown(cfg);
  initAccordion();
  attachRsvp(qs("#rsvpForm"), cfg, gsap);
  attachSong(qs("#songForm"), cfg);

  const nav = initNav(cfg);
  initCurtain(cfg, nav);

  // Sin sobre no hay interacción previa, así que no hay música: el botón sobra.
  if (!cfg.flags.curtain) qs("#audioBtn")?.remove();

  document.documentElement.classList.add("is-ready");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
