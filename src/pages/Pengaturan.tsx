import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateId, slugify, JenisSurat, COLOR_THEMES, ColorTheme, DEFAULT_BIODATA, BiodataField, getAllBiodataFields, generateBiodataTableHtml } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Upload, Moon, Sun, ImagePlus, Download, FolderOpen, UserPlus, ListChecks } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { loadData, saveData } from '@/lib/store';
import { toast } from 'sonner';


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

  const insertBiodataTable = () => {
    const el = editorRef.current;
    if (!el) return;
    if (selectedBiodata.length === 0) { toast.error('Pilih biodata terlebih dahulu'); return; }
    const html = generateBiodataTableHtml(selectedBiodata, allFields);
    el.focus();
    document.execCommand('insertHTML', false, html);
    toast.success('Tabel biodata disisipkan');
  };

  return (
    <div className="border border-border rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1">
          <ListChecks className="h-4 w-4" />Pilih Biodata untuk Template
        </Label>
        <Button variant="outline" size="sm" onClick={insertBiodataTable}>
          Sisipkan Tabel Biodata
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Centang field yang ingin ditampilkan pada form surat dan dokumen output.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allFields.map(field => (
          <label key={field.key} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-muted/50">
            <Checkbox
              checked={selectedBiodata.includes(field.key)}
              onCheckedChange={() => toggleKey(field.key)}
            />
            <span>{field.label}</span>
            {field.isCustom && <span className="text-[10px] px-1 py-0.5 rounded bg-accent text-accent-foreground">Kustom</span>}
          </label>
        ))}
      </div>
    </div>
  );
};

