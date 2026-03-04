# Plan: Logo Size Setting, Template Spacing, Storage Path, and Dashboard Date

## 1. Adjustable Logo Size in Pengaturan > Header Surat

Add a `logoSize` field (number, default `22`, in mm) to `SuratHeader` in `store.ts`. In `Pengaturan.tsx` Header tab, add a slider/input next to the upload button to control logo width/height. In `A4Preview.tsx`, use `h.logoSize || 22` for the logo dimensions.

**Files**: `src/lib/store.ts`, `src/pages/Pengaturan.tsx`, `src/components/A4Preview.tsx`

## 2. Add spacing after paragraphs in template content

In `A4Preview.tsx`, the isi div currently has no paragraph spacing. Add CSS to the isi container so `<p>` tags get `margin-bottom` spacing (e.g., `6pt` or `8px`). Use a `<style>` tag or inline approach targeting the isi div's children.

**File**: `src/components/A4Preview.tsx` — add a wrapping style like:

```css
p { margin-bottom: 6pt; }
```

## 3. Storage location setting (localStorage path display)

**Important limitation**: A web browser app **cannot** access the Windows file system or change where `localStorage` is stored. This is a browser security restriction. The app runs in a browser, not as a desktop app.  
  
this is be a desktop app in future

What we **can** do: Add a display-only setting showing the default path info (`C:/Users/{username}/AppData/Roaming/Minsa`) and provide an **Export/Import** feature so users can save/load their data as a JSON file to any location via the browser's file download/upload dialog. This gives users practical control over where their data backup lives.

**Files**: `src/pages/Pengaturan.tsx` — add an export/import section in a new "Penyimpanan" tab or within an existing tab.

## 4. Dashboard Riwayat Terakhir — show full creation date + last edit

Current display: `SURAT KETERANGAN AKTIF · Maret 2026`

Change to: `SURAT KETERANGAN AKTIF · 21 Maret 2026 | last edit`

In `src/pages/Index.tsx` line 149, format `createdAt` to show the day, and append `updatedAt` as "last edit" if it exists.

**File**: `src/pages/Index.tsx`

## Summary


| File                           | Changes                                              |
| ------------------------------ | ---------------------------------------------------- |
| `src/lib/store.ts`             | Add `logoSize: number` to `SuratHeader`, default 22  |
| `src/components/A4Preview.tsx` | Use dynamic logo size, add paragraph spacing to isi  |
| `src/pages/Pengaturan.tsx`     | Add logo size slider, add export/import data section |
| `src/pages/Index.tsx`          | Show full date + last edit in Riwayat Terakhir       |
