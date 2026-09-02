/* ============================================================================
   CALENDARIO — .ics para Apple/Outlook y enlace directo para Google.
   Todo se calcula desde js/config.js: fecha, hora, sede y ciudad.
   ============================================================================ */

/** Minutos de desfase de una zona horaria en un instante dado. */
function offsetMinutes(date, timeZone) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const p = {};
    for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return (asUTC - date.getTime()) / 60000;
  } catch {
    return -new Date().getTimezoneOffset();
  }
}

/**
 * Convierte una hora de pared ("2027-03-15T17:00:00" en México) al instante
 * UTC que le corresponde. Dos pasadas bastan para acertar incluso junto a un
 * cambio de horario.
 */
export function zonedToUtc(isoLocal, timeZone) {
  const naive = Date.parse(isoLocal.replace(/Z?$/, "") + "Z");
  if (Number.isNaN(naive)) return null;
  let ms = naive;
  for (let i = 0; i < 2; i++) ms = naive - offsetMinutes(new Date(ms), timeZone) * 60000;
  return new Date(ms);
}

const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Las comas, los puntos y coma y los saltos de línea van escapados en iCal. */
const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\r?\n/g, "\\n");

/** Ninguna línea de un .ics debe pasar de 75 octetos. */
function fold(line) {
  if (line.length <= 74) return line;
  const out = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 73) { out.push(" " + rest.slice(0, 73)); rest = rest.slice(73); }
  if (rest) out.push(" " + rest);
  return out.join("\r\n");
}

export function buildEvent(cfg) {
  const { date, couple, ceremony, location, meta } = cfg;
  const start = zonedToUtc(date.iso, date.timezone);
  const end = zonedToUtc(date.endIso || date.iso, date.timezone) || new Date(start.getTime() + 5 * 3600e3);

  const title = `Boda de ${couple.one} y ${couple.two}`;
  const place = [ceremony?.name, ...(ceremony?.address || []), [location?.city, location?.state].filter(Boolean).join(", ")]
    .filter(Boolean).join(", ");
  const description = [
    ceremony?.provisional ? "Sede por confirmar." : null,
    meta?.url ? `Invitación: ${meta.url}` : null,
  ].filter(Boolean).join("\n");

  return { title, place, description, start, end };
}

export function toICS(cfg) {
  const ev = buildEvent(cfg);
  const uid = `${stamp(ev.start)}-${Math.random().toString(36).slice(2, 10)}@invitacion`;
  const rows = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitacion//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(ev.start)}`,
    `DTEND:${stamp(ev.end)}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.place ? `LOCATION:${esc(ev.place)}` : null,
    ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(ev.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return rows.map(fold).join("\r\n") + "\r\n";
}

export function googleUrl(cfg) {
  const ev = buildEvent(cfg);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${stamp(ev.start)}/${stamp(ev.end)}`,
    ctz: cfg.date.timezone || "",
  });
  if (ev.place) params.set("location", ev.place);
  if (ev.description) params.set("details", ev.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICS(cfg) {
  const text = toICS(cfg);
  const name = `boda-${cfg.couple.one}-${cfg.couple.two}.ics`.toLowerCase().replace(/\s+/g, "-");
  const a = document.createElement("a");

  if ("download" in a && window.Blob && window.URL?.createObjectURL) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } else {
    // Navegadores antiguos de iOS: el esquema data abre la hoja de Calendario
    window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(text);
  }
}
