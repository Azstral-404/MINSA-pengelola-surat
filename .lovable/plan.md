# Plan: Multiple UI & Feature Improvements

## Changes Overview

### 1. Dashboard "Sistem Surat" title editable

- Add `dashboardTitle` field to `AppSettings` in store (default: "Sistem Surat")
- On dashboard, show editable title with pencil icon click → inline input

### 2. Template Isi Surat: support copy-paste from MS Word

- Change `<Textarea>` to `contentEditable` div that accepts rich HTML paste
- Also keep DOCX import button
- Store HTML content as-is in `templateIsi`

### 3. Editable header (KOP surat) in Pengaturan

- Add new tab "Header Surat" in Pengaturan
- Add fields to `AppSettings`: `headerLine1`, `headerLine2`, `headerSchool`, `headerAddress`, `headerContact`, `headerLogoUrl` (base64 data URL from file upload)
- Default values match current hardcoded header
- A4Preview reads these from settings
- Allow user to upload logo image (stored as base64 in localStorage)

### 4. Color themes + dark/light per theme

- Add `colorTheme` to AppSettings (e.g., 'default', 'emerald', 'ocean', 'sunset', 'royal')
- Each color theme has both light and dark variants
- In Pengaturan Tema tab: show color theme grid + dark/light switch
- CSS: define `[data-theme="emerald"]` etc. with both `:root` and `.dark` variants

### 5. Form: Kelas as button group, No. Induk & NISN numbers only

- Replace Kelas text input with radio-button-style group: I (Satu) through VI (Enam)
- Add `type="number"` / `inputMode="numeric"` + regex filter for noInduk and nisn
- Remove Tahun Ajaran select from form; auto-fill from `activeTahunAjaran`

### 6. DaftarSurat: add month filter, clickable cards, edit/export in dropdown

- Add month filter dropdown (Semua, Januari...Desember)
- Make entire card clickable → navigate to preview
- In three-dot menu: Lihat, Edit (navigate to edit form), Export PDF, Export DOCX, Hapus
- Add edit route `/surat/:jenisSlug/:id/edit` reusing TambahSurat with pre-filled data

### 7. PreviewSurat: Edit navigates to form, add Export PDF/DOCX

- Edit menu → navigate to `/surat/:jenisSlug/:id/edit`
- Export PDF: use `window.print()` with print stylesheet
- Export DOCX: generate basic DOCX using template string + Blob download

### 8. Sidebar logo bigger

- Increase logo from `w-14 h-14` to `w-20 h-20` (collapsed: `w-10 h-10`)
- increase text too

---

## Files to Edit


| File                            | Changes                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `src/lib/store.ts`              | Add `dashboardTitle`, `colorTheme`, header fields to AppSettings              |
| `src/index.css`                 | Add color theme CSS variables with `[data-theme]` selectors                   |
| `src/hooks/useAppData.ts`       | Apply `data-theme` attribute alongside dark class                             |
| `src/components/AppSidebar.tsx` | Bigger logo                                                                   |
| `src/components/A4Preview.tsx`  | Read header from settings instead of hardcoded                                |
| `src/pages/Index.tsx`           | Editable dashboard title                                                      |
| `src/pages/Pengaturan.tsx`      | Add Header tab, color themes grid, contentEditable for template               |
| `src/pages/DaftarSurat.tsx`     | Month filter, clickable cards, edit/export in dropdown                        |
| `src/pages/TambahSurat.tsx`     | Kelas radio buttons, numeric-only fields, remove TA select, support edit mode |
| `src/pages/PreviewSurat.tsx`    | Edit navigation, export PDF/DOCX functions                                    |
| `src/App.tsx`                   | Add edit route                                                                |
