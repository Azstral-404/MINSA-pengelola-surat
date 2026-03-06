import React, { useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { generateId, slugify, JenisSurat, COLOR_THEMES, ColorTheme, DEFAULT_BIODATA, BiodataField, getAllBiodataFields, generateBiodataTableHtml, expandSchoolName, buildLine2, buildSchoolSub, parseMadrasahName } from '@/lib/store';
import { KABUPATEN_LIST } from '@/lib/kabupaten';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Upload, Moon, Sun, ImagePlus, Download, FolderOpen, ListChecks, CalendarDays, FileText, Contact, Building, Palette, Database, User, LogOut, Pencil, Check, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { loadData, saveData } from '@/lib/store';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import kemenagLogo from '@/assets/kemenag-logo.png';

const FONT_SIZE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 8); // 8-20

// Detect Electron environment
declare global {
  interface Window {
    electronAPI?: {
      getDataPath: () => Promise<string>;
      chooseDataPath: () => Promise<string | null>;
      isElectron: boolean;
    };
  }
}

const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

function DataPathSection() {
  const [dataPath, setDataPath] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.getDataPath().then(p => setDataPath(p));
    }
  }, []);

  const handleChoose = async () => {
    if (!isElectron || !window.electronAPI) return;
    setLoading(true);
    try {
      const chosen = await window.electronAPI.chooseDataPath();
      if (chosen) {
        setDataPath(chosen);
        toast.success('Lokasi penyimpanan diperbarui. Restart aplikasi agar perubahan berlaku.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-muted/50 space-y-2">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Lokasi Penyimpanan Data</Label>
      </div>
      {isElectron ? (
        <>
          <p className="text-xs font-mono text-foreground break-all">{dataPath || 'Memuat...'}</p>
          <Button variant="outline" size="sm" onClick={handleChoose} disabled={loading}>
            <FolderOpen className="mr-1 h-4 w-4" />
            {loading ? 'Memilih...' : 'Ubah Lokasi'}
          </Button>
          <p className="text-xs text-muted-foreground">Pilih folder untuk menyimpan data aplikasi. Restart diperlukan setelah mengubah.</p>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-mono">localStorage (browser)</p>
          <p className="text-xs text-muted-foreground">Lokasi kustom tersedia di versi desktop app (Electron).</p>
        </>
      )}
    </div>
  );
}

const BiodataChecklistSection = ({
  selectedBiodata,
  onSelectedChange,
  editorRef,
  settings,
}: {
  selectedBiodata: string[];
  onSelectedChange: (keys: string[]) => void;
  editorRef: React.RefObject<HTMLDivElement>;
  settings: any;
}) => {
  const allFields = getAllBiodataFields(settings);

  const toggleKey = (key: string) => {
    if (selectedBiodata.includes(key)) {
      onSelectedChange(selectedBiodata.filter(k => k !== key));
    } else {
      onSelectedChange([...selectedBiodata, key]);
    }
  };

  const savedRangeRef = useRef<{ startOffset: number; endOffset: number; startPath: number[]; endPath: number[] } | null>(null);

  const getNodePath = (node: Node, container: Node): number[] => {
    const path: number[] = [];
    let current = node;
    while (current && current !== container) {
      const parent = current.parentNode;
      if (!parent) break;
      path.unshift(Array.from(parent.childNodes).indexOf(current as ChildNode));
      current = parent;
    }
    return path;
  };

  const captureSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          startPath: getNodePath(range.startContainer, el),
          endPath: getNodePath(range.endContainer, el),
        };
      }
    }
  };

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.addEventListener('keyup', captureSelection);
    el.addEventListener('mouseup', captureSelection);
    return () => {
      el.removeEventListener('keyup', captureSelection);
      el.removeEventListener('mouseup', captureSelection);
    };
  }, [editorRef]);

  const handleInsertMouseDown = () => {
    captureSelection();
  };

  const insertBiodataTable = () => {
    const el = editorRef.current;
    if (!el) return;
    if (selectedBiodata.length === 0) { toast.error('Pilih biodata terlebih dahulu'); return; }

    // Merge logic: find existing biodata lines and extract their keys
    const currentHtml = el.innerHTML;
    const existingKeys: string[] = [];
    for (const field of allFields) {
      if (currentHtml.includes(field.placeholder)) {
        existingKeys.push(field.key);
      }
    }

    // Merge: combine existing + newly selected, deduplicate
    const mergedKeys = [...new Set([...existingKeys, ...selectedBiodata])];

    // Remove existing biodata block if present
    let cleanHtml = currentHtml;
    for (const field of allFields) {
      const divRegex = new RegExp(`<div>[^<]*${field.placeholder.replace(/[{}]/g, '\\$&')}[^<]*</div>`, 'gi');
      cleanHtml = cleanHtml.replace(divRegex, '');
    }

    const html = generateBiodataTableHtml(mergedKeys, allFields);

    el.innerHTML = cleanHtml;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    document.execCommand('insertHTML', false, html);
    savedRangeRef.current = null;
    // Reset selectedBiodata after insert
    onSelectedChange([]);
    toast.success('Tabel biodata disisipkan');
  };

  return (
    <div className="border border-border rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1">
          <ListChecks className="h-4 w-4" />Pilih Biodata untuk Template
        </Label>
        <Button variant="outline" size="sm" onMouseDown={handleInsertMouseDown} onClick={insertBiodataTable}>
          Sisipkan Tabel Biodata
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Centang field yang ingin ditampilkan pada form surat dan dokumen output.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allFields.map(field => {
          const orderIndex = selectedBiodata.indexOf(field.key);
          return (
            <label key={field.key} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-muted/50">
              <Checkbox
                checked={selectedBiodata.includes(field.key)}
                onCheckedChange={() => toggleKey(field.key)}
              />
              <span>{field.label}</span>
              {orderIndex >= 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  {orderIndex + 1}
                </span>
              )}
              {field.isCustom && <span className="text-[10px] px-1 py-0.5 rounded bg-accent text-accent-foreground">Kustom</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
};

const Pengaturan = () => {
  const { data, updateData, setTheme, setColorTheme } = useApp();
  const [searchParams] = useSearchParams();
  const { state: sidebarState } = useSidebar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const editTemplateRef = useRef<HTMLDivElement>(null);
  const akunLogoRef = useRef<HTMLInputElement>(null);
  const akunKemenagLogoRef = useRef<HTMLInputElement>(null);
  const isDark = data.settings.theme === 'dark';

  const defaultTab = searchParams.get('tab') || 'akun';

  const [nipInput, setNipInput] = useState('');
  const [namaInput, setNamaInput] = useState('');
  const [tahunInput, setTahunInput] = useState('');
  const [jenisLabel, setJenisLabel] = useState('');
  const [jenisJudul, setJenisJudul] = useState('');
  const [jenisIsi, setJenisIsi] = useState('');
  const [newSelectedBiodata, setNewSelectedBiodata] = useState<string[]>([]);
  const [editingJenis, setEditingJenis] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editJudul, setEditJudul] = useState('');
  const [editIsi, setEditIsi] = useState('');
  const [editSelectedBiodata, setEditSelectedBiodata] = useState<string[]>([]);

  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomKey, setNewCustomKey] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'kepala' | 'tahun' | 'jenis' | 'biodata'; id: string; label: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [addConfirm, setAddConfirm] = useState<{ type: string; action: () => void } | null>(null);
  const [editConfirm, setEditConfirm] = useState<{ type: string; action: () => void } | null>(null);

  // Kepala edit state
  const [editingKepalaId, setEditingKepalaId] = useState<string | null>(null);
  const [editKepalaName, setEditKepalaName] = useState('');
  const [editKepalaNip, setEditKepalaNip] = useState('');

  const h = data.settings.suratHeader;
  const kabupaten = data.settings.kabupaten || '';
  const [kabupatenSearch, setKabupatenSearch] = useState(kabupaten);
  const [showKabupatenList, setShowKabupatenList] = useState(false);

  const filteredKabupaten = useMemo(() => {
    const q = kabupatenSearch.toLowerCase();
    if (!q) return KABUPATEN_LIST.slice(0, 20);
    return KABUPATEN_LIST.filter(k => k.toLowerCase().includes(q)).slice(0, 30);
  }, [kabupatenSearch]);

  const handleSelectKabupaten = (k: string) => {
    setKabupatenSearch(k);
    setShowKabupatenList(false);
    updateData(d => ({ ...d, settings: { ...d.settings, kabupaten: k } }));
    // Auto-update header line2 and schoolSub
    const newLine2 = buildLine2(k);
    const newSchoolSub = buildSchoolSub(k);
    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        kabupaten: k,
        suratHeader: { ...d.settings.suratHeader, line2: newLine2, schoolSub: newSchoolSub },
      },
    }));
  };

  // When schoolName changes in header tab, auto-expand school
  const handleSchoolNameAutoExpand = () => {
    const sn = data.settings.schoolName;
    if (!sn.trim()) return;
    const expanded = expandSchoolName(sn);
    updateHeader('school', expanded);
  };

  const updateHeader = (field: string, value: string | number) => {
    updateData(d => ({
      ...d, settings: { ...d.settings, suratHeader: { ...d.settings.suratHeader, [field]: value } },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateHeader('logoUrl', reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAkunLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'customLogo' | 'customKemenagLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateData(d => ({ ...d, settings: { ...d.settings, [field]: reader.result as string } }));
      toast.success('Logo berhasil diperbarui');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Kepala Madrasah
  const doAddKepala = () => {
    if (!namaInput.trim()) { toast.error('Nama wajib diisi'); return; }
    if (data.settings.kepalaMadrasah.some(k => k.nama.toLowerCase() === namaInput.trim().toLowerCase())) {
      toast.error('Kepala Madrasah dengan nama yang sama sudah ada');
      return;
    }
    updateData(d => ({
      ...d, settings: { ...d.settings, kepalaMadrasah: [...d.settings.kepalaMadrasah, { id: generateId(), nip: nipInput.trim(), nama: namaInput.trim() }] },
    }));
    setNipInput(''); setNamaInput('');
    toast.success('Kepala Madrasah ditambahkan');
  };
  const addKepala = () => {
    if (!namaInput.trim()) { toast.error('Nama wajib diisi'); return; }
    setAddConfirm({ type: 'Kepala Madrasah', action: doAddKepala });
  };

  const deleteKepala = (id: string) => {
    updateData(d => ({ ...d, settings: { ...d.settings, kepalaMadrasah: d.settings.kepalaMadrasah.filter(k => k.id !== id) } }));
    toast.success('Dihapus');
  };

  const startEditKepala = (k: { id: string; nama: string; nip: string }) => {
    setEditingKepalaId(k.id);
    setEditKepalaName(k.nama);
    setEditKepalaNip(k.nip);
  };
  const doSaveEditKepala = () => {
    if (!editingKepalaId || !editKepalaName.trim()) return;
    updateData(d => ({
      ...d, settings: {
        ...d.settings, kepalaMadrasah: d.settings.kepalaMadrasah.map(k =>
          k.id === editingKepalaId ? { ...k, nama: editKepalaName.trim(), nip: editKepalaNip.trim() } : k
        )
      },
    }));
    setEditingKepalaId(null);
    toast.success('Kepala Madrasah diperbarui');
  };
  const saveEditKepala = () => {
    if (!editingKepalaId || !editKepalaName.trim()) return;
    setEditConfirm({ type: 'Kepala Madrasah', action: doSaveEditKepala });
  };

  // Tahun Ajaran
  const doAddTahun = () => {
    if (!tahunInput.trim()) { toast.error('Tahun ajaran wajib diisi'); return; }
    updateData(d => ({
      ...d, settings: { ...d.settings, tahunAjaran: [...d.settings.tahunAjaran, { id: generateId(), label: tahunInput.trim() }] },
    }));
    setTahunInput('');
    toast.success('Tahun ajaran ditambahkan');
  };
  const addTahun = () => {
    if (!tahunInput.trim()) { toast.error('Tahun ajaran wajib diisi'); return; }
    setAddConfirm({ type: 'Tahun Ajaran', action: doAddTahun });
  };
  const deleteTahun = (id: string) => {
    updateData(d => ({ ...d, settings: { ...d.settings, tahunAjaran: d.settings.tahunAjaran.filter(t => t.id !== id) } }));
    toast.success('Dihapus');
  };

  // Jenis Surat
  const doAddJenisSurat = () => {
    if (!jenisLabel.trim()) { toast.error('Label wajib diisi'); return; }
    if (!jenisIsi.trim()) { toast.error('Template isi wajib diisi'); return; }
    const slug = slugify(jenisLabel.trim());
    if (data.settings.jenisSurat.some(j => j.slug === slug)) { toast.error('Sudah ada'); return; }
    updateData(d => ({
      ...d, settings: { ...d.settings, jenisSurat: [...d.settings.jenisSurat, {
        id: generateId(), slug, label: jenisLabel.trim(),
        templateJudul: jenisJudul.trim() || jenisLabel.trim().toUpperCase(),
        templateIsi: jenisIsi.trim(), createdAt: new Date().toISOString(),
        selectedBiodata: newSelectedBiodata,
      }] },
    }));
    setJenisLabel(''); setJenisJudul(''); setJenisIsi(''); setNewSelectedBiodata([]);
    toast.success('Jenis surat ditambahkan');
  };
  const addJenisSurat = () => {
    if (!jenisLabel.trim()) { toast.error('Label wajib diisi'); return; }
    if (!jenisIsi.trim()) { toast.error('Template isi wajib diisi'); return; }
    setAddConfirm({ type: 'Jenis Surat', action: doAddJenisSurat });
  };
  const deleteJenisSurat = (id: string) => {
    updateData(d => ({
      ...d, settings: { ...d.settings, jenisSurat: d.settings.jenisSurat.filter(j => j.id !== id) },
      surat: d.surat.filter(s => s.jenisSuratId !== id),
    }));
    toast.success('Dihapus');
  };
  const startEditJenis = (js: JenisSurat) => {
    setEditingJenis(js.id); setEditLabel(js.label); setEditJudul(js.templateJudul); setEditIsi(js.templateIsi);
    setEditSelectedBiodata(js.selectedBiodata || []);
  };
  const doSaveEditJenis = () => {
    if (!editingJenis) return;
    updateData(d => ({
      ...d, settings: { ...d.settings, jenisSurat: d.settings.jenisSurat.map(j =>
        j.id === editingJenis ? { ...j, label: editLabel.trim(), templateJudul: editJudul.trim(), templateIsi: editIsi.trim(), slug: slugify(editLabel.trim()), selectedBiodata: editSelectedBiodata } : j
      ) },
    }));
    setEditingJenis(null);
    toast.success('Template diperbarui');
  };
  const saveEditJenis = () => {
    if (!editingJenis) return;
    setEditConfirm({ type: 'Jenis Surat', action: doSaveEditJenis });
  };

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (editingJenis) setEditIsi(result.value);
      else setJenisIsi(result.value);
      toast.success('DOCX berhasil diimpor');
    } catch { toast.error('Gagal mengimpor DOCX'); }
    e.target.value = '';
  };

  const handleTemplatePaste = (e: React.ClipboardEvent<HTMLDivElement>, isEdit: boolean) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    let content = html || text;
    
    // Clean up MS Word HTML: remove white color, fix styling issues
    if (html) {
      // Create a temporary element to parse and clean HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove all inline color styles that might cause invisible text
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach(el => {
        const style = (el as HTMLElement).style;
        // Remove white/black text colors that cause visibility issues
        if (style.color === 'white' || style.color === '#ffffff' || style.color === '#fff' || 
            style.color === 'rgb(255, 255, 255)') {
          style.removeProperty('color');
        }
        // Remove background colors that might hide text
        if (style.backgroundColor === 'white' || style.backgroundColor === '#ffffff') {
          style.removeProperty('background-color');
        }
        // Remove font styles that cause issues
        if (style.fontSize === '0pt') {
          el.remove();
        }
      });
      
      // Replace MS Word paragraphs with proper spacing
      const paragraphs = tempDiv.querySelectorAll('p, div');
      paragraphs.forEach(p => {
        (p as HTMLElement).style.marginTop = '0';
        (p as HTMLElement).style.marginBottom = '6pt';
        (p as HTMLElement).style.lineHeight = '1.5';
      });
      
      // Convert tabs to spaces
      content = tempDiv.innerHTML.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      
      // Remove empty paragraphs (MS Word often adds these)
      content = content.replace(/<p[^>]*>\s*<\/p>/gi, '');
      
      // Remove MS Word specific comments and tags
      content = content.replace(/<!--\[if gte mso.*?-->/gi, '');
      content = content.replace(/<!--\[if !supportLists\]-->/gi, '');
      content = content.replace(/<!\[endif\]-->/gi, '');
    }
    
    document.execCommand('insertHTML', false, content);
  };

  const handleTemplateKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  // Custom biodata CRUD
  const addCustomBiodata = () => {
    if (!newCustomLabel.trim()) { toast.error('Label wajib diisi'); return; }
    const key = newCustomKey.trim() || slugify(newCustomLabel.trim()).replace(/-/g, '_');
    const allFields = getAllBiodataFields(data.settings);
    if (allFields.some(f => f.key === key)) { toast.error('Key sudah digunakan'); return; }
    const newField: BiodataField = {
      key, label: newCustomLabel.trim(), placeholder: `{${key}}`, inputType: 'text', isCustom: true,
    };
    updateData(d => ({
      ...d, settings: { ...d.settings, customBiodata: [...(d.settings.customBiodata || []), newField] },
    }));
    setNewCustomLabel(''); setNewCustomKey('');
    toast.success('Biodata kustom ditambahkan');
  };
  const deleteCustomBiodata = (key: string) => {
    updateData(d => ({
      ...d, settings: { ...d.settings, customBiodata: (d.settings.customBiodata || []).filter(f => f.key !== key) },
    }));
    toast.success('Dihapus');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    switch (deleteTarget.type) {
      case 'kepala': deleteKepala(deleteTarget.id); break;
      case 'tahun': deleteTahun(deleteTarget.id); break;
      case 'jenis': deleteJenisSurat(deleteTarget.id); break;
      case 'biodata': deleteCustomBiodata(deleteTarget.id); break;
    }
    setDeleteTarget(null);
  };

  const getDeleteDescription = () => {
    if (!deleteTarget) return '';
    const labels: Record<string, string> = {
      kepala: 'Kepala Madrasah',
      tahun: 'Tahun Ajaran',
      jenis: 'Jenis Surat (beserta semua surat terkait)',
      biodata: 'Biodata Kustom',
    };
    return `Apakah Anda yakin ingin menghapus ${labels[deleteTarget.type]} "${deleteTarget.label}"? Tindakan ini tidak dapat dibatalkan.`;
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const logoSrc = h.logoUrl || (data.settings.customKemenagLogo || '');

  const kepala = data.settings.kepalaMadrasah;

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
      <Tabs defaultValue={defaultTab} key={sidebarState}>
        <TabsList className="flex flex-wrap w-full h-auto gap-1 bg-muted p-1 rounded-lg">
          <TabsTrigger value="akun" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><User className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Akun</span></TabsTrigger>
          <TabsTrigger value="tahun" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><CalendarDays className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Tahun Ajaran</span></TabsTrigger>
          <TabsTrigger value="surat" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><FileText className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Jenis Surat</span></TabsTrigger>
          <TabsTrigger value="biodata" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><Contact className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Biodata</span></TabsTrigger>
          <TabsTrigger value="header" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><Building className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Header</span></TabsTrigger>
          <TabsTrigger value="tema" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><Palette className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Tema</span></TabsTrigger>
          <TabsTrigger value="penyimpanan" className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5"><Database className="h-4 w-4 shrink-0" /><span className="hidden lg:inline truncate">Data</span></TabsTrigger>
        </TabsList>

        {/* Akun & Identitas */}
        <TabsContent value="akun" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Akun & Identitas</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <input type="file" accept="image/*" ref={akunLogoRef} className="hidden" onChange={(e) => handleAkunLogoUpload(e, 'customLogo')} />
              <input type="file" accept="image/*" ref={akunKemenagLogoRef} className="hidden" onChange={(e) => handleAkunLogoUpload(e, 'customKemenagLogo')} />

              <div>
                <Label>Nama Aplikasi (Sidebar)</Label>
                <Input
                  value={data.settings.appName}
                  onChange={e => updateData(d => ({ ...d, settings: { ...d.settings, appName: e.target.value } }))}
                  placeholder="MANAJEMEN SURAT"
                />
                <p className="text-xs text-muted-foreground mt-1">Ditampilkan di sidebar sebagai judul.</p>
              </div>

              <div>
                <Label>Nama Sekolah</Label>
                <Input
                  value={data.settings.schoolName}
                  onChange={e => updateData(d => ({ ...d, settings: { ...d.settings, schoolName: e.target.value } }))}
                  placeholder="NAMA SEKOLAH"
                />
                <p className="text-xs text-muted-foreground mt-1">Ditampilkan di header dan dashboard.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <Label className="font-medium">Logo Sidebar</Label>
                  <div className="flex items-center gap-3">
                    {data.settings.customLogo ? (
                      <img src={data.settings.customLogo} alt="Logo" className="w-14 h-14 object-contain border rounded" />
                    ) : (
                      <div className="w-14 h-14 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <Button variant="outline" size="sm" onClick={() => akunLogoRef.current?.click()}>
                        <Upload className="mr-1 h-4 w-4" />{data.settings.customLogo ? 'Ganti' : 'Upload'}
                      </Button>
                      {data.settings.customLogo && (
                        <Button variant="ghost" size="sm" onClick={() => updateData(d => ({ ...d, settings: { ...d.settings, customLogo: '' } }))}>
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 space-y-3">
                  <Label className="font-medium">Logo Kementerian Agama</Label>
                  <div className="flex items-center gap-3">
                    {data.settings.customKemenagLogo ? (
                      <img src={data.settings.customKemenagLogo} alt="Kemenag" className="w-14 h-14 object-contain border rounded" />
                    ) : (
                      <div className="w-14 h-14 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <Button variant="outline" size="sm" onClick={() => akunKemenagLogoRef.current?.click()}>
                        <Upload className="mr-1 h-4 w-4" />{data.settings.customKemenagLogo ? 'Ganti' : 'Upload'}
                      </Button>
                      {data.settings.customKemenagLogo && (
                        <Button variant="ghost" size="sm" onClick={() => updateData(d => ({ ...d, settings: { ...d.settings, customKemenagLogo: '' } }))}>
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-medium text-sm mb-3">Identitas Sekolah</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>NSM</Label>
                    <Input
                      value={data.settings.nsm}
                      onChange={e => { if (/^\d*$/.test(e.target.value)) updateData(d => ({ ...d, settings: { ...d.settings, nsm: e.target.value } })); }}
                      placeholder="NSM" inputMode="numeric"
                    />
                  </div>
                  <div>
                    <Label>NPSN</Label>
                    <Input
                      value={data.settings.npsn}
                      onChange={e => { if (/^\d*$/.test(e.target.value)) updateData(d => ({ ...d, settings: { ...d.settings, npsn: e.target.value } })); }}
                      placeholder="NPSN" inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="border-t border-border pt-4">
                <Button variant="destructive" onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout (Reset Data)
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Menghapus semua data lokal dan mengembalikan ke pengaturan awal.</p>
              </div>
            </CardContent>
          </Card>

          {/* Kepala Madrasah - Separate Card */}
          <Card>
            <CardHeader><CardTitle>Kepala Madrasah</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {kepala.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Belum ada Kepala Madrasah. Tambahkan satu untuk ditampilkan di surat.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Nama</Label><Input value={namaInput} onChange={e => setNamaInput(e.target.value)} placeholder="Nama lengkap" /></div>
                    <div><Label>NIP</Label><Input value={nipInput} onChange={e => setNipInput(e.target.value)} placeholder="NIP (opsional)" /></div>
                  </div>
                  <Button onClick={addKepala} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {kepala.map(k => (
                    <div key={k.id}>
                      {editingKepalaId === k.id ? (
                        <div className="border border-border rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><Label>Nama</Label><Input value={editKepalaName} onChange={e => setEditKepalaName(e.target.value)} placeholder="Nama" /></div>
                            <div><Label>NIP</Label><Input value={editKepalaNip} onChange={e => setEditKepalaNip(e.target.value)} placeholder="NIP" /></div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEditKepala}><Check className="mr-1 h-4 w-4" />Simpan</Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingKepalaId(null)}><X className="mr-1 h-4 w-4" />Batal</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                              {k.nama.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground text-base">{k.nama}</div>
                            <div className="text-sm text-muted-foreground">NIP: {k.nip || '-'}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => startEditKepala(k)}>
                              <Pencil className="mr-1 h-4 w-4" />Edit
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'kepala', id: k.id, label: k.nama })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tahun Ajaran */}
        <TabsContent value="tahun">
          <Card>
            <CardHeader><CardTitle>Tahun Ajaran</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={tahunInput} onChange={e => setTahunInput(e.target.value)} placeholder="cth: 2025/2026" className="max-w-xs" />
                <Button onClick={addTahun} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah</Button>
              </div>
              {data.settings.tahunAjaran.length > 0 && (
                <div className="space-y-2">
                  {data.settings.tahunAjaran.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <span className="text-sm font-medium">{t.label}</span>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'tahun', id: t.id, label: t.label })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jenis Surat */}
        <TabsContent value="surat">
          <Card>
            <CardHeader><CardTitle>Jenis Surat & Template</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input type="file" accept=".docx" ref={fileInputRef} className="hidden" onChange={handleDocxImport} />

              <div className="border border-border rounded-lg p-4 space-y-2">
                <Label>Format Nomor Surat</Label>
                <p className="text-xs text-muted-foreground">
                  Placeholder: {'{nomor}'} = nomor surat, {'{bulan}'} = bulan (01-12), {'{tahun}'} = tahun
                </p>
                <Input
                  value={data.settings.nomorSuratFormat}
                  onChange={e => updateData(d => ({ ...d, settings: { ...d.settings, nomorSuratFormat: e.target.value } }))}
                  placeholder="B. {nomor} /Mi.01.21/1/PP.01.1/{bulan}/{tahun}"
                />
                <p className="text-xs text-muted-foreground">
                  Preview: NOMOR : {data.settings.nomorSuratFormat.replace(/\{nomor\}/gi, '001').replace(/\{bulan\}/gi, '03').replace(/\{tahun\}/gi, '2026')}
                </p>
              </div>

              {!editingJenis && (
                <div className="space-y-3 border border-border rounded-lg p-4">
                  <h3 className="font-medium text-sm">Tambah Jenis Surat Baru</h3>
                  <div><Label>Label</Label><Input value={jenisLabel} onChange={e => setJenisLabel(e.target.value)} placeholder="cth: Surat Pindah" /></div>
                  <div><Label>Judul Surat (opsional)</Label><Input value={jenisJudul} onChange={e => setJenisJudul(e.target.value)} placeholder="cth: SURAT KETERANGAN PINDAH" /></div>
                  <div>
                    <Label>Template Isi Surat</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Placeholder: {'{nama}'}, {'{tempat_lahir}'}, {'{tanggal_lahir}'}, {'{jenis_kelamin}'}, {'{kelas}'}, {'{no_induk}'}, {'{nisn}'}, {'{nama_orang_tua}'}, {'{alamat}'}, {'{tahun_ajaran}'}, <strong>{'{kabupaten}'}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">Anda bisa copy-paste langsung dari MS Word ke area di bawah ini.</p>
                    <style>{`
                      .template-editor p { margin-top: 0; margin-bottom: 6pt; line-height: 1.5; }
                      .template-editor div { margin-top: 0; margin-bottom: 6pt; line-height: 1.5; }
                    `}</style>
                    <div
                      ref={templateRef}
                      contentEditable
                      className="template-editor min-h-[200px] border border-input rounded-md p-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring overflow-auto prose prose-sm max-w-none"
                      style={{ lineHeight: '1.5' }}
                      onPaste={(e) => handleTemplatePaste(e, false)}
                      onKeyDown={handleTemplateKeyDown}
                      onBlur={(e) => setJenisIsi(e.currentTarget.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: jenisIsi }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addJenisSurat} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah</Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" />Import DOCX
                    </Button>
                  </div>
                  <BiodataChecklistSection
                    selectedBiodata={newSelectedBiodata}
                    onSelectedChange={setNewSelectedBiodata}
                    editorRef={templateRef}
                    settings={data.settings}
                  />
                </div>
              )}

              {editingJenis && (
                <div className="space-y-3 border border-primary/30 rounded-lg p-4 bg-primary/5">
                  <h3 className="font-medium text-sm">Edit Template</h3>
                  <div><Label>Label</Label><Input value={editLabel} onChange={e => setEditLabel(e.target.value)} /></div>
                  <div><Label>Judul Surat</Label><Input value={editJudul} onChange={e => setEditJudul(e.target.value)} /></div>
                  <div>
                    <Label>Template Isi Surat</Label>
                    <p className="text-xs text-muted-foreground mb-2">Anda bisa copy-paste langsung dari MS Word.</p>
                    <div
                      ref={editTemplateRef}
                      contentEditable
                      className="template-editor min-h-[200px] border border-input rounded-md p-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring overflow-auto prose prose-sm max-w-none"
                      style={{ lineHeight: '1.5' }}
                      onPaste={(e) => handleTemplatePaste(e, true)}
                      onKeyDown={handleTemplateKeyDown}
                      onBlur={(e) => setEditIsi(e.currentTarget.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: editIsi }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEditJenis} size="sm">Simpan</Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" />Import DOCX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingJenis(null)}>Batal</Button>
                  </div>
                  <BiodataChecklistSection
                    selectedBiodata={editSelectedBiodata}
                    onSelectedChange={setEditSelectedBiodata}
                    editorRef={editTemplateRef}
                    settings={data.settings}
                  />
                </div>
              )}

              {data.settings.jenisSurat.length > 0 && (
                <div className="space-y-2 mt-4">
                  {data.settings.jenisSurat.map(js => (
                    <div key={js.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{js.label}</div>
                        <div className="text-xs text-muted-foreground">Judul: {js.templateJudul}</div>
                        {js.selectedBiodata && js.selectedBiodata.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Biodata: {js.selectedBiodata.map(key => {
                              const field = getAllBiodataFields(data.settings).find(f => f.key === key);
                              return field?.label || key;
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEditJenis(js)}>Edit</Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'jenis', id: js.id, label: js.label })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biodata Kustom Tab */}
        <TabsContent value="biodata">
          <Card>
            <CardHeader><CardTitle>Biodata Kustom</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tambahkan field biodata baru yang tidak tersedia secara default (misalnya: NIK, No. KK, dll). Field yang ditambahkan akan muncul di checklist biodata saat membuat template surat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Label</Label>
                  <Input value={newCustomLabel} onChange={e => setNewCustomLabel(e.target.value)} placeholder="cth: NIK" />
                </div>
                <div>
                  <Label>Key (opsional, auto-generate)</Label>
                  <Input value={newCustomKey} onChange={e => setNewCustomKey(e.target.value)} placeholder="cth: nik" />
                  <p className="text-xs text-muted-foreground mt-1">Placeholder akan jadi: {`{${newCustomKey.trim() || slugify(newCustomLabel.trim() || 'key').replace(/-/g, '_')}}`}</p>
                </div>
              </div>
              <Button onClick={addCustomBiodata} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah Biodata</Button>

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-medium text-sm mb-2">Biodata Default</h3>
                <div className="space-y-1">
                  {DEFAULT_BIODATA.map(f => (
                    <div key={f.key} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <span>{f.label}</span>
                      <code className="text-xs text-muted-foreground">{f.placeholder}</code>
                    </div>
                  ))}
                </div>
              </div>

              {(data.settings.customBiodata || []).length > 0 && (
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-medium text-sm mb-2">Biodata Kustom</h3>
                  <div className="space-y-1">
                    {(data.settings.customBiodata || []).map(f => (
                      <div key={f.key} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <span>{f.label}</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground">{f.placeholder}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDeleteTarget({ type: 'biodata', id: f.key, label: f.label })}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header Surat */}
        <TabsContent value="header">
          <Card>
            <CardHeader><CardTitle>Header Surat (KOP)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input type="file" accept="image/*" ref={logoInputRef} className="hidden" onChange={handleLogoUpload} />
              <div className="flex items-center gap-4">
                {h.logoUrl ? (
                  <img src={h.logoUrl} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                    <Upload className="mr-1 h-4 w-4" />{h.logoUrl ? 'Ganti Logo' : 'Upload Logo'}
                  </Button>
                  {h.logoUrl && <Button variant="ghost" size="sm" onClick={() => updateHeader('logoUrl', '')}>Hapus Logo</Button>}
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <Label className="text-xs whitespace-nowrap">Ukuran: {h.logoSize || 22}mm</Label>
                  <Slider
                    value={[h.logoSize || 22]}
                    onValueChange={([v]) => updateHeader('logoSize', v)}
                    min={10}
                    max={40}
                    step={1}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Kabupaten Picker */}
              <div className="border border-border rounded-lg p-3 space-y-2">
                <Label className="font-medium">Kabupaten / Kota <span className="text-xs text-muted-foreground font-normal">(placeholder {'{kabupaten}'})</span></Label>
                <div className="relative">
                  <Input
                    value={kabupatenSearch}
                    onChange={e => { setKabupatenSearch(e.target.value); setShowKabupatenList(true); }}
                    onFocus={() => setShowKabupatenList(true)}
                    onBlur={() => setTimeout(() => setShowKabupatenList(false), 150)}
                    placeholder="Ketik untuk mencari kabupaten/kota..."
                    autoComplete="off"
                  />
                  {showKabupatenList && filteredKabupaten.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredKabupaten.map(k => (
                        <button
                          key={k}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onMouseDown={() => handleSelectKabupaten(k)}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {kabupatenSearch && (
                  <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                    <div>Baris 2: <span className="font-medium text-foreground">{buildLine2(kabupatenSearch)}</span></div>
                    <div>Kementerian Agama: <span className="font-medium text-foreground">{buildSchoolSub(kabupatenSearch)}</span></div>
                  </div>
                )}
              </div>

              {[
                { label: 'Baris 1', field: 'line1', sizeField: 'line1Size', defaultSize: 16, hint: '' },
                { label: 'Baris 2 (auto dari kabupaten)', field: 'line2', sizeField: 'line2Size', defaultSize: 14, hint: 'KANTOR KEMENTERIAN AGAMA {KABUPATEN}' },
                { label: 'Nama Sekolah (auto dari nama sekolah)', field: 'school', sizeField: 'schoolSize', defaultSize: 12, hint: '' },
                { label: 'Alamat', field: 'address', sizeField: 'addressSize', defaultSize: 11, hint: '' },
                { label: 'Kontak', field: 'contact', sizeField: 'contactSize', defaultSize: 11, hint: '' },
              ].map(item => (
                <div key={item.field}>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label>{item.label}</Label>
                        {item.field === 'school' && (
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={handleSchoolNameAutoExpand}
                          >
                            Auto dari nama sekolah
                          </button>
                        )}
                        {item.field === 'line2' && kabupatenSearch && (
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => updateHeader('line2', buildLine2(kabupatenSearch))}
                          >
                            Reset dari kabupaten
                          </button>
                        )}

                      </div>
                      <Input
                        value={(h as any)[item.field] || ''}
                        onChange={e => updateHeader(item.field, e.target.value)}
                        placeholder={item.hint}
                      />
                    </div>
                    <div className="w-20">
                      <Select
                        value={String((h as any)[item.sizeField] || item.defaultSize)}
                        onValueChange={v => updateHeader(item.sizeField, parseInt(v))}
                      >
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_SIZE_OPTIONS.map(s => (
                            <SelectItem key={s} value={String(s)}>{s}pt</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Live Preview */}
              <div className="border-t border-border pt-4 mt-4">
                <Label className="text-sm font-medium mb-2 block">Preview Header</Label>
                <div className="bg-white text-black border rounded-lg p-6 mx-auto" style={{ maxWidth: '210mm', fontFamily: "'Times New Roman', serif" }}>
                  <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '8px', position: 'relative' }}>
                    {logoSrc && (
                      <img
                        src={logoSrc}
                        alt="Logo"
                        style={{ position: 'absolute', left: '0', bottom: '5px', width: `${h.logoSize || 22}mm`, height: `${h.logoSize || 22}mm`, objectFit: 'contain' }}
                      />
                    )}
                    {h.line1 && <div style={{ fontSize: `${h.line1Size || 16}pt`, fontWeight: 'bold', lineHeight: '1.0' }}>{h.line1}</div>}
                    {h.line2 && <div style={{ fontSize: `${h.line2Size || 14}pt`, fontWeight: 'bold', lineHeight: '1.0' }}>{h.line2}</div>}
                    {h.school && <div style={{ fontSize: `${h.schoolSize || 12}pt`, fontWeight: 'bold', lineHeight: '1.0' }}>{h.school}</div>}
                    {kabupaten && <div style={{ fontSize: '10pt', lineHeight: '1.0' }}>{buildSchoolSub(kabupaten)}</div>}
                    {(h.address || h.contact) && <div style={{ fontSize: `${h.addressSize || 11}pt`, lineHeight: '1.0' }}>{h.address}{h.contact ? ` ${h.contact}` : ''}</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tema */}
        <TabsContent value="tema">
          <Card>
            <CardHeader><CardTitle>Tema Tampilan</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Warna Tema</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {COLOR_THEMES.map(ct => (
                    <button
                      key={ct.value}
                      onClick={() => setColorTheme(ct.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${data.settings.colorTheme === ct.value ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'}`}
                    >
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: ct.color }} />
                      <span className="text-xs font-medium">{ct.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-amber-500" />}
                  <div>
                    <div className="font-medium text-sm">{isDark ? 'Mode Gelap' : 'Mode Terang'}</div>
                    <div className="text-xs text-muted-foreground">{isDark ? 'Tampilan gelap untuk kenyamanan mata' : 'Tampilan terang standar'}</div>
                  </div>
                </div>
                <Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Penyimpanan / Data */}
        <TabsContent value="penyimpanan">
          <Card>
            <CardHeader><CardTitle>Penyimpanan Data</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <DataPathSection />

              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="font-medium text-sm">Ekspor & Impor Data</h3>
                <p className="text-xs text-muted-foreground">Simpan cadangan data atau pindahkan data ke perangkat lain.</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const blob = new Blob([JSON.stringify(loadData(), null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `minsa-backup-${new Date().toISOString().slice(0,10)}.json`;
                    a.click(); URL.revokeObjectURL(url);
                    toast.success('Data berhasil diekspor');
                  }}>
                    <Download className="mr-1 h-4 w-4" />Ekspor JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file'; input.accept = '.json';
                    input.onchange = async (ev) => {
                      const file = (ev.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const parsed = JSON.parse(text);
                        if (parsed.settings && parsed.surat) {
                          saveData(parsed);
                          window.location.reload();
                        } else { toast.error('Format file tidak valid'); }
                      } catch { toast.error('Gagal mengimpor data'); }
                    };
                    input.click();
                  }}>
                    <Upload className="mr-1 h-4 w-4" />Impor JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shared delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={getDeleteDescription()}
        onConfirm={handleConfirmDelete}
      />

      {/* Add confirmation dialog */}
      <ConfirmDialog
        open={!!addConfirm}
        onOpenChange={(open) => !open && setAddConfirm(null)}
        title="Konfirmasi Tambah"
        description={addConfirm 
          ? addConfirm.type === 'Kepala Madrasah' && namaInput
            ? `Apakah Anda yakin ingin menambahkan ${namaInput} sebagai Kepala Madrasah?`
            : `Apakah Anda yakin ingin menambahkan ${addConfirm.type} baru?`
          : ''}
        confirmLabel="Tambah"
        onConfirm={() => { addConfirm?.action(); setAddConfirm(null); }}
      />

      {/* Edit confirmation dialog */}
      <ConfirmDialog
        open={!!editConfirm}
        onOpenChange={(open) => !open && setEditConfirm(null)}
        title="Konfirmasi Edit"
        description={editConfirm ? `Apakah Anda yakin ingin menyimpan perubahan pada ${editConfirm.type}?` : ''}
        confirmLabel="Simpan"
        onConfirm={() => { editConfirm?.action(); setEditConfirm(null); }}
      />

      {/* Logout confirmation */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin logout? Semua data lokal akan dihapus dan tidak dapat dikembalikan."
        confirmLabel="Logout"
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Pengaturan;
