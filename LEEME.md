# Invitación de boda — Elena & Martín

Una invitación digital que se recorre como una sola noche: empieza en la hora
dorada y termina a medianoche. El cielo, la luz, los pétalos, el polvo luminoso
y las estrellas avanzan con el scroll, así que el invitado no ve "cambiar el
fondo": siente que está pasando el tiempo.

Publicado en: <https://tinmata1.github.io/invitaciones-web/>

---

## ⚠ AVISO SOBRE LA FECHA (leer antes de compartir)

La versión anterior decía **"Sábado 15 de marzo, 2027"**.
**El 15 de marzo de 2027 cae en lunes.** Los sábados más cercanos son el
**13** y el **20** de marzo de 2027.

No se ha corregido por cuenta propia porque no se sabe cuál de los dos datos es
el bueno. Mientras tanto, la invitación **no muestra el día de la semana** y
enseña un aviso discreto en la sección de la fecha.

Para resolverlo, en `js/config.js` → `date`:

- Si la fecha correcta es el 15: escriban `weekday: "Lunes"` y pongan
  `dataWarning: null`.
- Si el día correcto es sábado: cambien `iso`, `endIso` y `day` a la fecha real
  (13 o 20), escriban `weekday: "Sábado"` y pongan `dataWarning: null`.

En cuanto `dataWarning` sea `null`, el aviso desaparece de la página.

---

## Cómo cambiar el contenido

**Todo el texto vive en `js/config.js`.** No hay que buscar nada dentro del
HTML: el HTML está vacío y la página se construye desde ese archivo.

Tres convenciones:

| En el config            | Qué hace                                            |
|-------------------------|-----------------------------------------------------|
| `enabled: false`        | La sección entera desaparece.                        |
| `null` o `""`           | Ese dato no se dibuja. No deja hueco ni guion suelto.|
| `provisional: true`     | Añade la marca discreta "por confirmar".             |

Y dos marcas en los comentarios:

- `// PENDIENTE` — dato que ustedes tienen que dar. No se ha inventado ninguno.
- `// PROVISIONAL` — texto de relleno escrito por el diseño, a sustituir.

### Lo que hay que rellenar

| Dónde                       | Qué falta                                              |
|-----------------------------|--------------------------------------------------------|
| `blessing.sides`            | Los nombres de los padres son los de la plantilla.      |
| `ceremony.address`          | Dirección heredada de la plantilla.                     |
| `reception`                 | Sede sin confirmar (la sección lo dice, no lo inventa). |
| `story.chapters[].title/note`| Títulos y pies provisionales de la historia.           |
| `registry.options[].url`    | Enlaces a la portada de la tienda, no a su mesa.        |
| `rsvp.backend`              | Sin servicio: el formulario está en modo demo.          |
| `rsvp.deadline`             | Fecha límite para confirmar.                            |
| `policies.*`                | Estacionamiento, transporte, llegada, clima, hospedaje… |
| `details.contacts`          | Teléfonos. No se ha inventado ninguno.                  |
| `faq.items[].a`             | Cinco preguntas sin respuesta todavía.                  |

Las preguntas sin respuesta **no se dibujan**, y si ninguna la tiene, la sección
FAQ no existe. Lo mismo con "Antes de celebrar": sólo salen los datos que estén
configurados. Ahora mismo muestra dos (niños y música) porque son los únicos que
ya existían.

### La única excepción

Las etiquetas `<meta>` de `index.html` (título, descripción e imagen que se ven
al pegar el enlace en WhatsApp) tienen que estar en el HTML: WhatsApp no ejecuta
JavaScript. Si cambian nombres o fecha, hay que tocarlas también. Están al
principio del archivo, con un comentario que lo recuerda.

---

## Confirmación de asistencia (RSVP)

El formulario **no envía nada** mientras `rsvp.backend.type` sea `"none"`. En
ese estado avisa en pantalla de que está en modo demostración y escribe en la
consola lo que habría mandado. Nunca finge un envío.

Para activarlo de verdad, en `js/config.js`:

```js
rsvp: {
  backend: { type: "formspree", endpoint: "https://formspree.io/f/xxxxxxx" },
}
```

Opciones admitidas:

| `type`        | `endpoint`                                        |
|---------------|---------------------------------------------------|
| `"none"`      | Modo demo (por defecto).                           |
| `"formspree"` | La URL del formulario de Formspree.                |
| `"appsScript"`| La URL `…/exec` de un Google Apps Script.          |
| `"custom"`    | Cualquier API propia que acepte `POST` con JSON.   |

