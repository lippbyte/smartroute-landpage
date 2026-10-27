# SmartRoute AI — Landing Page

Halaman statis untuk memperkenalkan SmartRoute AI (Team Problem Solver) dan menayangkan video promosi. HTML, CSS, dan JavaScript vanilla tanpa build step. Animasi memakai GSAP 3.12.5 + ScrollTrigger dan Lenis 1.1.13 dari CDN (versi dipatok).

Tampilan mengikuti `assets/design.md` (panduan desain video promo dan aplikasi): latar navy `#001A42`, aksen biru `#0F3FC1` / `#4C7DFF`, kartu putih gaya aplikasi, warna moda transportasi, dan font Plus Jakarta Sans.

```
index.html                               struktur dan seluruh teks halaman
style.css                                token desain (design.md), tata letak, keadaan animasi
main.js                                  konstanta KONTAK_TIM, pemutar video, menu, semua animasi
scripts/proses-foto-latar.py             pemroses foto latar (Pillow)
assets/design.md                         panduan desain: palet, tipografi, komponen, gerak
assets/logotransparan.png                logo di hero dan intro (latar transparan)
assets/logowhitenobg.svg, logodark.svg   logo versi vektor (cadangan, belum dipakai halaman)
assets/Final Vidio Smart Route AI.mp4    video promosi (1920x1080, H.264, 2:10, 28,5 MB)
assets/video-poster.jpg                  poster video (frame detik ke-9)
assets/favicon.svg                       favicon dari ikon logo
assets/jakarta-bg.jpg                    foto latar kota, BELUM DIPASANG (lihat di bawah)
```

## Yang perlu diisi

### 1. Foto latar kota (belum dipasang)

Saat ini `assets/jakarta-bg.jpg` belum ada, jadi halaman tampil dengan latar navy polos. Tidak ada gambar rusak atau area kosong; satu-satunya efeknya adalah pesan 404 di konsol browser.

Cara memasang:

1. Pilih foto landscape beresolusi tinggi dengan lisensi jelas (Unsplash, Pexels, atau milik sendiri), misalnya siluet gedung Sudirman-Thamrin, Bundaran HI, atau halte TransJakarta.
2. Simpan sebagai `assets/jakarta-bg.jpg`.
3. Dari folder proyek jalankan:
   ```bash
   pip install pillow
   python scripts/proses-foto-latar.py
   ```
   Skrip membuat `assets/jakarta-bg.webp` (lebar 1920px) dan `assets/jakarta-bg-mobile.webp` (lebar 900px), hitam-putih, masing-masing di bawah 250 KB. JPG asli tidak diubah.
4. Jika lisensi foto mensyaratkan kredit, buka komentar `Kredit foto latar` di bagian `<footer>` pada `index.html` dan isi nama fotografernya.

Foto dibaurkan ke latar navy dengan `mix-blend-mode: luminosity`, sehingga tampil bernuansa biru dan hanya terlihat di celah antar kartu.

**Menyetel kepekatan foto:** ubah `--bg-photo-opacity` di bagian atas `style.css`. Bawaannya `0.10`; rentang yang disarankan `0.06` sampai `0.16`.

### 2. Kontak tim (sudah diisi)

Email kontak diatur di baris pertama `main.js`:

```js
const KONTAK_TIM = "hasbywiraalmuflih9@gmail.com";
```

Karena berisi `@`, teksnya otomatis menjadi tautan `mailto:` dengan stabilo oranye di blok penutup. Untuk mengganti, cukup ubah nilai ini. Tanpa JavaScript, blok penutup menampilkan teks placeholder di `index.html` (`<span data-kontak>`), jadi samakan juga teks itu bila perlu.

## Warna dan tipografi

Semua warna ada sebagai variabel di bagian atas `style.css`, sama dengan token di `assets/design.md` §2.6 (`--navy`, `--blue`, `--blue-l`, `--teal`, `--green-l`, `--orange`, warna moda, dan warna status). Oranye dipakai hanya untuk penekanan: coretan di bawah kata kunci dan stabilo kontak. Badge risiko memakai warna status: RENDAH (hijau), SEDANG (oranye), TINGGI (merah).

Font Plus Jakarta Sans dimuat dari Google Fonts dengan `font-display: swap` dan fallback Arial yang metriknya disamakan, agar teks tidak bergeser saat font selesai dimuat.

## Animasi

Semua animasi adalah peningkatan bertahap: tanpa JavaScript, saat pustaka CDN gagal dimuat (failsafe 3 detik), atau saat `prefers-reduced-motion: reduce`, seluruh konten tampil langsung dalam keadaan akhir.

