/*
 * "Horas Groove" — lagu orisinal bergaya retro-disco yang ceria (124 BPM).
 * Disintesis langsung di browser dengan Web Audio API: tidak perlu file lagu,
 * bebas masalah hak cipta. Ganti dengan MP3 sendiri lewat `music` di config.js.
 */
(function () {
  "use strict";
  const NOTE = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
  const hz = (n) => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12); };

  const BPM = 124, BEAT = 60 / BPM, E8 = BEAT / 2, S16 = BEAT / 4, BAR = BEAT * 4;

  // Progresi I–V–vi–IV di D mayor
  const ROOTS = ["D2", "A1", "B1", "G1"];
  const CHORDS = [["D4", "F#4", "A4"], ["C#4", "E4", "A4"], ["D4", "F#4", "B4"], ["D4", "G4", "B4"]];
  // Melodi: [posisi (1/8), nada, panjang (1/8)]
  const A = [
    [[0, "A5", 1], [1, "F#5", 1], [2, "A5", 1], [3, "B5", 1], [4, "A5", 2], [6, "F#5", 1], [7, "E5", 1]],
    [[0, "E5", 2], [2, "C#5", 1], [3, "E5", 1], [4, "A5", 2], [6, "G5", 1], [7, "F#5", 1]],
    [[0, "F#5", 1], [1, "D5", 1], [2, "F#5", 1], [3, "B5", 1], [4, "A5", 1], [5, "F#5", 1], [6, "D5", 1], [7, "E5", 1]],
    [[0, "D5", 3], [3, "B4", 1], [4, "D5", 1], [5, "E5", 1], [6, "F#5", 2]],
  ];
  const B = [
    [[0, "D6", 1], [1, "D6", 1], [2, "C#6", 1], [3, "D6", 1], [4, "A5", 2], [6, "F#5", 2]],
    [[0, "C#6", 1], [1, "C#6", 1], [2, "B5", 1], [3, "C#6", 1], [4, "E6", 2], [6, "A5", 2]],
    [[0, "B5", 1], [1, "B5", 1], [2, "A5", 1], [3, "B5", 1], [4, "D6", 1], [5, "C#6", 1], [6, "B5", 1], [7, "A5", 1]],
    [[0, "G5", 1], [1, "A5", 1], [2, "B5", 1], [3, "D6", 1], [4, "E6", 2], [6, "F#6", 2]],
  ];
  // Urutan per 4 birama: intro, A, A, B, B, (jeda tanpa melodi), A, B ...
  const FORM = [null, A, A, B, B, "break", A, B];

  let ctx, master, verbSend, noise, timer, bar = 0, nextBarAt = 0, playing = false;

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0;
    master.connect(comp); comp.connect(ctx.destination);
    // reverb ringan
    const verb = ctx.createConvolver(), len = ctx.sampleRate * 1.4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = buf; verbSend = ctx.createGain(); verbSend.gain.value = 0.22;
    verbSend.connect(verb); verb.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }

  const env = (g, t, peak, attack, decay) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    env(g, t, 0.9, 0.004, 0.28); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.32);
  }
  function hit(t, type, freq, peak, decay, q) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    env(g, t, peak, 0.002, decay); s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5); s.stop(t + decay + 0.05);
  }
  const clap = (t) => { [0, 0.012, 0.024].forEach((d) => hit(t + d, "bandpass", 1500, 0.35, 0.12, 1.2)); };
  const hat = (t, open) => hit(t, "highpass", 8000, open ? 0.12 : 0.07, open ? 0.18 : 0.04);
  const shaker = (t) => hit(t, "highpass", 6000, 0.025, 0.03);

  function bass(freq, t, len) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = freq;
    f.type = "lowpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(260, t + len);
    env(g, t, 0.32, 0.006, len); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + len + 0.05);
  }
  function stab(notes, t) {
    notes.forEach((n) => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "square"; o.frequency.value = hz(n) * (1 + (Math.random() - 0.5) * 0.004);
      f.type = "lowpass"; f.frequency.value = 2200;
      env(g, t, 0.045, 0.005, 0.16); o.connect(f); f.connect(g); g.connect(master); g.connect(verbSend);
      o.start(t); o.stop(t + 0.22);
    });
  }
  function lead(n, t, len) {
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 4200;
    env(g, t, 0.16, 0.008, Math.max(0.18, len * 1.1));
    f.connect(g); g.connect(master); g.connect(verbSend);
    [["square", 1, 0.5], ["triangle", 2, 0.35], ["sawtooth", 1.003, 0.2]].forEach(([type, mul, amp]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = type; o.frequency.value = hz(n) * mul; og.gain.value = amp;
      const lfo = ctx.createOscillator(), lg = ctx.createGain();       // sedikit vibrato
      lfo.frequency.value = 5.5; lg.gain.value = hz(n) * 0.004;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(og); og.connect(f);
      o.start(t); lfo.start(t); o.stop(t + len * 1.2 + 0.2); lfo.stop(t + len * 1.2 + 0.2);
    });
  }

  function scheduleBar(t0, idx) {
    const chord = idx % 4, part = FORM[idx < 4 ? 0 : 1 + (Math.floor((idx - 4) / 4) % (FORM.length - 1))];
    const isBreak = part === "break";
    for (let b = 0; b < 4; b++) {
      const tb = t0 + b * BEAT;
      if (!isBreak || b === 0) kick(tb);
      if (b % 2 === 1) clap(tb);
      hat(tb + E8, true);
      for (let s = 0; s < 4; s++) shaker(tb + s * S16);
    }
    // bass oktaf memantul (disco)
    const root = hz(ROOTS[chord]);
    for (let e = 0; e < 8; e++) bass(e % 2 ? root * 2 : root, t0 + e * E8, E8 * 0.9);
    // akor di ketukan lepas (offbeat)
    for (let e = 1; e < 8; e += 2) stab(CHORDS[chord], t0 + e * E8);
    // melodi
    if (Array.isArray(part)) part[chord].forEach(([pos, n, l]) => lead(n, t0 + pos * E8, l * E8));
    // fill drum di akhir setiap 4 birama
    if (chord === 3) [0, 1, 2, 3].forEach((s) => hit(t0 + 3 * BEAT + s * S16, "bandpass", 900 + s * 300, 0.25, 0.08, 1));
  }

  function pump() {
    while (nextBarAt < ctx.currentTime + 0.6) { scheduleBar(nextBarAt, bar++); nextBarAt += BAR; }
  }

  window.MusicBox = {
    get playing() { return playing; },
    play() {
      if (!ctx) { init(); nextBarAt = ctx.currentTime + 0.12; }
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.3);
      if (!timer) { pump(); timer = setInterval(pump, 150); }
      playing = true;
      return Promise.resolve();
    },
    pause() {
      if (!ctx) return;
      playing = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 400);
    },
  };
})();
