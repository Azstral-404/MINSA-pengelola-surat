import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { A4Preview } from '@/components/A4Preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MoreVertical, Printer, Trash2, Pencil, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface PrinterInfo {
  name: string;
  displayName: string;
}

const PreviewSurat = () => {
  const { jenisSlug, id } = useParams<{ jenisSlug: string; id: string }>();
  const [searchParams] = useSearchParams();
  const { data, updateData } = useApp();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [copies, setCopies] = useState<number>(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);
  const surat = data.surat.find(s => s.id === id);

  useEffect(() => {
    const action = searchParams.get('action');
    if (!action || !surat) return;
    const timer = setTimeout(() => {
      if (action === 'print') handleOpenPrintDialog();
      if (action === 'pdf') handleExportPdf();
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

  const captureA4 = async () => {
    const el = document.getElementById('a4-print-area') as HTMLElement | null;
    if (!el) return null;

    // ── 1. Remove scale transform so html2canvas sees full A4 size ──
    const prevTransform = el.style.transform;
    const prevTransition = el.style.transition;
    el.style.transform = 'none';
    el.style.transition = 'none';

    // ── 2. Convert every <img> inside to base64 so html2canvas can load them ──
    // Vite hashes asset filenames (e.g. kemenag-logo-Abc123.png) and html2canvas
    // cannot resolve them via CORS. Inlining as base64 fixes this completely.
    const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
    const originalSrcs: string[] = [];

    await Promise.all(imgs.map(async (img, i) => {
      originalSrcs[i] = img.src;
      if (!img.src || img.src.startsWith('data:')) return; // already base64
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => { img.src = reader.result as string; resolve(); };
          reader.readAsDataURL(blob);
        });
      } catch {
        // If fetch fails, leave original src — html2canvas will try useCORS
      }
    }));

    // Small delay for DOM repaint
    await new Promise(r => setTimeout(r, 100));

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
      logging: false,
    });

    // ── 3. Restore everything ──
    imgs.forEach((img, i) => { img.src = originalSrcs[i]; });
    el.style.transform = prevTransform;
    el.style.transition = prevTransition;

    return canvas;
  };

  const loadPrinters = async () => {
    setIsLoadingPrinters(true);
    try {
      if (window.electronAPI?.isElectron) {
        const printerList = await window.electronAPI.getPrinters();
        setPrinters(printerList || []);
        if (printerList && printerList.length > 0) {
          setSelectedPrinter(printerList[0].name);
        }
      } else {
        // Fallback for web - no printers available
        setPrinters([]);
      }
    } catch (error) {
      console.error('Failed to load printers:', error);
      setPrinters([]);
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  const handleOpenPrintDialog = async () => {
    setShowPrintDialog(true);
    await loadPrinters();
  };

  const handlePrint = async () => {
    if (!window.electronAPI?.isElectron) {
      // Fallback: use browser print
      const canvas = await captureA4();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><title>Cetak Surat</title>
<style>@page{size:A4;margin:0}*{margin:0;padding:0}body{margin:0}img{width:210mm;height:auto;display:block}</style>
</head><body><img src="${imgData}" onload="window.print();window.close()"/></body></html>`);
      w.document.close();
      setShowPrintDialog(false);
      return;
    }

    setIsPrinting(true);
    try {
      const result = await window.electronAPI.printDocument({
        printerName: selectedPrinter || undefined,
        copies: copies,
        duplex: false,
      });
      
      if (result.success) {
        toast.success('Dokumen dikirim ke printer');
      } else {
        toast.error(result.error || 'Gagal mencetak');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Gagal mencetak dokumen');
    } finally {
      setIsPrinting(false);
      setShowPrintDialog(false);
    }
  };

  const handleExportPdf = async () => {
    // Always use html2canvas → jsPDF to capture only the A4 letter area.
    // printToPDF captures the whole Electron window (dark UI) — wrong output.
    try {
      const canvas = await captureA4();
      if (!canvas) { toast.error('Gagal membuat PDF'); return; }

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const A4_W = 210; // mm
      const A4_H = 297; // mm

      // Fit the captured image exactly onto A4
      const imgRatio = canvas.height / canvas.width;
      const pageRatio = A4_H / A4_W;

      let imgW = A4_W;
      let imgH = A4_W * imgRatio;

      if (imgH > A4_H) {
        imgH = A4_H;
        imgW = A4_H / imgRatio;
      }

      const offsetX = (A4_W - imgW) / 2;
      const offsetY = (A4_H - imgH) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, imgW, imgH);
      pdf.save(`${surat.nama || 'surat'}.pdf`);
      toast.success('PDF berhasil diunduh');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Gagal mengekspor PDF');
    }
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
                <DropdownMenuItem onClick={handleOpenPrintDialog}>
                  <Printer className="mr-2 h-4 w-4" /> Cetak
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPdf}>
                  <FileDown className="mr-2 h-4 w-4" /> Export PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <A4Preview surat={surat} jenisSurat={jenisSurat} />

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cetak Surat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingPrinters ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Memuat daftar printer...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="printer">Printer</Label>
                  {printers.length > 0 ? (
                    <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                      <SelectTrigger id="printer">
                        <SelectValue placeholder="Pilih printer" />
                      </SelectTrigger>
                      <SelectContent>
                        {printers.map((printer) => (
                          <SelectItem key={printer.name} value={printer.name}>
                            {printer.displayName || printer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {window.electronAPI?.isElectron 
                        ? 'Tidak ada printer yang ditemukan. Pastikan printer sudah terinstal.' 
                        : 'Fitur cetak hanya tersedia di aplikasi desktop.'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="copies">Jumlah Salinan</Label>
                  <Select 
                    value={String(copies)} 
                    onValueChange={(v) => setCopies(Number(v))}
                  >
                    <SelectTrigger id="copies" className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handlePrint} 
              disabled={isPrinting || (window.electronAPI?.isElectron && printers.length === 0)}
            >
              {isPrinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencetak...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        description={`Apakah Anda yakin ingin menghapus surat "${surat.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={deleteSurat}
      />
    </div>
  );
};

export default PreviewSurat;
