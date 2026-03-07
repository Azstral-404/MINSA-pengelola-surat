# MINSA Surat Manager — Windows Desktop App

## Cara Build Windows Desktop App

### Prasyarat
- Node.js 18+ / Bun
- npm atau bun

### Install dependencies
```bash
npm install
# atau
bun install
```

### Development (jalankan sebagai desktop app)
```bash
npm run electron:dev
```
Akan membuka window Electron yang terhubung ke Vite dev server di localhost:8080.

### Build untuk Windows (installer + portable)
```bash
npm run electron:build
```
Output: `dist-electron/`
- `MINSA Surat Manager Setup x.x.x.exe` — installer (NSIS)
- `MINSA Surat Manager x.x.x.exe` — portable (tidak perlu install)

### Build directory saja (tanpa installer, lebih cepat untuk testing)
```bash
npm run electron:build:dir
```

## Catatan
- Data disimpan di localStorage browser (Electron). Untuk backup, gunakan fitur Ekspor JSON di Pengaturan > Data.
- Aplikasi bisa dijalankan di Windows 10/11 x64.
