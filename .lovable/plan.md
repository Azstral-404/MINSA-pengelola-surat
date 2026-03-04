# Plan: Page Setup Margins, Timestamps, Bold Nama, Optional NIP, Dashboard Grid

## Changes

### 1. A4 Margins — Match MS Word Page Setup (Images 1-3)

From screenshots: Top: **3.2mm**, Bottom: **25.4mm**, Left: **25.4mm**, Right: **25.4mm**, Header from edge: **12.7mm**, Footer from edge: **12.7mm**.

In `A4Preview.tsx`: change `paddingTop` from `5mm` to `3.2mm`.

### 2. Bold nama kepala madrasah + Optional NIP

In `A4Preview.tsx` signature block:

- Nama already has `fontWeight: 'bold'` — keep as is
- NIP line: only render if `kepala.nip` is non-empty. Change from always showing `NIP. {kepala.nip}` to conditional render.

### 3. Add `updatedAt` to Surat model (`src/lib/store.ts`)

- Add `updatedAt?: string` to `Surat` interface

### 4. Set timestamps on create/edit (`src/pages/TambahSurat.tsx`)

- On create: set `createdAt` and `updatedAt` to `new Date().toISOString()`
- On edit: update only `updatedAt`

### 5. Update info lines with timestamps

**PreviewSurat** (line 77): Change to:  
`NISN: {nisn} · No: {nomorSurat} · {tanggal bulan tahun} | Diedit: dd/mm/yyyy`

**DaftarSurat** (line 92): Same pattern — append `| Diedit: ...`

Format using `toLocaleDateString('id-ID')` or manual dd/mm/yyyy.

### 6. Dashboard grid — Match Image 4

Image 4 shows a 2-row right section:

- Row 1: [Masuk Total | Keluar Total] spanning left, then [Maret Masuk | Maret Keluar] on right top
- Row 2: (right side) [+Surat Masuk] [+Surat Keluar] buttons below the monthly stats

Current layout is `grid-cols-5` single row. Change to:

- `grid-cols-1 md:grid-cols-3` with the total card spanning 2 cols
- Right column: a stacked card with monthly stats on top and two buttons below
- This matches the screenshot layout more closely

## Files to Edit


| File                           | Changes                           |
| ------------------------------ | --------------------------------- |
| `src/lib/store.ts`             | Add `updatedAt?: string` to Surat |
| `src/components/A4Preview.tsx` | Top margin 3.2mm, conditional NIP |
| `src/pages/TambahSurat.tsx`    | Set `updatedAt` on create/edit    |
| `src/pages/PreviewSurat.tsx`   | Add timestamps to info line       |
| `src/pages/DaftarSurat.tsx`    | Add timestamps to info line       |
| `src/pages/Index.tsx`          | Restructure grid to match image 4 |
