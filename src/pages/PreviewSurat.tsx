import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { A4Preview } from '@/components/A4Preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Printer, Trash2, Pencil, FileDown } from 'lucide-react';
import { toast } from 'sonner';

const PreviewSurat = () => {
  const { jenisSlug, id } = useParams<{ jenisSlug: string; id: string }>();
  const [searchParams] = useSearchParams();
  const { data, updateData } = useApp();
  const navigate = useNavigate();

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);
  const surat = data.surat.find(s => s.id === id);

  // Auto-trigger print/docx from query param
  useEffect(() => {
    const action = searchParams.get('action');
    if (!action || !surat) return;
    const timer = setTimeout(() => {
      if (action === 'print') handlePrint();
      if (action === 'docx') handleExportDocx();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParams, surat]);

  if (!jenisSurat || !surat) return <div className="text-center py-10 text-muted-foreground">Surat tidak ditemukan.</div>;

  const isMasuk = surat.arah === 'masuk';

  const deleteSurat = () => {
    updateData(d => ({ ...d, surat: d.surat.filter(s => s.id !== id) }));
    toast.success('Surat dihapus');
    navigate(`/surat/${jenisSlug}`);
  };

  const handlePrint = () => {
    const el = document.getElementById('a4-print-area');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Cetak</title><style>@page{size:A4;margin:0}body{margin:0;font-family:'Times New Roman',serif;font-size:12pt}img{max-width:70px;max-height:70px}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const handleExportDocx = () => {
    const el = document.getElementById('a4-print-area');
    if (!el) return;
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${surat.nama}</title></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${surat.nama.replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('DOCX berhasil diexport');
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <Card className={`border-2 border-dashed ${isMasuk ? 'border-emerald-400' : 'border-rose-400'}`}>
        <CardContent className="py-3 px-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm text-foreground">{surat.nama}</div>
            <div className="text-xs text-muted-foreground">
              NISN: {surat.nisn || '-'} · No: {surat.nomorSurat || '-'} · {new Date(surat.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              {surat.updatedAt && ` | Diedit: ${new Date(surat.updatedAt).toLocaleDateString('id-ID')}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMasuk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
              {isMasuk ? 'SURAT MASUK' : 'SURAT KELUAR'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/surat/${jenisSlug}/${id}/edit`)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print / PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDocx}>
                  <FileDown className="mr-2 h-4 w-4" /> Export DOCX
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
