(function () {
  "use strict";
  const C = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- tanggal (selalu WIB) ----------
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const parts = (iso) => {
    const d = new Date(new Date(iso).getTime() + 7 * 3600e3);
    return { day: DAYS[d.getUTCDay()], date: d.getUTCDate(), m: d.getUTCMonth(), month: MONTHS[d.getUTCMonth()], year: d.getUTCFullYear() };
  };
  const P = parts(C.date);
  const pad = (n) => String(n).padStart(2, "0");
  const binds = {
    "couple.short": C.couple.short,
    "bride.nickname": C.couple.bride.nickname,
    "groom.nickname": C.couple.groom.nickname,
    dateLong: `${P.day}, ${P.date} ${P.month} ${P.year}`,
    dateShort: `${P.day.toUpperCase()} · ${P.date} ${P.month.toUpperCase()} ${P.year}`,
    dateDots: `${pad(P.date)}.${pad(P.m + 1)}.${String(P.year).slice(2)}`,
  };
  $$("[data-bind]").forEach((el) => { if (binds[el.dataset.bind]) el.textContent = binds[el.dataset.bind]; });
  $("#badgeText").textContent = `HORAS · ${binds.dateDots} · SAVE THE DATE · ${binds.dateDots} · `;
  document.title = `The Wedding of ${C.couple.short}`;

  // ---------- nama tamu (?to=) dengan efek mesin ketik ----------
  const guest = (new URLSearchParams(location.search).get("to") || "").trim().slice(0, 80) || "Tamu Undangan";
  const gEl = $("#guestName");
  if (guest !== "Tamu Undangan") $("#rsvpName").value = guest;
  if (reduced) gEl.textContent = guest;
  else {
    gEl.textContent = ""; gEl.classList.add("typing");
    let i = 0;
    setTimeout(function type() {
      gEl.textContent = guest.slice(0, ++i);
      if (i < guest.length) setTimeout(type, 55 + Math.random() * 60);
      else setTimeout(() => gEl.classList.remove("typing"), 1200);
    }, 900);
  }

  // ---------- musik ----------
  const audio = $("#bgm");
  const vinyl = $("#musicBtn");
  const player = C.music
    ? { play: () => { if (!audio.src) audio.src = C.music; return audio.play(); }, pause: () => audio.pause(), get playing() { return !audio.paused; } }
    : window.MusicBox;
  const setVinyl = () => vinyl.classList.toggle("playing", player.playing);
  vinyl.addEventListener("click", () => {
    if (player.playing) { player.pause(); setVinyl(); }
    else player.play().then(setVinyl).catch(() => {});
  });

  // ---------- buka amplop ----------
  $("#openBtn").addEventListener("click", () => {
    $("#envelope").classList.add("open");
    player.play().then(setVinyl).catch(() => {});
    setTimeout(() => {
      $("#cover").classList.add("gone");
      document.body.classList.remove("locked");
      window.scrollTo(0, 0);
      burst();
    }, reduced ? 0 : 1900);
    setTimeout(() => $("#cover").remove(), 3000);
  });

  // ---------- hitung mundur ----------
  const target = new Date(C.date).getTime();
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  const set = (el, v) => { if (el.textContent !== v) { el.textContent = v; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); } };
  function tick() {
    let t = Math.max(0, target - Date.now());
    const d = Math.floor(t / 864e5); t -= d * 864e5;
    const h = Math.floor(t / 36e5); t -= h * 36e5;
    const m = Math.floor(t / 6e4); t -= m * 6e4;
    set(cd.d, String(d)); set(cd.h, pad(h)); set(cd.m, pad(m)); set(cd.s, pad(Math.floor(t / 1e3)));
  }
  tick(); setInterval(tick, 1000);

  // ---------- kalender & peta ----------
  const ev = C.events[0];
  const mapsLink = (e) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapsQuery || e.venue)}`;
  const gcal = (e) => {
    const f = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return "https://calendar.google.com/calendar/render?" + new URLSearchParams({
      action: "TEMPLATE", text: `${e.name} ${C.couple.short}`, dates: `${f(e.date)}/${f(e.end || e.date)}`,
      location: `${e.venue}, ${e.address}`, details: `Undangan ${e.name} ${C.couple.short}. ${location.href.split("?")[0]}`,
    });
  };
  $("#calBtn").href = gcal(ev);
  $("#mapEmbed").src = `https://maps.google.com/maps?q=${encodeURIComponent(ev.mapsQuery || ev.venue)}&z=15&output=embed`;

  // ---------- ayat ----------
  $("#verseText").textContent = `“${C.verse.text}”`;
  $("#verseRef").textContent = C.verse.ref;

  // ---------- foto dengan cadangan ----------
  const FALLBACK = ["#c8312b", "#2f7d79", "#7d1f1f", "#e8743b", "#221c18"];
  window.__imgFail = (img, label) => {
    const i = Math.abs([...label].reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK.length;
    img.outerHTML = `<div class="fallback-art" style="background:${FALLBACK[i]}">${esc(label)}</div>`;
  };
  const photo = (src, alt, label) =>
    `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="__imgFail(this, '${esc(label).replace(/'/g, "")}')">`;

  // ---------- mempelai ----------
  function person(p, role) {
    const ig = p.instagram ? `<a class="btn btn-mustard small ig" href="https://instagram.com/${encodeURIComponent(p.instagram)}" target="_blank" rel="noopener">@${esc(p.instagram)}</a>` : "";
    return `<div class="polaroid reveal pop"><span class="pin"></span>
        <div class="pic">${p.photo ? photo(p.photo, p.fullName, p.nickname.charAt(0)) : `<div class="fallback-art" style="background:var(--red)">${esc(p.nickname.charAt(0))}</div>`}</div>
        <span class="cap">${esc(p.nickname)} ♥</span></div>
      <p class="role reveal">${role}</p>
      <h3 class="full reveal">${esc(p.fullName)}</h3>
      <p class="parents reveal">${esc(p.parents)}</p>${ig}`;
  }
  $("#groom").innerHTML = person(C.couple.groom, "Mempelai Pria");
  $("#bride").innerHTML = person(C.couple.bride, "Mempelai Wanita");

  // ---------- tiket acara ----------
  $("#events").innerHTML = C.events.map((e, i) => {
    const p = parts(e.date);
    return `<article class="ticket reveal pop">
      <div class="ticket-main">
        <div class="ticket-band"></div>
        <p class="kicker" style="text-align:left">Admit · Tamu Kehormatan</p>
        <h3>${esc(e.name)}</h3>
        <div class="when"><span class="day-num">${p.date}</span>
          <span class="day-meta">${p.day}<br>${p.month}<br>${p.year}</span></div>
        <span class="time">⏰ ${esc(e.timeLabel)}</span>
        <p class="venue">📍 ${esc(e.venue)}</p>
        <p class="addr">${esc(e.address)}</p>
        <div class="actions">
          <a class="btn btn-red small" href="${mapsLink(e)}" target="_blank" rel="noopener">Buka Google Maps</a>
          <a class="btn btn-mustard small" href="${esc(gcal(e))}" target="_blank" rel="noopener">＋ Kalender</a>
        </div>
      </div>
      <div class="ticket-stub"><span class="stub-text">HORAS · No. ${pad(p.date)}${pad(p.m + 1)}${i + 1}</span><span class="barcode"></span></div>
    </article>`;
  }).join("");

  // ---------- kisah (kartu pos) ----------
  $("#postcards").innerHTML = C.story.map((s, i) =>
    `<article class="postcard reveal" style="transition-delay:${i * 0.12}s">
      <div class="pc-stamp">${esc(s.year)}</div>
      <p class="pc-label">KARTU POS · BAB ${i + 1}</p>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
      <span class="pc-band"></span>
    </article>`).join("");

  // ---------- galeri film ----------
  const frames = (list, offset) => list.map((src, i) =>
    `<button class="frame" data-src="${esc(src)}" aria-label="Lihat foto ${i + 1}">${photo(src, "Foto " + (i + 1), "♥")}</button>`).join("");
  const g = C.gallery;
  const half = Math.ceil(g.length / 2);
  const a = g.slice(0, half), b = g.slice(half).concat(g.slice(0, Math.max(0, half - (g.length - half))));
  $("#film1").innerHTML = frames(a) + frames(a) + frames(a) + frames(a);
  $("#film2").innerHTML = frames(b) + frames(b) + frames(b) + frames(b);
  const lb = $("#lightbox");
  document.addEventListener("click", (e) => {
    const f = e.target.closest(".frame");
    if (f) { $(".lb-content", lb).innerHTML = `<img src="${esc(f.dataset.src)}" alt="">`; lb.hidden = false; }
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "BUTTON") lb.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.hidden = true; });

  // ---------- hadiah ----------
  $("#gifts").innerHTML = C.gifts.map((x, i) => `
    <div class="bank-card reveal pop">
      <span class="sun"></span><span class="band"></span>
      <span class="bank">${esc(x.bank)}</span>
      <span class="chip"></span>
      <p class="no" id="acc${i}">${esc(x.number)}</p>
      <div class="row"><span class="holder">a.n. ${esc(x.holder)}</span>
        <button class="btn ${i % 2 ? "btn-mustard" : "btn-ink"} small" data-copy-target="acc${i}">Salin</button></div>
    </div>`).join("");
  $("#giftAddress").textContent = C.giftAddress;

  const toast = (msg) => {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy-target]");
    if (!btn) return;
    const text = $("#" + btn.dataset.copyTarget).textContent.replace(/\s+/g, btn.dataset.copyTarget.startsWith("acc") ? "" : " ").trim();
    const done = () => toast("Tersalin ✓ Mauliate!");
    const fallback = () => { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (_) {} ta.remove(); };
    navigator.clipboard ? navigator.clipboard.writeText(text).then(done, fallback) : fallback();
  });

  // ---------- RSVP & ucapan ----------
  const KEY = "wishes:" + C.couple.short;
  const seed = [
    { name: "Keluarga Besar", attend: "Hadir", message: "Selamat menempuh hidup baru! Kiranya Tuhan Yesus memberkati rumah tangga kalian. Horas!", at: Date.now() - 2 * 864e5 },
    { name: "Sahabat", attend: "Hadir", message: "Gabe ma hamu, saur matua bulung! Bahagia selalu ya Dimar & Septian 🤍", at: Date.now() - 5 * 36e5 },
  ];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } };
  const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (_) {} };
  const ago = (t) => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    return Math.floor(s / 86400) + " hari lalu";
  };
  function renderWishes() {
    const list = load().concat(seed).sort((x, y) => y.at - x.at);
    $("#wishCount").textContent = list.length;
    $("#statHadir").textContent = list.filter((w) => w.attend === "Hadir").length;
    $("#wishes").innerHTML = list.map((w, i) =>
      `<li style="animation-delay:${Math.min(i, 8) * 0.06}s"><div class="who">${esc(w.name)}<span class="badge-s">${esc(w.attend)}</span></div>
       <p>${esc(w.message)}</p><span class="when">${ago(w.at)}</span></li>`).join("");
  }
  renderWishes();
  $("#rsvpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const w = { name: f.get("name").trim(), attend: f.get("attend"), guests: f.get("guests"), message: f.get("message").trim(), at: Date.now() };
    if (!w.name || !w.message) return;
    const list = load(); list.push(w); save(list); renderWishes();
    e.target.message.value = "";
    toast("Mauliate godang atas doanya! 🤍");
    burst();
    if (C.whatsapp) {
      const text = `Syalom/Horas, saya ${w.name} konfirmasi kehadiran di pernikahan ${C.couple.short}.\n\nKehadiran: ${w.attend}\nJumlah: ${w.guests} orang\n\nUcapan: ${w.message}`;
      window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      $("#formNote").textContent = "Konfirmasi juga dikirim lewat WhatsApp.";
    }
  });

  // ---------- reveal ----------
  const io = new IntersectionObserver((en) => en.forEach((x) => {
    if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
  }), { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));

  // ---------- navigasi aktif & progress ----------
  const links = $$(".dock a");
  const navIo = new IntersectionObserver((en) => en.forEach((x) => {
    if (x.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + x.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const s = $(a.getAttribute("href")); if (s) navIo.observe(s); });
  const bar = $("#progressBar");
  addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  }, { passive: true });

  // ---------- confetti retro ----------
  const cv = $("#confetti"), ctx = cv.getContext("2d");
  const COLORS = ["#c8312b", "#f2b33d", "#2f7d79", "#221c18", "#e8743b", "#f6b9a8"];
  let W, H, bits = [], running = false;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener("resize", resize);
  const mk = (burstMode) => ({
    x: burstMode ? W / 2 + (Math.random() - 0.5) * 80 : Math.random() * W,
    y: burstMode ? H * 0.45 : -20,
    vx: burstMode ? (Math.random() - 0.5) * 14 : (Math.random() - 0.5) * 0.6,
    vy: burstMode ? -Math.random() * 13 - 3 : 0.6 + Math.random() * 0.9,
    r: 4 + Math.random() * 6, a: Math.random() * 6.3, va: (Math.random() - 0.5) * 0.15,
    shape: (Math.random() * 4) | 0, c: COLORS[(Math.random() * COLORS.length) | 0], burst: burstMode, life: 1,
  });
  function draw(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.burst ? p.life : 0.55;
    ctx.fillStyle = ctx.strokeStyle = p.c; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    ctx.beginPath();
    if (p.shape === 0) { ctx.arc(0, 0, p.r * 0.6, 0, 6.3); ctx.fill(); }
    else if (p.shape === 1) { ctx.fillRect(-p.r * 0.7, -p.r * 0.35, p.r * 1.4, p.r * 0.7); }
    else if (p.shape === 2) { for (let k = 0; k < 4; k++) { ctx.lineTo(Math.cos(k * 1.57) * p.r, Math.sin(k * 1.57) * p.r); ctx.lineTo(Math.cos(k * 1.57 + .78) * p.r * .35, Math.sin(k * 1.57 + .78) * p.r * .35); } ctx.closePath(); ctx.fill(); }
    else { ctx.moveTo(-p.r, 0); ctx.quadraticCurveTo(-p.r / 2, -p.r, 0, 0); ctx.quadraticCurveTo(p.r / 2, p.r, p.r, 0); ctx.stroke(); }
    ctx.restore();
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    bits.forEach((p, i) => {
      if (p.burst) { p.vy += 0.32; p.vx *= 0.985; p.life -= 0.006; }
      else { p.x += Math.sin((p.y + i * 40) / 60) * 0.4; }
      p.x += p.vx; p.y += p.vy; p.a += p.va; draw(p);
    });
    bits = bits.filter((p) => p.burst ? p.life > 0 && p.y < H + 30 : p.y < H + 30);
    while (bits.filter((p) => !p.burst).length < 16) bits.push(mk(false));
    requestAnimationFrame(loop);
  }
  function burst() {
    if (reduced) return;
    for (let i = 0; i < 90; i++) bits.push(mk(true));
    if (!running) { running = true; loop(); }
  }
})();
