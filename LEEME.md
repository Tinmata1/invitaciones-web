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

## Pendientes

- **Música:** falta `assets/audio/musica.mp3`. Sin él, el botón de audio aparece
  pero no suena nada (el sitio no se rompe).
- **Datos de ejemplo:** los nombres de los padres, la sede de la ceremonia y la
  ciudad siguen siendo los del template. Revísalos en `index.html`.

## Personalización rápida

- **Nombres:** busca `Elena` y `Martín` en `index.html`.
- **Fecha del contador:** línea `const target = new Date("2027-03-15T17:00:00")`.
- **Colores del cielo:** array `skyStops` en el `<script>`.
- **Fotos/videos:** reemplaza los archivos en `assets/` conservando los nombres,
  o edita las rutas en la sección `<section class="gallery">`.

## Notas

- Respeta `prefers-reduced-motion` (accesibilidad).
- Optimizado para móvil (donde se abren la mayoría de las invitaciones).
- Fotos comprimidas de ~8MB a ~250KB y videos con *faststart* para carga rápida.
