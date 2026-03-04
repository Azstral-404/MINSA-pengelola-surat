# Plan: Fix Bold Nama, Logo Size, NIP Optional, Nomor Surat Format, Info Date

## Issues & Changes

### 1. Fix `{nama}` not bold in A4 preview

The `parseTemplate` replaces `{nama}` with plain text. The nama itself needs to be wrapped in `<b>` tags during replacement.

**File**: `src/components/A4Preview.tsx` line 17

- Change `.replace(/\{nama\}/gi, surat.nama)` to `.replace(/\{nama\}/gi, '<b>' + surat.nama + '</b>')`

### 2. Logo not touching header border line

Current logo: `width: 25.47mm, height: 25.59mm`, positioned at `top: -1.7mm`. The logo overlaps the bottom border. Reduce height to `22mm` and adjust `top` to `0mm` so it stays above the 3px border.

**File**: `src/components/A4Preview.tsx` line 52

- Change size to `width: 22mm, height: 22mm` and `top: 0`

### 3. NIP optional when adding Kepala Madrasah

Currently `addKepala` requires both NIP and Nama (`if (!nipInput.trim() || !namaInput.trim())`). Change validation to only require `nama`.

**File**: `src/pages/Pengaturan.tsx` line 50

- Change to `if (!namaInput.trim()) { toast.error('Nama wajib diisi'); return; }`

### 4. Editable nomor surat format template

Add a `nomorSuratFormat` field to `AppSettings` with default `B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}`. Add an input in Pengaturan > jenis surat. Update `formatNomorSurat` to use the template.

**Files**:

- `src/lib/store.ts`: Add `nomorSuratFormat: string` to `AppSettings`, default `'B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}'`. Update `formatNomorSurat` to accept the format string and do replacements.
- `src/pages/Pengaturan.tsx`: Add input field for "Format Nomor Surat" in Jenis surat with placeholder explanation.
- `src/components/A4Preview.tsx`: Pass format from settings to `formatNomorSurat`. Make the nomor line **bold**.

### 5. Show tanggal dibuat in info bar

Format: `NISN: xxx · No: xxx · 4 Maret 2026 | Diedit: 4/3/2026`

**Files**: `src/pages/PreviewSurat.tsx` line 78, `src/pages/DaftarSurat.tsx` line 92

- Add `new Date(surat.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })` between No and bulan/tahun

## Summary of file changes


| File                           | Changes                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `src/lib/store.ts`             | Add `nomorSuratFormat` to settings, update `formatNomorSurat`         |
| `src/components/A4Preview.tsx` | Bold nama replacement, logo size fix, bold nomor, use format template |
| `src/pages/Pengaturan.tsx`     | NIP optional, add nomor format input                                  |
| `src/pages/PreviewSurat.tsx`   | Add createdAt date to info line                                       |
| `src/pages/DaftarSurat.tsx`    | Add createdAt date to info line                                       |
