# Pengumpulan UTS Pemrograman Web Dasar

## Identitas Mahasiswa

- Nama: Bhakti Saputra
- NIM: 2405101090
- Kelas: 5E
- Program Studi: Teknik Informatika
- Mata Kuliah: Pemrograman Web Dasar
- Tahun Akademik: 2026/2027

## Deskripsi

Repository ini berisi source code, dokumentasi hasil pengerjaan Ujian Tengah Semester (UTS)
mata kuliah Pemrograman Web Dasar.

## Deskripsi Pengerjaan UTS

Project yang dikerjakan adalah **GameVault**, website toko digital untuk top up item game
(Roblox, Mobile Legends, Valorant) dan isi pulsa (Telkomsel, Indosat, XL, Tri).

Masalah yang diselesaikan: jual beli item game dan pulsa di toko kecil masih lewat chat, sehingga
ID tujuan mudah salah catat, stok dan harga tidak jelas, rekap tercecer, dan status pesanan tidak
terlihat. Di GameVault pembeli memesan sendiri lewat form, sedangkan admin memproses pesanan lewat
panel admin yang terpisah.

Aplikasi dibuat dengan HTML, CSS, dan JavaScript. Data disimpan di browser (localStorage). Server
Node.js (`server.js`) bersifat opsional, dipakai agar pesanan dari browser atau HP lain ikut masuk ke
admin. Pada tahap UAS, penyimpanan data akan dipindah ke PHP dan MySQL.

## Fitur yang Diimplementasikan

1. Landing page yang menjelaskan GameVault
2. Daftar akun, login, dan logout dengan pembagian hak akses pembeli dan admin (halaman terpisah)
3. Katalog dengan pencarian dan filter per game atau provider
4. Form pemesanan dengan validasi ID, Zone ID, dan nomor HP, total harga otomatis, dan pop-up konfirmasi
5. Rincian harga: harga dasar, biaya layanan 5%, PPN 11% atas biaya layanan (pulsa tanpa PPN)
6. Pilihan pembayaran QRIS, DANA, GoPay, OVO, dan transfer BCA, dengan nota berisi QR atau nomor tujuan
7. Request top up dengan jumlah bebas
8. Riwayat dan status pesanan (Pending, Diproses, Sukses, Batal)
9. Panel admin: antrean pesanan, kelola produk (tambah, ubah, hapus, harga, stok), dan kelola transaksi
10. Chat per pesanan antara pembeli dan admin (teks, gambar, dan resi)
11. Pusat bantuan (FAQ dan form pertanyaan ke admin)
12. Tampilan mode gelap dan responsif untuk HP

## Struktur Folder

- `uts/`: Source code dan file pendukung UTS.
  - `index.html`: halaman pembeli
  - `admin.html`: panel admin
  - `qr.html`: halaman QR untuk membuka toko dari HP
  - `css/style.css`: tampilan
  - `img/`: logo game dan provider (roblox, mobile-legends, valorant, telkomsel, indosat, xl, tri)
  - `js/script.js`: logika aplikasi
  - `js/qrcode.js`: library pembuat QR
  - `server.js`: server Node.js opsional
- `uts/screenshots/`: Bukti visual hasil implementasi.

## Cara Menjalankan Aplikasi

Cara 1 (cukup HTML, CSS, JS):

1. Buka folder `uts` di VS Code.
2. Pasang ekstensi Live Server, klik kanan `index.html`, pilih **Open with Live Server**.
3. Halaman admin ada di `admin.html` pada alamat yang sama.

Cara 2 (opsional, agar pesanan dari browser atau HP lain masuk ke admin):

1. Pasang Node.js, lalu buka terminal di folder `uts`.
2. Jalankan `node server.js`.
3. Buka `http://localhost:3000` (toko) dan `http://localhost:3000/admin.html` (admin).
4. Untuk membuka dari HP, buka `http://localhost:3000/qr.html` lalu pindai QR-nya (satu Wi-Fi).

Akun contoh untuk uji coba:

- Admin: `admin` / `admin123`
- Pembeli: `pembeli` / `pembeli123` (atau daftar akun baru)

## Referensi

- qrcode-generator oleh Kazuhiko Arase (lisensi MIT): library pembuat QR di `js/qrcode.js`
- Google Fonts: font Poppins
- telkomsel.com: daftar nominal pulsa
- Lapakgaming dan VCGamers: referensi harga item game
- pajak.go.id: ketentuan PPN pulsa dan voucer
- Logo game dan provider di `uts/img/`: milik masing-masing pemilik merek, dipakai hanya untuk keperluan tugas
