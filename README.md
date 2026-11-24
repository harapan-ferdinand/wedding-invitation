# Undangan Pernikahan Digital — Andreas & Juwi

Undangan web statis (HTML/CSS/JS murni, tanpa build) bertema **Batak Kristen** dengan gaya **retro-vintage** cerah:
motif gorga & ulos, sunburst, perangko, tiket, polaroid, dan film strip.

## Fitur
- Sampul dengan nama tamu otomatis dari URL: `index.html?to=Pak+Harapan+%26+Keluarga`
- Sampul amplop vintage dengan segel lilin — ketuk untuk membuka, nama tamu diketik ala mesin ketik
- "Syalom & Horas!", ayat Matius 19 : 6, hitung mundur model flip, badge berputar, pita berjalan
- Mempelai dalam polaroid yang bergoyang, acara Resepsi dalam bentuk tiket
- Peta ilustrasi vintage (SVG, selalu tampil) dengan rumah adat Batak sebagai penanda; ketuk untuk membuka Google Maps
- Kisah cinta sebagai kartu pos (bisa digeser), galeri film strip yang bergerak + lightbox
- RSVP di kertas bergaris, ucapan tampil sebagai sticky notes (opsional diteruskan ke WhatsApp)
- Kartu rekening retro dengan tombol salin, confetti, progress bar ulos
- Musik: instrumental **"Inggir-Inggir"** (`assets/inggir-inggir-instrumental.mp3`, vokal dihilangkan
  dengan Demucs) — tombol piringan hitam di kanan bawah. Kosongkan `music` di config untuk kembali ke
  lagu bawaan "Horas Groove" (disintesis di browser).
- Foto dummy dari Unsplash (bebas pakai); bila gagal dimuat tampil ilustrasi pengganti

## Cara mengubah data
Semua isi diatur di **`js/config.js`** — nama lengkap, orang tua, tanggal, lokasi, rekening,
nomor WhatsApp, foto (taruh di folder `assets/`), dan musik.
Bagian bertanda `TODO` masih placeholder (nama lengkap & marga, orang tua, rekening, alamat kado).

## Menjalankan
Buka `index.html` di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
```

Untuk online, aktifkan **GitHub Pages** (Settings → Pages → branch ini, folder root).

> Catatan: ucapan tamu disimpan di browser masing-masing (localStorage). Agar ucapan
> terlihat oleh semua tamu, perlu backend (mis. Google Sheets / Firebase).