| Bagian | Animasi |
|---|---|
| Intro | Logo tersapu dari kiri, ledakan logo (kilatan, tiga cincin, 18 titik warna moda), lalu sapuan enam pita miring (oranye, hijau, biru, biru tua, navy) membuka halaman. Maks 1,6 detik, sekali per sesi, bisa dilewati dengan klik atau tombol apa pun |
| Hero | Logo tersapu dari kiri; tagline muncul kata per kata dengan coretan oranye di bawah "Smarter."; tag, deskripsi, tombol masuk bertahap; peta transit berwarna moda tergambar lalu bergeser sangat pelan, beberapa halte berdenyut |
| Pita berjalan | Pita biru berisi istilah utama dengan titik warna moda, bergerak pelan, berhenti saat disorot kursor |
| Judul seksi | Muncul kata per kata; kata kunci mendapat coretan oranye yang tergambar dari kiri |
| Masalah | Kartu kaca masuk 3D, garis aksen tumbuh, angka menghitung naik dan berhenti tepat di nilai akhir, kilau menyapu sekali |
| Fitur | Kartu masuk 3D dan miring mengikuti kursor; HP berisi kartu rute masuk 3D lalu melayang pelan, garis rute tergambar, titik berpindah membal, badge RENDAH lalu SEDANG muncul, rentang 22-31 mnt menghitung naik |
| Cara Kerja | Lembar putih seperti bottom sheet. Desktop: di-pin, garis progres tiap langkah terisi dan node pipeline menyala sesuai scroll, titik data mengalir di penghubung. Mobile: masuk bertahap |
| Blok besar | Lengkung atas membuka mengikuti scroll (Cara Kerja dan penutup) |
| Video | Kartu membesar dari 0,92 ke 1 menuju tengah layar; cincin denyut pada tombol putar; klik memperluas kartu dan memutar video |
| Peta jalan | Jalur kereta: rel terisi mengikuti scroll dengan kereta kecil di ujungnya, kolom menyala berurutan, pil "Kita di sini" muncul memantul, kolom Target bergaris putus-putus |
| Tim | Kartu masuk bertahap; ikon profil dalam lingkaran berwarna muncul memantul |
| Penutup | Judul kata per kata dengan coretan oranye, lalu ledakan logo |
| Mikro-interaksi | Tombol utama mengikuti kursor (maks 8px) dengan kilau saat disorot, garis bawah tautan navigasi, kartu terangkat saat disorot, kapsul navigasi mengecil saat scroll turun, bilah progres scroll hijau muda di tepi atas |
| Foto latar | Muncul perlahan setelah siap; parallax halus di desktop (maks 8% tinggi layar) |
| Scroll | Scroll halus (Lenis); tautan jangkar menggulir dengan offset setinggi navigasi |

Sengaja tidak ada kendaraan yang bergerak di peta hero, supaya tidak terkesan menampilkan posisi armada secara langsung.

**Menonaktifkan intro:** di `index.html`, ubah `<html lang="id" data-intro="on">` menjadi `data-intro="off"`. Intro juga hanya tampil sekali per sesi browser.

## Mengganti aset lain

### Logo

Hero dan intro memakai `assets/logotransparan.png` (1080x1350, logo berada di area tengah 877x168 px). Ruang transparan di sekelilingnya dipangkas dengan margin negatif pada `.logo-box img` di `style.css`. Jika logo diganti dengan berkas yang ukuran atau posisi gambarnya berbeda, sesuaikan angka margin tersebut.

Catatan ketajaman: area logo di PNG ini selebar 877 px, sedangkan di desktop logo tampil sampai 680 px. Di layar retina (2x) logo sedikit kurang tajam dibanding versi SVG. Jika ingin lebih tajam, ganti `src` di hero dan intro dengan PNG beresolusi lebih tinggi atau dengan `assets/logowhitenobg.svg` (lalu sesuaikan angka margin).

### Video promosi

Video diputar dari folder `assets/` dengan elemen `<video>` bawaan browser dan baru diunduh setelah tombol putar ditekan.

1. Simpan berkas baru dengan nama yang sama, `assets/Final Vidio Smart Route AI.mp4`. Jika namanya berbeda, ubah `src` pada `<source>` dan `href` kedua tautan unduh di bagian `#video` pada `index.html` (spasi ditulis `%20`).
2. Pakai MP4 dengan codec H.264 agar bisa diputar di semua browser.
3. Jika durasinya berubah, perbarui teks `2:10` dan `aria-label` pada `<template id="video-play-template">`.
4. Jika ingin poster lain, ganti `assets/video-poster.jpg` (1280x720).

Jika video tidak dapat diputar, kartu menampilkan pesan beserta tautan unduh.

## Menjalankan secara lokal

Dari folder proyek:

```bash
python -m http.server 8000
```

Lalu buka <http://localhost:8000>. Halaman juga bisa dibuka dengan klik dua kali `index.html`, tetapi foto latar dan pustaka CDN lebih andal lewat server. Animasi membutuhkan koneksi internet karena pustakanya dimuat dari CDN; tanpa koneksi, halaman tetap tampil utuh tanpa animasi.

## Deploy

Tidak ada perintah build. Video 28,5 MB masih di bawah batas 100 MB per berkas di GitHub. GitHub Pages, Netlify, dan Vercel otomatis mengompres HTML/CSS/JS, sehingga halaman lebih cepat dibanding saat diuji dengan `python -m http.server`.

### GitHub Pages

1. Buat repositori baru, lalu unggah semua berkas proyek (`index.html` harus berada di root).
2. Buka **Settings → Pages**.
3. Pada **Source** pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Setelah 1-2 menit, situs aktif di `https://<username>.github.io/<nama-repo>/`.

### Netlify

- **Paling cepat:** buka <https://app.netlify.com/drop> lalu seret folder proyek ke halaman itu.
- **Lewat GitHub:** **Add new site → Import an existing project**, pilih repositori, kosongkan *Build command*, isi *Publish directory* dengan `.`, lalu **Deploy**.

### Vercel

**Add New → Project**, impor repositori, pilih *Framework Preset* **Other**, tanpa build command.

## Opsional setelah online

- Tambahkan gambar pratinjau untuk media sosial: `<meta property="og:image" content="https://alamat-situs-anda/assets/video-poster.jpg">` di `<head>`. URL-nya harus absolut, jadi baru bisa diisi setelah alamat situs diketahui. Gunakan JPG atau PNG; sebagian besar media sosial tidak menampilkan SVG.

## Kredit foto

Foto latar belum dipasang. Setelah dipasang, catat sumber dan fotografernya di sini dan, bila lisensinya mensyaratkan, di footer halaman.
