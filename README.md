# Landing page Muhammad Nabil Aditya Putera

Halaman perkenalan satu halaman, dibuat dengan Next.js (App Router).

## Mengubah isi

Semua teks ada di `app/profile.js`. Ganti nama proyek, deskripsi, email, dan tautan
sosial media dengan data kamu, lalu simpan.

## Menjalankan di komputer

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Deploy ke Vercel

1. Unggah folder ini ke repositori GitHub baru.
2. Di vercel.com, pilih **Add New, Project**, lalu impor repositori tersebut.
3. Biarkan pengaturan bawaan (Vercel mengenali Next.js otomatis), lalu klik **Deploy**.

## Memasang domain dari DomaiNesia

1. Di Vercel: **Project, Settings, Domains**, masukkan domainmu, lalu **Add**.
2. Di client area DomaiNesia: **Domain, Manage DNS**, tambahkan record yang ditampilkan Vercel.
   Biasanya record **A** untuk domain utama ke `76.76.21.21` dan record **CNAME** untuk `www`
   ke `cname.vercel-dns.com`. Pakai nilai yang tampil di dashboard Vercel jika berbeda.
3. Tunggu propagasi DNS. HTTPS dipasang otomatis oleh Vercel.
