/* ============================================================================
   RSVP — la interfaz no sabe nada del backend.
   ----------------------------------------------------------------------------
   `createSender` traduce la configuración a un único método `send(datos)`.
   Mientras el tipo sea "none", NADA sale del navegador: el formulario avisa
   en pantalla de que está en modo demo y escribe en consola lo que habría
   enviado. Añadir un proveedor nuevo es añadir un caso a este archivo.
   ============================================================================ */

import { qs } from "./dom.js";

/**
 * Pase personalizado leído de la URL: ?invitado=Ana%20Ruiz&lugares=2
 *
 * Es una COMODIDAD, no un control de acceso: cualquiera puede editar la barra
 * de direcciones. Por eso sólo saluda y precarga el formulario; no oculta ni
 * protege nada, y la invitación funciona igual sin ningún parámetro.
 */
export function readInvite() {
  let p;
  try { p = new URLSearchParams(window.location.search); } catch { return null; }
  const name = (p.get("invitado") || p.get("guest") || "").trim().slice(0, 80);
  if (!name) return null;
  const seatsRaw = parseInt(p.get("lugares") || p.get("seats") || "", 10);
  const seats = Number.isFinite(seatsRaw) ? Math.max(1, Math.min(12, seatsRaw)) : null;
  return { name, seats };
}

export function createSender(backend, source = "invitacion") {
  const type = backend?.type || "none";
  const endpoint = backend?.endpoint || null;
  const live = type !== "none" && !!endpoint;

  async function post(url, body, headers) {
    const res = await fetch(url, { method: "POST", headers, body, mode: "cors" });
    if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
    return res;
  }

  return {
    mode: live ? "live" : "demo",
    type,

    async send(data) {
      const payload = { ...data, source, sentAt: new Date().toISOString() };

      if (!live) {
        // Modo demo: no se envía nada a ninguna parte.
        console.info("[RSVP · modo demo] No se envió nada. Esto es lo que se habría mandado:", payload);
        await new Promise((r) => setTimeout(r, 450));
        return { demo: true };
      }

      switch (type) {
        case "formspree":
          await post(endpoint, JSON.stringify(payload), {
            "Content-Type": "application/json",
            Accept: "application/json",
          });
          return { demo: false };

        case "appsScript":
          // text/plain evita la petición OPTIONS previa, que Apps Script no
          // contesta. El script recibe el JSON en e.postData.contents.
          await post(endpoint, JSON.stringify(payload), {
            "Content-Type": "text/plain;charset=utf-8",
          });
          return { demo: false };

        case "custom":
        default:
          await post(endpoint, JSON.stringify(payload), { "Content-Type": "application/json" });
          return { demo: false };
      }
    },
  };
}

/* ------------------------------------------------------------------------- */
/* Comportamiento del formulario de confirmación                             */
/* ------------------------------------------------------------------------- */

export function attachRsvp(form, cfg, gsap) {
  if (!form) return;

  const sender = createSender(cfg.rsvp.backend, "rsvp");
  const status = qs(".form-status", form);
  const submit = qs("[type=submit]", form);
  const conditional = qs(".rsvp__conditional", form);
  const attendingInputs = Array.from(form.querySelectorAll("[name=attending]"));

  /* Los campos de acompañantes sólo tienen sentido si viene. */
  const syncConditional = () => {
    const yes = form.querySelector("[name=attending]:checked")?.value === "si";
    if (!conditional) return;
    conditional.hidden = false;
    if (gsap) {
      gsap.to(conditional, {
        height: yes ? "auto" : 0,
        opacity: yes ? 1 : 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => { conditional.style.overflow = yes ? "visible" : "hidden"; },
      });
    } else {
      conditional.style.height = yes ? "auto" : "0";
      conditional.style.opacity = yes ? "1" : "0";
    }
    conditional.querySelectorAll("input,select,textarea").forEach((f) => { f.disabled = !yes; });
  };
  attendingInputs.forEach((i) => i.addEventListener("change", syncConditional));
  if (conditional) {
    conditional.style.height = "0";
    conditional.style.opacity = "0";
    conditional.style.overflow = "hidden";
    conditional.querySelectorAll("input,select,textarea").forEach((f) => { f.disabled = true; });
  }

  function say(message, isError = false) {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle("form-status--error", isError);
  }

  function fieldError(name, message) {
    const input = form.querySelector(`[name=${name}]`);
    const slot = form.querySelector(`[data-error-for=${name}]`);
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    if (slot) slot.textContent = message || "";
    return !message;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    let ok = true;
    ok = fieldError("name", data.name?.trim() ? "" : "Nos hace falta tu nombre.") && ok;
    ok = fieldError("attending", data.attending ? "" : "Dinos si podrás acompañarnos.") && ok;
    if (!ok) {
      say("Falta algún dato por completar.", true);
      form.querySelector("[aria-invalid=true]")?.focus();
      return;
    }

    submit.disabled = true;
    const original = submit.querySelector("span")?.textContent;
    if (submit.querySelector("span")) submit.querySelector("span").textContent = "Enviando…";

    try {
      const result = await sender.send({
        name: data.name.trim(),
        attending: data.attending === "si",
        guests: data.attending === "si" ? Number(data.guests || 0) : 0,
        diet: (data.diet || "").trim() || null,
        message: (data.message || "").trim() || null,
      });

      if (result.demo) {
        say(
          "Modo demostración: la confirmación NO se ha enviado a ninguna parte, porque todavía no hay servicio configurado. " +
          "Los datos aparecen en la consola del navegador. Ver js/config.js → rsvp.backend."
        );
      } else if (data.attending === "si") {
        say("¡Confirmado! Nos vemos el día de la boda. Gracias por avisarnos.");
        form.reset();
        syncConditional();
      } else {
        say("Gracias por avisarnos. Te vamos a echar de menos.");
        form.reset();
        syncConditional();
      }
    } catch (err) {
      console.error("[RSVP]", err);
      say("No pudimos enviar la confirmación. Inténtalo de nuevo en un momento.", true);
    } finally {
      submit.disabled = false;
      if (submit.querySelector("span") && original) submit.querySelector("span").textContent = original;
    }
  });

  return sender;
}

/* ------------------------------------------------------------------------- */
/* Petición de canción — mismo adaptador, formulario mínimo                   */
/* ------------------------------------------------------------------------- */

export function attachSong(form, cfg) {
  if (!form) return;
  const backend = cfg.songRequest.backend || cfg.rsvp.backend;
  const sender = createSender(backend, "cancion");
  const status = qs(".form-status", form);
  const submit = qs("[type=submit]", form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.song?.trim()) {
      status.hidden = false;
      status.textContent = "Escribe una canción y la anotamos.";
      status.classList.add("form-status--error");
      return;
    }
    submit.disabled = true;
    try {
      const result = await sender.send({ song: data.song.trim(), name: (data.by || "").trim() || null });
      status.hidden = false;
      status.classList.remove("form-status--error");
      status.textContent = result.demo
        ? "Modo demostración: la canción no se envió a ninguna parte (no hay servicio configurado todavía)."
        : "Anotada. Gracias por el aporte.";
      if (!result.demo) form.reset();
    } catch (err) {
      console.error("[Canción]", err);
      status.hidden = false;
      status.classList.add("form-status--error");
      status.textContent = "No pudimos guardarla. Inténtalo de nuevo.";
    } finally {
      submit.disabled = false;
    }
  });

  return sender;
}
