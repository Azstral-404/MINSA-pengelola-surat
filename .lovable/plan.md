# Plan: Filter Surat by Tahun Ajaran (Academic Year)

## Logic

TA format is `"2025/2026"`. This means:

- **Semester Ganjil**: Juli–Desember of the first year (2025)
- **Semester Genap**: Januari–Juni of the second year (2026)
- Full range: July [firstYear] → June [secondYear]

A surat belongs to a TA if its `bulan` and `tahun` fields fall within this range.

## Changes

### 1. Add helper function (`src/lib/store.ts`)

Add `isInTahunAjaran(surat, taLabel)` that:

- Parses TA label `"2025/2026"` → `startYear=2025`, `endYear=2026`
- Returns true if `(tahun === startYear && bulan >= 7)` OR `(tahun === endYear && bulan <= 6)`

### 2. Filter dashboard stats and recent list (`src/pages/Index.tsx`)

- If `activeTA` is set, filter all stats (`masukTotal`, `keluarTotal`, `masukBulan`, `keluarBulan`) and `recentSurat` using `isInTahunAjaran`
- If no TA selected, show all (current behavior)
- [SURAT KETERANGAN AKTIF · (input tanggal) Maret 2026](https://07b2ca18-5fcd-431e-81c3-a20d0ebfba53.lovableproject.com/surat/surat-keterangan-aktif/mmbac0kb1ec5c/preview) | last edit

### 3. Filter DaftarSurat list (`src/pages/DaftarSurat.tsx`)

- If `activeTA` is set, also filter `suratList` by `isInTahunAjaran`

## Files


| File                        | Changes                              |
| --------------------------- | ------------------------------------ |
| `src/lib/store.ts`          | Add `isInTahunAjaran` helper         |
| `src/pages/Index.tsx`       | Filter stats and recent by active TA |
| `src/pages/DaftarSurat.tsx` | Filter surat list by active TA       |
