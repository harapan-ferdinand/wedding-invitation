# Undangan Pernikahan Digital — Dimar & Septian

Undangan web statis (HTML/CSS/JS murni, tanpa build) bernuansa Islami, hijau zamrud & emas.

## Fitur
- Sampul dengan nama tamu otomatis dari URL: `index.html?to=Pak+Harapan+%26+Keluarga`
- Bismillah, salam, dan kutipan QS. Ar-Rum : 21
- Hitung mundur ke hari H + tombol "Simpan ke Kalender" (Google Calendar)
- Profil mempelai, rangkaian acara (Akad & Resepsi) dengan tautan Google Maps
- Linimasa kisah cinta, galeri dengan lightbox
- Form RSVP & ucapan (opsional diteruskan ke WhatsApp)
- Kartu rekening digital dengan tombol salin, alamat kirim kado
- Navigasi bawah, musik latar opsional, animasi kelopak bunga & scroll reveal

## Cara mengubah data
Semua isi diatur di **`js/config.js`** — nama lengkap, orang tua, tanggal, lokasi, rekening,
nomor WhatsApp, foto (taruh di folder `assets/`), dan musik.

## Menjalankan
Buka `index.html` di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
```

Untuk online, aktifkan **GitHub Pages** (Settings → Pages → branch ini, folder root).

> Catatan: ucapan tamu disimpan di browser masing-masing (localStorage). Agar ucapan
> terlihat oleh semua tamu, perlu backend (mis. Google Sheets / Firebase).
