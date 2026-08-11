import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Cada pareja está armada con polígonos independientes (piernas, brazos,
 * vestido, torso) que pivotan desde su propio hombro/cadera. El avance
 * de "los pasos" está atado al progreso del scroll por la sección (no
 * es un loop en el tiempo): quieto si no scrolleas, y a medida que se
 * recorre la sección cada parte gira siguiendo su propio keyframe,
 * simulando el paso de un vals.
 */
export function initWaltzScroll() {
  const section = document.querySelector(".section--blessing");
  if (!section) return;

  const scrollTrigger = {
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    scrub: 0.5,
  };

  // Piernas del novio: paso alterno.
  gsap.to(".wp-part--leg-l", {
    keyframes: { rotate: [0, -22, 14, -18, 10, 0] },
    ease: "none",
    scrollTrigger,
  });
  gsap.to(".wp-part--leg-r", {
    keyframes: { rotate: [0, 20, -16, 18, -10, 0] },
    ease: "none",
    scrollTrigger,
  });

  // Vestido de la novia: se mece con el giro.
  gsap.to(".wp-part--dress", {
    keyframes: { rotate: [0, -9, 7, -6, 4, 0] },
    ease: "none",
    scrollTrigger,
  });

  // Brazos: vaivén suave, algo más marcado en el que cuelga.
  gsap.to(".wp-part--arm-raise", {
    keyframes: { rotate: [0, 6, -4, 5, -3, 0] },
    ease: "none",
    scrollTrigger,
  });
  gsap.to(".wp-part--arm-hang", {
    keyframes: { rotate: [0, -11, 8, -7, 5, 0] },
    ease: "none",
    scrollTrigger,
  });

  // Balanceo sutil de cada figura completa, pivotando desde los pies.
  gsap.to(".wp-figure", {
    keyframes: { rotate: [0, -4, 3, -3, 2, 0] },
    ease: "none",
    scrollTrigger,
  });
}
