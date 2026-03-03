# MINSA — Aplikasi Manajemen Surat MINSA

## Ringkasan

Aplikasi manajemen surat untuk Madrasah Ibtidaiyah Negeri 1 Langsa. Data disimpan di localStorage, dengan user dapat memilih dimana meletakkan nya sesuai file explorer. Fitur utama: pembuatan surat dengan template yang bisa dikustomisasi, preview A4, dan pengaturan lengkap.

---

## 1. Layout & Navigasi

- **Sidebar** semi-transparan (50% opacity) dengan menu dinamis berdasarkan jenis surat yang ditambahkan user di pengaturan
- Menu default: Dashboard, Pengaturan
- Menu surat ditambahkan otomatis setelah user membuat jenis surat baru (misal: "Surat Ket Aktif", "Surat Pindah", "Surat Tidak Ada SKHU")
- Sidebar bisa di-collapse

## 2. Halaman Dashboard

- Ringkasan jumlah surat per jenis
- Surat terbaru

## 3. Halaman Pengaturan

### a. Kepala Madrasah

- Tambah, edit, hapus NIP dan nama Kepala Madrasah

### b. Tahun Ajaran

- Tambah dan hapus tahun ajaran (misal: 2025/2026)

### c. Tema Warna

- Beberapa pilihan tema warna untuk tampilan aplikasi

### d. Jenis Surat (Template)

- User bisa **membuat jenis surat baru** (misal: "Surat Pindah", "Surat Tidak Ada SKHU")
- Setelah membuat jenis surat, user **wajib mengisi template isi surat** dari awal (editor teks)
- Template ini akan digunakan seterusnya untuk setiap surat baru dari jenis tersebut
- User juga bisa **mengimpor konten dari file .docx** atau mengedit langsung
- Bagian yang bisa diedit: judul surat, isi surat, paragraf pembuka/penutup
- **Header tetap** (Kementerian Agama RI → email) — tidak bisa diubah
- **Nomor surat global**: `NOMOR : B. [nomor surat] /Mi.01.21/1/PP.01.1/[bulan]/[tahun]` — Times New Roman 12, center, di bawah judul surat
  &nbsp;
  e. Header MIN 1 LANGSA  
- Di bawah "MIN 1 LANGSA": **NSM: 111111730001 · NPSN: 10105537** 

## 4. Halaman Surat (per Jenis)

- Tabel daftar surat dengan **row tahun sejajar dengan row bulan**
- Tombol tambah surat baru → form isian data siswa/penerima sesuai template
- Data form: Nama, Tempat/Tanggal Lahir, Jenis Kelamin, Kelas, No. Induk, NISN, Nama Orang Tua, Alamat (sesuai template)

## 5. Preview Surat (A4)

- File/komponen terpisah untuk preview
- Ukuran kertas **A4** (210mm × 297mm)
- **Background selalu putih** meskipun dark mode aktif
- Header resmi: Kementerian Agama RI, Kantor Kementerian Agama Kota Langsa, MADRASAH IBTIDAIYAH NEGERI 1 LANGSA
- Alamat dan email
- Judul surat sesuai template (bukan "SURAT KETERANGAN [jenis]" tapi langsung label jenis surat dalam UPPERCASE)
- Nomor surat otomatis dengan format global
- Isi surat sesuai template yang dibuat user
- Nama dan tanda tangan Kepala Madrasah dari pengaturan
- Tombol cetak/download PDF

## 6. Penyimpanan

- Semua data (surat, pengaturan, template, tahun ajaran) disimpan di **localStorage , sesuai file explorer**
- **tambahkan export ke pdf atau docx**

---

## Halaman & Route


| Halaman              | Route                           |
| -------------------- | ------------------------------- |
| Dashboard            | `/`                             |
| Pengaturan           | `/pengaturan`                   |
| Daftar Surat [Jenis] | `/surat/:jenisSlug`             |
| Tambah Surat         | `/surat/:jenisSlug/tambah`      |
| Preview Surat        | `/surat/:jenisSlug/:id/preview` |
