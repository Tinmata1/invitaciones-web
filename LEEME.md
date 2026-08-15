# Invitación de boda — Elena & Martín

Sitio de una sola página con animaciones cinematográficas (GSAP + ScrollTrigger).
El cielo viaja de la hora dorada a la medianoche conforme haces scroll, sincronizado
con el itinerario, y cierra con fuegos artificiales.

Publicado en: https://tinmata1.github.io/invitaciones-web/

## Estructura

```
.
├── index.html            (todo el sitio: HTML, CSS y JS en un archivo)
└── assets/
    ├── img/
    │   ├── risa.jpg          (foto galería)
    │   ├── baile.jpg         (foto galería)
    │   └── hero-poster.jpg   (respaldo del video hero)
    ├── video/
    │   ├── hero.mp4          (fondo del hero)
    │   ├── momento1.mp4      (galería)
    │   └── momento2.mp4      (galería)
    └── audio/
        └── musica.mp3    ← FALTA: coloca aquí tu archivo de música
```

No hay paso de build. GSAP y las fuentes se cargan por CDN, así que el sitio se
publica tal cual: cada push a `master` lo despliega solo (`.github/workflows/deploy.yml`).

## Música

El sitio **siempre suena**, haya o no archivo de audio:

- Si existe `assets/audio/musica.mp3`, se reproduce esa canción.
- Si no existe, la pieza se **sintetiza por código** con Web Audio: un arpegio
  de piano con reverb cuya armonía, registro, brillo y tempo viajan de la hora
  dorada a la medianoche siguiendo el mismo scroll que el cielo.

Para poner tu propia canción basta con dejar el mp3 en esa ruta: el cambio es
automático, no hay que tocar el código.

## Pendientes

- **Dirección provisional:** la sede es la del template (Catedral Basílica de
  Nuestra Señora de la Luz, León). Está marcada como tal en la propia página.
- **Datos de ejemplo:** los nombres de los padres siguen siendo los del
  template. Revísalos en `index.html`.

## Personalización rápida

- **Nombres:** busca `Elena` y `Martín` en `index.html`.
- **Fecha del contador:** línea `const target = new Date("2027-03-15T17:00:00")`.
- **Colores del cielo:** array `skyStops` en el `<script>`.
- **Sede y mapa:** sección `#ubicacion` (dirección, iframe y enlaces a Maps/Waze).
- **Vestimenta:** sección `#vestimenta` (texto, figuras SVG y paleta de colores).
- **Armonía de la música:** arrays `DAY` y `NIGHT` en el módulo `Music` (notas MIDI).
- **Fotos/videos:** reemplaza los archivos en `assets/` conservando los nombres,
  o edita las rutas en la sección `<section class="gallery">`.

## Notas

- Respeta `prefers-reduced-motion` (accesibilidad).
- Optimizado para móvil (donde se abren la mayoría de las invitaciones).
- Fotos comprimidas de ~8MB a ~250KB y videos con *faststart* para carga rápida.
