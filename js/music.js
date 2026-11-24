/*
 * "Canon in D" — Johann Pachelbel (domain publik)
 * Aransemen music-box sederhana yang disintesis langsung di browser (Web Audio API),
 * jadi tidak perlu file lagu & bebas masalah hak cipta.
 */
(function () {
  "use strict";
  const NOTE = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
  const hz = (n) => {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  };

  const Q = 0.72;                 // durasi 1 ketukan (detik)
  const BAR = Q * 2;              // satu nada bass = 2 ketukan
  const CYCLE = BAR * 8;          // satu putaran progresi akor

  const BASS = ["D3", "A2", "B2", "F#2", "G2", "D2", "G2", "A2"];
  const CHORDS = [
    ["D4", "F#4", "A4"], ["A3", "C#4", "E4"], ["B3", "D4", "F#4"], ["F#3", "A3", "C#4"],
    ["G3", "B3", "D4"], ["D4", "F#4", "A4"], ["G3", "B3", "D4"], ["A3", "C#4", "E4"],
  ];
  // Melodi (nada, durasi dalam ketukan)
  const half = (arr, oct) => arr.map((n) => [n, 2]);
  const MEL = {
    theme1: half(["F#5", "E5", "D5", "C#5", "B4", "A4", "B4", "C#5"]),
    theme2: half(["D5", "C#5", "B4", "A4", "G4", "F#4", "G4", "E4"]),
    quarters: ["D4", "F#4", "A4", "G4", "F#4", "D4", "F#4", "E4", "D4", "B3", "D4", "A4", "G4", "B4", "A4", "G4"]
      .map((n) => [n.replace(/\d/, (d) => +d + 1), 1]),
    eighths: [
      "F#5", "D5", "E5", "F#5", "E5", "C#5", "D5", "E5", "D5", "B4", "C#5", "D5", "C#5", "A4", "B4", "C#5",
      "B4", "G4", "A4", "B4", "A4", "F#4", "G4", "A4", "B4", "G4", "A4", "B4", "C#5", "A4", "B4", "C#5",
    ].map((n) => [n, 0.5]),
    high: half(["F#6", "E6", "D6", "C#6", "B5", "A5", "B5", "C#6"]),
  };
  const ORDER = [null, "theme1", "theme2", "quarters", "eighths", "high", "quarters", "theme1"];

  let ctx, master, wet, timer, cycle = 0, nextCycleAt = 0, playing = false;

  function impulse(sec) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    const verb = ctx.createConvolver(); verb.buffer = impulse(3);
    wet = ctx.createGain(); wet.gain.value = 0.45;
    master.connect(comp); master.connect(verb); verb.connect(wet); wet.connect(comp);
    comp.connect(ctx.destination);
  }

  // Nada music-box: fundamental + partial tinggi yang cepat meluruh
  function bell(freq, t, vel, len) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(master);
    [[1, 1, "sine"], [2, 0.25, "sine"], [3.01, 0.08, "triangle"]].forEach(([mul, amp, type]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = type; o.frequency.value = freq * mul; og.gain.value = amp;
      if (mul > 1) { og.gain.setValueAtTime(amp, t); og.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.35); }
      o.connect(og); og.connect(g); o.start(t); o.stop(t + len + 0.05);
    });
  }
  function bass(freq, t) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    f.type = "lowpass"; f.frequency.value = 700;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + BAR * 1.3);
    o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + BAR * 1.4);
  }

  function scheduleCycle(t0, idx) {
    const part = ORDER[idx === 0 ? 0 : 1 + ((idx - 1) % (ORDER.length - 1))];
    for (let i = 0; i < 8; i++) {
      const tb = t0 + i * BAR;
      bass(hz(BASS[i]), tb);
      const ch = CHORDS[i];
      [ch[0], ch[1], ch[2], ch[1]].forEach((n, k) => bell(hz(n), tb + k * Q / 2, k === 0 ? 0.07 : 0.045, 1.6));
    }
    if (part) {
      let t = t0;
      MEL[part].forEach(([n, beats]) => { bell(hz(n), t, beats >= 2 ? 0.2 : 0.15, Math.max(1.2, beats * Q * 1.6)); t += beats * Q; });
    }
  }

  function pump() {
    while (nextCycleAt < ctx.currentTime + 1.0) {
      scheduleCycle(nextCycleAt, cycle++);
      nextCycleAt += CYCLE;
    }
  }

  window.MusicBox = {
    get playing() { return playing; },
    play() {
      if (!ctx) { init(); nextCycleAt = ctx.currentTime + 0.15; }
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
      if (!timer) { pump(); timer = setInterval(pump, 250); }
      playing = true;
      return Promise.resolve();
    },
    pause() {
      if (!ctx) return;
      playing = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => { if (!playing) { ctx.suspend(); } }, 500);
    },
  };
})();
