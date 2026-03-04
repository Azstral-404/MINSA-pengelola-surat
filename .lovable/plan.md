

# Plan: Fix Biodata Table Insertion at Cursor Position & Clean Deletion

## Problems
1. **"Sisipkan Tabel Biodata" always inserts at the beginning** — `document.execCommand('insertHTML')` loses the cursor position because `el.focus()` resets it. Need to save/restore the selection, or use the Selection API to insert at the current cursor position.
2. **Invisible table remnants when deleting biodata** — The generated HTML table (`<table>` tags) leaves behind empty/invisible table elements that can't be easily deleted in contentEditable. Need to generate simpler HTML (plain `<div>` lines instead of `<table>`) so deletion works naturally.

## Changes

### 1. Fix cursor-position insertion (`src/pages/Pengaturan.tsx`, lines 39-47)

Replace the `insertBiodataTable` function in `BiodataChecklistSection`:
- Before inserting, check if there's a saved selection/range inside the editor
- If no selection exists inside the editor, move cursor to the end before inserting
- Use `window.getSelection()` and `Range` API to insert at current cursor position

### 2. Replace `<table>` with simple `<div>` format (`src/lib/store.ts`, `generateBiodataTableHtml`)

Change `generateBiodataTableHtml` to output simple `<div>` lines instead of `<table>`:
```html
<div>Nama&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {nama}</div>
<div>Tempat Lahir&nbsp;: {tempat_lahir}</div>
```
This makes it trivially deletable in contentEditable — just select and delete like normal text. Use `&nbsp;` padding to align colons.

| File | Changes |
|------|---------|
| `src/pages/Pengaturan.tsx` | Fix `insertBiodataTable` to insert at cursor position using Selection API |
| `src/lib/store.ts` | Change `generateBiodataTableHtml` from `<table>` to simple `<div>` lines with `&nbsp;` alignment |

