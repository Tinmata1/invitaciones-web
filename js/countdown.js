/* ============================================================================
   CUENTA ATRÁS
   Los dígitos no parpadean: ruedan hacia arriba, como un panel de estación.
   Se detiene sola cuando la pestaña no está a la vista.
   ============================================================================ */

import { qs, qsa, prefersReduced } from "./dom.js";
import { zonedToUtc } from "./calendar.js";

const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

export function initCountdown(cfg) {
  const gsap = window.gsap;
  const reduce = prefersReduced();
  const nodes = {};
  qsa("[data-cd]").forEach((n) => { nodes[n.dataset.cd] = n; });
  if (!Object.keys(nodes).length) return;

  const readable = qs("[data-cd-text]");
  const target = zonedToUtc(cfg.date.iso, cfg.date.timezone)?.getTime();
  if (!target) return;

  function roll(node, value) {
    if (!node || node.textContent === value) return;
    if (reduce) { node.textContent = value; return; }
    gsap.timeline()
      .to(node, { yPercent: -115, opacity: 0, duration: 0.26, ease: "power2.in" })
      .set(node, { textContent: value, yPercent: 115 })
      .to(node, { yPercent: 0, opacity: 1, duration: 0.44, ease: "power3.out" });
  }

  let lastMinute = -1;

  function tick() {
    if (document.hidden) return;
    const left = Math.max(0, target - Date.now());
    const d = Math.floor(left / 864e5);
    const h = Math.floor(left / 36e5) % 24;
    const m = Math.floor(left / 6e4) % 60;
    const s = Math.floor(left / 1e3) % 60;

    roll(nodes.d, pad(d));
    roll(nodes.h, pad(h));
    roll(nodes.m, pad(m));
    roll(nodes.s, pad(s));

    // Texto para lectores de pantalla: se actualiza en silencio, por minuto
    if (readable && m !== lastMinute) {
      lastMinute = m;
      readable.textContent = left === 0
        ? "La cuenta atrás ha terminado."
        : `Faltan ${d} días, ${h} horas y ${m} minutos.`;
    }
  }

  tick();
  const timer = setInterval(tick, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  return () => clearInterval(timer);
}
