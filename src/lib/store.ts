// MINSA - Store & Types
export interface KepalaMadrasah {
  id: string;
  nip: string;
  nama: string;
}

export interface TahunAjaran {
  id: string;
  label: string;
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
  updatedAt?: string;
}

export type ThemeName = 'light' | 'dark';
export type ColorTheme = 'default' | 'emerald' | 'ocean' | 'sunset' | 'royal';

export interface SuratHeader {
  line1: string;
  line2: string;
  school: string;
  address: string;
  contact: string;
  logoUrl: string; // base64 data URL
}

export interface AppSettings {
  kepalaMadrasah: KepalaMadrasah[];
  tahunAjaran: TahunAjaran[];
  jenisSurat: JenisSurat[];
  theme: ThemeName;
  colorTheme: ColorTheme;
  activeTahunAjaran: string;
  dashboardTitle: string;
  suratHeader: SuratHeader;
  nsm: string;
  npsn: string;
  nomorSuratFormat: string;
}

export interface AppData {
  settings: AppSettings;
  surat: Surat[];
}

const DEFAULT_HEADER: SuratHeader = {
  line1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
  line2: 'KANTOR KEMENTERIAN AGAMA KOTA LANGSA',
  school: 'MADRASAH IBTIDAIYAH NEGERI 1 LANGSA',
  address: 'Jl. T.M Bahrum No.2 Kel. Jawa Kec. Langsa Kota, Kota Langsa, 24412',
  contact: 'Telp: (0641) 426487 Email: minaborong@gmail.com',
  logoUrl: '',
};

const DEFAULT_DATA: AppData = {
  settings: {
    kepalaMadrasah: [],
    tahunAjaran: [],
    jenisSurat: [],
    theme: 'light',
    colorTheme: 'default',
    activeTahunAjaran: '',
    dashboardTitle: 'Sistem Surat',
    suratHeader: DEFAULT_HEADER,
    nsm: '111111730001',
    npsn: '10105537',
    nomorSuratFormat: 'B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}',
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
        settings: {
          ...DEFAULT_DATA.settings,
          ...parsed.settings,
          suratHeader: { ...DEFAULT_HEADER, ...(parsed.settings?.suratHeader || {}) },
        },
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

export const KELAS_OPTIONS = [
  { value: 'I', label: 'I (Satu)' },
  { value: 'II', label: 'II (Dua)' },
  { value: 'III', label: 'III (Tiga)' },
  { value: 'IV', label: 'IV (Empat)' },
  { value: 'V', label: 'V (Lima)' },
  { value: 'VI', label: 'VI (Enam)' },
];

export const COLOR_THEMES: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'default', label: 'Default', color: '#1e293b' },
  { value: 'emerald', label: 'Emerald', color: '#059669' },
  { value: 'ocean', label: 'Ocean', color: '#0284c7' },
  { value: 'sunset', label: 'Sunset', color: '#ea580c' },
  { value: 'royal', label: 'Royal', color: '#7c3aed' },
];

export function isInTahunAjaran(surat: Pick<Surat, 'bulan' | 'tahun'>, taLabel: string): boolean {
  const parts = taLabel.split('/');
  if (parts.length !== 2) return false;
  const startYear = parseInt(parts[0], 10);
  const endYear = parseInt(parts[1], 10);
  if (isNaN(startYear) || isNaN(endYear)) return false;
  return (surat.tahun === startYear && surat.bulan >= 7) || (surat.tahun === endYear && surat.bulan <= 6);
}

export function formatNomorSurat(nomorSurat: string, bulan: number, tahun: number, format?: string): string {
  const bulanStr = String(bulan).padStart(2, '0');
  const template = format || 'B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}';
  const result = template
    .replace(/\{nomor\}/gi, nomorSurat || '......')
    .replace(/\{bulan\}/gi, bulanStr)
    .replace(/\{tahun\}/gi, String(tahun));
  return `NOMOR : ${result}`;
}
