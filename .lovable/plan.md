# Plan: Comprehensive Fixes and Enhancements

## 1. Fix PDF Export & Print

**Problem**: Print/PDF opens a new window but doesn't properly replicate the A4 preview styling. Images may not load, styles are incomplete.

**Fix in `PreviewSurat.tsx**`:

- Rewrite `handlePrint` and `handleExportPdf` to clone the full A4 element including computed styles
- Inline all styles and convert images to base64 before writing to the new window
- For PDF: add a toast instructing user to "Save as PDF" in print dialog
- For Print: ensure `w.print()` fires after images load using `onload` event

## 2. Fix Responsive Tabs in Pengaturan

**Problem**: Tabs don't fill the full width of the main content area. `max-w-4xl` constrains the page.

**Fix in `Pengaturan.tsx**`:

- Remove `max-w-4xl` from the container div so content fills the main area
- Use `w-full` on all tab content containers
- Tabs already use `flex-wrap` and `flex-1`; ensure the wrapping parent has no artificial width cap

## 3. Fix Default Theme to Follow System

**Problem**: Default theme is hardcoded to `'light'`.

**Fix in `src/lib/store.ts` and `src/hooks/useAppData.ts**`:

- Change default `theme` to `'system'` 
- Actually, simpler: on first load (when `onboarded` is false and no stored data), detect system preference using `window.matchMedia('(prefers-color-scheme: dark)')` and set theme accordingly
- In `useAppData.ts`, when theme is `'light'` and it's the first load, check system preference

Better approach: just change the initial default in `DEFAULT_DATA` to detect system theme. In `loadData()`, if no stored data exists, detect system dark mode and set `theme` accordingly.

## 4. Fix Mobile Sidebar Text Not Showing

**Problem**: On mobile, sidebar menu items (Dashboard, Pengaturan, etc.) text doesn't show.

**Fix in `AppSidebar.tsx**`: The sidebar uses `collapsed` state to hide text. On mobile, the sidebar sheet should show full text. Check that the `collapsed` variable correctly reflects mobile state. The `useSidebar` hook's `state` might always be `collapsed` on mobile. Need to check — on mobile the sidebar opens as a sheet and should show text. Fix: use `isMobile` from `useSidebar` and show text when sidebar is open (as sheet) on mobile.

## 5. Fix Biodata Checklist - Don't Reset Ticks, Merge Not Duplicate

**Problem**: After clicking "Sisipkan Tabel Biodata", selected checkboxes reset. Also, inserting again duplicates instead of merging.

**Fix in `BiodataChecklistSection**`:

- Don't reset `selectedBiodata` after inserting — remove any reset logic
- For merge: before inserting, scan the editor content for existing biodata table divs. Parse which fields are already present. Only insert fields that aren't already in the content. Or: replace the entire existing biodata block with the new merged set.

Implementation: When inserting, look for existing biodata lines in the editor HTML. If found, replace the block with updated fields including both old and newly selected ones.

## 6. Add Confirmation for Adding Kepala, Tahun Ajaran, Jenis Surat

**Fix in `Pengaturan.tsx**`:

- Add `addConfirm` state: `{ type: string; action: () => void } | null`
- Before `addKepala`, `addTahun`, `addJenisSurat` execute, show a ConfirmDialog asking "Tambah [item]?"
- Use a generic ConfirmDialog with `title="Konfirmasi Tambah"` and positive styling (not destructive)

## 7. Move Kepala Madrasah to Akun Tab, Prevent Add it twice only one, Allow Edit

**Fix in `Pengaturan.tsx**`:

- Remove the `kepala` TabsContent and move its content into the `akun` tab, below the existing identity section
- Add duplicate check: prevent adding if same `nama` already exists
- Add edit functionality: inline edit with state for `editingKepalaId`, `editKepalaName`, `editKephalNip`
- Remove `kepala` from TabsList

## 8. Change Defaults

**Fix in `src/lib/store.ts**`:

- `appName`: `'MINSA'` → `'MANAJEMEN SURAT'`
- `schoolName`: `'MIN 1 Langsa'` → `'NAMA SEKOLAH'`
- `nsm`: `'111111740001'` → `''`
- `npsn`: `'60703494'` → `''`
- All `DEFAULT_HEADER` fields: set to empty strings `''`
- `nomorSuratFormat`: keep as is (or clear)

**Fix in `Layout.tsx**`: If `schoolName === 'NAMA SEKOLAH'`, hide "Kementerian Agama Kota ..." subtitle.

**Fix in `Onboarding.tsx**`: 

- Default `appName` to `'MANAJEMEN SURAT'`, `schoolName` to empty
- Add NSM and NPSN fields (number-only inputs)
- Fix detection: if school name matches madrasah types → show "Kementerian Agama Kota {city}"; else show "Kementerian Pendidikan"

## 9. Header Font Size Controls + Live Preview

**Fix in `Pengaturan.tsx` Header tab**:

- Add `SuratHeader` fields for font sizes: `line1Size`, `line2Size`, `schoolSize`, `addressSize`, `contactSize` (defaults: 16, 14, 12, 11, 11)
- For each header field (Baris 1 through Kontak), add a dropdown/select on the right side showing font size options (8pt–20pt)
- Add a live A4-style preview below the inputs showing how the header looks

**Fix in `src/lib/store.ts**`: Extend `SuratHeader` interface with optional size fields.

**Fix in `A4Preview.tsx**`: Use the new size fields from header settings instead of hardcoded values.

## Files Changed


| File                            | Changes                                                                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/store.ts`              | Change defaults (appName, schoolName, nsm, npsn, header). Add font size fields to SuratHeader. Fix `detectMadrasahInfo` for non-madrasah fallback.                                            |
| `src/hooks/useAppData.ts`       | Detect system dark/light on first load.                                                                                                                                                       |
| `src/pages/PreviewSurat.tsx`    | Rewrite print/PDF to properly clone styles and wait for images.                                                                                                                               |
| `src/pages/Pengaturan.tsx`      | Remove `max-w-4xl`. Remove Kepala tab, merge into Akun. Add confirmation for add actions. Add header font size dropdowns + live preview. Fix biodata insert merge logic. Add edit for Kepala. |
| `src/pages/Onboarding.tsx`      | Default to "MANAJEMEN SURAT". Add NSM/NPSN. Fix detection to show "Kementerian Pendidikan" for non-madrasah.                                                                                  |
| `src/components/AppSidebar.tsx` | Fix mobile text visibility using `isMobile` from useSidebar.                                                                                                                                  |
| `src/components/Layout.tsx`     | Hide "Kementerian Agama" when schoolName is default.                                                                                                                                          |
| `src/components/A4Preview.tsx`  | Use dynamic font sizes from header settings.                                                                                                                                                  |
