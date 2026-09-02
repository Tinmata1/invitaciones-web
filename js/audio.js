/* ============================================================================
   MÚSICA
   ----------------------------------------------------------------------------
   Nunca suena sin que el invitado lo pida: arranca en el clic de "Abrir
   invitación", que es exactamente lo que exigen Safari/iOS y Chrome para
   permitir audio.

   Si existe el mp3, se reproduce. Si no existe, la pieza se sintetiza por
   código: un arpegio con reverb cuya armonía, registro, brillo y tempo viajan
   de la hora dorada a la medianoche siguiendo el mismo progreso que el cielo.
   ============================================================================ */

const KEY = "invitacion:audio";

export const Music = (() => {
  let el = null;
  let mode = null;              // "file" | "synth" | null
  let on = false;
  let cfg = { src: null, synthFallback: true, volume: 0.55 };

  /* --- Sintetizador de respaldo --- */
  let ctx, master, timer, step = 0, nextT = 0;

  // Progresiones (notas MIDI): cálida al atardecer → profunda a medianoche
  const DAY   = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 66]];
  const NIGHT = [[57, 60, 64, 71], [53, 57, 60, 64], [50, 53, 57, 60], [52, 55, 59, 62]];
  const ARP = [0, 1, 2, 3, 2, 1, 0, 2];
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const night = () => window.__nightProgress || 0;

  // Reverb de sala: respuesta al impulso de ruido decreciente
  function impulse(sec, decay) {
    const sr = ctx.sampleRate;
    const len = Math.max(1, Math.floor(sr * sec));
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // Una nota: triangular + armónico senoidal, ataque rápido, caída larga
  function note(f, t, dur, vel) {
    const p = night();
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const hg = ctx.createGain();
    const lp = ctx.createBiquadFilter();

    o.type = "triangle"; o.frequency.value = f;
    o2.type = "sine";    o2.frequency.value = f * 2.005;
    hg.gain.value = 0.3;
    lp.type = "lowpass"; lp.frequency.value = 1500 - p * 760; lp.Q.value = 0.7;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.connect(g); o2.connect(hg); hg.connect(g); g.connect(lp); lp.connect(master);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.06); o2.stop(t + dur + 0.06);
  }

  // Planificador con anticipación: agenda las notas por venir
  function tick() {
    if (!ctx) return;
    const p = night();
    const ahead = ctx.currentTime + 0.9;
    let guard = 0;
    while (nextT < ahead && guard++ < 64) {
      const set = p < 0.5 ? DAY : NIGHT;
      const chord = set[Math.floor(step / 8) % set.length];
      const i = step % 8;
      note(hz(chord[ARP[i]] + 12), nextT, 2.7, 0.15);
      if (i === 0) note(hz(chord[0] - 12), nextT, 4.4, 0.12);            // bajo por compás
      if (i === 4 && p > 0.4) note(hz(chord[3] + 24), nextT, 3.4, 0.05); // brillo de noche
      nextT += 0.60 + p * 0.26;                                          // se remansa al oscurecer
      step++;
    }
  }

  function startSynth() {
    if (!cfg.synthFallback) return false;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      const verb = ctx.createConvolver();
      verb.buffer = impulse(3.2, 2.4);
      const wet = ctx.createGain();
      wet.gain.value = 0.38;
      master.connect(ctx.destination);
      master.connect(verb); verb.connect(wet); wet.connect(ctx.destination);
      nextT = ctx.currentTime + 0.15;
      tick();
      timer = setInterval(tick, 200);
      master.gain.setTargetAtTime(cfg.volume * 0.36, ctx.currentTime, 2.2);
      mode = "synth"; on = true;
      return true;
    } catch {
      return false;
    }
  }

  return {
    configure(audioConfig = {}) {
      cfg = { ...cfg, ...audioConfig };
      el = document.getElementById("audio");
      if (el && cfg.src) { el.src = cfg.src; el.volume = cfg.volume; }
      return this;
    },

    /** Arranca tras la interacción. Devuelve true si algo está sonando. */
    async start() {
      if (sessionStorage.getItem(KEY) === "off") return false;
      if (el && cfg.src) {
        try {
          await el.play();
          mode = "file"; on = true;
          return true;
        } catch { /* no hay archivo, o el navegador lo rechazó: al sintetizador */ }
      }
      return startSynth();
    },

    /** Alterna y recuerda la decisión durante la sesión. */
    toggle() {
      if (mode === "file") {
        if (el.paused) { el.play().catch(() => {}); on = true; }
        else { el.pause(); on = false; }
      } else if (mode === "synth") {
        if (on) { master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25); on = false; }
        else { ctx.resume(); master.gain.setTargetAtTime(cfg.volume * 0.36, ctx.currentTime, 0.8); on = true; }
      } else {
        // Nunca llegó a arrancar (p. ej. sesión marcada como "off"): reintenta
        sessionStorage.removeItem(KEY);
        this.start();
        return true;
      }
      sessionStorage.setItem(KEY, on ? "on" : "off");
      return on;
    },

    get playing() { return on; },
  };
})();

export default Music;
