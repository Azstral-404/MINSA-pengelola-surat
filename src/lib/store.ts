// MINSA - Store & Types
export interface KepalaMadrasah {
  id: string;
  nip: string;
  nama: string;
}

export interface TahunAjaran {
  id: string;
  label: string; // e.g. "2025/2026"
}

export interface JenisSurat {
  id: string;
  slug: string;
  label: string; // e.g. "Surat Ket Aktif"
  templateJudul: string;
  templateIsi: string; // HTML content
  createdAt: string;
}

export interface Surat {
  id: string;
  jenisSuratId: string;
  nomorSurat: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  kelas: string;
  noInduk: string;
  nisn: string;
  namaOrangTua: string;
  alamat: string;
  tahunAjaran: string;
  bulan: number; // 1-12
  tahun: number;
  kepalaMadrasahId: string;
  createdAt: string;
}

export type ThemeName = 'default' | 'emerald' | 'ocean' | 'sunset' | 'royal';

export interface AppSettings {
  kepalaMadrasah: KepalaMadrasah[];
  tahunAjaran: TahunAjaran[];
  jenisSurat: JenisSurat[];
  theme: ThemeName;
}

export interface AppData {
  settings: AppSettings;
  surat: Surat[];
}

const DEFAULT_DATA: AppData = {
  settings: {
    kepalaMadrasah: [],
    tahunAjaran: [],
    jenisSurat: [],
    theme: 'default',
  },
  surat: [],
};

const STORAGE_KEY = 'minsa-data';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed, settings: { ...DEFAULT_DATA.settings, ...parsed.settings } };
    }
  } catch {}
  return structuredClone(DEFAULT_DATA);
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatNomorSurat(nomorSurat: string, bulan: number, tahun: number): string {
  const bulanStr = String(bulan).padStart(2, '0');
  return `NOMOR : B. ${nomorSurat || '......'} /Mi.01.21/1/PP.01.1/${bulanStr}/${tahun}`;
}
