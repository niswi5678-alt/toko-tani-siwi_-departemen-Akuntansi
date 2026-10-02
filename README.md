# Sistem Persediaan Toko Tani Siwi Maju

Aplikasi persediaan berbasis HTML, CSS, dan JavaScript dengan database Supabase PostgreSQL. Frontend berkomunikasi langsung dengan Supabase menggunakan Supabase JavaScript CDN.

## Struktur Proyek

```text
back end/
  app.js
  schema.sql
front end/
  index.html
  css/style.css
  javascript/
    config.js
    supplier.js
    produk.js
    transaksiMasuk.js
    transaksiKeluar.js
    ringkasan.js
.github/
  workflows/deploy-pages.yml
```

Database memiliki empat tabel inti: `supplier`, `produk`, `transaksi_masuk`, dan `transaksi_keluar`. Kategori disimpan sebagai kolom `produk.kategori`, bukan tabel tersendiri.

Dashboard menghitung kas masuk dari total `transaksi_keluar` (penjualan) dan kas keluar dari total `transaksi_masuk` (pembelian stok). Arus kas bersih adalah kas masuk dikurangi kas keluar. Perhitungan ini menganggap penjualan diterima tunai; saldo awal, utang/piutang, dan pengeluaran lain belum dimasukkan.

## 1. Siapkan Supabase

