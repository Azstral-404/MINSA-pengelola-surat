# Plan: Add timestamps to Surat info display

## Changes

### 1. Add `updatedAt` field to Surat model (`src/lib/store.ts`)

- Add `updatedAt: string` to `Surat` interface

### 2. Set timestamps on create/edit (`src/pages/TambahSurat.tsx`)

- On create: set both `createdAt` and `updatedAt` to `new Date().toISOString()`
- On edit: update `updatedAt` only

### 3. Update info line in PreviewSurat (`src/pages/PreviewSurat.tsx`)

- Change line 77 from: `NISN: {surat.nisn} · Maret 2026`
- To: `NISN: {surat.nisn} · No: {surat.nomorSurat} · {tanggal bulan tahun} | Dibuat: 04/03/2026 | Diedit: 04/03/2026`
- Format dates with `toLocaleDateString('id-ID')`

### 4. Update info line in DaftarSurat (`src/pages/DaftarSurat.tsx`)

- Same pattern on line 92: append `| Dibuat: ... | Diedit: ...`