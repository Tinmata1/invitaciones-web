import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function buildFireworkParticles() {
  document.querySelectorAll(".fx-firework").forEach((container) => {
    const count = Number(container.dataset.count) || 10;
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const distance = 14 + Math.random() * 6;
      const fx = Math.cos(angle) * distance;
      const fy = Math.sin(angle) * distance;

      const span = document.createElement("span");
      span.style.setProperty("--fx", `${fx}px`);
      span.style.setProperty("--fy", `${fy}px`);
      span.style.animationDelay = `${0.1 + Math.random() * 0.15}s`;
      container.appendChild(span);
    }
  });
}

/** La línea central se "dibuja" a sí misma a medida que se recorre el itinerario. */
function initProgressLine(timeline) {
  const progress = timeline.querySelector(".timeline__progress");
  if (!progress) return;

  gsap.to(progress, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: timeline,
      start: "top 75%",
      end: "bottom 65%",
      scrub: 0.4,
    },
  });
}

/**
 * Cada evento entra desde el lado donde va a quedar su texto (zigzag),
 * con un giro leve y un rebote (back.out) para que se sienta más vivo
 * sin perder elegancia. El ícono aparece un instante después.
 */
function initItemEntrances(items) {
  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  items.forEach((item, index) => {
    const fromLeft = isMobile ? true : index % 2 === 0;
    const icon = item.querySelector(".timeline__icon");
    const body = item.querySelector(".timeline__body");

    gsap.fromTo(
      body,
      { opacity: 0, x: fromLeft ? -70 : 70, rotate: fromLeft ? -3 : 3 },
      {
        opacity: 1,
        x: 0,
        rotate: 0,
        duration: 0.9,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: item,
          start: "top 82%",
          once: true,
        },
      }
    );

    gsap.fromTo(
      icon,
      { opacity: 0, scale: 0.4, rotate: fromLeft ? -20 : 20 },
      {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.7,
        delay: 0.18,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: item,
          start: "top 82%",
          once: true,
        },
      }
    );
  });
}

export function initTimelineFx() {
  buildFireworkParticles();

  const timeline = document.querySelector(".timeline");
  const items = document.querySelectorAll(".timeline__item");
  if (!timeline || !items.length) return;

  initProgressLine(timeline);
  initItemEntrances(items);

  // Animaciones internas de cada ícono (copas, vapor, fuegos, vals):
  // se activan y desactivan cada vez que el evento entra/sale de vista.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.4 }
  );

  items.forEach((item) => observer.observe(item));
}
