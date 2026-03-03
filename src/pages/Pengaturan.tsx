import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateId, slugify, ThemeName, JenisSurat } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Upload, Palette } from 'lucide-react';
import { toast } from 'sonner';

const THEMES: { name: ThemeName; label: string; color: string }[] = [
  { name: 'default', label: 'Default', color: 'hsl(222.2, 47.4%, 11.2%)' },
  { name: 'emerald', label: 'Emerald', color: 'hsl(152, 60%, 30%)' },
  { name: 'ocean', label: 'Ocean', color: 'hsl(210, 70%, 40%)' },
  { name: 'sunset', label: 'Sunset', color: 'hsl(20, 80%, 45%)' },
  { name: 'royal', label: 'Royal', color: 'hsl(270, 50%, 40%)' },
];

const Pengaturan = () => {
  const { data, updateData, setTheme } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kepala Madrasah state
  const [nipInput, setNipInput] = useState('');
  const [namaInput, setNamaInput] = useState('');

  // Tahun Ajaran state
  const [tahunInput, setTahunInput] = useState('');

  // Jenis Surat state
  const [jenisLabel, setJenisLabel] = useState('');
  const [jenisJudul, setJenisJudul] = useState('');
  const [jenisIsi, setJenisIsi] = useState('');
  const [editingJenis, setEditingJenis] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editJudul, setEditJudul] = useState('');
  const [editIsi, setEditIsi] = useState('');

  // === Kepala Madrasah ===
  const addKepala = () => {
    if (!nipInput.trim() || !namaInput.trim()) { toast.error('NIP dan Nama wajib diisi'); return; }
    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        kepalaMadrasah: [...d.settings.kepalaMadrasah, { id: generateId(), nip: nipInput.trim(), nama: namaInput.trim() }],
      },
    }));
    setNipInput(''); setNamaInput('');
    toast.success('Kepala Madrasah ditambahkan');
  };

  const deleteKepala = (id: string) => {
    updateData(d => ({
      ...d,
      settings: { ...d.settings, kepalaMadrasah: d.settings.kepalaMadrasah.filter(k => k.id !== id) },
    }));
    toast.success('Dihapus');
  };

  // === Tahun Ajaran ===
  const addTahun = () => {
    if (!tahunInput.trim()) { toast.error('Tahun ajaran wajib diisi'); return; }
    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        tahunAjaran: [...d.settings.tahunAjaran, { id: generateId(), label: tahunInput.trim() }],
      },
    }));
    setTahunInput('');
    toast.success('Tahun ajaran ditambahkan');
  };

  const deleteTahun = (id: string) => {
    updateData(d => ({
      ...d,
      settings: { ...d.settings, tahunAjaran: d.settings.tahunAjaran.filter(t => t.id !== id) },
    }));
    toast.success('Dihapus');
  };

  // === Jenis Surat ===
  const addJenisSurat = () => {
    if (!jenisLabel.trim()) { toast.error('Label jenis surat wajib diisi'); return; }
    if (!jenisIsi.trim()) { toast.error('Template isi surat wajib diisi'); return; }
    const slug = slugify(jenisLabel.trim());
    if (data.settings.jenisSurat.some(j => j.slug === slug)) {
      toast.error('Jenis surat dengan nama serupa sudah ada'); return;
    }
    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        jenisSurat: [...d.settings.jenisSurat, {
          id: generateId(),
          slug,
          label: jenisLabel.trim(),
          templateJudul: jenisJudul.trim() || jenisLabel.trim().toUpperCase(),
          templateIsi: jenisIsi.trim(),
          createdAt: new Date().toISOString(),
        }],
      },
    }));
    setJenisLabel(''); setJenisJudul(''); setJenisIsi('');
    toast.success('Jenis surat ditambahkan');
  };

  const deleteJenisSurat = (id: string) => {
    updateData(d => ({
      ...d,
      settings: { ...d.settings, jenisSurat: d.settings.jenisSurat.filter(j => j.id !== id) },
      surat: d.surat.filter(s => s.jenisSuratId !== id),
    }));
    toast.success('Jenis surat dan semua suratnya dihapus');
  };

  const startEditJenis = (js: JenisSurat) => {
    setEditingJenis(js.id);
    setEditLabel(js.label);
    setEditJudul(js.templateJudul);
    setEditIsi(js.templateIsi);
  };

  const saveEditJenis = () => {
    if (!editingJenis) return;
    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        jenisSurat: d.settings.jenisSurat.map(j =>
          j.id === editingJenis
            ? { ...j, label: editLabel.trim(), templateJudul: editJudul.trim(), templateIsi: editIsi.trim(), slug: slugify(editLabel.trim()) }
            : j
        ),
      },
    }));
    setEditingJenis(null);
    toast.success('Template diperbarui');
  };

  // Import DOCX
  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (editingJenis) {
        setEditIsi(result.value);
      } else {
        setJenisIsi(result.value);
      }
      toast.success('Konten DOCX berhasil diimpor');
    } catch {
      toast.error('Gagal mengimpor file DOCX');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>

      <Tabs defaultValue="kepala">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="kepala">Kepala Madrasah</TabsTrigger>
          <TabsTrigger value="tahun">Tahun Ajaran</TabsTrigger>
          <TabsTrigger value="surat">Jenis Surat</TabsTrigger>
          <TabsTrigger value="tema">Tema</TabsTrigger>
        </TabsList>

        {/* Kepala Madrasah */}
        <TabsContent value="kepala">
          <Card>
            <CardHeader><CardTitle>Kepala Madrasah</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>NIP</Label>
                  <Input value={nipInput} onChange={e => setNipInput(e.target.value)} placeholder="NIP" />
                </div>
                <div>
                  <Label>Nama</Label>
                  <Input value={namaInput} onChange={e => setNamaInput(e.target.value)} placeholder="Nama lengkap" />
                </div>
              </div>
              <Button onClick={addKepala} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah</Button>

              {data.settings.kepalaMadrasah.length > 0 && (
                <div className="space-y-2 mt-4">
                  {data.settings.kepalaMadrasah.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <div className="font-medium text-sm">{k.nama}</div>
                        <div className="text-xs text-muted-foreground">NIP: {k.nip}</div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteKepala(k.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
                      <Button variant="ghost" size="icon" onClick={() => deleteTahun(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jenis Surat / Template */}
        <TabsContent value="surat">
          <Card>
            <CardHeader><CardTitle>Jenis Surat & Template</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input type="file" accept=".docx" ref={fileInputRef} className="hidden" onChange={handleDocxImport} />

              {!editingJenis && (
                <div className="space-y-3 border border-border rounded-lg p-4">
                  <h3 className="font-medium text-sm">Tambah Jenis Surat Baru</h3>
                  <div>
                    <Label>Label (nama jenis surat)</Label>
                    <Input value={jenisLabel} onChange={e => setJenisLabel(e.target.value)} placeholder="cth: Surat Pindah" />
                  </div>
                  <div>
                    <Label>Judul Surat (opsional, default = label uppercase)</Label>
                    <Input value={jenisJudul} onChange={e => setJenisJudul(e.target.value)} placeholder="cth: SURAT KETERANGAN PINDAH" />
                  </div>
                  <div>
                    <Label>Template Isi Surat (HTML/teks)</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Gunakan placeholder: {'{nama}'}, {'{tempat_lahir}'}, {'{tanggal_lahir}'}, {'{jenis_kelamin}'}, {'{kelas}'}, {'{no_induk}'}, {'{nisn}'}, {'{nama_orang_tua}'}, {'{alamat}'}, {'{tahun_ajaran}'}
                    </p>
                    <Textarea value={jenisIsi} onChange={e => setJenisIsi(e.target.value)} rows={8} placeholder="Tulis template isi surat di sini..." />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addJenisSurat} size="sm"><Plus className="mr-1 h-4 w-4" />Tambah Jenis Surat</Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" />Import DOCX
                    </Button>
                  </div>
                </div>
              )}

              {editingJenis && (
                <div className="space-y-3 border border-primary/30 rounded-lg p-4 bg-primary/5">
                  <h3 className="font-medium text-sm">Edit Template</h3>
                  <div>
                    <Label>Label</Label>
                    <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                  </div>
                  <div>
                    <Label>Judul Surat</Label>
                    <Input value={editJudul} onChange={e => setEditJudul(e.target.value)} />
                  </div>
                  <div>
                    <Label>Template Isi Surat</Label>
                    <Textarea value={editIsi} onChange={e => setEditIsi(e.target.value)} rows={8} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEditJenis} size="sm">Simpan</Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" />Import DOCX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingJenis(null)}>Batal</Button>
                  </div>
                </div>
              )}

              {/* List existing */}
              {data.settings.jenisSurat.length > 0 && (
                <div className="space-y-2 mt-4">
                  {data.settings.jenisSurat.map(js => (
                    <div key={js.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{js.label}</div>
                        <div className="text-xs text-muted-foreground">Judul: {js.templateJudul}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEditJenis(js)}>Edit</Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteJenisSurat(js.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tema */}
        <TabsContent value="tema">
          <Card>
            <CardHeader><CardTitle>Tema Warna</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      data.settings.theme === t.name ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pengaturan;
