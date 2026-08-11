import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initSmoothScroll } from "./modules/lenis.js";
import { initLoader } from "./modules/loader.js";
import { initCountdown } from "./modules/countdown.js";
import { initHeroVideo } from "./modules/heroVideo.js";
import { initReveal } from "./modules/reveal.js";
import { initTimelineFx } from "./modules/timelineFx.js";
import { initNotesField } from "./modules/notes.js";
import { initGallery } from "./modules/gallery.js";
import { initLazyVideos } from "./modules/lazyVideos.js";
import { initWaltzScroll } from "./modules/waltzScroll.js";
import { initWardrobeReveal } from "./modules/wardrobeReveal.js";

initSmoothScroll();
initHeroVideo();
initCountdown();
initReveal();
initTimelineFx();
initNotesField();
initGallery(9);
initLazyVideos();
initWaltzScroll();
initWardrobeReveal();

initLoader({
  onEnter: () => {
    ScrollTrigger.refresh();

    gsap.fromTo(
      ".hero__content .eyebrow, .hero__title, .hero__subtitle",
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.15 }
    );
  },
});

// Las fuentes web y las imágenes pueden cambiar la altura de secciones
// después de que ScrollTrigger ya midió la página, desalineando los
// puntos de disparo de las animaciones más abajo (ej. últimas fotos
// de la galería). Se vuelve a medir cuando todo terminó de cargar.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener("load", () => ScrollTrigger.refresh());