1. Buat atau pilih project di [Supabase Dashboard](https://supabase.com/dashboard).
2. Buka **SQL Editor** pada project tersebut.
3. Buka `back end/schema.sql`, salin SQL-nya ke SQL Editor, lalu jalankan.
4. Pastikan empat tabel terlihat di schema `public`: `supplier`, `produk`, `transaksi_masuk`, dan `transaksi_keluar`.

> **Peringatan:** `schema.sql` berisi `DROP TABLE ... CASCADE`. Menjalankannya akan menghapus tabel dan data sebelumnya sebelum membuat ulang skema. Jalankan hanya untuk database baru atau setelah memastikan data lama sudah dicadangkan.

## 2. Hubungkan Frontend ke Supabase

1. Di Supabase, buka **Project Settings > API** (atau bagian **API Keys** pada tampilan dashboard terbaru).
2. Salin **Project URL** dan **Publishable key**.
3. Buka `front end/javascript/config.js` dan isi nilainya:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_PUBLISHABLE_KEY';
```

Nama konstanta `SUPABASE_ANON_KEY` dipertahankan demi kompatibilitas kode; nilainya dapat berupa Supabase publishable key yang berawalan `sb_publishable_`. Jangan gunakan `service_role` atau secret key di frontend.

## 3. Jalankan Lokal

Buka folder proyek di VS Code, lalu buka `front end/index.html` menggunakan ekstensi Live Server. Pastikan komputer terhubung ke internet karena Supabase JavaScript dimuat dari CDN dan data diakses melalui Supabase.

## 4. Unggah Perbaikan ke Repository yang Sudah Ada

Repository GitHub yang digunakan saat ini menyimpan `index.html`, `style.css`, dan file JavaScript langsung di root, berbeda dari folder `front end/` pada proyek lokal. HTML frontend memuat file JavaScript secara berurutan, mencoba root repository terlebih dahulu lalu folder `javascript/` untuk penggunaan lokal. Aplikasi baru mulai mengambil data setelah semua script berhasil dimuat.

Untuk memperbarui situs yang saat ini diterbitkan dari branch, buka repository melalui GitHub Desktop (**File > Clone repository**) jika belum memiliki salinan lokal. Salin file berikut dari proyek lokal ke root repository, mengganti file dengan nama sama:

- `front end/index.html` menjadi `index.html`
- `front end/css/style.css` menjadi `style.css`
- `front end/javascript/supplier.js` menjadi `supplier.js`
- `front end/javascript/produk.js` menjadi `produk.js`
- `front end/javascript/transaksiMasuk.js` menjadi `transaksiMasuk.js`
- `front end/javascript/transaksiKeluar.js` menjadi `transaksiKeluar.js`
- `front end/javascript/ringkasan.js` menjadi `ringkasan.js`

Buka terminal pada folder hasil clone dan jalankan:

```bash
git add index.html style.css supplier.js produk.js transaksiMasuk.js transaksiKeluar.js ringkasan.js
git commit -m "Add inventory and cash flow dashboard"
git push origin main
```

Jika proyek ini memang sudah merupakan hasil clone repository, salin semua file tersebut ke root proyek lalu jalankan perintah di atas. Hindari `git init` atau `git remote add origin` jika remote repository sudah tersedia. Alternatifnya, salin `.github/workflows/deploy-pages.yml` ke root repository dan ubah **Settings > Pages > Source** menjadi **GitHub Actions**.

File `config.js` berisi URL project dan publishable key yang digunakan browser. Publishable key memang dirancang untuk penggunaan frontend, tetapi siapa pun dapat melihatnya pada aplikasi/repository publik. Keamanan data harus diterapkan dengan **Row Level Security (RLS)** dan policies yang sesuai di Supabase. Aplikasi saat ini belum memiliki autentikasi pengguna dan SQL belum mengaktifkan RLS; jangan gunakan dengan data operasional atau membuka repository/aplikasi untuk umum sebelum akses database diamankan. Jangan pernah memasukkan `service_role` atau secret key ke GitHub.

## 5. Deploy Frontend dengan GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` menyiapkan website lalu menerbitkan hanya aset frontend. Workflow mendukung dua susunan: proyek lokal dengan folder `front end/`, dan repository GitHub yang menyimpan `index.html`, `style.css`, serta file JavaScript langsung di root. Pada susunan root, workflow menyalin aset ke `css/` dan `javascript/` agar sesuai dengan alamat file yang diminta oleh `index.html`.

1. Pastikan perubahan dan file workflow sudah di-push ke branch `main`.
2. Di GitHub, buka **Settings > Pages**.
3. Pada **Build and deployment > Source**, pilih **GitHub Actions** lalu simpan bila diminta.
4. Buka **Actions**, pilih workflow **Deploy frontend to GitHub Pages**, lalu tunggu sampai berstatus berhasil.
5. Buka kembali alamat Pages dan muat ulang dengan `Ctrl+F5`. Push baru ke `main` akan menerbitkan website lagi.

Jika tampilan website hanya teks polos, buka tab **Actions** dan pastikan workflow terbaru berstatus berhasil. Setelah workflow berhasil, muat ulang website dengan `Ctrl+F5`; jika masih polos, periksa apakah file `css/style.css` dan `javascript/config.js` tersedia pada hasil deployment.

Perubahan pada `front end/javascript/config.js` harus ikut di-push agar website memakai konfigurasi Supabase yang benar.

## Catatan Arsitektur

Frontend melakukan query langsung ke Supabase untuk operasi supplier, produk, transaksi masuk, dan transaksi keluar. `back end/app.js` bukan server HTTP yang dijalankan oleh GitHub Pages; workflow Pages hanya menerbitkan frontend statis. File `back end/schema.sql` digunakan untuk menyiapkan database Supabase.

Skema SQL saat ini belum memiliki trigger untuk memperbarui `produk.stok` otomatis ketika transaksi masuk atau keluar dicatat. Nilai stok tidak berubah otomatis hanya dengan menyimpan transaksi.

## Troubleshooting

- **Tabel tidak ditemukan:** pastikan `schema.sql` berhasil dijalankan dan nama tabel/kolom sesuai.
- **Project URL/key belum berfungsi:** periksa nilai di `front end/javascript/config.js`, simpan, lalu push perubahan.
- **Aplikasi mendapat error permission/RLS:** periksa RLS dan policies Supabase. Jangan mengatasi masalah ini dengan memasukkan secret key ke frontend.
- **Website GitHub Pages belum muncul:** periksa log workflow di tab **Actions**, lalu pastikan Pages memakai source **GitHub Actions**.
