/* ============================================================================
   RENDER — construye la invitación entera a partir de js/config.js.
   ----------------------------------------------------------------------------
   Ningún texto vive en el HTML. Si un dato está vacío, su elemento no llega a
   existir: nunca queda un hueco, un guion suelto ni un "undefined".
   ============================================================================ */

import { el, lines, has } from "./dom.js";
import { monogram, tuxedo, gown, mapPin } from "./art.js";
import { googleUrl, downloadICS } from "./calendar.js";
import { readInvite } from "./rsvp.js";

let uid = 0;
const id = (p) => `${p}-${++uid}`;

/** Cabecera de capítulo: hilo, antetítulo y título. Siempre igual. */
function head(eyebrow, heading, headingId, { align = "center" } = {}) {
  return [
    has(eyebrow) ? el("p.eyebrow", { "data-reveal": "fade" }, eyebrow) : null,
    has(heading) ? el("h2", { id: headingId, "data-reveal": "lines" }, lines(heading)) : null,
  ].filter(Boolean);
}

function act(sectionId, className, labelId, ...children) {
  const node = el(`section#${sectionId}.act`, { "aria-labelledby": labelId }, ...children);
  String(className || "").split(/\s+/).filter(Boolean).forEach((c) => node.classList.add(c));
  return node;
}

/* ========================================================================= */
/* ACTO 0 · EL SOBRE                                                         */
/* ========================================================================= */
export function renderCurtain(cfg) {
  const { couple, date, location } = cfg;
  return el("div.curtain#curtain", { role: "dialog", "aria-modal": "true", "aria-label": "Abrir invitación" },
    el("div.curtain__panel.is-top", { "aria-hidden": "true" }),
    el("div.curtain__panel.is-bottom", { "aria-hidden": "true" }),
    el("div.curtain__content",
      el("p.eyebrow.curtain__eyebrow", cfg.hero.eyebrow),
      monogram(couple.initials),
      el("p.curtain__names", couple.one, " ", el("span.amp", "&"), " ", couple.two),
      el("p.curtain__date", `${date.day} · ${String(date.month).slice(0, 3)} · ${date.year}`),
      el("span.curtain__line", { "aria-hidden": "true" }),
      el("button.btn.btn--quiet#openBtn", { type: "button" }, el("span", "Abrir invitación")),
      el("p.curtain__hint", "Con música · sube el volumen"),
    ),
  );
}

/* ========================================================================= */
/* ACTO 1 · HERO                                                             */
/* ========================================================================= */
export function renderHero(cfg) {
  const { couple, hero, date, location } = cfg;
  const titleId = id("t");

  const names = el("h1.hero__names", { id: titleId },
    el("span.hero__line", { "data-word": couple.one }),
    el("span.hero__line", el("span.amp.hero__amp", "&")),
    el("span.hero__line", { "data-word": couple.two }),
  );

  const dateText = [date.weekday, `${date.day} de ${String(date.month).toLowerCase()} de ${date.year}`]
    .filter(has).join(" · ");

  return el("section#hero.hero", { "aria-labelledby": titleId },
    el("div.hero__media",
      el("video#heroVideo", {
        poster: hero.poster, muted: true, loop: true, playsinline: true,
        "webkit-playsinline": "true", preload: "none", "aria-hidden": "true", tabindex: "-1",
        "data-src": hero.video,
      }),
    ),
    el("div.hero__veil", { "aria-hidden": "true" }),
    names,
    el("p.hero__credits",
      el("span", dateText),
      el("i", { "aria-hidden": "true" }),
      el("span", `${location.city}, ${location.state}`),
    ),
    has(couple.tagline) ? el("p.hero__sub", couple.tagline) : null,
    el("div.scroll-cue", { "aria-hidden": "true" },
      el("span", "Desliza"),
      el("span.scroll-cue__track"),
    ),
  );
}

