

# Plan: Add Biodata Insert Button to Template Editor

## What

Add a "Biodata" toolbar button above the template `contentEditable` area (both in "Tambah" and "Edit" modes). When clicked, it shows a dropdown/popover listing all available placeholders. Clicking a placeholder inserts it at the cursor position in the rich text editor.

## Placeholders

`{nama}`, `{tempat_lahir}`, `{tanggal_lahir}`, `{jenis_kelamin}`, `{kelas}`, `{no_induk}`, `{nisn}`, `{nama_orang_tua}`, `{alamat}`, `{tahun_ajaran}`

## UI

- A small "Biodata" button with a `UserPlus` icon, placed in the toolbar row next to "Import DOCX"
- On click, opens a `Popover` with a list of placeholder chips/buttons
- Clicking a chip inserts the placeholder text (e.g. `{nama}`) at the current cursor position using `document.execCommand('insertText', false, '{nama}')`
- Both the "add new" and "edit" template sections get this button

## Changes

| File | Changes |
|------|---------|
| `src/pages/Pengaturan.tsx` | Add Popover with placeholder buttons next to template editor, use `document.execCommand('insertText')` to insert at cursor |

## Implementation Detail

- Define a constant array of biodata items: `{ label: 'Nama', placeholder: '{nama}' }`, etc.
- Create a small `BiodataInsertButton` inline component that renders a `Popover` trigger + content
- The insert function focuses the contentEditable div first, then uses `execCommand('insertText')` to insert at cursor
- Place the button in the toolbar row for both add and edit template sections

