export function initLoader({ onEnter } = {}) {
  const loader = document.getElementById("loader");
  const enterBtn = document.getElementById("enter-btn");
  const music = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  document.body.style.overflow = "hidden";

  enterBtn.addEventListener("click", () => {
    loader.classList.add("is-hidden");
    document.body.style.overflow = "";

    music.volume = 0.6;
    music.play().catch(() => {
      // Autoplay bloqueado o archivo aún no disponible: se ignora silenciosamente.
      musicToggle.setAttribute("aria-pressed", "false");
    });

    if (typeof onEnter === "function") onEnter();
  });

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().catch(() => {});
      musicToggle.setAttribute("aria-pressed", "true");
    } else {
      music.pause();
      musicToggle.setAttribute("aria-pressed", "false");
    }
  });
}
