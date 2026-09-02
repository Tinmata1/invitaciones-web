/* ============================================================================
   MOTION — el lenguaje de movimiento de la invitación.
   ----------------------------------------------------------------------------
   Cinco familias, y ninguna se usa fuera de su sitio:

     1. TIPOGRAFÍA    palabras que suben desde detrás de una máscara
     2. MÁSCARA       fotografía y video que se abren como un telón
     3. DERIVA        dos planos a distinta velocidad, nunca tres
     4. ESCENA FIJA   sólo donde el relato lo pide (la historia)
     5. AMBIENTE      cielo y partículas, siempre de fondo

   Si un movimiento no cuenta nada, no está aquí.
   ============================================================================ */

import { qs, qsa, prefersReduced } from "./dom.js";
import { Ambient } from "./ambient.js";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

/* ------------------------------------------------------------------------- */
/* 1 · Tipografía enmascarada                                                */
/* ------------------------------------------------------------------------- */

/** Envuelve un nodo en máscara + interior animable. */
function mask(child) {
  const outer = document.createElement("span");
  outer.className = "mw";
  const inner = document.createElement("span");
  inner.className = "mi";
  inner.appendChild(child);
  outer.appendChild(inner);
  return { outer, inner };
}

/** Parte un título en palabras enmascaradas, respetando <br> y <span>. */
export function splitWords(node) {
  if (node.dataset.split === "done") return qsa(".mi", node);
  const parts = [];
  const out = document.createDocumentFragment();

  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const words = child.textContent.split(/(\s+)/);
      words.forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) { out.appendChild(document.createTextNode(" ")); return; }
        const { outer, inner } = mask(document.createTextNode(token));
        out.appendChild(outer);
        parts.push(inner);
      });
    } else if (child.nodeName === "BR") {
      out.appendChild(child.cloneNode());
    } else {
      const { outer, inner } = mask(child.cloneNode(true));
      out.appendChild(outer);
      parts.push(inner);
    }
  });

  node.replaceChildren(out);
  node.dataset.split = "done";
  return parts;
}

/** Los nombres del hero, letra a letra. Sólo aquí: en otro sitio es ruido. */
export function splitChars(line) {
  const word = line.dataset.word;
  if (!word) return [];
  const frag = document.createDocumentFragment();
  const chars = [];
  for (const ch of word) {
    const span = document.createElement("span");
    span.className = "hero__char";
    span.textContent = ch === " " ? " " : ch;
    frag.appendChild(span);
    chars.push(span);
  }
  line.setAttribute("aria-hidden", "false");
  line.replaceChildren(frag);
  return chars;
}

/* ------------------------------------------------------------------------- */
/* Registro de reveals                                                       */
/* ------------------------------------------------------------------------- */
export function initReveals(reduce) {
  // Títulos: palabras que suben
  qsa('[data-reveal="lines"]').forEach((node) => {
    const words = splitWords(node);
    if (reduce) { gsap.set(words, { yPercent: 0, opacity: 1 }); return; }
    gsap.set(words, { yPercent: 108 });
    gsap.to(words, {
      yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.055,
      scrollTrigger: { trigger: node, start: "top 88%", once: true },
    });
  });

  // Texto y piezas sueltas: un desplazamiento corto, nunca de 30px
  qsa('[data-reveal="fade"]').forEach((node) => {
    if (reduce) { gsap.set(node, { opacity: 1, y: 0 }); return; }
    gsap.fromTo(node,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.95, ease: "power3.out",
        scrollTrigger: { trigger: node, start: "top 90%", once: true } });
  });

  // Fotografía y video: telón que se abre y la imagen que se asienta
  qsa('[data-reveal="mask"]').forEach((node) => {
    const media = qs(".frame__media, iframe", node);
    if (reduce) {
      gsap.set(node, { clipPath: "none", opacity: 1 });
      if (media) gsap.set(media, { scale: 1 });
      return;
    }
    gsap.set(node, { clipPath: "inset(0% 0% 100% 0%)" });
    const tl = gsap.timeline({ scrollTrigger: { trigger: node, start: "top 86%", once: true } });
    tl.to(node, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "power4.inOut" });
    if (media) tl.fromTo(media, { scale: 1.14 }, { scale: 1, duration: 1.7, ease: "power3.out" }, 0.05);
  });

  // El hilo de luz que cose un capítulo con el siguiente
  qsa("[data-thread]").forEach((node) => {
    if (reduce) { node.style.setProperty("--thread-p", "1"); return; }
    gsap.fromTo(node,
      { "--thread-p": 0 },
      { "--thread-p": 1, ease: "none",
        scrollTrigger: { trigger: node, start: "top 92%", end: "top 55%", scrub: true } });
  });
}

