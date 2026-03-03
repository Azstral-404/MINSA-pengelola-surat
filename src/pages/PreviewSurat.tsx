import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { A4Preview } from '@/components/A4Preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Printer, Trash2, Pencil } from 'lucide-react';
import { BULAN_NAMES } from '@/lib/store';
import { toast } from 'sonner';

const PreviewSurat = () => {
  const { jenisSlug, id } = useParams<{ jenisSlug: string; id: string }>();
  const { data, updateData } = useApp();
  const navigate = useNavigate();

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);
  const surat = data.surat.find(s => s.id === id);

  if (!jenisSurat || !surat) {
    return <div className="text-center py-10 text-muted-foreground">Surat tidak ditemukan.</div>;
  }

  const isMasuk = surat.arah === 'masuk';

  const deleteSurat = () => {
    updateData(d => ({ ...d, surat: d.surat.filter(s => s.id !== id) }));
    toast.success('Surat dihapus');
    navigate(`/surat/${jenisSlug}`);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      {/* Info card */}
      <Card className={`border-2 border-dashed ${isMasuk ? 'border-emerald-400' : 'border-rose-400'}`}>
        <CardContent className="py-3 px-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm text-foreground">{surat.nama}</div>
            <div className="text-xs text-muted-foreground">
              NISN: {surat.nisn || '-'} · {BULAN_NAMES[surat.bulan]} {surat.tahun}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMasuk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
              {isMasuk ? 'SURAT MASUK' : 'SURAT KELUAR'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {}}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const el = document.getElementById('a4-print-area');
                  if (!el) return;
                  const w = window.open('', '_blank');
                  if (!w) return;
                  w.document.write(`<!DOCTYPE html><html><head><title>Cetak</title><style>@page{size:A4;margin:20mm}body{margin:0;font-family:'Times New Roman',serif;font-size:12pt}</style></head><body>${el.innerHTML}</body></html>`);
                  w.document.close();
                  w.focus();
                  setTimeout(() => { w.print(); w.close(); }, 300);
                }}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={deleteSurat}>
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <A4Preview surat={surat} jenisSurat={jenisSurat} />
    </div>
  );
};

export default PreviewSurat;
