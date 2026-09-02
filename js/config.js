/* ============================================================================
   CONFIGURACIÓN DE LA BODA
   ----------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CAMBIAR EL CONTENIDO.
   Ningún texto de la invitación vive dentro del HTML.

   Convenciones:
     · enabled:false      → la sección entera no se dibuja.
     · valor null o ""    → ese dato no se dibuja (no deja huecos).
     · provisional:true   → se muestra la marca discreta "por confirmar".
     · // PENDIENTE       → dato que los novios todavía tienen que dar.
     · // PROVISIONAL     → texto de relleno escrito por el diseño, a sustituir.
   ============================================================================ */

export const WEDDING = {

  /* ------------------------------------------------------------------ */
  /* PAREJA                                                             */
  /* ------------------------------------------------------------------ */
  couple: {
    one: "Elena",
    two: "Martín",
    // Iniciales del monograma. Se dibujan a mano en SVG, no como texto.
    initials: ["E", "M"],
    // Frase del hero. PROVISIONAL: cámbienla por la suya.
    tagline: "Un solo día, una sola noche, y todas las personas que queremos en el mismo lugar.",
  },

  /* ------------------------------------------------------------------ */
  /* FECHA Y HORA                                                       */
  /* ------------------------------------------------------------------ */
  date: {
    // Fecha y hora de inicio de la CEREMONIA, en hora local del evento.
    iso: "2027-03-15T17:00:00",
    // Duración estimada del evento completo (para el archivo de calendario).
    endIso: "2027-03-16T00:00:00",
    timezone: "America/Mexico_City",

    // Cómo se escribe la fecha en pantalla.
    day: "15",
    month: "Marzo",
    year: "2027",
    time: "5:00 p.m.",

    /* ⚠ DATA WARNING ⚠
       La versión anterior del sitio decía "Sábado 15 de marzo, 2027".
       El 15 de marzo de 2027 cae en LUNES, no en sábado.
       Los sábados más cercanos son el 13 y el 20 de marzo de 2027.
       NO se ha corregido nada por cuenta propia: hay que decidir qué dato es
       el bueno (¿la fecha o el día de la semana?) y entonces:
         · escribir el día correcto en `weekday` (p. ej. "Sábado"), y
         · ajustar `iso`, `endIso`, `day` si la que cambia es la fecha.
       Mientras `weekday` sea null, la invitación NO muestra día de la semana,
       y en su lugar aparece el aviso de abajo (dataWarning). */
    weekday: null,
    dataWarning: "Fecha por confirmar: revisen el día de la semana antes de compartir la invitación.",
  },

  location: {
    city: "León",
    state: "Guanajuato",
    short: "León, Gto.",
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 3 · BENDICIÓN Y PADRES                                        */
  /* ------------------------------------------------------------------ */
  blessing: {
    enabled: true,
    eyebrow: "Con la bendición de Dios",
    heading: "y de nuestros padres",
    // PROVISIONAL: verso de apertura, sustituible por el que ustedes quieran.
    verse: "Hay decisiones que uno no toma solo. Ésta la tomamos acompañados.",
    // PENDIENTE: estos nombres vienen de la plantilla original, no son reales.
    provisional: true,
    sides: [
      { role: "Padres de la novia", names: ["María Fernanda López Ibarra", "Roberto Sánchez García"] },
      { role: "Padres del novio",   names: ["Alejandra Torres Ruiz", "Eduardo Martínez Vega"] },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 4 · NUESTRA HISTORIA                                          */
  /* ------------------------------------------------------------------ */
  story: {
    enabled: true,
    eyebrow: "Momentos",
    heading: "Nuestra\nhistoria",
    // PROVISIONAL: los títulos y pies son de relleno. No se ha inventado
    // ninguna fecha ni ningún hecho: sustitúyanlos por los suyos.
    chapters: [
      { title: "Nos conocimos",        note: "Título provisional — sustituyan por su historia.", media: { type: "image", src: "assets/img/risa.jpg",        alt: "Elena y Martín riendo" } },
      { title: "Nuestra primera aventura", note: "Título provisional — sustituyan por su historia.", media: { type: "video", src: "assets/video/momento1.mp4", alt: "Un momento en movimiento" } },
      { title: "El sí",                media: { type: "image", src: "assets/img/baile.jpg",       alt: "Elena y Martín bailando" }, note: "Título provisional — sustituyan por su historia." },
      { title: "Lo que viene",         media: { type: "video", src: "assets/video/momento2.mp4",  alt: "Un momento en movimiento" }, note: "Título provisional — sustituyan por su historia." },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 5 · CEREMONIA Y RECEPCIÓN                                     */
  /* ------------------------------------------------------------------ */
  ceremony: {
    enabled: true,
    label: "La ceremonia",
    time: "5:00 p.m.",
    name: "Catedral Basílica de Nuestra Señora de la Luz",
    // PENDIENTE: dirección heredada de la plantilla.
    provisional: true,
    address: ["Álvaro Obregón 112, Centro, 37000", "León de los Aldama, Guanajuato"],
    // Mapa de OpenStreetMap: no planta marcador propio, así el único pin es
    // el dorado del diseño. Para moverlo, cambien el bbox:
    // minLon,minLat,maxLon,maxLat
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=-101.68621%2C21.12080%2C-101.67781%2C21.12720&layer=mapnik",
    maps: "https://www.google.com/maps/dir/?api=1&destination=Catedral%20Bas%C3%ADlica%20de%20Nuestra%20Se%C3%B1ora%20de%20la%20Luz%2C%20Le%C3%B3n%2C%20Guanajuato",
    waze: "https://waze.com/ul?q=Catedral%20Bas%C3%ADlica%20de%20Nuestra%20Se%C3%B1ora%20de%20la%20Luz%2C%20Le%C3%B3n",
  },

  reception: {
    // PENDIENTE: cuando se confirme la sede, poner enabled:true y rellenar.
    enabled: true,
    label: "La recepción",
    time: null,
    name: null,
    address: [],
    mapEmbed: null,
    maps: null,
    waze: null,
    // Texto que se muestra mientras no haya sede confirmada.
    pendingNote: "Estamos afinando el lugar donde seguirá la noche. En cuanto esté confirmado, aparecerá aquí mismo.",
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 6 · ITINERARIO                                                */
  /* ------------------------------------------------------------------ */
  timeline: {
    enabled: true,
    eyebrow: "El plan de la noche",
    heading: "Itinerario",
    stops: [
      { time: "5:00",  title: "Ceremonia",            note: "Catedral Basílica de N. S. de la Luz" },
      { time: "6:30",  title: "Recepción y brindis",  note: "Sede por confirmar" },
      { time: "7:30",  title: "Cena",                 note: null },
      { time: "9:00",  title: "Baile",                note: "Primer baile de los novios" },
      { time: "11:00", title: "Fuegos artificiales",  note: "Cierre de la noche" },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 7 · CÓDIGO DE VESTIMENTA                                      */
  /* ------------------------------------------------------------------ */
  dressCode: {
    enabled: true,
    eyebrow: "Código de vestimenta",
    code: "Etiqueta rigurosa",
    note: "Esmoquin para ellos, vestido largo para ellas. La noche lo merece.",
    labels: { one: "Ellos", two: "Ellas" },
    palette: [
      { hex: "#0E0E1C", name: "Negro" },
      { hex: "#2B2B3D", name: "Oxford" },
      { hex: "#14142E", name: "Azul noche" },
      { hex: "#5A4A55", name: "Ciruela" },
      { hex: "#E6C583", name: "Oro" },
    ],
    // Reservado a la novia. Dejar en null para no mostrar la línea.
    reserved: "El blanco queda reservado para la novia.",
  },

  // Datos sueltos que se reutilizan en varias secciones (vestimenta, FAQ,
  // "Antes de celebrar"). Poner null en los que no apliquen.
  policies: {
    children:   { label: "Niños",         value: "Se admiten niños" },
    music:      { label: "Música",        value: "Música clásica en vivo" },
    photos:     { label: "Fotografías",   value: null }, // PENDIENTE
    arrival:    { label: "Llegada sugerida", value: null }, // PENDIENTE
    parking:    { label: "Estacionamiento", value: null }, // PENDIENTE
    valet:      { label: "Valet parking",   value: null }, // PENDIENTE
    transport:  { label: "Transporte",      value: null }, // PENDIENTE
    weather:    { label: "Clima esperado",  value: null }, // PENDIENTE
    ceremonySpace:  { label: "Ceremonia",   value: null }, // PENDIENTE: interior / exterior
    receptionSpace: { label: "Recepción",   value: null }, // PENDIENTE: interior / exterior
    lodging:    { label: "Hospedaje",       value: null }, // PENDIENTE
    coordinator:{ label: "Coordinación",    value: null }, // PENDIENTE
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 8 · ANTES DE CELEBRAR                                         */
  /* ------------------------------------------------------------------ */
  details: {
    enabled: true,
    eyebrow: "Para que todo fluya",
    heading: "Antes de celebrar",
    intro: null,
    // Cada entrada apunta a una clave de `policies`. Sólo se dibujan las que
    // tienen valor: la sección entera desaparece si ninguna lo tiene.
    show: [
      "arrival", "parking", "valet", "transport",
      "ceremonySpace", "receptionSpace", "children",
      "weather", "photos", "lodging", "coordinator", "music",
    ],
    // Teléfonos de contacto. PENDIENTE: no se ha inventado ninguno.
    contacts: [
      // { role: "Coordinadora", name: "", phone: "", whatsapp: "" },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 9 · CONFIRMACIÓN DE ASISTENCIA                                */
  /* ------------------------------------------------------------------ */
  rsvp: {
    enabled: true,
    eyebrow: "Confirmación",
    heading: "¿Nos acompañan?",
    intro: "Nos ayuda muchísimo saberlo con tiempo para reservar su lugar.",
    // PENDIENTE: fecha límite para confirmar.
    deadline: null,
    // Máximo de acompañantes que puede declarar un invitado.
    maxGuests: 4,
    /* Saludo personalizado por invitado. Se activa solo si el enlace lleva
       parámetros:  …/?invitado=Ana%20Ruiz&lugares=2
       Muestra "Esta invitación corresponde a…", precarga el nombre y limita
       los acompañantes a los lugares del pase.
       OJO: es una comodidad, NO un control de acceso — cualquiera puede editar
       la URL. Pongan false para desactivarlo. */
    personalize: true,
    // Campos opcionales del formulario.
    askDiet: true,
    askMessage: true,

    /* ---- Conexión con el mundo real ----
       El formulario NO envía nada mientras type sea "none": se comporta en
       modo demo, lo dice en pantalla y escribe en consola lo que habría
       mandado. Para activarlo de verdad, elijan UNO:

       type: "formspree"   endpoint: "https://formspree.io/f/xxxxxxx"
       type: "appsScript"  endpoint: "https://script.google.com/macros/s/AKf.../exec"
       type: "custom"      endpoint: "https://tu-api.com/rsvp"   (POST JSON)

       Los tres reciben el mismo objeto JSON:
         { name, attending, guests, diet, message, song, sentAt, source }
       Ver js/rsvp.js si quieren añadir otro proveedor. */
    backend: { type: "none", endpoint: null },
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 10 · LA CANCIÓN                                               */
  /* ------------------------------------------------------------------ */
  songRequest: {
    enabled: true,
    eyebrow: "Para la pista",
    heading: "¿Qué canción no puede faltar?",
    intro: "Una sola. La que les haga levantarse de la silla.",
    // Si es null, reutiliza el backend de rsvp (y su modo demo).
    backend: null,
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 11 · MESA DE REGALOS                                          */
  /* ------------------------------------------------------------------ */
  registry: {
    enabled: true,
    eyebrow: "Con cariño",
    lead: "Su presencia es nuestro mejor regalo.",
    intro: "Si además quieren tener un detalle con nosotros, aquí dejamos algunas opciones.",
    // type: "store" | "transfer" | "gift" | "note"
    // PENDIENTE: los enlaces van a la portada de cada tienda, no a una mesa
    // concreta. Cuando abran la suya, sustituyan `url` por el enlace directo.
    options: [
      { type: "store", name: "Amazon",              meta: "Mesa por abrir", url: "https://www.amazon.com.mx/wedding/home" },
      { type: "store", name: "El Palacio de Hierro", meta: "Mesa por abrir", url: "https://www.elpalaciodehierro.com/mesa-de-regalos" },
      // Ejemplo de transferencia. NO se ha inventado ninguna cuenta: para
      // usarla, rellenen los datos y quiten el comentario.
      // { type:"transfer", name:"Transferencia", meta:"Banco · CLABE", details:["Titular: ", "CLABE: "] },
    ],
    note: "Las mesas todavía no están abiertas: los enlaces son provisionales.",
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 12 · PREGUNTAS FRECUENTES                                     */
  /* ------------------------------------------------------------------ */
  // Sólo se dibujan las preguntas que tienen respuesta.
  faq: {
    enabled: true,
    eyebrow: "Por si acaso",
    heading: "Preguntas frecuentes",
    items: [
      { q: "¿Se permiten niños?",                        a: "Sí, los niños son bienvenidos." },
      { q: "¿Cuál es el código de vestimenta?",          a: "Etiqueta rigurosa: esmoquin para ellos y vestido largo para ellas. El blanco queda reservado para la novia." },
      { q: "¿Puedo llevar acompañante?",                 a: null }, // PENDIENTE
      { q: "¿Hay estacionamiento?",                      a: null }, // PENDIENTE
      { q: "¿A qué hora debo llegar?",                   a: null }, // PENDIENTE
      { q: "¿Puedo tomar fotografías durante la ceremonia?", a: null }, // PENDIENTE
      { q: "¿Dónde será la recepción?",                  a: null }, // PENDIENTE
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ACTO 13 · CIERRE                                                   */
  /* ------------------------------------------------------------------ */
  finale: {
    enabled: true,
    eyebrow: "Te esperamos",
    // Se muestra debajo del monograma. null = no se dibuja.
    colophon: null,
  },

  /* ------------------------------------------------------------------ */
  /* MÚSICA                                                             */
  /* ------------------------------------------------------------------ */
  audio: {
    // Si el archivo existe, suena. Si no existe (404), el sitio sintetiza una
    // pieza por código con Web Audio y nadie se entera.
    src: "assets/audio/musica.mp3",
    // false = si no hay archivo, no suena nada.
    synthFallback: true,
    volume: 0.55,
  },

  /* ------------------------------------------------------------------ */
  /* HERO                                                               */
  /* ------------------------------------------------------------------ */
  hero: {
    video: "assets/video/hero.mp4",
    poster: "assets/img/hero-poster.jpg",
    eyebrow: "Nos casamos",
  },

  /* ------------------------------------------------------------------ */
  /* NAVEGACIÓN — el orden aquí es el orden de los capítulos             */
  /* ------------------------------------------------------------------ */
  // `hour` es la hora ficticia del capítulo dentro de la noche: es lo que
  // hace sentir que el sitio avanza en el tiempo. No tiene que coincidir con
  // el itinerario real.
  chapters: [
    { id: "hero",      name: "Comienzo",    hour: "17:00" },
    { id: "fecha",     name: "La fecha",    hour: "17:20" },
    { id: "bendicion", name: "Bendición",   hour: "17:40" },
    { id: "historia",  name: "Historia",    hour: "18:10" },
    { id: "ubicacion", name: "Ubicación",   hour: "18:40" },
    { id: "itinerario",name: "Itinerario",  hour: "19:20" },
    { id: "vestimenta",name: "Vestimenta",  hour: "20:00" },
    { id: "detalles",  name: "Detalles",    hour: "20:40" },
    { id: "rsvp",      name: "Confirmar",   hour: "21:20" },
    { id: "cancion",   name: "La canción",  hour: "22:00" },
    { id: "regalos",   name: "Regalos",     hour: "22:40" },
    { id: "faq",       name: "Preguntas",   hour: "23:20" },
    { id: "final",     name: "Medianoche",  hour: "00:00" },
  ],

  /* ------------------------------------------------------------------ */
  /* AJUSTES DE EXPERIENCIA                                             */
  /* ------------------------------------------------------------------ */
  flags: {
    // El sobre inicial. Desactivarlo quita también la música (los navegadores
    // exigen una interacción del usuario antes de reproducir audio).
    curtain: true,
    ambient: true,      // estrellas, pétalos, polvo luminoso
    fireworks: true,    // cierre
    hourRail: true,     // riel de horas en pantallas grandes
    // Techo de partículas. Se reduce solo en móviles y pantallas pequeñas.
    particleCap: 34,
  },

  /* ------------------------------------------------------------------ */
  /* METADATOS (buscadores y vista previa al compartir por WhatsApp)     */
  /* ------------------------------------------------------------------ */
  meta: {
    title: "Elena & Martín · Invitación de boda",
    description: "15 de marzo de 2027 · León, Guanajuato. Acompáñanos a celebrar.",
    // Imagen para la vista previa del enlace. Debe ser una URL absoluta.
    image: "https://tinmata1.github.io/invitaciones-web/assets/img/hero-poster.jpg",
    url: "https://tinmata1.github.io/invitaciones-web/",
  },
};

export default WEDDING;