/* ========================================================================= */
/* ACTO 2 · LA FECHA                                                         */
/* ========================================================================= */
export function renderDate(cfg) {
  const { date } = cfg;
  const titleId = id("t");

  const unit = (key, label) =>
    el("div.cd-unit",
      el("div.cd-value", el("span.cd-value__roll", { "data-cd": key }, "00")),
      el("span.cd-label", label),
    );

  const mark = el("div.date-mark", { "data-reveal": "fade" },
    el("span.date-mark__day.num", date.day),
    el("span.date-mark__stack",
      el("span.date-mark__month", date.month),
      el("span.date-mark__year.num", date.year),
      has(date.weekday) ? el("span.date-mark__weekday", date.weekday) : null,
      has(date.time) ? el("span.date-mark__weekday", date.time) : null,
    ),
  );

  return act("fecha", "act--center date-act", titleId,
    el("div.act__inner--narrow",
      ...head("Falta muy poco", "Nuestra boda", titleId),
      mark,
      el("div.countdown", { role: "timer", "aria-live": "off", "aria-label": "Cuenta atrás" },
        unit("d", "Días"), unit("h", "Horas"), unit("m", "Minutos"), unit("s", "Segundos"),
      ),
      el("p.visually-hidden", { "data-cd-text": "" }),
      el("div.btn-row", { "data-reveal": "fade" },
        el("button.btn#icsBtn", { type: "button", onclick: () => downloadICS(cfg) },
          el("span", "Agregar al calendario")),
        el("a.btn.btn--quiet", { href: googleUrl(cfg), target: "_blank", rel: "noopener" },
          el("span", "Google Calendar")),
      ),
      has(date.dataWarning)
        ? el("p.date-warning", { "data-reveal": "fade" }, date.dataWarning)
        : null,
    ),
  );
}

/* ========================================================================= */
/* ACTO 3 · BENDICIÓN Y PADRES                                               */
/* ========================================================================= */
export function renderBlessing(cfg) {
  const b = cfg.blessing;
  if (!b?.enabled) return null;
  const titleId = id("t");

  const side = (s) =>
    el("div.parents__col", { "data-reveal": "fade" },
      el("p.parents__role", s.role),
      el("p.parents__name", ...s.names.flatMap((n, i) => (i ? [el("br"), el("span.amp", "&"), el("br"), n] : [n]))),
    );

  return act("bendicion", "act--center blessing", titleId,
    el("div.act__inner",
      ...head(b.eyebrow, b.heading, titleId),
      has(b.verse) ? el("p.blessing__verse", { "data-reveal": "fade" }, b.verse) : null,
      el("div.parents",
        side(b.sides[0]),
        el("span.parents__divider", { "aria-hidden": "true" }),
        side(b.sides[1]),
      ),
      b.provisional ? el("p.pending", "Nombres por confirmar") : null,
    ),
  );
}

/* ========================================================================= */
/* ACTO 4 · NUESTRA HISTORIA                                                 */
/* ========================================================================= */
export function renderStory(cfg) {
  const s = cfg.story;
  if (!s?.enabled || !s.chapters?.length) return null;
  const titleId = id("t");
  const total = s.chapters.length;

  // Cada capítulo es un plano suelto. En la escena viven todos a la vez, uno
  // detrás de otro en profundidad, y el scroll los trae hacia el invitado.
  const panel = (c, i) => {
    const media = c.media.type === "video"
      ? el("video.frame__media", {
          "data-src": c.media.src, muted: true, loop: true, playsinline: true,
          "webkit-playsinline": "true", preload: "none", "data-lazy-video": "",
          // Todos los planos están en pantalla a la vez: quien decide qué video
          // se reproduce es la escena, no el observador de visibilidad.
          "data-gated": "",
          "aria-label": c.media.alt || "", tabindex: "-1",
        })
      : el("img.frame__media", {
          src: c.media.src, alt: c.media.alt || "", loading: "lazy", decoding: "async",
        });

    return el("article.story__panel", { "data-panel": String(i), style: { "--i": String(i) } },
      el("figure.frame",
        media,
        el("span.frame__veil", { "aria-hidden": "true" }),
        el("figcaption.frame__caption",
          el("span.frame__index.num", String(i + 1).padStart(2, "0")),
          el("span.frame__title", c.title),
          has(c.note) ? el("span.frame__note", c.note) : null,
        ),
      ),
    );
  };

  return el("section#historia.story", { "aria-labelledby": titleId },
    el("div.story__stage",
      el("div.story__depth",
        el("div.story__intro",
          el("p.eyebrow", { "data-reveal": "fade" }, s.eyebrow),
          el("h2", { id: titleId, "data-reveal": "lines" }, lines(s.heading)),
        ),
        ...s.chapters.map(panel),
      ),
      el("ol.story__rail", { "aria-hidden": "true" },
        ...s.chapters.map((_, i) => el("li.story__tick", { "data-tick": String(i) })),
      ),
      el("p.story__counter", { "aria-hidden": "true" },
        el("span", { "data-story-index": "" }, "01"), ` / ${String(total).padStart(2, "0")}`),
      el("p.story__hint", { "aria-hidden": "true" }, el("i"), "Continúa"),
    ),
  );
}

