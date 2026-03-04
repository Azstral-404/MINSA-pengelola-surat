# Plan: Dynamic Biodata System, Template-Driven Form, and Default Updates

## Overview

Currently biodata fields are hardcoded. This plan makes them dynamic and configurable per jenis surat, formats selected biodata as a structured table in the document output, and makes the TambahSurat form show only fields that the template uses. except jenis surat, nomor surat, dan kepala madrasah. wich its stay at jenis surat , nomor surat first and kepala madrasah last

## 1. Add `biodataFields` to `JenisSurat` and custom biodata to `AppSettings`

**File: `src/lib/store.ts**`

- Add `BiodataField` interface: `{ key: string; label: string; placeholder: string; inputType: 'text' | 'date' | 'select'; isCustom?: boolean }`
- Add `customBiodata: BiodataField[]` to `AppSettings` for user-created fields (e.g. NIK)
- Add `selectedBiodata: string[]` (array of keys) to `JenisSurat` — tracks which biodata fields this template uses
- Add `extraFields: Record<string, string>` to `Surat` interface for custom field values
- Export a `DEFAULT_BIODATA` constant with the 10 standard fields
- Update defaults: `address` = `'Jln.Medan - Banda Aceh Gp.Teungoh Langsa Kota'`, `contact` = `'Email : minsa1959@gmail.com'`, `nsm` = `'111111740001'`, `npsn` = `'60703494'`

## 2. Biodata selection UI in Pengaturan > Jenis Surat

**File: `src/pages/Pengaturan.tsx**`

- In both "Tambah" and "Edit" template sections, add a **Biodata** checklist area below the template editor
- Show all default + custom biodata as checkboxes; user toggles which ones to include
- Store selected keys in the jenis surat's `selectedBiodata` array
- When biodata items are selected, auto-generate a formatted HTML table block (like the reference image) showing:
  ```
  Nama                     : {nama}
  Tempat/Tanggal Lahir     : {tempat_lahir}, {tanggal_lahir}
  ...
  ```
  User can insert this block into template via a "Sisipkan Biodata" button
- Add a new **"Biodata Kustom"** section (or sub-section in the Jenis Surat tab) where users can add/remove custom biodata fields (label + key). These become available in the checklist and in the form.

## 3. Template-driven form in TambahSurat

**File: `src/pages/TambahSurat.tsx**`

- Read `jenisSurat.selectedBiodata` to determine which fields to show
- Only render form fields for biodata that are in `selectedBiodata`
- For custom fields, render generic text inputs and store values in `surat.extraFields[key]`
- Keep Nomor Surat, Arah, and Kepala Madrasah always visible

## 4. A4Preview handles custom fields

**File: `src/components/A4Preview.tsx**`

- Extend `parseTemplate` to also replace custom field placeholders from `surat.extraFields`
- Format biodata section as aligned table (label padded, colon-separated) matching the reference image

## 5. Update default header values

**File: `src/lib/store.ts**`

- `address`: `'Jln.Medan - Banda Aceh Gp.Teungoh Langsa Kota'`
- `contact`: `'Email : minsa1959@gmail.com'`
- `nsm`: `'111111740001'`
- `npsn`: `'60703494'`

## Summary


| File                           | Changes                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `src/lib/store.ts`             | Add `BiodataField`, `customBiodata`, `selectedBiodata`, `extraFields`, update defaults |
| `src/pages/Pengaturan.tsx`     | Add biodata checklist per template, custom biodata CRUD, formatted insert              |
| `src/pages/TambahSurat.tsx`    | Dynamic form based on `selectedBiodata`, support custom fields                         |
| `src/components/A4Preview.tsx` | Parse custom placeholders, formatted biodata table output                              |
