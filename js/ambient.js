/* ============================================================================
   AMBIENTE — el sistema que hace que pase el tiempo.
   ----------------------------------------------------------------------------
   Un solo progreso (0 = hora dorada, 1 = medianoche) gobierna a la vez el
   cielo, el resplandor del sol, las estrellas y las partículas. No hay
   "cambios de fondo": hay una noche que avanza.

   Un solo <canvas> y un solo requestAnimationFrame para todo. Las estrellas se
   pintan una vez en un lienzo aparte y se estampan cada fotograma, que sale
   mucho más barato que redibujar cien arcos.
   ============================================================================ */

import { isLowPower, prefersReduced } from "./dom.js";

/* ---------------------------------------------------------------------------
   El viaje del cielo. Cada parada es un momento real de la tarde-noche.
   --------------------------------------------------------------------------- */
const SKY = [
  { at: 0.00, zenith: "#4A3A63", mid: "#8C5F76", horizon: "#F0A868" }, // hora dorada
  { at: 0.20, zenith: "#3B2C52", mid: "#6E4568", horizon: "#DE8A63" }, // sol bajo
  { at: 0.40, zenith: "#241A3A", mid: "#3E2C55", horizon: "#A15E6A" }, // blue hour
  { at: 0.62, zenith: "#131029", mid: "#241C42", horizon: "#4A3055" }, // anochecer
  { at: 0.82, zenith: "#0A0A1E", mid: "#12102E", horizon: "#221A3C" }, // noche
  { at: 1.00, zenith: "#04040C", mid: "#08081A", horizon: "#0D0B22" }, // medianoche
];

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ramp = (v, a, b) => clamp01((v - a) / (b - a));
const rand = (a, b) => a + Math.random() * (b - a);

const PETAL_COLORS = ["#F2DCAE", "#E6C583", "#E09A6C", "#F4EFE4"];

