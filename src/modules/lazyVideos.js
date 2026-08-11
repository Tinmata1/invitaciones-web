/**
 * Videos secundarios (no el hero): no descargan hasta acercarse al
 * viewport. Al activarse, se precargan completos como Blob (ver
 * heroVideo.js para el porqué) y luego reproducen en loop.
 */
export function initLazyVideos() {
  const videos = document.querySelectorAll("video[data-lazy-src]");
  if (!videos.length) return;

  const loading = new WeakSet();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        if (video.src) {
          video.play().catch(() => {});
          return;
        }

        if (loading.has(video)) return;
        loading.add(video);

        fetch(video.dataset.lazySrc)
          .then((res) => res.blob())
          .then((blob) => {
            video.src = URL.createObjectURL(blob);
            video.load();
            video.play().catch(() => {});
          })
          .catch(() => {});
      });
    },
    { rootMargin: "200px" }
  );

  videos.forEach((video) => observer.observe(video));
}
