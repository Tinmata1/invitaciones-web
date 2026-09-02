/* ============================================================================
   DOM — ayudantes mínimos.
   Todo el contenido se inserta con textContent, nunca con innerHTML, así que
   un apóstrofo o un "&" en la configuración no puede romper la página.
   ============================================================================ */

export const qs  = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set(["svg", "path", "line", "circle", "ellipse", "g", "polyline", "polygon", "rect", "defs", "use"]);

/**
 * Crea un elemento.
 *   el("p.lead", "hola")
 *   el("a.btn", { href:"#" }, el("span", "Ir"))
 * El primer argumento admite "tag.clase.clase" y "#id".
 */
export function el(spec, ...rest) {
  const m = /^([a-zA-Z][\w-]*)?((?:[.#][\w-]+)*)$/.exec(spec);
  if (!m) throw new Error(`Selector no válido: ${spec}`);
  const tag = m[1] || "div";
  const node = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);

  (m[2].match(/[.#][\w-]+/g) || []).forEach((token) => {
    if (token[0] === ".") node.classList.add(token.slice(1));
    else node.id = token.slice(1);
  });

  for (const arg of rest) append(node, arg);
  return node;
}

function append(node, arg) {
  if (arg === null || arg === undefined || arg === false) return;
  if (Array.isArray(arg)) { arg.forEach((a) => append(node, a)); return; }
  if (arg instanceof Node) { node.appendChild(arg); return; }
  if (typeof arg === "object") { attrs(node, arg); return; }
  node.appendChild(document.createTextNode(String(arg)));
}

function attrs(node, map) {
  for (const [key, value] of Object.entries(map)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "style" && typeof value === "object") {
      Object.assign(node.style, value);
    } else if (key === "dataset") {
      Object.assign(node.dataset, value);
    } else if (key === "html") {
      node.innerHTML = value;                    // sólo para SVG propio del diseño
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, value);
    }
  }
}

/** Convierte "a\nb" en dos líneas reales, respetando el salto del config. */
export function lines(text) {
  return String(text).split("\n").flatMap((line, i) => (i ? [el("br"), line] : [line]));
}

/** Verdadero si el valor tiene contenido dibujable. */
export const has = (v) => v !== null && v !== undefined && String(v).trim() !== "";

export const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Coarse pointer + poca memoria ⇒ bajamos la ambición de las partículas. */
export const isLowPower = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