/* ========================================================================= */
/* ACTO 5 · CEREMONIA Y RECEPCIÓN                                            */
/* ========================================================================= */
function venueBlock(v, cfg, { withMap = true } = {}) {
  const titleId = id("t");

  const text = el("div.venue__text",
    el("p.eyebrow.eyebrow--start", { "data-reveal": "fade" }, v.label),
    has(v.time) ? el("p.label", { "data-reveal": "fade" }, v.time) : null,
    el("h2.venue__name", { id: titleId, "data-reveal": "lines" }, v.name),
    v.address?.length
      ? el("p.venue__addr", { "data-reveal": "fade" }, ...v.address.map((a) => el("span", a)))
      : null,
    v.provisional ? el("p.pending", "Dirección por confirmar") : null,
    (v.maps || v.waze)
      ? el("div.btn-row", { style: { justifyContent: "flex-start" }, "data-reveal": "fade" },
          v.maps ? el("a.btn", { href: v.maps, target: "_blank", rel: "noopener" }, el("span", "Google Maps")) : null,
          v.waze ? el("a.btn.btn--quiet", { href: v.waze, target: "_blank", rel: "noopener" }, el("span", "Waze")) : null,
        )
      : null,
  );

  const map = withMap && has(v.mapEmbed)
    ? el("div.venue__map", { "data-reveal": "mask" },
        el("iframe", {
          src: v.mapEmbed, loading: "lazy", title: `Mapa de ${v.name}`,
          referrerpolicy: "no-referrer-when-downgrade",
        }),
        mapPin(),
      )
    : null;

  return { titleId, node: el("div.venue", text, map) };
}

export function renderVenue(cfg) {
  const c = cfg.ceremony;
  const r = cfg.reception;
  const blocks = [];
  let labelId = null;

  if (c?.enabled && has(c.name)) {
    const b = venueBlock(c, cfg);
    labelId = b.titleId;
    blocks.push(el("div.act__inner", b.node));
  }

  if (r?.enabled) {
    if (has(r.name)) {
      const b = venueBlock(r, cfg);
      labelId = labelId || b.titleId;
      blocks.push(el("div.act__inner", { style: { marginTop: "var(--space-8)" } }, b.node));
    } else {
      // Sin sede confirmada: se dice, no se inventa.
      const tid = id("t");
      labelId = labelId || tid;
      blocks.push(el("div.act__inner--narrow.venue--pending", { style: { marginTop: "var(--space-8)" } },
        el("div.venue__panel", { "data-reveal": "fade" },
          el("p.eyebrow", r.label),
          el("h2", { id: tid, style: { fontSize: "var(--step-3)" } }, "Por confirmar"),
          has(r.pendingNote) ? el("p.prose", { style: { marginTop: "var(--space-3)" } }, r.pendingNote) : null,
        ),
      ));
    }
  }

  if (!blocks.length) return null;
  return el("section#ubicacion.act", { "aria-labelledby": labelId }, ...blocks);
}

/* ========================================================================= */
/* ACTO 6 · ITINERARIO                                                       */
/* ========================================================================= */
export function renderTimeline(cfg) {
  const t = cfg.timeline;
  if (!t?.enabled || !t.stops?.length) return null;
  const titleId = id("t");

  const stop = (s) =>
    el("li.timeline__stop",
      el("div.timeline__card",
        el("p.timeline__time.num", s.time),
        el("p.timeline__title", s.title),
        has(s.note) ? el("p.timeline__note", s.note) : null,
      ),
      el("span.timeline__node", { "aria-hidden": "true" }),
    );

  return act("itinerario", "act--center", titleId,
    el("div.act__inner",
      ...head(t.eyebrow, t.heading, titleId),
      el("div.timeline",
        el("span.timeline__spine", { "aria-hidden": "true" }),
        el("span.timeline__fill", { "aria-hidden": "true" }),
        el("ol", { style: { listStyle: "none" } }, ...t.stops.map(stop)),
      ),
    ),
  );
}

