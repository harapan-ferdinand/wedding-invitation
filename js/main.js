(function () {
  "use strict";
  const C = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  // Format dates in WIB regardless of the viewer's timezone.
  function parts(iso) {
    const d = new Date(new Date(iso).getTime() + 7 * 3600e3);
    return { day: DAYS[d.getUTCDay()], date: d.getUTCDate(), month: MONTHS[d.getUTCMonth()], year: d.getUTCFullYear() };
  }
  const main = parts(C.date);
  const binds = {
    "couple.short": C.couple.short,
    "bride.nickname": C.couple.bride.nickname,
    "groom.nickname": C.couple.groom.nickname,
    dateLong: `${main.day}, ${main.date} ${main.month} ${main.year}`,
  };
  $$("[data-bind]").forEach((el) => { if (binds[el.dataset.bind]) el.textContent = binds[el.dataset.bind]; });
  document.title = `Undangan Pernikahan ${C.couple.short}`;

  // ---------- guest name from ?to= ----------
  const params = new URLSearchParams(location.search);
  const guest = (params.get("to") || "").trim().slice(0, 80);
  if (guest) {
    $("#guestName").textContent = guest;
    $("#rsvpName").value = guest;
  }

  // ---------- open invitation ----------
  const audio = $("#bgm");
  const musicBtn = $("#musicBtn");
  if (C.music) { audio.src = C.music; musicBtn.hidden = false; }
  function setPlaying(p) { musicBtn.classList.toggle("playing", p); }
  musicBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
    else { audio.pause(); setPlaying(false); }
  });

  $("#openBtn").addEventListener("click", () => {
    $("#cover").classList.add("opened");
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
    if (C.music) audio.play().then(() => setPlaying(true)).catch(() => {});
    startPetals();
    setTimeout(() => $("#cover").remove(), 1300);
  });

  // ---------- countdown ----------
  const target = new Date(C.date).getTime();
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    $("#cd-d").textContent = d;
    $("#cd-h").textContent = String(h).padStart(2, "0");
    $("#cd-m").textContent = String(m).padStart(2, "0");
    $("#cd-s").textContent = String(s).padStart(2, "0");
  }
  tick(); setInterval(tick, 1000);

  // ---------- calendar link ----------
  const gcal = (ev) => {
    const f = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: `${ev.name} ${C.couple.short}`,
      dates: `${f(ev.date)}/${f(ev.end || ev.date)}`,
      location: `${ev.venue}, ${ev.address}`,
      details: `Undangan pernikahan ${C.couple.short}`,
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  };
  $("#calBtn").href = gcal({ ...C.events[0], end: C.events[C.events.length - 1].end });

  // ---------- couple ----------
  function person(p, role) {
    const pic = p.photo
      ? `<img src="${esc(p.photo)}" alt="${esc(p.fullName)}" loading="lazy">`
      : `<span class="initial">${esc(p.nickname.charAt(0))}</span>`;
    const ig = p.instagram ? `<a class="ig" href="https://instagram.com/${encodeURIComponent(p.instagram)}" target="_blank" rel="noopener">@${esc(p.instagram)}</a>` : "";
    return `<div class="portrait">${pic}</div>
      <p class="eyebrow">${role}</p>
      <h3 class="nick">${esc(p.nickname)}</h3>
      <p class="full">${esc(p.fullName)}</p>
      <p class="parents">${esc(p.parents)}</p>${ig}`;
  }
  $("#bride").innerHTML = person(C.couple.bride, "Mempelai Wanita");
  $("#groom").innerHTML = person(C.couple.groom, "Mempelai Pria");

  // ---------- events ----------
  $("#events").innerHTML = C.events.map((ev) => {
    const p = parts(ev.date);
    return `<article class="card event-card reveal">
      <h3>${esc(ev.name)}</h3>
      <div class="event-big">
        <span class="side">${p.day}</span><span class="num">${p.date}</span><span class="side">${p.month}<br>${p.year}</span>
      </div>
      <p class="event-day">Pukul ${esc(ev.timeLabel)}</p>
      <p class="venue">${esc(ev.venue)}</p>
      <p class="addr">${esc(ev.address)}</p>
      <a class="btn btn-small" href="${esc(ev.maps)}" target="_blank" rel="noopener">Lihat Lokasi</a>
      <a class="btn btn-small" href="${esc(gcal(ev))}" target="_blank" rel="noopener">+ Kalender</a>
    </article>`;
  }).join("");

  // ---------- story ----------
  $("#timeline").innerHTML = C.story.map((s) =>
    `<li class="reveal"><span class="yr">${esc(s.year)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`
  ).join("");

  // ---------- gallery ----------
  const palettes = [["#1b4d43", "#0b2a24"], ["#c9a45c", "#9c7a36"], ["#2a6457", "#123b33"], ["#e8d3a2", "#c9a45c"], ["#123b33", "#2a6457"], ["#9c7a36", "#1b4d43"]];
  const motifs = [
    '<path d="M50 85S15 62 15 38a17 17 0 0135-6 17 17 0 0135 6c0 24-35 47-35 47z"/>',
    '<circle cx="40" cy="50" r="22"/><circle cx="60" cy="50" r="22"/>',
    '<path d="M50 10l10 30 30 10-30 10-10 30-10-30-30-10 30-10z"/>',
    '<path d="M20 80V40a30 30 0 0160 0v40z"/><path d="M50 18v62"/>',
    '<path d="M50 20c-8 14-8 30 0 60 8-30 8-46 0-60zM20 50c14-8 30-8 60 0-30 8-46 8-60 0z"/>',
    '<path d="M30 30h40v40H30z" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="8"/>',
  ];
  const art = (i) => {
    const [a, b] = palettes[i % palettes.length];
    return `<div class="art" style="background:linear-gradient(150deg,${a},${b})"><svg viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4">${motifs[i % motifs.length]}</svg></div>`;
  };
  const photos = C.gallery && C.gallery.length ? C.gallery : null;
  const n = photos ? photos.length : 6;
  $("#galleryGrid").innerHTML = Array.from({ length: n }, (_, i) =>
    `<div class="tile reveal" data-i="${i}" tabindex="0" role="button" aria-label="Lihat foto ${i + 1}">${photos ? `<img src="${esc(photos[i])}" alt="Foto ${i + 1}" loading="lazy">` : art(i)}</div>`
  ).join("");
  const lb = $("#lightbox");
  const openLb = (i) => { $(".lb-content", lb).innerHTML = photos ? `<img src="${esc(photos[i])}" alt="">` : art(i); lb.hidden = false; };
  $$(".tile").forEach((t) => {
    t.addEventListener("click", () => openLb(+t.dataset.i));
    t.addEventListener("keydown", (e) => { if (e.key === "Enter") openLb(+t.dataset.i); });
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "BUTTON") lb.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.hidden = true; });

  // ---------- gifts ----------
  $("#gifts").innerHTML = C.gifts.map((g, i) => `
    <div class="bank-card reveal">
      <div class="chip"></div><span class="bank">${esc(g.bank)}</span>
      <p class="no" id="acc${i}">${esc(g.number)}</p>
      <div class="row"><span class="holder">a.n. ${esc(g.holder)}</span>
      <button class="btn btn-small" data-copy-target="acc${i}">Salin</button></div>
    </div>`).join("");
  $("#giftAddress").textContent = C.giftAddress;

  const toast = (msg) => {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy-target]");
    if (!b) return;
    const text = $("#" + b.dataset.copyTarget).textContent.trim();
    const done = () => toast("Berhasil disalin ✓");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  });
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
    ta.select(); try { document.execCommand("copy"); cb(); } catch (_) {} ta.remove();
  }

  // ---------- RSVP & wishes ----------
  const KEY = "wishes:" + C.couple.short;
  const seed = [
    { name: "Keluarga Besar", attend: "Hadir", message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. Semoga menjadi keluarga sakinah, mawaddah, warahmah.", at: Date.now() - 864e5 },
  ];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } };
  const save = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) {} };
  const ago = (t) => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    return Math.floor(s / 86400) + " hari lalu";
  };
  function renderWishes() {
    const list = load().concat(seed).sort((a, b) => b.at - a.at);
    $("#wishCount").textContent = list.length;
    $("#statHadir").textContent = list.filter((w) => w.attend === "Hadir").length;
    $("#wishes").innerHTML = list.map((w) =>
      `<li><div class="who">${esc(w.name)} <span class="badge">${esc(w.attend)}</span></div>
       <p>${esc(w.message)}</p><span class="when">${ago(w.at)}</span></li>`
    ).join("");
  }
  renderWishes();

  $("#rsvpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const w = {
      name: f.get("name").trim(), attend: f.get("attend"), guests: f.get("guests"),
      message: f.get("message").trim(), at: Date.now(),
    };
    if (!w.name || !w.message) return;
    const list = load(); list.push(w); save(list); renderWishes();
    e.target.message.value = "";
    toast("Terima kasih atas doa & ucapannya 🤍");
    if (C.whatsapp) {
      const text = `Assalamualaikum, saya ${w.name} ingin konfirmasi kehadiran di pernikahan ${C.couple.short}.\n\nKehadiran: ${w.attend}\nJumlah tamu: ${w.guests}\n\nUcapan: ${w.message}`;
      window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      $("#formNote").textContent = "Konfirmasi juga dikirim melalui WhatsApp.";
    }
  });

  // ---------- reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));

  // ---------- active nav ----------
  const links = $$(".dock a");
  const sections = links.map((a) => $(a.getAttribute("href")));
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && navIo.observe(s));

  // ---------- falling petals ----------
  function startPetals() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = $("#petals"), ctx = cv.getContext("2d");
    let W, H; const dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const colors = ["#e8d3a2", "#c9a45c", "#f6e7e1", "#ffffff"];
    const petals = Array.from({ length: 22 }, () => mk(true));
    function mk(init) {
      return { x: Math.random() * W, y: init ? Math.random() * H : -20, r: 4 + Math.random() * 6, vy: .4 + Math.random() * .9,
        vx: -.3 + Math.random() * .6, a: Math.random() * 6.28, va: -.02 + Math.random() * .04, sway: Math.random() * 6.28,
        c: colors[(Math.random() * colors.length) | 0], o: .35 + Math.random() * .45 };
    }
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      petals.forEach((p, i) => {
        p.sway += .02; p.x += p.vx + Math.sin(p.sway) * .5; p.y += p.vy; p.a += p.va;
        if (p.y > H + 20) petals[i] = mk(false);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      requestAnimationFrame(loop);
    })();
  }
})();
