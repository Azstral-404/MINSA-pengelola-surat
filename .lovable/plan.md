

# Plan: Dashboard Buttons, Responsive Tabs, PDF Export, Themes, Akun Tab, and Landing Page

## 1. Dashboard Surat Buttons (Index.tsx)

**Problem**: Buttons silently do nothing when no jenis surat exists, and always pick the first one.

**Fix**:
- **0 jenis surat**: Navigate to `/pengaturan` and auto-select the "surat" tab (via query param `?tab=surat`)
- **1 jenis surat**: Navigate directly to tambah page (current behavior)
- **2+ jenis surat**: Show a popover/dropdown listing all jenis surat options for user to pick

Implementation: Use `DropdownMenu` from shadcn for the multi-option case. Both green and red buttons get the same logic but with different `arah` param.

## 2. Responsive Tabs on Pengaturan (Pengaturan.tsx)

**Problem**: Tabs don't reflow properly when sidebar opens/closes.

**Fix**: Use `useSidebar` hook from sidebar context to listen to sidebar state changes. Add a key or force re-render on sidebar state change. Also apply `flex-wrap` and ensure each tab trigger uses proper responsive sizing. The real fix: the `TabsList` needs `w-full` and tabs should use `flex-1 min-w-0` with proper truncation. Will also add the new "Akun" tab (8th tab).

## 3. Remove "Manajemen Surat" from Sidebar (AppSidebar.tsx)

Remove the `<span className="text-xs text-muted-foreground">Manajemen Surat</span>` line.

## 4. Export PDF instead of DOCX (PreviewSurat.tsx)

- Change "Export DOCX" to "Export PDF"
- Remove "PDF" text from "Print / PDF" menu item (just "Print")
- Use `window.print()` approach with proper `@media print` CSS to generate a true PDF via browser's Save as PDF, OR use `html2canvas` + `jspdf`. Since we want it to look exactly like the preview, use the browser's built-in print-to-PDF: open a new window with the A4 content, trigger print (user can save as PDF). This is what `handlePrint` already does. For a dedicated "Export PDF" we'll do the same print flow but label it clearly.
- Remove the `handleExportDocx` function entirely.

## 5. Add 5 More Themes (store.ts + index.css)

Add these 5 new color themes with full light+dark CSS variables:
- **Indigo** (`#4f46e5`)
- **Cyan** (`#06b6d4`)  
- **Fuchsia** (`#d946ef`)
- **Lime** (`#84cc16`)
- **Zinc** (`#71717a`)

Update `ColorTheme` type and `COLOR_THEMES` array in store.ts.

## 6. Akun Tab in Pengaturan (Pengaturan.tsx)

New tab after "Data" containing:
- **MINSA logo**: Upload/change the sidebar logo (currently `minsa-logo.png`). Store as base64 in settings.
- **Kemenag logo**: Upload/change the header Kemenag logo (currently `kemenag-logo.png`). Store as base64 in settings.
- **MINSA text**: Change the sidebar title text (default "MINSA"). Store in `settings.appName`.
- **MIN 1 Langsa text**: Change the school short name. Store in `settings.schoolName`.
- **Identitas Sekolah (NSM/NPSN)**: Move from Header tab to here.
- **Logout button**: Clear localStorage + reload, with ConfirmDialog confirmation.

New fields in `AppSettings`: `appName`, `schoolName`, `customLogo`, `customKemenagLogo`.

## 7. Landing/Onboarding Page

**When**: First time opening (no data in localStorage, or a flag `settings.onboarded !== true`).

**Flow**: Show a setup page instead of dashboard:
- **Surname** field → sets `appName` (sidebar title, default "MINSA")
- **Nama Sekolah** field → sets `schoolName` (e.g. "MIN 1 Langsa")
- Auto-detect madrasah type from name: if contains RA/MI/MIN/MIS/MTS/MTs/MTsN/MTSN/MTSS/MTsS/MA/MAN/MAS, show below the field: `Kementerian Agama Kota {extracted city}` and auto-set `suratHeader.line2`.
- Submit button saves settings and sets `onboarded: true`.

Detection logic: Parse school name like "MIN 1 Langsa" → type="MIN", the rest after the number = city "Langsa" → display "Kementerian Agama Kota Langsa".

## 8. Dashboard Identity Sync (Index.tsx)

- Remove hardcoded "MIN 1 Langsa" text
- Use `data.settings.schoolName` instead
- The subtitle shows `{schoolName} — NSM: ... · NPSN: ...`

## Files Changed

| File | Changes |
|------|---------|
| `src/lib/store.ts` | Add `appName`, `schoolName`, `customLogo`, `customKemenagLogo`, `onboarded` to AppSettings. Add 5 new themes to ColorTheme type and COLOR_THEMES array. Update defaults and loadData. |
| `src/index.css` | Add CSS variables for 5 new themes (indigo, cyan, fuchsia, lime, zinc) with light+dark variants. |
| `src/pages/Index.tsx` | Smart button logic with DropdownMenu for 2+ jenis surat. Use `schoolName` from settings instead of hardcoded text. |
| `src/pages/Pengaturan.tsx` | Add Akun tab (icon: User). Move NSM/NPSN from Header to Akun. Add logo uploads, app name, school name, logout. Support `?tab=surat` query param for default tab. Use `useSidebar` for responsive tabs. |
| `src/pages/PreviewSurat.tsx` | Replace Export DOCX with Export PDF. Remove "PDF" from Print menu item. |
| `src/components/AppSidebar.tsx` | Remove "Manajemen Surat" text. Use dynamic `appName` and logos from settings. |
| `src/components/Layout.tsx` | Use dynamic `schoolName` and `customKemenagLogo` from settings. |
| `src/components/A4Preview.tsx` | Use dynamic Kemenag logo from settings. |
| `src/pages/Onboarding.tsx` | New landing page for first-time setup. |
| `src/App.tsx` | Add onboarding route, redirect to it if not onboarded. |

