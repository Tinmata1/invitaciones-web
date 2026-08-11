import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initReveal() {
  document.querySelectorAll(".reveal-up").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => el.classList.add("is-visible"),
    });
  });
}
