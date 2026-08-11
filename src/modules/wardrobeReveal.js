import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initWardrobeReveal() {
  const section = document.querySelector(".section--wardrobe");
  if (!section) return;

  const man = section.querySelector(".wardrobe-figure--man");
  const woman = section.querySelector(".wardrobe-figure--woman");
  const link = section.querySelector(".wardrobe__link");

  const scrollTrigger = { trigger: section, start: "top 78%", once: true };

  gsap.fromTo(
    man,
    { opacity: 0, x: -60, rotate: -6 },
    { opacity: 1, x: 0, rotate: 0, duration: 1, ease: "back.out(1.4)", scrollTrigger }
  );
  gsap.fromTo(
    woman,
    { opacity: 0, x: 60, rotate: 6 },
    { opacity: 1, x: 0, rotate: 0, duration: 1, ease: "back.out(1.4)", scrollTrigger }
  );
  gsap.fromTo(
    link,
    { opacity: 0, scale: 0.6 },
    { opacity: 1, scale: 1, duration: 0.8, delay: 0.25, ease: "back.out(2)", scrollTrigger }
  );
}