/* ========================================================================= */
/* ACTO 7 · VESTIMENTA                                                       */
/* ========================================================================= */
export function renderDress(cfg) {
  const d = cfg.dressCode;
  if (!d?.enabled) return null;
  const titleId = id("t");

  const chips = d.palette?.length
    ? el("div.palette", { "data-reveal": "fade" },
        ...d.palette.map((c) =>
          el("span.palette__chip",
            el("i", { style: { background: c.hex } , "aria-hidden": "true"}),
            el("b", c.name),
          )),
      )
    : null;

  return act("vestimenta", "act--center", titleId,
    el("div.act__inner",
      el("p.eyebrow", { "data-reveal": "fade" }, d.eyebrow),
      el("h2.dress__code", { id: titleId, "data-reveal": "lines" }, d.code),
      has(d.note) ? el("p.lead", { "data-reveal": "fade" }, d.note) : null,

      el("div.silhouettes",
        el("span.silhouette-wrap", { "data-sil": "" }, tuxedo(), el("span.silhouette__label", d.labels.one)),
        el("span.silhouette-wrap", { "data-sil": "" }, gown(), el("span.silhouette__label", d.labels.two)),
      ),

      chips,
      has(d.reserved) ? el("p.dress__reserved", { "data-reveal": "fade" }, el("em", d.reserved)) : null,
    ),
  );
}

/* ========================================================================= */
/* ACTO 8 · ANTES DE CELEBRAR                                                */
/* ========================================================================= */
export function renderDetails(cfg) {
  const d = cfg.details;
  if (!d?.enabled) return null;

  const items = (d.show || [])
    .map((key) => cfg.policies?.[key])
    .filter((p) => p && has(p.value));

  const contacts = (d.contacts || []).filter((c) => has(c.name) || has(c.phone));
  if (!items.length && !contacts.length) return null;   // nada configurado ⇒ no hay sección

  const titleId = id("t");

  const card = (p) =>
    el("div.card", { "data-reveal": "fade" },
      el("span.card__label", p.label),
      el("p.detail__value", p.value),
      has(p.note) ? el("p.detail__note", p.note) : null,
    );

  const contactCard = (c) =>
    el("div.card", { "data-reveal": "fade" },
      el("span.card__label", c.role || "Contacto"),
      el("p.detail__value", c.name || c.phone),
      has(c.phone)
        ? el("p.detail__note", el("a.link", { href: `tel:${String(c.phone).replace(/\s+/g, "")}` }, c.phone))
        : null,
      has(c.whatsapp)
        ? el("p.detail__note", el("a.link", { href: `https://wa.me/${String(c.whatsapp).replace(/\D/g, "")}`, target: "_blank", rel: "noopener" }, "WhatsApp"))
        : null,
    );

  return act("detalles", "act--center", titleId,
    el("div.act__inner",
      ...head(d.eyebrow, d.heading, titleId),
      has(d.intro) ? el("p.lead", { "data-reveal": "fade" }, d.intro) : null,
      el("div.grid.grid--3.details__grid",
        ...items.map(card),
        ...contacts.map(contactCard),
      ),
    ),
  );
}

