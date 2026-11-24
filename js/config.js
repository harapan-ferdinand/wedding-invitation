/*
 * ============================================================
 *  KONFIGURASI UNDANGAN
 *  Ubah data di bawah ini sesuai detail acara yang sebenarnya.
 *  Semua teks di halaman diambil dari sini.
 * ============================================================
 */
window.WEDDING = {
  couple: {
    short: "Dimar & Septian",
    bride: {
      nickname: "Dimar",
      fullName: "Dimar Ayu Lestari, S.Pd.",          // TODO: ganti nama lengkap
      parents: "Putri dari Bapak Fulan & Ibu Fulanah", // TODO
      instagram: "",                                   // contoh: "dimar.ayu" (opsional)
      photo: "",                                       // contoh: "assets/dimar.jpg" (opsional)
    },
    groom: {
      nickname: "Septian",
      fullName: "Septian Pratama, S.T.",               // TODO
      parents: "Putra dari Bapak Fulan & Ibu Fulanah", // TODO
      instagram: "",
      photo: "",
    },
  },

  // Tanggal utama (dipakai untuk hitung mundur). Format ISO dengan zona waktu.
  date: "2026-12-20T08:00:00+07:00", // TODO

  events: [
    {
      name: "Akad Nikah",
      date: "2026-12-20T08:00:00+07:00",
      end: "2026-12-20T10:00:00+07:00",
      timeLabel: "08.00 – 10.00 WIB",
      venue: "Kediaman Mempelai Wanita",
      address: "Jl. Melati No. 12, Kel. Sukamaju, Kota Bandung", // TODO
      maps: "https://maps.google.com/?q=Bandung",                 // TODO
    },
    {
      name: "Resepsi",
      date: "2026-12-20T11:00:00+07:00",
      end: "2026-12-20T14:00:00+07:00",
      timeLabel: "11.00 – 14.00 WIB",
      venue: "Gedung Serbaguna Al-Ikhlas",
      address: "Jl. Mawar No. 45, Kota Bandung",
      maps: "https://maps.google.com/?q=Bandung",
    },
  ],

  story: [
    { year: "2019", title: "Pertama Bertemu", text: "Allah mempertemukan kami dalam sebuah kegiatan kampus. Sapaan sederhana yang tak disangka menjadi awal segalanya." },
    { year: "2022", title: "Saling Mengenal", text: "Waktu mengajarkan kami untuk saling memahami, menguatkan, dan tumbuh bersama dalam kebaikan." },
    { year: "2025", title: "Lamaran", text: "Dengan restu kedua keluarga, kami mengikat niat baik dalam sebuah acara lamaran yang hangat." },
    { year: "2026", title: "Hari Bahagia", text: "Bismillah, kami melangkah ke jenjang pernikahan untuk menyempurnakan separuh agama." },
  ],

  // Daftar foto galeri. Kosongkan untuk memakai ilustrasi bawaan.
  gallery: [
    // "assets/gallery-1.jpg",
  ],

  gifts: [
    { bank: "BCA", number: "1234567890", holder: "Dimar Ayu Lestari" },     // TODO
    { bank: "Mandiri", number: "0987654321", holder: "Septian Pratama" },   // TODO
  ],
  giftAddress: "Jl. Melati No. 12, Kel. Sukamaju, Kota Bandung", // alamat kirim kado

  // Nomor WhatsApp untuk konfirmasi kehadiran (format internasional, tanpa +)
  whatsapp: "", // contoh: "6281234567890"

  // Musik latar (opsional). Contoh: "assets/music.mp3"
  music: "",
};
