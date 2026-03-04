

# Plan: Logo Position, Font, and Kelas Display Fixes

## Changes

### 1. Logo positioning (`src/components/A4Preview.tsx` line 52)
Current: `left: '-12.9mm', top: '0'`. Move logo closer to text (10px gap) and raise 2px above the border line.
- Change `left` to `'-10px'` relative approach — actually, need to keep absolute but adjust: change `left` from `-12.9mm` to `10px` (from the left edge of the padding area). Better approach: set `left: 0` and `top: '-2px'`, and use `marginRight: '10px'` won't work with absolute. Use `left: '-15mm'` (closer to text) and `bottom: '5px'` instead of `top: 0` so it sits 2px above the border.
- Final: `left: '-10mm'` (closer, ~10px gap to first text character), `bottom: '5px'` (2px above border line), keep `width: 22mm, height: 22mm`.

### 2. Ensure all fonts are Times New Roman
The main container already has `fontFamily: "'Times New Roman', serif"`. Add explicit `fontFamily` inheritance to the `dangerouslySetInnerHTML` isi div and signature block to ensure no override. Also add `* { font-family: inherit; }` approach via inline style on the root.

### 3. Kelas shows label like "III (Tiga)" in preview
Currently `{kelas}` replaces with just the value (e.g., "III"). Change the `parseTemplate` to look up `KELAS_OPTIONS` and use the label (e.g., "III (Tiga)") instead.
- Import `KELAS_OPTIONS` in `A4Preview.tsx`
- In `parseTemplate`, replace `{kelas}` with the matching label from `KELAS_OPTIONS`, falling back to the raw value.

## Files

| File | Changes |
|------|---------|
| `src/components/A4Preview.tsx` | Adjust logo `left`/`bottom`, add font-family enforcement, use KELAS_OPTIONS label for `{kelas}` |