/* ========================================================================= */
/* ACTO 9 · RSVP                                                             */
/* ========================================================================= */
export function renderRsvp(cfg) {
  const r = cfg.rsvp;
  if (!r?.enabled) return null;
  const titleId = id("t");
  const demo = !(r.backend?.type && r.backend.type !== "none" && r.backend.endpoint);

  // Pase personalizado (?invitado=…&lugares=…). Si no viene, todo sigue igual.
  const pass = r.personalize === false ? null : readInvite();
  // Los lugares del pase incluyen al invitado: 2 lugares = 1 acompañante.
  const maxGuests = pass?.seats ? Math.max(0, pass.seats - 1) : (r.maxGuests || 0);

  const guestOptions = Array.from({ length: maxGuests + 1 }, (_, i) =>
    el("option", { value: String(i) }, i === 0 ? "Voy solo" : `${i} acompañante${i > 1 ? "s" : ""}`));

  const conditional = el("div.rsvp__conditional",
    el("div.field",
      el("label.field__label", { for: "rsvpGuests" }, "¿Vienes acompañado?"),
      el("select.field__control#rsvpGuests", { name: "guests" }, ...guestOptions),
    ),
    r.askDiet
      ? el("div.field",
          el("label.field__label", { for: "rsvpDiet" }, "Alguna restricción alimentaria (opcional)"),
          el("input.field__control#rsvpDiet", { name: "diet", type: "text", autocomplete: "off", placeholder: "Vegetariano, sin gluten…" }),
        )
      : null,
  );

  return act("rsvp", "act--center", titleId,
    el("div.act__inner--narrow",
      ...head(r.eyebrow, r.heading, titleId),
      has(r.intro) ? el("p.lead", { "data-reveal": "fade" }, r.intro) : null,
      has(r.deadline) ? el("p.rsvp__deadline", { "data-reveal": "fade" }, `Confirma antes del ${r.deadline}`) : null,

      pass
        ? el("div.rsvp__pass", { "data-reveal": "fade" },
            el("span.card__label", "Esta invitación corresponde a"),
            el("p.rsvp__pass-name", pass.name),
            pass.seats
              ? el("p.rsvp__pass-seats", `${pass.seats} ${pass.seats === 1 ? "lugar reservado" : "lugares reservados"}`)
              : null,
          )
        : null,

      el("form.rsvp__form#rsvpForm", { novalidate: true, "data-reveal": "fade" },
        demo ? el("p.demo-flag", "Modo demostración") : null,

        el("div.field",
          el("label.field__label", { for: "rsvpName" }, "Tu nombre"),
          el("input.field__control#rsvpName", { name: "name", type: "text", autocomplete: "name", required: true, "aria-describedby": "err-name", value: pass?.name || null }),
          el("span.field__error#err-name", { "data-error-for": "name", role: "alert" }),
        ),

        el("fieldset.field", { style: { border: "0", padding: "0" } },
          el("legend.field__label", "¿Podrás acompañarnos?"),
          el("div.choice",
            el("span.choice__item",
              el("input.choice__input#rsvpYes", { type: "radio", name: "attending", value: "si" }),
              el("label.choice__face", { for: "rsvpYes" }, "Ahí estaré"),
            ),
            el("span.choice__item",
              el("input.choice__input#rsvpNo", { type: "radio", name: "attending", value: "no" }),
              el("label.choice__face", { for: "rsvpNo" }, "No podré ir"),
            ),
          ),
          el("span.field__error", { "data-error-for": "attending", role: "alert" }),
        ),

        conditional,

        r.askMessage
          ? el("div.field",
              el("label.field__label", { for: "rsvpMsg" }, "Un mensaje para los novios (opcional)"),
              el("textarea.field__control#rsvpMsg", { name: "message", rows: "3" }),
            )
          : null,

        el("div.rsvp__actions",
          el("button.btn.btn--solid", { type: "submit" }, el("span", "Enviar confirmación")),
        ),
        el("p.form-status", { hidden: true, role: "status", "aria-live": "polite" }),
        demo
          ? el("p.form-note",
              "Para recibir las confirmaciones de verdad hay que conectar un servicio en ",
              el("code", "js/config.js"), " → ", el("code", "rsvp.backend"), ".")
          : null,
      ),
    ),
  );
}

/* ========================================================================= */
/* ACTO 10 · LA CANCIÓN                                                      */
/* ========================================================================= */
export function renderSong(cfg) {
  const s = cfg.songRequest;
  if (!s?.enabled) return null;
  const titleId = id("t");

  return act("cancion", "act--center song", titleId,
    el("div.act__inner--narrow",
      ...head(s.eyebrow, s.heading, titleId),
      has(s.intro) ? el("p.lead", { "data-reveal": "fade" }, s.intro) : null,
      el("form.song__form#songForm", { novalidate: true, "data-reveal": "fade" },
        el("div.field",
          el("label.field__label", { for: "songTitle" }, "Canción y artista"),
          el("input.field__control#songTitle", { name: "song", type: "text", autocomplete: "off" }),
        ),
        el("div.field",
          el("label.field__label", { for: "songBy" }, "De parte de (opcional)"),
          el("input.field__control#songBy", { name: "by", type: "text", autocomplete: "name" }),
        ),
        el("button.btn", { type: "submit" }, el("span", "Anotar")),
      ),
      el("p.form-status", { hidden: true, role: "status", "aria-live": "polite" }),
    ),
  );
}

