// =====================================================================
// SEMUA ISI HALAMAN ADA DI FILE INI.
// Ganti bagian bertanda "GANTI" dengan data kamu yang sebenarnya,
// simpan, lalu deploy ulang. Tidak perlu mengubah file lain.
// =====================================================================

export const profile = {
  siteUrl: "https://www.nabiladitya.my.id",
  name: "Muhammad Nabil Aditya Putera",
  nameLines: ["Muhammad", "Nabil", "Aditya", "Putera"],
  callName: "Nabil",
  role: "Software Engineer | Project Manager | AI, IoT & Cybersecurity Enthusiast",

  // Kalimat pembuka di bagian paling atas
  intro:
    "Halo, saya Nabil Aditya. Software Engineer dan Project Manager yang tertarik pada AI, IoT, dan Cybersecurity.",

  // Bagian "Tentang saya": satu item = satu paragraf
  about: [
    "Saya Muhammad Nabil Aditya Putera, biasa dipanggil Nabil Aditya. Saya seorang Software Engineer dan Project Manager yang tertarik pada cara teknologi membuat pekerjaan sehari-hari lebih mudah, dan saya suka mengubah ide menjadi sesuatu yang bisa langsung dipakai orang.",
    "Minat saya berada di persimpangan AI, IoT, dan Cybersecurity: bagaimana perangkat terhubung, bagaimana data diolah menjadi keputusan, dan bagaimana semuanya tetap aman. Kalau kamu punya ide, pertanyaan, atau tawaran kerja sama, saya senang mendengarnya.",
  ],

  // Bagian "Yang saya kerjakan"
  skills: [
    {
      name: "Software Engineering",
      desc: "Merancang dan membangun aplikasi dari sisi tampilan sampai sisi server dengan JavaScript dan Next.js.",
    },
    {
      name: "Project Management",
      desc: "Memimpin tim dan memastikan proyek selesai tepat waktu dan sesuai kebutuhan.",
    },
    {
      name: "AI & IoT",
      desc: "Menghubungkan perangkat dan data dengan kecerdasan buatan untuk solusi nyata.",
    },
    {
      name: "Cybersecurity",
      desc: "Menerapkan praktik keamanan agar sistem dan data tetap terlindungi.",
    },
  ],

  // Bagian "Proyek". Hapus "href" kalau proyeknya belum punya tautan.
  projects: [
    {
      title: "Halaman perkenalan pribadi",
      desc: "Situs portofolio yang sedang kamu lihat. Dibuat dengan Next.js dan dipasang di Vercel.",
      tags: ["Next.js", "Vercel"],
      href: "https://www.nabiladitya.my.id",
    },
    {
      // GANTI: nama proyek aslimu
      title: "Nama proyek kedua",
      desc: "Jelaskan dalam satu atau dua kalimat apa proyek ini dan masalah apa yang diselesaikan.",
      tags: ["Teknologi", "Peran kamu"],
      href: "https://github.com/",
    },
    {
      // GANTI: nama proyek aslimu
      title: "Nama proyek ketiga",
      desc: "Tambahkan atau hapus proyek sesuai kebutuhan. Daftar ini menyesuaikan sendiri.",
      tags: ["Teknologi", "Peran kamu"],
      href: "https://github.com/",
    },
  ],

  // Bagian kontak di bagian paling bawah
  contact: {
    email: "nabil@contoh.com", // GANTI dengan email aslimu
    links: [
      // GANTI semua dengan URL profil aslimu
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Instagram", href: "https://www.instagram.com/" },
    ],
  },
};