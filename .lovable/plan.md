# Plan: Fixes and Enhancements

## 1. Add Edit Confirmation for Jenis Surat and Kepala Madrasah

In `Pengaturan.tsx`, wrap `saveEditJenis` and `saveEditKepala` with the existing `addConfirm` dialog pattern, using titles like "Konfirmasi Edit".

Add a new `editConfirm` state (or reuse `addConfirm` with different label) to show confirmation before saving edits.

## 2. Fix Biodata Checklist: Numbering + Reset on Insert

**Numbering**: In `BiodataChecklistSection`, track selection order. When user checks "Nama", show "1" next to it; check "Alamat" next, show "2", etc. Store as ordered array (already is `selectedBiodata`). Display the index+1 next to each checked item.

**Reset on Insert**: After `insertBiodataTable()` succeeds, call `onSelectedChange([])` to clear all ticks. (Currently line 141 says "Do NOT reset" — change this to reset.)

## 3. Fix Template Biodata → TambahSurat Dynamic Fields

In `TambahSurat.tsx`, the current logic at line 27-30 checks `selectedBiodata` to determine visible fields. But it should also check if the template (`templateIsi`) contains any placeholders. If NO placeholders are detected in the template AND no `selectedBiodata` is set, only show: Jenis Surat (arah), Nomor Surat, and Kepala Madrasah.

**Implementation**: Scan `jenisSurat.templateIsi` for any `{placeholder}` patterns matching known biodata fields. If none found and `selectedBiodata` is empty, set `visibleFields = []`.

## 4. Fix Header Defaults Based on School Name (Onboarding)

In `Onboarding.tsx` `handleSubmit`, auto-populate header fields based on detected school type:

- **Baris 1**: If madrasah type detected (RA/MI/MTS/MA and variants) → `"KEMENTERIAN AGAMA REPUBLIK INDONESIA"`. Else → empty.
- **Baris 2**: If madrasah → `"KANTOR KEMENTERIAN AGAMA KOTA {CITY}"`. Else → empty.
- **Baris 3 (school)**: Map type to full name:
  - RA → `"RAUDHATHUL ATHFAL {CITY}"`
  - MI → `"MADRASAH IBTIDAIYAH {NEGERI/SWASTA} {CITY}"` (N→NEGERI, S→SWASTA from type suffix like MIN/MIS)
  - MTs → `"MADRASAH TSANAWIYAH {NEGERI/SWASTA} {CITY}"` (N→NEGERI, S→SWASTA from type suffix like MTsN/MTsS)
  - MA → `"MADRASAH ALIYAH {NEGERI/SWASTA} {CITY}"` (N→NEGERI, S→SWASTA from type suffix like MAN/MAS)
  - Else → empty

Update `detectMadrasahInfo` in `store.ts` to also return `status: 'NEGERI' | 'SWASTA' | ''` and `baseType: 'RA' | 'MI' | 'MTS' | 'MA' | ''` for easier mapping.

**Logo**: Ensure `logoUrl` stays empty by default (already is `''` in defaults). No change needed.

**Position**: Logo and line positions in header preview and A4Preview are already using absolute positioning. No changes needed — they already work correctly.

## 5. Separate Kepala Madrasah into Own Card (Same Akun Tab)

In `Pengaturan.tsx` Akun tab, move the Kepala Madrasah section from inside the "Akun & Identitas" Card into a separate `<Card>` below it, still within `TabsContent value="akun"`.

**Only allow one Kepala**: Hide the add form when `kepalaMadrasah.length >= 1`. Show only the edit/view UI.

**Nama first, NIP second**: Swap field order in both add form and display.

**Beautiful view**: When one Kepala exists, show a styled card with avatar placeholder, name prominently, NIP below, with edit/delete buttons.

## 6. Fix Print and Export PDF with jsPDF

Install `jspdf` and `html2canvas` packages. Rewrite `PreviewSurat.tsx`:

- **Export PDF**: Use `html2canvas` to capture `#a4-print-area` as canvas, then `jsPDF.addImage()` to create a proper PDF file that auto-downloads.
- **Print**: Use the same `html2canvas` approach but open in a new window and trigger `window.print()`.

This replaces the current `openPrintWindow` approach which has styling issues.  
  
7. Merge  "Tempat Lahir" and "Tanggal Lahir" into "Tempat/Tanggal Lahir" at Template Biodata

daripada "Tempat Lahir : {tempat_lahir}" "Tanggal Lahir : {tanggal lahir}" jadikan menjadi "Tempat/Tanggal Lahir : {tempat_lahir}, {tanggal_lahir}".

## Files Changed


| File                         | Changes                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/store.ts`           | Extend `detectMadrasahInfo` return type with `baseType` and `status`                                                         |
| `src/pages/Pengaturan.tsx`   | Edit confirmations, biodata numbering + reset, Kepala in separate card with limit of 1, name-first layout, beautiful display |
| `src/pages/TambahSurat.tsx`  | Check template for placeholders; if none, hide all biodata fields                                                            |
| `src/pages/Onboarding.tsx`   | Auto-set header line1/line2/school based on school type detection                                                            |
| `src/pages/PreviewSurat.tsx` | Replace print/PDF with html2canvas + jsPDF approach                                                                          |
| `package.json`               | Add `jspdf` and `html2canvas` dependencies                                                                                   |
