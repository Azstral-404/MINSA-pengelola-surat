# MINSA Surat Manager — Panduan Build Windows Desktop

## Prasyarat

| Software | Versi | Download |
|---|---|---|
| **Node.js** | 18 LTS atau 20 LTS | https://nodejs.org |
| **Git** | Terbaru | https://git-scm.com |
| **Windows 10/11** | x64 | — |

> **Bun** (opsional tapi lebih cepat): https://bun.sh

---

## Cara Cepat (Direkomendasikan)

```
1. Clone atau download repository ini
2. Jalankan: build-installer.bat
3. Ikuti pilihan di layar
4. Hasil ada di folder: dist-electron\
```

---

## Cara Manual (Command Line)

### Install dependencies
```bash
npm install
# atau
bun install
```

### Jalankan di mode development
```bash
npm run electron:dev
```

### Build semua installer sekaligus
```bash
npm run electron:build:all
```

Output: `dist-electron/`

---

## Jenis Installer

| Perintah | Output | Keterangan |
|---|---|---|
| `npm run electron:build:nsis` | `*-Setup-x.x.x.exe` | Installer standar (NSIS), recommended |
| `npm run electron:build:msi` | `*.msi` | Windows Installer — cocok untuk deploy IT |
| `npm run electron:build:portable` | `*-Portable-x.x.x.exe` | Tanpa install, langsung jalan |
| `npm run electron:build:msix` | `*.msix` | Windows Store / sideload (perlu sertifikat) |
| `npm run electron:build:all` | Semua di atas | Build semua sekaligus |

---

## Tentang MSIX

MSIX memerlukan **code signing certificate** untuk distribusi publik.

Untuk testing di komputer sendiri:
1. Buka **Settings → Update & Security → For Developers**
2. Aktifkan **Developer Mode**
3. Jalankan `npm run electron:build:msix`
4. Install `.msix` dengan klik kanan → Install

Untuk distribusi tanpa certificate, gunakan **NSIS (.exe)** atau **MSI**.

---

## Data Aplikasi

Data tersimpan di:
- **Default**: `%APPDATA%\MINSA-Surat-Manager\minsa-data.json`
- **Custom**: Bisa diubah di Pengaturan → Lokasi Data

Data **tidak** dihapus saat uninstall (kecuali user memilih "Ya" saat uninstall).

### Backup & Restore
Di dalam aplikasi: **Pengaturan → Ekspor / Impor Data**

---

## Troubleshooting

**Build gagal dengan error "electron-builder not found"**
```bash
npm install --save-dev electron-builder
```

**Error "Cannot read properties of undefined" saat build**
- Pastikan `vite build` berhasil terlebih dahulu
- Cek folder `dist/` ada dan berisi file

**MSIX error "Certificate not found"**
- Aktifkan Developer Mode di Windows
- Atau beli/buat self-signed certificate

**Aplikasi tidak bisa dibuka setelah install**
- Klik kanan → Properties → Unblock
- Atau buka Windows Defender → Allow this app

---

## Struktur Output

```
dist-electron/
├── MINSA-Surat-Manager-Setup-1.0.0.exe   ← NSIS installer
├── MINSA-Surat-Manager-1.0.0.msi          ← MSI installer
├── MINSA-Surat-Manager-Portable-1.0.0.exe ← Portable (no install)
└── MINSA-Surat-Manager-1.0.0.msix         ← MSIX (jika di-build)
```

---

## Spesifikasi Minimum

| | Minimum |
|---|---|
| OS | Windows 10 (Build 10240) x64 |
| RAM | 512 MB (512 MB bebas) |
| Storage | 200 MB |
| CPU | Any x64 processor |

---

## Lisensi

Copyright © 2025 AZSTRAL. All rights reserved.