Los cuatro reciben el mismo objeto:

```json
{ "name": "", "attending": true, "guests": 2, "diet": null,
  "message": null, "source": "rsvp", "sentAt": "…" }
```

La petición de canción usa el mismo adaptador (`source: "cancion"`). Si quieren
mandarla a otro sitio, rellenen `songRequest.backend`.

Añadir otro proveedor es añadir un `case` en `js/rsvp.js`. La interfaz no sabe
nada del backend, así que no hay que tocar nada más.

### Pase personalizado por invitado

Si al enlace se le añaden parámetros, la invitación saluda por su nombre:

```
https://tinmata1.github.io/invitaciones-web/?invitado=Ana%20Ruiz&lugares=2
```

Muestra *"Esta invitación corresponde a Ana Ruiz — 2 lugares reservados"*,
precarga el nombre en el formulario y limita los acompañantes a los lugares del
pase (2 lugares = 1 acompañante). Sin parámetros, todo funciona igual.

> Es una **comodidad, no un control de acceso**: la invitación es un sitio
> estático y cualquiera puede editar la URL. Por eso sólo saluda y precarga;
> no oculta secciones ni protege nada. No se ha implementado nada que aparente
> una seguridad que no existe. Se apaga con `rsvp.personalize: false`.

---

## Música, fotos y video

**Música** — `js/config.js` → `audio.src`. Si el archivo existe, suena. Si no
existe, la pieza **se sintetiza por código** con Web Audio: un arpegio con reverb
cuya armonía, registro, brillo y tempo viajan de la hora dorada a la medianoche
siguiendo el mismo progreso que el cielo. Para poner su canción basta con dejar
el mp3 en `assets/audio/musica.mp3`; no hay que tocar código.

La música **sólo arranca al pulsar "Abrir invitación"**, que es lo que exigen
Safari/iOS y Chrome. El botón de la esquina la silencia y recuerda la decisión
durante la sesión.

**Fotos y video** — reemplacen los archivos de `assets/` conservando el nombre,
o cambien las rutas en `config.js`:

- Hero: `hero.video` y `hero.poster`.
- Historia: `story.chapters[].media` (`type: "image"` o `"video"`, `src`, `alt`).

El `alt` es obligatorio para que la invitación se pueda leer con lector de
pantalla. Está en el config, no en el HTML.

---

## Estructura

```
index.html              esqueleto vacío + <meta> para compartir
css/
  tokens.css            color, tipografía, ritmo, curvas de movimiento
  base.css              reset, capas del cielo, accesibilidad
  components.css        botones, campos, acordeón, navegación, marcos
  sections.css          la puesta en escena de cada acto
js/
  config.js             ← TODO EL CONTENIDO ESTÁ AQUÍ
  app.js                orden de arranque y apertura del sobre
  render.js             construye los actos desde el config
  motion.js             el lenguaje de movimiento y las escenas
  ambient.js            cielo, partículas, estrellas y cierre
  audio.js              música (archivo + sintetizador de respaldo)
  nav.js                línea de progreso, riel de horas, índice
  countdown.js          cuenta atrás con dígitos que ruedan
  calendar.js           .ics y enlace de Google Calendar
  rsvp.js               adaptador de backend + formularios
  art.js                monograma y siluetas (SVG propio)
  dom.js                ayudantes mínimos
assets/                 img · video · audio · favicon
```

Sin paso de build y sin npm. GSAP y las tipografías vienen de CDN; el resto son
módulos ES nativos. Cada push a `master` publica el repositorio tal cual
(`.github/workflows/deploy.yml`).

---

## El recorrido

| Acto | Capítulo | Idea |
|------|----------|------|
| 0 | El sobre | Monograma que se dibuja; al pulsar, se abre por su propia línea dorada. |
| 1 | Hero | Video a sangre, nombres letra a letra, dos planos que se separan. |
| 2 | La fecha | El 15 en enorme, cuenta atrás que rueda, y "agregar al calendario". |
| 3 | Bendición | Solemne. Casi sin movimiento: es el contraste del hero. |
| 4 | Nuestra historia | Escena fija con recorrido horizontal. |
| 5 | Ceremonia y recepción | Mapa con pin propio; la recepción dice que falta. |
| 6 | Itinerario | Un hilo de luz que avanza con el lector y enciende cada hora. |
| 7 | Vestimenta | Dos prendas dibujadas a trazo y la paleta como muestras de tela. |
| 8 | Antes de celebrar | Sólo los datos que existan. |
| 9 | Confirmación | Formulario que pertenece a la invitación, no un widget pegado. |
| 10 | La canción | Una pregunta, una respuesta. |
| 11 | Mesa de regalos | "Su presencia es nuestro mejor regalo", y luego lo discreto. |
| 12 | Preguntas | Acordeón sobrio. |
| 13 | Medianoche | Las chispas se posan y dibujan el monograma en el cielo. |