/* ------------------------------------------------------------------------- */
/* 3 · Deriva — dos planos, nunca tres                                       */
/* ------------------------------------------------------------------------- */
function heroScene(reduce) {
  const hero = qs("#hero");
  if (!hero) return;
  const video = qs("#heroVideo", hero);
  const names = qs(".hero__names", hero);
  const credits = qs(".hero__credits", hero);
  const sub = qs(".hero__sub", hero);
  const cue = qs(".scroll-cue", hero);

  if (reduce) {
    gsap.set([names, credits, sub, cue], { opacity: 1, y: 0 });
    qsa(".hero__line[data-word]", hero).forEach((l) => {
      splitChars(l).forEach((c) => gsap.set(c, { y: 0 }));
    });
    return;
  }

  // Plano de fondo y plano de texto se separan al desplazar: eso es la deriva
  gsap.to(video, {
    scale: 1.22, yPercent: 6, ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to([names, credits, sub], {
    yPercent: -34, opacity: 0, ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "70% top", scrub: true },
  });
  gsap.to(cue, {
    opacity: 0, ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "22% top", scrub: true },
  });
}

/** La entrada del hero, encadenada al momento en que se abre el sobre. */
export function playHeroIntro(reduce) {
  const hero = qs("#hero");
  if (!hero) return gsap.timeline();

  const chars = qsa(".hero__line[data-word]", hero).flatMap(splitChars);
  const credits = qs(".hero__credits", hero);
  const sub = qs(".hero__sub", hero);
  const cue = qs(".scroll-cue", hero);

  if (reduce) {
    gsap.set([...chars, credits, sub, cue], { opacity: 1, y: 0 });
    return gsap.timeline();
  }

  gsap.set(chars, { yPercent: 112 });
  gsap.set([credits, sub, cue], { opacity: 0 });

  return gsap.timeline()
    .to(chars, { yPercent: 0, duration: 1.25, ease: "power4.out", stagger: 0.038 })
    .fromTo(credits, { y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.62")
    .fromTo(sub, { y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.72")
    .to(cue, { opacity: 1, duration: 0.8 }, "-=0.4");
}

/* ------------------------------------------------------------------------- */
/* 4 · Escena fija — sólo la historia la merece                              */
/* ------------------------------------------------------------------------- */
/* La historia no desfila de lado: se atraviesa. Los capítulos esperan al fondo
   de la escena, el scroll los trae hasta el primer plano y siguen de largo por
   encima del hombro del invitado. Dentro de cada marco, la imagen viaja a otra
   velocidad que su plano: la deriva de siempre, ahora en profundidad.
   Sólo se animan transform y opacity, y nunca hay más de dos planos a la vez
   moviéndose de verdad. */
function storyScene(reduce) {
  const story = qs("#historia");
  if (!story) return;
  const intro   = qs(".story__intro", story);
  const hint    = qs(".story__hint", story);
  const counter = qs("[data-story-index]", story);
  const panels  = qsa(".story__panel", story);
  const ticks   = qsa(".story__tick", story);
  if (!panels.length) return;

  // Sin movimiento, o en pantallas demasiado bajas para fijar cómodamente:
  // la historia se apila y se lee. No se pierde nada.
  const canPin = !reduce && window.innerHeight > 460;
  if (!canPin) {
    story.classList.add("story--stacked");
    // Apilada no hay capítulo "activo": los videos vuelven a la regla común.
    qsa("video[data-gated]", story).forEach((v) => v.removeAttribute("data-gated"));
    return;
  }

  const FAR  = -1500;  // dónde espera un recuerdo antes de acercarse
  const NEAR = 560;    // hasta dónde pasa de largo antes de desvanecerse
  const LIFE = 2.2;    // lo que dura un capítulo, en unidades de la escena
  const STEP = 1.75;   // cada cuánto entra el siguiente: se cruzan, no se pisan
  const LEAD = 0.55;   // el título tiene tiempo de alejarse antes del primero
  const FADE = 0.6;    // el cruce entre un recuerdo y el siguiente
  const lastIndex = panels.length - 1;
  // El último capítulo no pasa de largo: se posa y se queda. Así la escena no
  // se suelta con la pantalla vacía, y la historia termina en el presente.
  const units = LEAD + lastIndex * STEP + LIFE * 0.72;

  /* --------- Qué capítulo se está mirando --------- */
  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    if (counter) counter.textContent = String(i + 1).padStart(2, "0");
    ticks.forEach((tick, k) => tick.classList.toggle("is-on", k <= i));
    // Un solo video reproduciéndose: el del capítulo que se está mirando.
    panels.forEach((panel, k) => {
      const v = qs("video[data-gated]", panel);
      if (!v) return;
      if (k === i) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.preload = "auto"; v.load(); }
        v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: story,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * 0.58 * units),
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // El número cambia en mitad de la disolvencia, que es cuando el ojo
        // deja de leer un capítulo y empieza a leer el siguiente.
        const t = self.progress * units;
        const i = Math.floor((t - LEAD - FADE / 2) / STEP);
        setActive(Math.min(lastIndex, Math.max(0, i)));
      },
      onLeaveBack: () => setActive(0),
    },
  });

  // El título se aleja al fondo: el invitado entra dentro del recuerdo.
  if (intro) tl.to(intro, { z: -700, opacity: 0, duration: LEAD + 0.35 }, 0);
  if (hint)  tl.to(hint,  { opacity: 0, duration: 0.4 }, 0.9);

  panels.forEach((panel, i) => {
    const media   = qs(".frame__media", panel);
    const caption = qs(".frame__caption", panel);
    const side    = i % 2 ? 1 : -1;          // alternan de lado: nunca en fila
    const at      = LEAD + i * STEP;
    const last    = i === lastIndex;
    const life    = last ? LIFE * 0.72 : LIFE;

    // El plano entero, del fondo al primer plano. El último frena y se queda.
    tl.fromTo(panel,
      { z: FAR, xPercent: 30 * side, yPercent: 10, rotationY: -9 * side, rotationX: 4 },
      last
        ? { z: 40, xPercent: 0, yPercent: 0, rotationY: 0, rotationX: 0,
            duration: life, ease: "power2.out" }
        : { z: NEAR, xPercent: -18 * side, yPercent: -10, rotationY: 6 * side, rotationX: -2,
            duration: life },
      at)
      // Aparece todavía lejos y se apaga al rebasar. La salida dura lo mismo
      // que la entrada del siguiente y empieza a la vez: el relevo es una
      // disolvencia limpia, nunca dos fotos superpuestas peleándose.
      .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: FADE }, at);
    if (!last) tl.to(panel, { opacity: 0, duration: FADE }, at + STEP);

    // Segundo plano: la imagen dentro del marco va a su propia velocidad.
    if (media) {
      tl.fromTo(media,
        { scale: 1.2, yPercent: -3.5 },
        { scale: 1.02, yPercent: 3.5, duration: life }, at);
    }

    // El pie entra cuando el recuerdo ya está cerca y se va antes de rebasar.
    if (caption) {
      tl.fromTo(caption,
        { opacity: 0, yPercent: 22 },
        { opacity: 1, yPercent: 0, duration: 0.5, ease: "power3.out" }, at + 0.5);
      if (!last) tl.to(caption, { opacity: 0, duration: 0.35 }, at + STEP - 0.2);
    }
  });

  setActive(0);
}

