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
  label: string;
  templateJudul: string;
  templateIsi: string;
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
  bulan: number;
  tahun: number;
  kepalaMadrasahId: string;
  arah: 'masuk' | 'keluar';
  createdAt: string;
}

export type ThemeName = 'light' | 'dark';

export interface AppSettings {
  kepalaMadrasah: KepalaMadrasah[];
  tahunAjaran: TahunAjaran[];
  jenisSurat: JenisSurat[];
  theme: ThemeName;
  activeTahunAjaran: string; // label of active TA
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
    theme: 'light',
    activeTahunAjaran: '',
  },
  surat: [],
};

const STORAGE_KEY = 'minsa-data';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_DATA,
        ...parsed,
        settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
        surat: (parsed.surat || []).map((s: any) => ({ ...s, arah: s.arah || 'keluar' })),
      };
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
