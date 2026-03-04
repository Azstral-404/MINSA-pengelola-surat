// MINSA - Store & Types

export interface BiodataField {
  key: string;
  label: string;
  placeholder: string;
  inputType: 'text' | 'date' | 'select';
  isCustom?: boolean;
}

export const DEFAULT_BIODATA: BiodataField[] = [
  { key: 'nama', label: 'Nama', placeholder: '{nama}', inputType: 'text' },
  { key: 'tempatLahir', label: 'Tempat Lahir', placeholder: '{tempat_lahir}', inputType: 'text' },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', placeholder: '{tanggal_lahir}', inputType: 'date' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin', placeholder: '{jenis_kelamin}', inputType: 'select' },
  { key: 'kelas', label: 'Kelas', placeholder: '{kelas}', inputType: 'select' },
  { key: 'noInduk', label: 'No. Induk', placeholder: '{no_induk}', inputType: 'text' },
  { key: 'nisn', label: 'NISN', placeholder: '{nisn}', inputType: 'text' },
  { key: 'namaOrangTua', label: 'Nama Orang Tua/Wali', placeholder: '{nama_orang_tua}', inputType: 'text' },
  { key: 'alamat', label: 'Alamat', placeholder: '{alamat}', inputType: 'text' },
  { key: 'tahunAjaran', label: 'Tahun Ajaran', placeholder: '{tahun_ajaran}', inputType: 'text' },
];

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
  selectedBiodata?: string[];
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
  extraFields?: Record<string, string>;
}

export type ThemeName = 'light' | 'dark';
export type ColorTheme = 'default' | 'emerald' | 'ocean' | 'sunset' | 'royal';

export interface SuratHeader {
  line1: string;
  line2: string;
  school: string;
  address: string;
  contact: string;
  logoUrl: string;
  logoSize: number;
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
  customBiodata?: BiodataField[];
}

export interface AppData {
  settings: AppSettings;
  surat: Surat[];
}

const DEFAULT_HEADER: SuratHeader = {
  line1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
  line2: 'KANTOR KEMENTERIAN AGAMA KOTA LANGSA',
  school: 'MADRASAH IBTIDAIYAH NEGERI 1 LANGSA',
  address: 'Jln.Medan - Banda Aceh Gp.Teungoh Langsa Kota',
  contact: 'Email : minsa1959@gmail.com',
  logoUrl: '',
  logoSize: 22,
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
    nsm: '111111740001',
    npsn: '60703494',
    nomorSuratFormat: 'B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}',
    customBiodata: [],
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
          customBiodata: parsed.settings?.customBiodata || [],
        },
        surat: (parsed.surat || []).map((s: any) => ({ ...s, arah: s.arah || 'keluar', extraFields: s.extraFields || {} })),
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

export function getAllBiodataFields(settings: AppSettings): BiodataField[] {
  return [...DEFAULT_BIODATA, ...(settings.customBiodata || []).map(f => ({ ...f, isCustom: true }))];
}

export function generateBiodataTableHtml(selectedKeys: string[], allFields: BiodataField[]): string {
  const selected = selectedKeys.map(key => allFields.find(f => f.key === key)).filter(Boolean) as BiodataField[];
  if (selected.length === 0) return '';
  
  const maxLabelLen = Math.max(...selected.map(f => f.label.length));
  
  let html = '';
  for (const field of selected) {
    const padding = '\u00A0'.repeat(Math.max(0, maxLabelLen - field.label.length));
    html += `<div>${field.label}${padding}\u00A0: ${field.placeholder}</div>`;
  }
  return html;
}