const Pengaturan = () => {
  const { data, updateData, setTheme, setColorTheme } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const editTemplateRef = useRef<HTMLDivElement>(null);
  const isDark = data.settings.theme === 'dark';

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

  // Custom biodata state
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomKey, setNewCustomKey] = useState('');

  const h = data.settings.suratHeader;
  const updateHeader = (field: string, value: string) => {
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

  // Kepala Madrasah
  const addKepala = () => {
    if (!namaInput.trim()) { toast.error('Nama wajib diisi'); return; }
    updateData(d => ({
      ...d, settings: { ...d.settings, kepalaMadrasah: [...d.settings.kepalaMadrasah, { id: generateId(), nip: nipInput.trim(), nama: namaInput.trim() }] },
    }));
    setNipInput(''); setNamaInput('');
    toast.success('Kepala Madrasah ditambahkan');
  };
  const deleteKepala = (id: string) => {
    updateData(d => ({ ...d, settings: { ...d.settings, kepalaMadrasah: d.settings.kepalaMadrasah.filter(k => k.id !== id) } }));
    toast.success('Dihapus');
  };

  // Tahun Ajaran
  const addTahun = () => {
    if (!tahunInput.trim()) { toast.error('Tahun ajaran wajib diisi'); return; }
    updateData(d => ({
      ...d, settings: { ...d.settings, tahunAjaran: [...d.settings.tahunAjaran, { id: generateId(), label: tahunInput.trim() }] },
    }));
    setTahunInput('');
    toast.success('Tahun ajaran ditambahkan');
  };
  const deleteTahun = (id: string) => {
    updateData(d => ({ ...d, settings: { ...d.settings, tahunAjaran: d.settings.tahunAjaran.filter(t => t.id !== id) } }));
    toast.success('Dihapus');
  };

  // Jenis Surat
  const addJenisSurat = () => {
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
  const saveEditJenis = () => {
    if (!editingJenis) return;
    updateData(d => ({
      ...d, settings: { ...d.settings, jenisSurat: d.settings.jenisSurat.map(j =>
        j.id === editingJenis ? { ...j, label: editLabel.trim(), templateJudul: editJudul.trim(), templateIsi: editIsi.trim(), slug: slugify(editLabel.trim()), selectedBiodata: editSelectedBiodata } : j
      ) },
    }));
    setEditingJenis(null);
    toast.success('Template diperbarui');
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
    const content = html || text;
    document.execCommand('insertHTML', false, content);
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

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
      <Tabs defaultValue="kepala">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="kepala">Kepala</TabsTrigger>
          <TabsTrigger value="tahun">Tahun Ajaran</TabsTrigger>
          <TabsTrigger value="surat">Jenis Surat</TabsTrigger>
          <TabsTrigger value="biodata">Biodata</TabsTrigger>
          <TabsTrigger value="header">Header Surat</TabsTrigger>
          <TabsTrigger value="tema">Tema</TabsTrigger>
          <TabsTrigger value="penyimpanan">Data</TabsTrigger>
        </TabsList>

        {/* Kepala Madrasah */}
        <TabsContent value="kepala">
          <Card>
            <CardHeader><CardTitle>Kepala Madrasah</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>NIP</Label><Input value={nipInput} onChange={e => setNipInput(e.target.value)} placeholder="NIP" /></div>
                <div><Label>Nama</Label><Input value={namaInput} onChange={e => setNamaInput(e.target.value)} placeholder="Nama lengkap" /></div>
              </div>
              <Button onClick={addKepala} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah</Button>
              {data.settings.kepalaMadrasah.length > 0 && (
                <div className="space-y-2 mt-4">
                  {data.settings.kepalaMadrasah.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div><div className="font-medium text-sm">{k.nama}</div><div className="text-xs text-muted-foreground">NIP: {k.nip}</div></div>
                      <Button variant="ghost" size="icon" onClick={() => deleteKepala(k.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => deleteTahun(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

              {/* Format Nomor Surat */}
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
                      Placeholder: {'{nama}'}, {'{tempat_lahir}'}, {'{tanggal_lahir}'}, {'{jenis_kelamin}'}, {'{kelas}'}, {'{no_induk}'}, {'{nisn}'}, {'{nama_orang_tua}'}, {'{alamat}'}, {'{tahun_ajaran}'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">Anda bisa copy-paste langsung dari MS Word ke area di bawah ini.</p>
                    <div
                      ref={templateRef}
                      contentEditable
                      className="min-h-[200px] border border-input rounded-md p-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring overflow-auto prose prose-sm max-w-none"
                      onPaste={(e) => handleTemplatePaste(e, false)}
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
                  {/* Biodata checklist for new template */}
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
                      className="min-h-[200px] border border-input rounded-md p-3 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring overflow-auto prose prose-sm max-w-none"
                      onPaste={(e) => handleTemplatePaste(e, true)}
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
                  {/* Biodata checklist for edit template */}
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
                        <Button variant="ghost" size="icon" onClick={() => deleteJenisSurat(js.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

              {/* Default biodata list */}
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

              {/* Custom biodata list */}
              {(data.settings.customBiodata || []).length > 0 && (
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-medium text-sm mb-2">Biodata Kustom</h3>
                  <div className="space-y-1">
                    {(data.settings.customBiodata || []).map(f => (
                      <div key={f.key} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <span>{f.label}</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground">{f.placeholder}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteCustomBiodata(f.key)}>
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
                    onValueChange={([v]) => updateData(d => ({
                      ...d, settings: { ...d.settings, suratHeader: { ...d.settings.suratHeader, logoSize: v } },
                    }))}
                    min={10}
                    max={40}
                    step={1}
                    className="w-32"
                  />
                </div>
              </div>
              <div><Label>Baris 1</Label><Input value={h.line1} onChange={e => updateHeader('line1', e.target.value)} /></div>
              <div><Label>Baris 2</Label><Input value={h.line2} onChange={e => updateHeader('line2', e.target.value)} /></div>
              <div><Label>Nama Sekolah</Label><Input value={h.school} onChange={e => updateHeader('school', e.target.value)} /></div>
              <div><Label>Alamat</Label><Input value={h.address} onChange={e => updateHeader('address', e.target.value)} /></div>
              <div><Label>Kontak</Label><Input value={h.contact} onChange={e => updateHeader('contact', e.target.value)} /></div>
              <div className="border-t border-border pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Identitas Sekolah (Dashboard)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>NSM</Label><Input value={data.settings.nsm} onChange={e => updateData(d => ({ ...d, settings: { ...d.settings, nsm: e.target.value } }))} placeholder="NSM" /></div>
                  <div><Label>NPSN</Label><Input value={data.settings.npsn} onChange={e => updateData(d => ({ ...d, settings: { ...d.settings, npsn: e.target.value } }))} placeholder="NPSN" /></div>
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
                <div className="grid grid-cols-5 gap-3">
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
              <div className="p-4 rounded-lg border border-border bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Lokasi Default (Desktop)</Label>
                </div>
                <p className="text-xs text-muted-foreground font-mono">C:\Users\{'{username}'}\AppData\Roaming\Minsa</p>
                <p className="text-xs text-muted-foreground">Lokasi ini akan digunakan saat aplikasi dijalankan sebagai desktop app. Saat ini data tersimpan di localStorage browser.</p>
              </div>

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
    </div>
  );
};

export default Pengaturan;