/* ------------------------------------------------------------------------- */
/* Escenas de capítulo                                                       */
/* ------------------------------------------------------------------------- */
function timelineScene(reduce) {
  const timeline = qs(".timeline");
  if (!timeline) return;
  const fill = qs(".timeline__fill", timeline);
  const stops = qsa(".timeline__stop", timeline);

  if (reduce) {
    gsap.set(fill, { scaleY: 1 });
    stops.forEach((s) => s.classList.add("is-on"));
    gsap.set(qsa(".timeline__card", timeline), { opacity: 1, x: 0 });
    return;
  }

  // El hilo de luz avanza con el lector: es el mismo ornamento del sitio
  gsap.fromTo(fill, { scaleY: 0 }, {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: timeline, start: "top 65%", end: "bottom 75%", scrub: 0.6 },
  });

  stops.forEach((stop, i) => {
    const card = qs(".timeline__card", stop);
    const fromLeft = window.innerWidth >= 820 && i % 2 === 0;
    gsap.fromTo(card,
      { opacity: 0, x: window.innerWidth >= 820 ? (fromLeft ? -28 : 28) : 22 },
      { opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: {
          trigger: stop, start: "top 82%",
          onEnter: () => stop.classList.add("is-on"),
          onLeaveBack: () => stop.classList.remove("is-on"),
        } });
  });
}

