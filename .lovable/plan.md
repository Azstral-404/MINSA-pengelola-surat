# Plan: Logo Layout, Dashboard UI, Template Justify, Sidebar Updates

## Changes

### 1. A4 Preview Logo — Match MS Word Layout (Images 1-3)

From the screenshots: logo is positioned absolutely at `-12.9mm` horizontal from column, `-1.7mm` vertical from paragraph, size `25.47mm × 25.59mm`, "In front of text" wrapping.

In `A4Preview.tsx`:

- Change logo size from `70px` to `~25.5mm` (≈96px)
- Position: `left: -12.9mm`, `top: -1.7mm` relative to the header div
- Set `zIndex: 10` for "in front of text" behavior

### 2. Template Isi — Justify text

In `A4Preview.tsx`:

- Add `textAlign: 'justify'` to the `<div>` that renders `parsedIsi`

### 3. Dashboard Layout — Match Image 4

Current layout uses `grid-cols-3`. Image 4 shows a horizontal row of 5 sections:

- [Masuk total | Keluar total] [Masuk bulan | Keluar bulan] [+Surat Masuk] [+Surat Keluar]

In `Index.tsx`:

- Change grid to `grid-cols-1 md:grid-cols-5` single row
- Total card spans 2 cols, monthly card spans 1 col, each button spans 1 col
- Remove `lg:row-span-2`, make everything single row height

### 4. Sidebar Logo — Bigger

In `AppSidebar.tsx`:

- Increase from `w-28 h-28` to `w-36 h-36` (collapsed: `w-12 h-12`)
- Increase "MINSA" text from `text-lg` to `text-xl`

### 5. Add "© copyright AZSTRAL " credit above Pengaturan

In `AppSidebar.tsx`:

- Add small text "© copyright AZSTRAL" with copyright icon above the Pengaturan menu item in `SidebarFooter`

## Files to Edit


| File                            | Changes                                                |
| ------------------------------- | ------------------------------------------------------ |
| `src/components/A4Preview.tsx`  | Logo position/size per Word layout, justify isi text   |
| `src/pages/Index.tsx`           | Horizontal single-row stats layout matching screenshot |
| `src/components/AppSidebar.tsx` | Bigger logo, AZSTRAL credit above Pengaturan           |
