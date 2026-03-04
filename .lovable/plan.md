

# Plan: Fix Biodata Table Alignment, Responsive Tabs with Icons, and Cursor Insertion

## 3 Issues to Fix

### 1. Biodata table colon (`:`) alignment in `generateBiodataTableHtml`

**Problem**: Using `\u00A0` padding based on character count doesn't produce visually aligned colons because proportional fonts have different character widths.

**Fix** (`src/lib/store.ts`): Replace the `<div>` approach with an inline `<table>` using fixed-width styling, or use `<span style="display:inline-block; width:Xch">` for monospace-like alignment. Best approach: use a simple two-column layout with `display:inline-block` and a fixed `min-width` on the label span:

```html
<div><span style="display:inline-block;min-width:20ch">Nama</span>: {nama}</div>
<div><span style="display:inline-block;min-width:20ch">Tempat Lahir</span>: {tempat_lahir}</div>
```

The `ch` unit ensures consistent alignment regardless of font. Calculate `min-width` as `maxLabelLen + 1` in `ch` units.

### 2. Responsive tabs with icons in Pengaturan

**Problem**: 7-column grid tabs overflow on small screens.

**Fix** (`src/pages/Pengaturan.tsx`):
- Replace `grid grid-cols-7` with `flex flex-wrap` or use responsive classes
- Add icons to each tab trigger:
  - Kepala → `UserRound`
  - Tahun Ajaran → `CalendarDays`  
  - Jenis Surat → `FileText`
  - Biodata → `Contact`
  - Header Surat → `Building`
  - Tema → `Palette`
  - Data → `Database`
- On small screens, show only icon (hide text via `hidden sm:inline`). On larger screens show icon + text.

### 3. Cursor-position insertion still not working

**Problem**: `el.focus()` resets cursor. The `savedSelectionRef` is local to `BiodataChecklistSection` but the `useEffect` listeners may not fire properly since `blur` on the editor triggers state update (`onBlur={setJenisIsi(innerHTML)}`) which re-renders and resets the `contentEditable`.

**Fix**: The `dangerouslySetInnerHTML` re-render on blur destroys the DOM nodes that `savedSelectionRef` points to. Solution: instead of saving a `Range` object (which becomes invalid after DOM changes), save the cursor **offset** (character position). Or simpler: don't re-render the contentEditable on blur — remove `dangerouslySetInnerHTML` and manage it imperatively. However the simplest fix: move the selection save to `mousedown` on the insert button (before focus leaves the editor), using `onMouseDown` on the button to capture the range before blur fires.

## Changes Summary

| File | Changes |
|------|---------|
| `src/lib/store.ts` | Fix `generateBiodataTableHtml` to use `display:inline-block;min-width:Xch` for aligned colons |
| `src/pages/Pengaturan.tsx` | (1) Add icons to all 7 tab triggers with responsive hide/show text. (2) Change TabsList from `grid grid-cols-7` to responsive flex. (3) Fix insertion by capturing selection on button `onMouseDown` before blur fires |