export const Ambient = (() => {
  let canvas, ctx, dpr = 1, w = 0, h = 0;
  let starLayer = null;                 // lienzo con el campo de estrellas fijo
  let twinklers = [];                   // las pocas que sí parpadean
  let parts = [];
  let cap = 34;
  let progress = 0;
  let running = false;
  let reduce = false;
  let root, sky, glow;
  let shootAt = 0;

  /* --- Fuegos artificiales y constelación final --- */
  let fw = [];
  let fwPhase = "off";                  // off | bursts | gather | hold | dissolve
  let fwT0 = 0;
  let constellation = null;
  let lastBurst = 0;

  /* ------------------------------------------------------------------ */
  function resize() {
    const maxDpr = isLowPower() ? 1.5 : 2;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    constellation = null;               // se recalcula con el nuevo tamaño
  }

  /** Campo de estrellas estampado una sola vez. */
  function buildStars() {
    const count = reduce ? 40 : Math.round(Math.min(190, (w * h) / 9000));
    starLayer = document.createElement("canvas");
    starLayer.width = canvas.width;
    starLayer.height = canvas.height;
    const s = starLayer.getContext("2d");
    s.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.fillStyle = "#FFFFFF";
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 2.2) * 1.25 + 0.25;
      s.globalAlpha = rand(0.25, 0.9);
      s.beginPath();
      s.arc(Math.random() * w, Math.random() * h, r, 0, 6.283);
      s.fill();
    }
    twinklers = reduce ? [] : Array.from({ length: 16 }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.85,
      r: rand(0.7, 1.5), t: Math.random() * 6.283, sp: rand(0.012, 0.03),
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Partículas: un solo universo que cambia de forma con la hora.       */
  /* petal → polvo cálido → motas de luz                                 */
  function weights(p) {
    return {
      petal: clamp01(1 - p / 0.34),
      dust: Math.max(0, Math.sin(Math.PI * clamp01((p - 0.10) / 0.75)) * 0.95),
      mote: ramp(p, 0.52, 0.86) * 0.9,
    };
  }

  function pickKind(p) {
    const wgt = weights(p);
    const total = wgt.petal + wgt.dust + wgt.mote;
    if (total <= 0.001) return "dust";
    let r = Math.random() * total;
    if ((r -= wgt.petal) < 0) return "petal";
    if ((r -= wgt.dust) < 0) return "dust";
    return "mote";
  }

  function spawn(p, fromTop) {
    const kind = pickKind(p);
    if (kind === "petal") {
      return {
        kind, x: rand(-20, w + 20), y: fromTop ? rand(-40, -5) : rand(-40, h),
        s: rand(4.5, 10), vy: rand(0.32, 0.85), vx: rand(-0.28, 0.28),
        rot: rand(0, 6.28), vr: rand(-0.018, 0.018),
        c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0], o: rand(0.35, 0.8),
      };
    }
    if (kind === "dust") {
      return {
        kind, x: rand(0, w), y: fromTop ? rand(h, h + 40) : rand(0, h),
        s: rand(0.6, 1.9), vy: rand(-0.28, -0.06), vx: rand(-0.12, 0.12),
        t: rand(0, 6.28), sp: rand(0.006, 0.018),
        c: "#F2DCAE", o: rand(0.18, 0.55),
      };
    }
    return {
      kind, x: rand(0, w), y: fromTop ? rand(h, h + 30) : rand(0, h),
      s: rand(0.5, 1.3), vy: rand(-0.16, -0.03), vx: rand(-0.06, 0.06),
      t: rand(0, 6.28), sp: rand(0.01, 0.025),
      c: "#FFF6E0", o: rand(0.2, 0.7),
    };
  }

  function seed() {
    const base = reduce ? 0 : cap;
    parts = Array.from({ length: base }, () => spawn(progress, false));
  }

  function drawParticles(dt) {
    const wgt = weights(progress);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const alpha = p.o * (wgt[p.kind] || 0);

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const out = p.kind === "petal"
        ? p.y > h + 30
        : p.y < -30 || p.x < -30 || p.x > w + 30;

      // Si su hora ya pasó, la partícula se apaga y vuelve como lo que toque
      if (out || alpha < 0.004) { parts[i] = spawn(progress, true); continue; }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.c;

      if (p.kind === "petal") {
        p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.s, p.s * 0.46, 0, 0, 6.283);
        ctx.fill();
        ctx.restore();
      } else {
        p.t += p.sp * dt;
        const r = p.s * (0.75 + Math.sin(p.t) * 0.25);
        ctx.globalAlpha = alpha * (0.6 + Math.sin(p.t) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 6.283);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* --- Estrella fugaz: rara, corta, sin ruido. --- */
  let shoot = null;
  function maybeShoot(now) {
    if (reduce || progress < 0.62) return;
    if (!shoot && now > shootAt) {
      shoot = { x: rand(w * 0.15, w * 0.9), y: rand(0, h * 0.4), vx: rand(-3.6, -6), vy: rand(1.6, 2.8), life: 1 };
      shootAt = now + rand(11000, 22000);
    }
    if (!shoot) return;
    shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= 0.016;
    if (shoot.life <= 0) { shoot = null; return; }
    const len = 46 * shoot.life;
    const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * len * 0.2, shoot.y - shoot.vy * len * 0.2);
    g.addColorStop(0, `rgba(255,248,224,${0.75 * shoot.life})`);
    g.addColorStop(1, "rgba(255,248,224,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(shoot.x, shoot.y);
    ctx.lineTo(shoot.x - shoot.vx * len * 0.2, shoot.y - shoot.vy * len * 0.2);
    ctx.stroke();
  }

  /* ------------------------------------------------------------------ */
  /* CIERRE — fuegos artificiales finos y constelación                   */
  /* ------------------------------------------------------------------ */

  /** Muestrea las iniciales del monograma para saber a dónde volar. */
  function sampleConstellation(svgNode) {
    if (!svgNode) return null;
    const paths = Array.from(svgNode.querySelectorAll("path, circle, line"));
    if (!paths.length) return null;

    const pts = [];
    const box = svgNode.viewBox.baseVal;
    for (const path of paths) {
      let len = 0;
      try { len = path.getTotalLength(); } catch { continue; }
      if (!len) continue;
      const n = Math.max(8, Math.round(len / 2.4));
      for (let i = 0; i <= n; i++) {
        const pt = path.getPointAtLength((len * i) / n);
        pts.push({ x: pt.x, y: pt.y });
      }
    }
    if (!pts.length) return null;

    // Se dibuja ARRIBA, en el cielo vacío: si cayera en el centro se
    // superpondría al monograma de tinta y no se vería ninguno de los dos.
    const scale = Math.min(w * 0.66 / box.width, h * 0.24 / box.height);
    const ox = w / 2 - (box.width * scale) / 2;
    const oy = h * 0.23 - (box.height * scale) / 2;
    return pts.map((p) => ({ x: ox + p.x * scale, y: oy + p.y * scale }));
  }

  function burst() {
    const cx = rand(w * 0.18, w * 0.82);
    const cy = rand(h * 0.14, h * 0.46);
    const hue = [44, 38, 48, 34][(Math.random() * 4) | 0];
    const n = isLowPower() ? 34 : 52;
    const speed = rand(1.5, 3.1);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + rand(-0.06, 0.06);
      const sp = speed * rand(0.55, 1);
      fw.push({
        x: cx, y: cy, px: cx, py: cy,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: rand(0.006, 0.011), hue, target: null,
      });
    }
  }

  function drawFinale(now, dt) {
    if (fwPhase === "off") return;
    const t = now - fwT0;

    if (fwPhase === "bursts") {
      if (now - lastBurst > 1250 && t < 3600) { burst(); lastBurst = now; }
      if (t > 4400) {
        // Los rescoldos que quedan se convierten en la constelación
        if (constellation && constellation.length) {
          const survivors = fw.filter((p) => p.life > 0.12);
          const need = constellation.length;
          while (survivors.length < need) {
            survivors.push({
              x: rand(0, w), y: rand(0, h), px: 0, py: 0,
              vx: 0, vy: 0, life: 0.9, decay: 0, hue: 44, target: null,
            });
          }
          survivors.length = need;
          survivors.forEach((p, i) => { p.target = constellation[i]; p.decay = 0; p.life = Math.max(p.life, 0.55); });
          fw = survivors;
          fwPhase = "gather";
          fwT0 = now;
        } else {
          fwPhase = "dissolve";
          fwT0 = now;
        }
      }
    } else if (fwPhase === "gather" && t > 2600) {
      fwPhase = "hold"; fwT0 = now;
    } else if (fwPhase === "hold" && t > 5200) {
      fwPhase = "dissolve"; fwT0 = now;
      fw.forEach((p) => { p.target = null; p.vx = rand(-0.25, 0.25); p.vy = rand(-0.55, -0.12); p.decay = rand(0.004, 0.009); });
    } else if (fwPhase === "dissolve" && !fw.length) {
      fwPhase = "off";
    }

    ctx.globalCompositeOperation = "lighter";
    for (let i = fw.length - 1; i >= 0; i--) {
      const p = fw[i];
      p.px = p.x; p.py = p.y;

      if (p.target) {
        // Muelle suave hacia su sitio en la constelación
        p.vx += (p.target.x - p.x) * 0.0075 * dt;
        p.vy += (p.target.y - p.y) * 0.0075 * dt;
        p.vx *= 0.90; p.vy *= 0.90;
        p.life = Math.min(1, p.life + 0.012 * dt);
      } else {
        p.vy += 0.022 * dt;      // gravedad discreta
        p.vx *= 0.992; p.vy *= 0.992;
        p.life -= p.decay * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.life <= 0) { fw.splice(i, 1); continue; }

      const alpha = Math.min(1, p.life) * 0.9;
      if (p.target) {
        // Ya posada: un punto. Con trazo no se vería nada, porque al llegar a
        // su sitio la partícula deja de moverse y el segmento mide cero.
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${p.hue},64%,${74 + p.life * 12}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, 6.283);
        ctx.fill();
      } else {
        // En vuelo: trazo fino. La estela lee mucho más elegante que una bola.
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${p.hue},72%,${62 + p.life * 16}%)`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------ */
  let lastFrame = 0;
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (document.hidden) { lastFrame = now; return; }

    // dt normalizado a 60fps: la escena avanza igual en un móvil a 45fps
    const dt = Math.min(3, (now - lastFrame) / 16.667) || 1;
    lastFrame = now;

    try {
      ctx.clearRect(0, 0, w, h);

      const starAlpha = ramp(progress, 0.28, 0.72);
      if (starAlpha > 0.01 && starLayer) {
        ctx.globalAlpha = starAlpha;
        ctx.drawImage(starLayer, 0, 0, w, h);
        ctx.globalAlpha = 1;
        for (const s of twinklers) {
          s.t += s.sp * dt;
          ctx.globalAlpha = starAlpha * (0.35 + Math.sin(s.t) * 0.45);
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, 6.283);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        maybeShoot(now);
      }

      if (parts.length) drawParticles(dt);
      drawFinale(now, dt);
    } catch { /* un fotograma perdido no puede matar el bucle */ }
  }

  /* ------------------------------------------------------------------ */
  return {
    init({ particleCap = 34, ambient = true } = {}) {
      root = document.documentElement;
      sky = document.querySelector(".sky");
      glow = document.querySelector(".sky__glow");
      canvas = document.getElementById("ambient");
      reduce = prefersReduced();
      cap = isLowPower() ? Math.round(particleCap * 0.55) : particleCap;
      if (!ambient) cap = 0;

      this.setProgress(0);
      if (!canvas) return this;

      ctx = canvas.getContext("2d", { alpha: true });
      resize();
      seed();

      let rt;
      window.addEventListener("resize", () => {
        clearTimeout(rt);
        rt = setTimeout(() => { resize(); seed(); }, 180);
      }, { passive: true });

      running = true;
      lastFrame = performance.now();
      requestAnimationFrame(loop);
      return this;
    },

    /** 0 = hora dorada · 1 = medianoche. Lo llama el scroll. */
    setProgress(p) {
      progress = clamp01(p);
      if (!sky) return;

      let i = 0;
      while (i < SKY.length - 2 && progress > SKY[i + 1].at) i++;
      const a = SKY[i], b = SKY[i + 1];
      const t = (progress - a.at) / (b.at - a.at || 1);

      sky.style.setProperty("--sky-zenith", mix(hex(a.zenith), hex(b.zenith), t));
      sky.style.setProperty("--sky-mid", mix(hex(a.mid), hex(b.mid), t));
      sky.style.setProperty("--sky-horizon", mix(hex(a.horizon), hex(b.horizon), t));

      if (glow) {
        glow.style.setProperty("--glow-o", String(Math.pow(1 - ramp(progress, 0, 0.52), 1.4)));
        glow.style.setProperty("--glow-y", `${ramp(progress, 0, 0.6) * 34}vh`);
      }
      // Disponible para cualquier otro módulo (la música lo lee)
      window.__nightProgress = progress;
    },

    /** El cierre. Se llama una sola vez al entrar en el último acto. */
    fireFinale(monogramNode) {
      if (fwPhase !== "off" || reduce) return;
      constellation = sampleConstellation(monogramNode);
      fw = [];
      fwPhase = "bursts";
      fwT0 = performance.now();
      lastBurst = 0;
    },

    get progress() { return progress; },

    /** Estado interno, para diagnosticar el cierre sin adivinar. */
    debug() {
      return {
        fase: fwPhase, particulas: fw.length, viewport: [w, h], dpr,
        puntos: constellation ? constellation.length : 0,
        caja: constellation ? [
          Math.round(Math.min(...constellation.map((p) => p.x))),
          Math.round(Math.min(...constellation.map((p) => p.y))),
          Math.round(Math.max(...constellation.map((p) => p.x))),
          Math.round(Math.max(...constellation.map((p) => p.y))),
        ] : null,
      };
    },
  };
})();

export default Ambient;