function venueScene(reduce) {
  qsa(".venue__map").forEach((map) => {
    const rings = qsa(".venue__ring", map);
    const needle = qs(".venue__needle", map);
    const dot = qs(".venue__dot", map);
    if (reduce) { gsap.set([needle, dot], { opacity: 1, scaleY: 1 }); return; }

    const st = { trigger: map, start: "top 78%", once: true };
    gsap.fromTo(needle, { scaleY: 0, transformOrigin: "top center" },
      { scaleY: 1, duration: 0.7, ease: "power3.in", delay: 0.65, scrollTrigger: st });
    gsap.fromTo(dot, { scale: 0 },
      { scale: 1, duration: 0.6, ease: "back.out(3)", delay: 1.28, scrollTrigger: st });
    // Las ondas laten desde el punto exacto, muy despacio, sin estridencia
    rings.forEach((ring, i) =>
      gsap.fromTo(ring, { scale: 0.35, opacity: 0.75 },
        { scale: 5.2, opacity: 0, duration: 3.8, ease: "sine.out",
          repeat: -1, delay: 1.5 + i * 1.26, scrollTrigger: st }));
  });
}

function dressScene(reduce) {
  const wraps = qsa("[data-sil]");
  if (!wraps.length) return;

  wraps.forEach((wrap, w) => {
    const strokes = qsa("path, circle", wrap);
    if (reduce) { gsap.set(strokes, { opacity: 1 }); return; }

    const st = { trigger: qs(".silhouettes") || wrap, start: "top 78%", once: true };
    strokes.forEach((s, i) => {
      let len = 0;
      try { len = s.getTotalLength(); } catch { /* algún navegador antiguo */ }
      if (!len) { gsap.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.5 + i * 0.06, scrollTrigger: st }); return; }
      gsap.set(s, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      gsap.to(s, {
        strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut",
        delay: w * 0.22 + i * 0.075, scrollTrigger: st,
      });
    });
  });

  // Paleta: las franjas de color crecen desde abajo, como muestras de tela
  const chips = qsa(".palette__chip i");
  if (chips.length && !reduce) {
    gsap.fromTo(chips, { scaleY: 0, transformOrigin: "bottom center" },
      { scaleY: 1, duration: 0.8, ease: "power3.out", stagger: 0.07,
        scrollTrigger: { trigger: ".palette", start: "top 88%", once: true } });
  }
}

function monogramScene(reduce) {
  qsa(".monogram").forEach((svg) => {
    const strokes = qsa("path, line, circle", svg);
    if (reduce) { gsap.set(strokes, { opacity: 1 }); return; }
    strokes.forEach((s) => {
      let len = 0;
      try { len = s.getTotalLength(); } catch { /* ignorado */ }
      if (len) gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
    });
  });
}

/** Dibuja un monograma concreto. Se usa en el sobre y en el cierre. */
export function drawMonogram(svg, { duration = 1.5, delay = 0 } = {}) {
  if (!svg) return gsap.timeline();
  const strokes = qsa("path, line, circle", svg);
  return gsap.to(strokes, {
    strokeDashoffset: 0, duration, ease: "power2.inOut", stagger: 0.09, delay,
  });
}

/* ------------------------------------------------------------------------- */
/* 5 · Ambiente — el progreso de la noche                                    */
/* ------------------------------------------------------------------------- */
function nightScene() {
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => Ambient.setProgress(self.progress),
  });
}

function finaleScene(reduce) {
  const finale = qs("#final");
  if (!finale) return;
  const mono = qs("#finaleMonogram", finale);

  ScrollTrigger.create({
    trigger: finale,
    start: "top 62%",
    once: true,
    onEnter: () => {
      drawMonogram(mono, { duration: 1.7 });
      if (!reduce) Ambient.fireFinale(mono);
    },
  });
}

/* ------------------------------------------------------------------------- */
/* Video: sólo se descarga y se mueve lo que está a la vista                 */
/* ------------------------------------------------------------------------- */
export function initLazyVideo() {
  const vids = qsa("video[data-lazy-video]");
  if (!vids.length || !("IntersectionObserver" in window)) {
    vids.forEach((v) => { if (v.dataset.src && !v.src) v.src = v.dataset.src; });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.preload = "auto"; v.load(); }
        // Los videos con puerta (los de la historia) los gobierna su escena:
        // allí hay varios planos en pantalla a la vez y sólo se mira uno.
        if (!v.hasAttribute("data-gated")) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { rootMargin: "160px" });
  vids.forEach((v) => io.observe(v));

  // La pestaña en segundo plano no gasta batería reproduciendo nada
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) vids.forEach((v) => v.pause());
  });
}

/* ------------------------------------------------------------------------- */
export function initMotion() {
  const reduce = prefersReduced();
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });   // la barra de Safari no re-dispara todo

  monogramScene(reduce);
  initReveals(reduce);
  heroScene(reduce);
  storyScene(reduce);
  timelineScene(reduce);
  venueScene(reduce);
  dressScene(reduce);
  finaleScene(reduce);
  nightScene();
  initLazyVideo();

  window.addEventListener("load", () => ScrollTrigger.refresh());
  return { reduce };
}
