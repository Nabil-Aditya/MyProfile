// =====================================================================
// SEMUA ISI HALAMAN ADA DI FILE INI.
// Teks di bawah adalah contoh. Ganti dengan data kamu yang sebenarnya,
// simpan, lalu deploy ulang. Tidak perlu mengubah file lain.
// =====================================================================

export const profile = {
  name: "Muhammad Nabil Aditya Putera",
  nameLines: ["Muhammad", "Nabil", "Aditya", "Putera"],
  callName: "Nabil",

  // Kalimat pembuka di bagian paling atas
  intro:
    "Halo, saya Nabil. Saya membuat hal-hal di web dan senang mempelajari sesuatu yang baru setiap minggu.",

  // Bagian "Tentang saya": satu item = satu paragraf
  about: [
    "Saya Muhammad Nabil Aditya Putera, biasa dipanggil Nabil. Saya tertarik pada cara teknologi membuat pekerjaan sehari-hari lebih mudah, dan saya suka mengubah ide menjadi sesuatu yang bisa langsung dipakai orang.",
    "Di luar layar, saya suka bertukar cerita dan mencoba hal baru. Kalau kamu punya ide, pertanyaan, atau tawaran kerja sama, saya senang mendengarnya.",
  ],

  // Bagian "Yang saya kerjakan"
  skills: [
    {
      name: "Website",
      desc: "Merancang dan membangun situs yang cepat, rapi, dan nyaman dibuka dari ponsel.",
    },
    {
      name: "Aplikasi web",
      desc: "Membuat fitur dari sisi tampilan sampai sisi server dengan JavaScript dan Next.js.",
    },
    {
      name: "Belajar dan berbagi",
      desc: "Mencatat hal yang baru dipelajari dan menjelaskannya dengan bahasa yang sederhana.",
    },
  ],

  // Bagian "Proyek". Hapus "href" kalau proyeknya belum punya tautan.
  projects: [
    {
      title: "Halaman perkenalan pribadi",
      desc: "Situs yang sedang kamu lihat. Dibuat dengan Next.js dan dipasang di Vercel.",
      tags: ["Next.js", "Vercel"],
    },
    {
      title: "Nama proyek kedua",
      desc: "Jelaskan dalam satu atau dua kalimat apa proyek ini dan masalah apa yang diselesaikan.",
      tags: ["Teknologi", "Peran kamu"],
      href: "https://github.com/",
    },
    {
      title: "Nama proyek ketiga",
      desc: "Tambahkan atau hapus proyek sesuai kebutuhan. Daftar ini menyesuaikan sendiri.",
      tags: ["Teknologi", "Peran kamu"],
      href: "https://github.com/",
    },
  ],

  // Bagian kontak di bagian paling bawah
  contact: {
    email: "nabil@contoh.com", // ganti dengan email aslimu
    links: [
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Instagram", href: "https://www.instagram.com/" },
    ],
  },
};
