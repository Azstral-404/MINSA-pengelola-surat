# MINSA Surat Manager — Build Guide

## Prerequisites

- **Node.js** 18+ (recommended: LTS)
- **npm** 9+ (comes with Node.js)
- Windows 10/11 (for building Windows installers)

## Setup

```bash
npm install
```

> If you see warnings about optional dependencies, that is normal — rollup platform binaries
> are optional and npm will install only the one matching your OS.

## Web Development

```bash
npm run dev
```

Opens at `http://localhost:8080`

## Electron Development

```bash
npm run electron:dev
```

## Building Windows Installers

### All formats (NSIS installer + MSI + Portable EXE)

```bash
npm run electron:build:all
```

Output: `dist-electron/` folder

### Individual formats

```bash
# NSIS installer (.exe setup)
npm run electron:build:nsis

# MSI installer
npm run electron:build:msi

# Portable EXE (no installation needed)
npm run electron:build:portable
```

## Troubleshooting

### `Cannot find package 'vite'`

Run `npm install` first. Make sure you are in the project root directory.

### `@rollup/rollup-linux-x64-gnu` not found on Windows

This is expected — rollup uses platform-specific binaries. The Windows binary
(`@rollup/rollup-win32-x64-msvc`) is listed as optional and will be installed
automatically by npm on Windows.

### Build fails with `lovable-tagger` error

`lovable-tagger` is only used in development mode and is optional for builds.
The `vite.config.ts` handles its absence gracefully.

### MSI build fails

Ensure you have the [WiX Toolset](https://wixtoolset.org/) installed, or
use only NSIS/portable targets:

```bash
npm run electron:build:nsis
npm run electron:build:portable
```

## Output Files

After a successful build, find installers in `dist-electron/`:

| File | Description |
|------|-------------|
| `MINSA-Surat-Manager-Setup-x.x.x.exe` | NSIS installer (recommended) |
| `MINSA-Surat-Manager-x.x.x.msi` | MSI installer |
| `MINSA-Surat-Manager-Portable-x.x.x.exe` | Portable EXE (no install needed) |
