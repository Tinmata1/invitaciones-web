/* ============================================================================
   ARTE — el SVG original del proyecto.
   Todo son trazos: se dibujan solos con stroke-dashoffset y no llevan relleno,
   así que pesan nada y escalan sin perder finura. Ninguna imagen prestada.
   ============================================================================ */

/** Convierte una cadena SVG en un nodo real del documento. */
export function svgFrom(markup) {
  const doc = new DOMParser().parseFromString(markup.trim(), "image/svg+xml");
  return document.importNode(doc.documentElement, true);
}

/* ---------------------------------------------------------------------------
   MONOGRAMA
   Dos iniciales enfrentadas, separadas por un filo vertical, dentro de un
   anillo. Sin ampersand dibujado: el "&" pertenece a la tipografía, no al
   monograma — mezclarlos ensucia las dos cosas.
   --------------------------------------------------------------------------- */
export function monogram(initials = ["E", "M"], className = "monogram") {
  const [a, b] = initials;
  return svgFrom(`
    <svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 220 140" role="img"
         aria-label="Monograma ${a} y ${b}">
      <circle class="mono-ring" cx="110" cy="66" r="58"/>
      <line class="mono-amp" x1="110" y1="40" x2="110" y2="92"/>
      ${glyph(a, "left")}
      ${glyph(b, "right")}
    </svg>
  `);
}

/* Trazado de las iniciales más probables en español. Si la inicial no está
   en la tabla, se cae a un trazo genérico legible en lugar de romperse. */
function glyph(letter, side) {
  const L = String(letter || "").toUpperCase().charAt(0);
  const dx = side === "left" ? 0 : 60;
  const paths = GLYPHS[L] || GLYPHS._;
  return paths
    .map((d) => `<path d="${shift(d, dx)}"/>`)
    .join("");
}

/* Cada glifo se dibuja en una caja de 28×44 con origen en (66,44). */
const GLYPHS = {
  A: ["M66 88 L80 44 L94 88", "M71 74 H89"],
  B: ["M68 44 V88", "M68 44 H84 C92 44 92 64 84 64 H68", "M68 64 H86 C94 64 94 88 86 88 H68"],
  C: ["M94 52 C86 42 68 44 68 66 C68 88 86 90 94 80"],
  D: ["M68 44 V88", "M68 44 H82 C94 44 94 88 82 88 H68"],
  E: ["M94 44 H68 V88 H94", "M68 66 H86"],
  F: ["M94 44 H68 V88", "M68 66 H86"],
  G: ["M94 52 C86 42 68 44 68 66 C68 88 88 90 94 80 V68 H84"],
  H: ["M68 44 V88", "M94 44 V88", "M68 66 H94"],
  I: ["M80 44 V88", "M72 44 H88", "M72 88 H88"],
  J: ["M88 44 V78 C88 90 74 90 70 82"],
  K: ["M68 44 V88", "M94 44 L68 68", "M77 60 L94 88"],
  L: ["M68 44 V88 H94"],
  M: ["M68 88 V44 L81 70 L94 44 V88"],
  N: ["M68 88 V44 L94 88 V44"],
  O: ["M81 44 C93 44 96 54 96 66 C96 78 93 88 81 88 C69 88 66 78 66 66 C66 54 69 44 81 44 Z"],
  P: ["M68 88 V44 H84 C93 44 93 66 84 66 H68"],
  Q: ["M81 44 C93 44 96 54 96 66 C96 78 93 88 81 88 C69 88 66 78 66 66 C66 54 69 44 81 44 Z", "M85 78 L96 92"],
  R: ["M68 88 V44 H84 C93 44 93 65 84 65 H68", "M80 65 L94 88"],
  S: ["M94 51 C88 42 70 42 70 55 C70 68 92 64 92 77 C92 90 74 90 68 81"],
  T: ["M68 44 H94", "M81 44 V88"],
  U: ["M68 44 V74 C68 88 94 88 94 74 V44"],
  V: ["M68 44 L81 88 L94 44"],
  W: ["M66 44 L73 88 L81 58 L89 88 L96 44"],
  X: ["M68 44 L94 88", "M94 44 L68 88"],
  Y: ["M68 44 L81 66 L94 44", "M81 66 V88"],
  Z: ["M68 44 H94 L68 88 H94"],
  _: ["M68 44 H94 V88 H68 Z"],
};

/** Desplaza horizontalmente un path escrito con coordenadas absolutas. */
function shift(d, dx) {
  if (!dx) return d;
  let axis = 0; // 0 = x, 1 = y — los pares de coordenadas alternan
  return d.replace(/-?\d+(?:\.\d+)?|[A-Za-z]/g, (token) => {
    if (/[A-Za-z]/.test(token)) {
      if (token === "H") axis = 0;
      else if (token === "V") axis = 1;
      else axis = 0;
      return token;
    }
    const n = parseFloat(token);
    const isX = axis === 0;
    axis = 1 - axis;
    return isX ? String(n + dx) : token;
  });
}

/* ---------------------------------------------------------------------------
   SILUETAS DE VESTIMENTA
   No son personas: son las dos prendas, dibujadas como si colgaran. Sin caras,
   sin piel, sin clipart. Sólo la línea que define la etiqueta rigurosa.
   --------------------------------------------------------------------------- */
export function tuxedo() {
  return svgFrom(`
    <svg xmlns="http://www.w3.org/2000/svg" class="silhouette" viewBox="0 0 100 220" role="img" aria-label="Esmoquin">
      <path d="M18 44 C30 32 40 27 50 27 C60 27 70 32 82 44"/>
      <path d="M18 44 C13 96 12 150 14 196"/>
      <path d="M82 44 C87 96 88 150 86 196"/>
      <path d="M14 196 C34 200 66 200 86 196"/>
      <path d="M50 33 L33 47 C36 78 39 96 44 110"/>
      <path d="M50 33 L67 47 C64 78 61 96 56 110"/>
      <path class="sil-soft" d="M43 44 L50 49 L43 54"/>
      <path class="sil-soft" d="M57 44 L50 49 L57 54"/>
      <circle class="sil-soft" cx="50" cy="126" r="1.6"/>
      <circle class="sil-soft" cx="50" cy="146" r="1.6"/>
      <circle class="sil-soft" cx="50" cy="166" r="1.6"/>
    </svg>
  `);
}

export function gown() {
  return svgFrom(`
    <svg xmlns="http://www.w3.org/2000/svg" class="silhouette" viewBox="0 0 100 220" role="img" aria-label="Vestido largo">
      <path d="M37 40 C43 33 57 33 63 40"/>
      <path d="M37 40 C35 62 35 82 36 96"/>
      <path d="M63 40 C65 62 65 82 64 96"/>
      <path d="M36 96 H64"/>
      <path d="M36 96 C24 128 15 166 11 197"/>
      <path d="M64 96 C76 128 85 166 89 197"/>
      <path d="M11 197 C34 206 66 206 89 197"/>
      <path class="sil-soft" d="M45 100 C41 138 39 170 37 195"/>
      <path class="sil-soft" d="M55 100 C59 138 61 170 63 195"/>
    </svg>
  `);
}

/* ---------------------------------------------------------------------------
   AGUJA DEL MAPA
   Un punto, un hilo que cae y ondas que laten. Sin globo de mapa genérico.
   --------------------------------------------------------------------------- */
export function mapPin() {
  const rings = [0, 1, 2].map(() => `<span class="venue__ring"></span>`).join("");
  const wrap = document.createElement("div");
  wrap.className = "venue__pin";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `${rings}<span class="venue__needle"></span><span class="venue__dot"></span>`;
  return wrap;
}
