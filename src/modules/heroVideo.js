import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * El contenedor .hero mide 220vh y .hero__pin es sticky (ver CSS), así
 * que el video queda fijo en pantalla mientras el usuario recorre esa
 * franja de scroll. En vez de "adelantar" el video frame a frame con
 * currentTime (frágil: depende del decodificador del navegador y de
 * cuánto haya bufferizado), el video se reproduce normal en loop y es
 * el SCROLL el que anima transformaciones CSS sobre él (zoom, oscure-
 * cimiento, paralaje del texto). Esto nunca falla: no depende de que
 * el video decodifique un frame específico a tiempo, solo de CSS.
 */
export function initHeroVideo() {
  const section = document.getElementById("hero");
  const video = document.getElementById("hero-video");
  const content = section?.querySelector(".hero__content");
  const overlay = section?.querySelector(".hero__overlay");
  if (!section || !video) return;

  video.addEventListener("error", () => section.classList.add("video-missing"));
  video.addEventListener(
    "loadeddata",
    () => section.classList.remove("video-missing"),
    { once: true }
  );

  // Si el video no arrancó en un tiempo razonable, se asume que no
  // está disponible y se muestra el fallback elegante.
  setTimeout(() => {
    if (video.readyState < 2) section.classList.add("video-missing");
  }, 6000);

  video.play().catch(() => {
    // Autoplay bloqueado por el navegador: el fallback se hace cargo
    // si tampoco hay datos cargados tras el timeout de arriba.
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
    },
  })
    .to(video, { scale: 1.32, ease: "none" }, 0)
    .to(content, { yPercent: -60, opacity: 0, ease: "none" }, 0)
    .to(overlay, { opacity: 1, ease: "none" }, 0.1);
}