El ornamento es siempre el mismo hilo dorado: divide capítulos, es la espina del
itinerario y es la línea por la que se abre el sobre. Una idea, repetida.

---

## Movimiento

Cinco familias, y ninguna se usa fuera de su sitio:

1. **Tipografía enmascarada** — palabras que suben desde detrás de una máscara.
2. **Máscara** — la fotografía se abre como un telón y la imagen se asienta.
3. **Deriva** — dos planos a distinta velocidad. Nunca tres.
4. **Escena fija** — sólo la historia la merece.
5. **Ambiente** — cielo y partículas, siempre de fondo.

### `prefers-reduced-motion`

Si el sistema lo pide: no hay escenas fijas, ni deriva, ni partículas, ni
recorrido horizontal (la historia se apila y se lee), y **todo el contenido está
visible desde el primer fotograma**. Verificado: cero elementos ocultos.

---

## Rendimiento

- **Un solo `<canvas>` y un solo `requestAnimationFrame`** para cielo,
  partículas, estrellas y fuegos artificiales.
- El campo de estrellas se pinta **una vez** en un lienzo aparte y se estampa
  cada fotograma, en lugar de redibujar dos centenares de arcos.
- Sólo se animan `transform` y `opacity`.
- Menos partículas y menor densidad de píxeles en móviles.
- Los videos **se descargan y se reproducen sólo mientras están a la vista**, y
  se paran si la pestaña pasa a segundo plano.
- El video del hero empieza a bajar mientras el invitado lee el sobre, así que
  al pulsar ya está listo.
- El bucle entero se detiene con la pestaña oculta.
- Sin `filter: blur()` ni `mix-blend-mode` a pantalla completa: los dos cuestan
  un repintado carísimo en Safari móvil.

Medido en 390×844, densidad ×3 y **CPU frenada ×4** (un iPhone de gama media),
recorriendo la página entera: mediana **12,1 ms** por fotograma, p95 **18,2 ms**,
un único fotograma por encima de 50 ms.

---

## Qué se ha probado

Con Chromium en headless por protocolo DevTools:

- **Anchos**: 320, 375, 390, 430, 768, 1024, 1440 y 1920. Cero desbordamiento
  horizontal y cero errores de consola en los ocho.
- **Movimiento reducido**: sin escenas fijas, todo legible, cero errores.
- **Consola y red**: sin excepciones. El único 404 es `assets/audio/musica.mp3`,
  que es esperado y activa el sintetizador.
- **Calendario**: el `.ics` sale con `DTSTART:20270315T230000Z`, que son las
  17:00 en León; líneas plegadas a 75 octetos, saltos CRLF y comas escapadas.
- **RSVP**: validación, campos condicionales, modo demo y mensajes de error.
- **Acordeón, índice de capítulos y cierre con Escape**.
- **Accesibilidad**: sin imágenes sin `alt`, sin campos sin etiqueta, sin
  botones sin nombre; un solo `<h1>`, sin saltos de nivel, todas las secciones
  con nombre y foco visible en todos los controles.

---

## Limitaciones conocidas

- **Sin iPhone real.** Todo se ha probado en Chromium emulando iOS. Conviene
  abrirlo una vez en un iPhone de verdad para confirmar el arranque de la música
  y la altura del hero con la barra de Safari.
- **`.ics` en iOS antiguo.** Se descarga con `Blob` y `<a download>`; si el
  navegador no lo admite, cae a un `data:` URI. El botón de Google Calendar es la
  vía más fiable en cualquier caso.
- **Sin JavaScript** la invitación no se dibuja: hay un `<noscript>` con nombres,
  fecha y sede para que el enlace nunca quede en blanco.
- **La música sintetizada** es un respaldo digno, pero no sustituye a una canción
  de verdad. En cuanto exista el mp3, deja de usarse.
- El bloque `<meta>` de `index.html` hay que mantenerlo a mano (ver arriba).
