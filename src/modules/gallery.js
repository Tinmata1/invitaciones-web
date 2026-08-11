import { ScrollTrigger } from "gsap/ScrollTrigger";

const CAMERA_ICON = `
  <svg viewBox="0 0 24 24" class="icon-camera">
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
`;

// Fotos reales ya entregadas; el resto de las posiciones queda como
// marcador genérico hasta que lleguen más fotografías.
const REAL_PHOTOS = {
  1: "/assets/images/foto-01.jpg",
  2: "/assets/images/foto-02.jpg",
};

export function initGallery(count = 9) {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  for (let i = 1; i <= count; i++) {
    const item = document.createElement("div");
    item.className = "gallery__item";
    item.style.transitionDelay = `${((i - 1) % 3) * 0.08}s`;

    const photo = REAL_PHOTOS[i];
    item.innerHTML = photo
      ? `
      <div class="gallery__placeholder">
        <img class="mono" src="${photo}" alt="Fotografía ${String(i).padStart(2, "0")}" loading="lazy" />
      </div>
    `
      : `
      <div class="gallery__placeholder">
        ${CAMERA_ICON}
        <span>Fotografía ${String(i).padStart(2, "0")}</span>
      </div>
    `;
    grid.appendChild(item);
  }

  grid.querySelectorAll(".gallery__item").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => el.classList.add("is-visible"),
    });
  });
}
