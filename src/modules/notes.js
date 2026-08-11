const GLYPHS = ["♪", "♫", "♩", "♬"];

export function initNotesField() {
  const field = document.querySelector("[data-notes]");
  if (!field) return;

  const count = 18;
  for (let i = 0; i < count; i++) {
    const note = document.createElement("span");
    note.className = "note";
    note.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    note.style.left = `${Math.random() * 100}%`;
    note.style.fontSize = `${1.3 + Math.random() * 1.6}rem`;
    note.style.animationDuration = `${5 + Math.random() * 4}s`;
    note.style.animationDelay = `${Math.random() * 5}s`;
    field.appendChild(note);
  }
}
