import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { generateId } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TambahSurat = () => {
  const { jenisSlug } = useParams<{ jenisSlug: string }>();
  const [searchParams] = useSearchParams();
  const arahParam = searchParams.get('arah') as 'masuk' | 'keluar' | null;
  const { data, updateData } = useApp();
  const navigate = useNavigate();

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);

  const [form, setForm] = useState({
    nomorSurat: '',
    nama: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki-laki',
    kelas: '',
    noInduk: '',
    nisn: '',
    namaOrangTua: '',
    alamat: '',
    tahunAjaran: data.settings.activeTahunAjaran || '',
    kepalaMadrasahId: '',
    arah: arahParam || 'keluar' as 'masuk' | 'keluar',
  });

  if (!jenisSurat) {
    return <div className="text-center py-10 text-muted-foreground">Jenis surat tidak ditemukan.</div>;
  }

  const setField = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) { toast.error('Nama wajib diisi'); return; }

    const now = new Date();
    const surat = {
      id: generateId(),
      jenisSuratId: jenisSurat.id,
      nomorSurat: form.nomorSurat.trim(),
      nama: form.nama.trim(),
      tempatLahir: form.tempatLahir.trim(),
      tanggalLahir: form.tanggalLahir,
      jenisKelamin: form.jenisKelamin,
      kelas: form.kelas.trim(),
      noInduk: form.noInduk.trim(),
      nisn: form.nisn.trim(),
      namaOrangTua: form.namaOrangTua.trim(),
      alamat: form.alamat.trim(),
      tahunAjaran: form.tahunAjaran,
      bulan: now.getMonth() + 1,
      tahun: now.getFullYear(),
      kepalaMadrasahId: form.kepalaMadrasahId,
      arah: form.arah,
      createdAt: now.toISOString(),
    };

    updateData(d => ({ ...d, surat: [...d.surat, surat] }));
    toast.success('Surat berhasil ditambahkan');
    navigate(`/surat/${jenisSlug}`);
  };

  const isMasuk = form.arah === 'masuk';

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-foreground mb-4">
        Tambah {jenisSurat.label}
        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${isMasuk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {isMasuk ? 'MASUK' : 'KELUAR'}
        </span>
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Arah */}
            <div>
              <Label>Jenis Surat</Label>
              <Select value={form.arah} onValueChange={v => setField('arah', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nomor Surat (opsional)</Label>
              <Input value={form.nomorSurat} onChange={e => setField('nomorSurat', e.target.value)} placeholder="Kosongkan jika belum ada" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nama Lengkap *</Label>
                <Input value={form.nama} onChange={e => setField('nama', e.target.value)} required />
              </div>
              <div>
                <Label>Jenis Kelamin</Label>
                <Select value={form.jenisKelamin} onValueChange={v => setField('jenisKelamin', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tempat Lahir</Label>
                <Input value={form.tempatLahir} onChange={e => setField('tempatLahir', e.target.value)} />
              </div>
              <div>
                <Label>Tanggal Lahir</Label>
                <Input type="date" value={form.tanggalLahir} onChange={e => setField('tanggalLahir', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Kelas</Label>
                <Input value={form.kelas} onChange={e => setField('kelas', e.target.value)} placeholder="cth: VI-A" />
              </div>
              <div>
                <Label>No. Induk</Label>
                <Input value={form.noInduk} onChange={e => setField('noInduk', e.target.value)} />
              </div>
              <div>
                <Label>NISN</Label>
                <Input value={form.nisn} onChange={e => setField('nisn', e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Nama Orang Tua/Wali</Label>
              <Input value={form.namaOrangTua} onChange={e => setField('namaOrangTua', e.target.value)} />
            </div>

            <div>
              <Label>Alamat</Label>
              <Input value={form.alamat} onChange={e => setField('alamat', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tahun Ajaran</Label>
                <Select value={form.tahunAjaran} onValueChange={v => setField('tahunAjaran', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                  <SelectContent>
                    {data.settings.tahunAjaran.map(t => (
                      <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kepala Madrasah</Label>
                <Select value={form.kepalaMadrasahId} onValueChange={v => setField('kepalaMadrasahId', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kepala madrasah" /></SelectTrigger>
                  <SelectContent>
                    {data.settings.kepalaMadrasah.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">Simpan Surat</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TambahSurat;
