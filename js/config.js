/*
 * ============================================================
 *  KONFIGURASI UNDANGAN — ubah data di sini saja.
 *  Bagian bertanda TODO masih berupa contoh / placeholder.
 * ============================================================
 */
window.WEDDING = {
  couple: {
    short: "Andreas & Juwi",
    groom: {
      nickname: "Andreas",
      fullName: "Andreas [Marga]",                                  // TODO nama lengkap + marga
      parents: "Putra dari Bapak [Nama Ayah] & Ibu [Nama Ibu] br. [Marga]", // TODO
      instagram: "",
      // Foto dummy (Unsplash). Ganti dengan "assets/andreas.jpg"
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80&auto=format&fit=crop",
    },
    bride: {
      nickname: "Juwi",
      fullName: "Juwi br. [Marga]",                                // TODO
      parents: "Putri dari Bapak [Nama Ayah] & Ibu [Nama Ibu] br. [Marga]", // TODO
      instagram: "",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=80&auto=format&fit=crop",
    },
  },

  // Tanggal utama untuk hitung mundur (WIB)
  date: "2026-12-23T10:00:00+07:00",

  events: [
    {
      name: "Resepsi Pernikahan",
      date: "2026-12-23T10:00:00+07:00",
      end: "2026-12-23T16:00:00+07:00",   // dipakai untuk kalender saja
      timeLabel: "10.00 WIB – Selesai",
      venue: "Wisma Marindal",
      address: "Marindal, Medan – Sumatera Utara", // TODO lengkapi alamat jalan
      mapsQuery: "Wisma Marindal, Medan",            // dipakai untuk peta di halaman
      mapsUrl: "https://maps.app.goo.gl/AAJ7JzotP12XMUJr5", // link resmi lokasi (tombol)
    },
  ],

  verse: {
    text: "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
    ref: "Matius 19 : 6",
  },

  story: [
    { year: "2019", title: "Pertama Bertemu", text: "Tuhan mempertemukan kami di tempat yang tak terduga. Satu sapaan sederhana menjadi awal cerita panjang." },
    { year: "2022", title: "Bertumbuh Bersama", text: "Dalam suka dan duka kami belajar saling memahami, menguatkan, dan bertumbuh dalam iman." },
    { year: "2025", title: "Marhusip & Lamaran", text: "Dengan restu kedua keluarga besar, kami menyatukan niat baik menuju pernikahan kudus." },
    { year: "2026", title: "Hari Bahagia", text: "Atas kasih karunia Tuhan, kami melangkah bersama membangun keluarga yang diberkati." },
  ],

  // Foto galeri dummy (Unsplash). Ganti dengan foto sendiri, mis. "assets/g1.jpg"
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=900&q=80&auto=format&fit=crop",
  ],

  // Rekening — PLACEHOLDER, akan diisi kemudian
  gifts: [
    { bank: "NAMA BANK", number: "0000 0000 0000", holder: "Nama Pemilik Rekening" }, // TODO
    { bank: "NAMA BANK", number: "0000 0000 0000", holder: "Nama Pemilik Rekening" }, // TODO
  ],
  giftAddress: "[Alamat pengiriman kado]", // TODO

  // Nomor WhatsApp untuk konfirmasi (format 62xxxx, tanpa +). Kosongkan bila tidak dipakai.
  whatsapp: "",

  // Musik latar: lagu asli "Inggir-Inggir" (dengan vokal, tanpa diedit).
  // Versi instrumental: "assets/inggir-inggir-instrumental.mp3"
  // Kosongkan ("") untuk memakai lagu bawaan "Horas Groove" yang disintesis di browser.
  music: "assets/inggir-inggir.mp3",
};
