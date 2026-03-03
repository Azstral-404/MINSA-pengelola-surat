import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { BULAN_NAMES } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Eye, Pencil, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';

const DaftarSurat = () => {
  const { jenisSlug } = useParams<{ jenisSlug: string }>();
  const { data, updateData } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'semua' | 'masuk' | 'keluar'>('semua');

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);
  if (!jenisSurat) {
    return <div className="text-center py-10 text-muted-foreground">Jenis surat tidak ditemukan.</div>;
  }

  let suratList = data.surat.filter(s => s.jenisSuratId === jenisSurat.id);
  if (filter !== 'semua') suratList = suratList.filter(s => s.arah === filter);
  suratList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const deleteSurat = (id: string) => {
    updateData(d => ({ ...d, surat: d.surat.filter(s => s.id !== id) }));
    toast.success('Surat dihapus');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-foreground">{jenisSurat.label}</h1>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-8 text-xs w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua</SelectItem>
              <SelectItem value="masuk">Masuk</SelectItem>
              <SelectItem value="keluar">Keluar</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="mr-1 h-4 w-4" />Buat Surat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/surat/${jenisSlug}/tambah?arah=masuk`)}>
                Surat Masuk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/surat/${jenisSlug}/tambah?arah=keluar`)}>
                Surat Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {suratList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Belum ada surat. Klik "+ Buat Surat" untuk memulai.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {suratList.map(s => {
            const isMasuk = s.arah === 'masuk';
            return (
              <Card key={s.id} className={`border-l-4 ${isMasuk ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{s.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      NISN: {s.nisn || '-'} · No: {s.nomorSurat || '-'} · {BULAN_NAMES[s.bulan]} {s.tahun}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMasuk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                      {isMasuk ? 'MASUK' : 'KELUAR'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/surat/${jenisSlug}/${s.id}/preview`)}>
                          <Eye className="mr-2 h-4 w-4" /> Lihat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/surat/${jenisSlug}/${s.id}/preview`)}>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteSurat(s.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DaftarSurat;