/* ========================================================================= */
/* ACTO 11 · MESA DE REGALOS                                                 */
/* ========================================================================= */
export function renderRegistry(cfg) {
  const r = cfg.registry;
  if (!r?.enabled || !r.options?.length) return null;
  const titleId = id("t");

  const option = (o) => {
    const body = [
      el("span",
        el("span.registry__name", o.name),
        has(o.meta) ? el("span.registry__meta", o.meta) : null,
        o.details?.length ? el("span.registry__meta", o.details.join(" · ")) : null,
      ),
      o.url ? el("span.registry__go", { "aria-hidden": "true" }, "Abrir", el("i")) : null,
    ];
    return o.url
      ? el("a.registry__option", { href: o.url, target: "_blank", rel: "noopener", "data-reveal": "fade" }, ...body)
      : el("div.registry__option", { "data-reveal": "fade" }, ...body);
  };

  return act("regalos", "act--center", titleId,
    el("div.act__inner",
      el("p.eyebrow", { "data-reveal": "fade" }, r.eyebrow),
      el("h2.registry__lead", { id: titleId, "data-reveal": "lines" }, r.lead),
      has(r.intro) ? el("p.prose", { "data-reveal": "fade" }, r.intro) : null,
      el("div.registry__options", ...r.options.map(option)),
      has(r.note) ? el("p.pending", r.note) : null,
    ),
  );
}

/* ========================================================================= */
/* ACTO 12 · FAQ                                                             */
/* ========================================================================= */
export function renderFaq(cfg) {
  const f = cfg.faq;
  if (!f?.enabled) return null;
  const items = (f.items || []).filter((i) => has(i.q) && has(i.a));
  if (!items.length) return null;                        // sin respuestas ⇒ sin sección
  const titleId = id("t");

  const row = (item, i) => {
    const panelId = `faq-panel-${i}`;
    const btnId = `faq-btn-${i}`;
    return el("div.accordion__item",
      el("h3", { style: { margin: "0" } },
        el("button.accordion__trigger", { type: "button", id: btnId, "aria-expanded": "false", "aria-controls": panelId },
          el("span", item.q),
          el("span.accordion__sign", { "aria-hidden": "true" }),
        ),
      ),
      el("div.accordion__panel", { id: panelId, role: "region", "aria-labelledby": btnId },
        el("div", item.a),
      ),
    );
  };

  return act("faq", "act--center", titleId,
    el("div.act__inner--narrow",
      ...head(f.eyebrow, f.heading, titleId),
      el("div.accordion.faq__list", ...items.map(row)),
    ),
  );
}

/* ========================================================================= */
/* ACTO 13 · MEDIANOCHE                                                      */
/* ========================================================================= */
export function renderFinale(cfg) {
  const f = cfg.finale;
  const { couple, date, location } = cfg;
  const titleId = id("t");
  const mono = monogram(couple.initials, "monogram finale__monogram");
  mono.id = "finaleMonogram";

  return el("section#final.finale", { "aria-labelledby": titleId },
    mono,
    el("p.eyebrow", { "data-reveal": "fade" }, f.eyebrow),
    el("p.finale__names", { id: titleId, "data-reveal": "lines" },
      couple.one, " ", el("span.amp", "&"), " ", couple.two),
    el("p.finale__await.num", `${date.day} de ${String(date.month).toLowerCase()} de ${date.year}`),
    el("p.finale__place", `${location.city}, ${location.state}`),
    has(f.colophon) ? el("p.colophon", f.colophon) : null,
  );
}

/* ========================================================================= */
/* MONTAJE                                                                   */
/* ========================================================================= */
export function renderAll(cfg, stage) {
  const parts = [
    renderHero(cfg),
    renderDate(cfg),
    renderBlessing(cfg),
    renderStory(cfg),
    renderVenue(cfg),
    renderTimeline(cfg),
    renderDress(cfg),
    renderDetails(cfg),
    renderRsvp(cfg),
    renderSong(cfg),
    renderRegistry(cfg),
    renderFaq(cfg),
    renderFinale(cfg),
  ].filter(Boolean);

  // Un hilo de luz entre capítulos: la costura que los une.
  const withThreads = [];
  parts.forEach((section, i) => {
    withThreads.push(section);
    if (i < parts.length - 1 && !section.classList.contains("story")) {
      withThreads.push(el("span.thread.thread--short", { "aria-hidden": "true", "data-thread": "" }));
    }
  });

  stage.append(...withThreads);
  return parts;
}
