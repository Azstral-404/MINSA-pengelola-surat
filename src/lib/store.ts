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
  { key: 'tempatLahir', label: 'Tempat/Tanggal Lahir', placeholder: '{tempat_lahir}, {tanggal_lahir}', inputType: 'text' },
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
export type ColorTheme = 'default' | 'emerald' | 'ocean' | 'sunset' | 'royal' | 'rose' | 'teal' | 'amber' | 'slate' | 'indigo' | 'cyan' | 'fuchsia' | 'lime' | 'zinc';

export interface SuratHeader {
  line1: string;
  line2: string;
  school: string;
  address: string;
  contact: string;
  logoUrl: string;
  logoSize: number;
  line1Size?: number;
  line2Size?: number;
  schoolSize?: number;
  addressSize?: number;
  contactSize?: number;
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
  appName: string;
  schoolName: string;
  customLogo: string;
  customKemenagLogo: string;
  onboarded: boolean;
}

export interface AppData {
  settings: AppSettings;
  surat: Surat[];
}

const DEFAULT_HEADER: SuratHeader = {
  line1: '',
  line2: '',
  school: '',
  address: '',
  contact: '',
  logoUrl: '',
  logoSize: 22,
  line1Size: 16,
  line2Size: 14,
  schoolSize: 12,
  addressSize: 11,
  contactSize: 11,
};

function detectSystemTheme(): ThemeName {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

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
    nsm: '',
    npsn: '',
    nomorSuratFormat: 'B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}',
    customBiodata: [],
    appName: 'MANAJEMEN SURAT',
    schoolName: 'NAMA SEKOLAH',
    customLogo: '',
    customKemenagLogo: '',
    onboarded: false,
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
          appName: parsed.settings?.appName || 'MANAJEMEN SURAT',
          schoolName: parsed.settings?.schoolName || 'NAMA SEKOLAH',
          customLogo: parsed.settings?.customLogo || '',
          customKemenagLogo: parsed.settings?.customKemenagLogo || '',
          onboarded: parsed.settings?.onboarded ?? false,
        },
        surat: (parsed.surat || []).map((s: any) => ({ ...s, arah: s.arah || 'keluar', extraFields: s.extraFields || {} })),
      };
    }
  } catch {}
  // No stored data → use system theme
  return structuredClone({ ...DEFAULT_DATA, settings: { ...DEFAULT_DATA.settings, theme: detectSystemTheme() } });
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
  { value: 'rose', label: 'Rose', color: '#e11d48' },
  { value: 'teal', label: 'Teal', color: '#0d9488' },
  { value: 'amber', label: 'Amber', color: '#d97706' },
  { value: 'slate', label: 'Slate', color: '#475569' },
  { value: 'indigo', label: 'Indigo', color: '#4f46e5' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { value: 'fuchsia', label: 'Fuchsia', color: '#d946ef' },
  { value: 'lime', label: 'Lime', color: '#84cc16' },
  { value: 'zinc', label: 'Zinc', color: '#71717a' },
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
  
  const maxLen = Math.max(...selected.map(f => f.label.length)) + 1;
  
  let html = '';
  for (const field of selected) {
    html += `<div><span style="display:inline-block;min-width:${maxLen}ch">${field.label}</span>: ${field.placeholder}</div>`;
  }
  return html;
}

export const MADRASAH_TYPES = ['RA', 'MI', 'MIN', 'MIS', 'MTS', 'MTs', 'MTsN', 'MTSN', 'MTSS', 'MTsS', 'MA', 'MAN', 'MAS'];

export interface MadrasahInfo {
  type: string;
  city: string;
  isMadrasah: boolean;
  baseType: 'RA' | 'MI' | 'MTS' | 'MA' | '';
  status: 'NEGERI' | 'SWASTA' | '';
}

export function detectMadrasahInfo(schoolName: string): MadrasahInfo | null {
  if (!schoolName.trim()) return null;
  const sorted = [...MADRASAH_TYPES].sort((a, b) => b.length - a.length);
  for (const type of sorted) {
    const regex = new RegExp(`^${type}\\s+`, 'i');
    if (regex.test(schoolName.trim())) {
      const rest = schoolName.trim().replace(regex, '');
      const city = rest.replace(/^\d+\s*/, '').trim();
      if (city) {
        // Determine baseType
        const upper = type.toUpperCase();
        let baseType: MadrasahInfo['baseType'] = '';
        if (upper === 'RA') baseType = 'RA';
        else if (upper === 'MI' || upper === 'MIN' || upper === 'MIS') baseType = 'MI';
        else if (upper === 'MTS' || upper === 'MTSN' || upper === 'MTSS') baseType = 'MTS';
        else if (upper === 'MA' || upper === 'MAN' || upper === 'MAS') baseType = 'MA';

        // Determine status (N=NEGERI, S=SWASTA)
        let status: MadrasahInfo['status'] = '';
        const lastChar = type.slice(-1).toUpperCase();
        if (lastChar === 'N' && type.length > 2) status = 'NEGERI';
        else if (lastChar === 'S' && type.length > 2) status = 'SWASTA';

        return { type, city, isMadrasah: true, baseType, status };
      }
    }
  }
  return { type: '', city: '', isMadrasah: false, baseType: '', status: '' };
}
