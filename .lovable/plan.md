# Plan: Redesign MINSA to Match Screenshots

## What Changes

Based on the 4 screenshots, these are the key differences from the current implementation:

### 1. Sidebar Redesign

- Add the uploaded MINSA logo image (`Duck-ai-image-2026-03-02-22-06_1.png`) to sidebar top
- Show "MINSA" title and "Manajemen Surat" subtitle below logo
- Keep dynamic menu items (Dashboard, Surat Ket Aktif, Surat Pindah, etc.)
- Pengaturan at bottom of sidebar

### 2. Layout Header Redesign

- Left: sidebar toggle + "MIN 1 LANGSA" bold + "Kementerian Agama Kota Langsa" subtitle
- Right: Tahun Ajaran selector dropdown ("TA 2025/2026") + dark/light mode toggle icon

### 3. Dashboard Redesign (match screenshot 2)

- Title: "MARIANUM" but user can edit it with subtitle "MIN 1 Langsa — 111111740001 - 60703494"

1 stat cards big:

- TOTAL (seluruh surat masuk) | TOTAL (seluruh surat keluar) with backgroun gradiasi antara (green tint) | (red/pink tint)  
  cth 2025/2026 dibawahnya 10 dibawahnya TOTAL

1 stat card medium atas  di kanan 1 stat cards big:

- TOTAL (tampilkan nama bulan ini) | TOTAL (tampilkan nama bulan ini) with backgroun gradiasi antara (green tint) | (red/pink tint)  
cth MARET     dibawahnya  2   dibawahnya TOTAL     


2 stat card 1x2 small dibawah 1 stat card medium atas  dikanan  1   stat cards big:

- Two action buttons: "+ Surat Masuk" (green) and "+ Surat Keluar" (red/pink)

&nbsp;

- "Riwayat Terakhir" section showing recent letters as cards with left colored border can be click and allow user to go to menu like Screenshot 2026-03-04 at 04-08-09 Lovable App.png

### 4. Add `arah` Field to Surat Model

- Each surat gets `arah: 'masuk' | 'keluar'` field
- "Surat Masuk" = incoming, "Surat Keluar" = outgoing
- Color coded: green for masuk, red/pink for keluar

### 5. DaftarSurat Redesign (match screenshot 3)

- Title: jenis surat label
- Top right: "+ Buat Surat" button with dropdown (Surat Masuk / Surat Keluar)
- Filter dropdown: "Semua" / "Masuk" / "Keluar"
- Card-based list (not table) with left colored border (red for keluar, green for masuk)
- Each card shows: nama (bold), NISN, No surat, badge "KELUAR"/"MASUK"
- Three-dot menu on each card for actions (edit, print, convert pdf or docx, delete)

### 6. PreviewSurat Redesign (match screenshot 1)

- Top: info card with dashed red border showing nama, NISN, date, "SURAT KELUAR" badge
- Action buttons: Three-dot menu on each card for actions (edit, print, convert pdf or docx, delete)
- Below: A4 preview with proper header matching the OUTPUT.html format

### 7. Theme: Dark/Light Only

- Replace 5 color themes with simple dark/light toggle
- Store as `theme: 'light' | 'dark'` in settings
- Toggle button in header (moon/sun icon)
- Update Pengaturan tema tab to show just dark/light switch

### 8. A4 Preview Update

- Header: keep current format (already matches)
- Ensure "Nomor: 0" style from screenshot (simpler display)
- Match the document body layout from OUTPUT.html reference

---

## Files to Create/Edit


| File                            | Action                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| `src/assets/minsa-logo.png`     | Copy uploaded logo                                                  |
| `src/lib/store.ts`              | Add `arah` field, change ThemeName to 'light'/'dark', add active TA |
| `src/index.css`                 | Replace color themes with proper dark mode using class-based toggle |
| `src/hooks/useAppData.ts`       | Update theme logic for dark class                                   |
| `src/components/Layout.tsx`     | Redesign header with MIN 1 LANGSA, TA selector, dark mode toggle    |
| `src/components/AppSidebar.tsx` | Add logo, restructure menu, Pengaturan at bottom                    |
| `src/pages/Index.tsx`           | Full redesign: masuk/keluar stats, action buttons, riwayat          |
| `src/pages/DaftarSurat.tsx`     | Card-based list, Buat Surat dropdown, filter                        |
| `src/pages/PreviewSurat.tsx`    | Info card + action buttons + A4 preview                             |
| `src/pages/TambahSurat.tsx`     | Add arah (masuk/keluar) selection                                   |
| `src/pages/Pengaturan.tsx`      | Simplify tema to dark/light switch                                  |
| `src/components/A4Preview.tsx`  | Minor adjustments to match output format                            |
