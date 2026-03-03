import React, { useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Surat, JenisSurat, formatNomorSurat, KepalaMadrasah } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface A4PreviewProps {
  surat: Surat;
  jenisSurat: JenisSurat;
}

export function A4Preview({ surat, jenisSurat }: A4PreviewProps) {
  const { data } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const kepala = data.settings.kepalaMadrasah.find(k => k.id === surat.kepalaMadrasahId);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !ref.current) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Cetak Surat</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { margin: 0; font-family: 'Times New Roman', serif; font-size: 12pt; }
        .a4-page { width: 210mm; min-height: 297mm; padding: 20mm; box-sizing: border-box; }
      </style>
      </head><body>${ref.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  // Parse template: replace placeholders
  const parseTemplate = (template: string) => {
    return template
      .replace(/\{nama\}/gi, surat.nama)
      .replace(/\{tempat_lahir\}/gi, surat.tempatLahir)
      .replace(/\{tanggal_lahir\}/gi, surat.tanggalLahir)
      .replace(/\{jenis_kelamin\}/gi, surat.jenisKelamin)
      .replace(/\{kelas\}/gi, surat.kelas)
      .replace(/\{no_induk\}/gi, surat.noInduk)
      .replace(/\{nisn\}/gi, surat.nisn)
      .replace(/\{nama_orang_tua\}/gi, surat.namaOrangTua)
      .replace(/\{alamat\}/gi, surat.alamat)
      .replace(/\{tahun_ajaran\}/gi, surat.tahunAjaran);
  };

  const parsedIsi = parseTemplate(jenisSurat.templateIsi);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handlePrint} className="print:hidden">
        <Printer className="mr-2 h-4 w-4" /> Cetak Surat
      </Button>

      <div
        ref={ref}
        className="bg-white text-black shadow-lg mx-auto"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          fontFamily: "'Times New Roman', serif",
          fontSize: '12pt',
          lineHeight: '1.6',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11pt' }}>KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
          <div style={{ fontSize: '11pt' }}>KANTOR KEMENTERIAN AGAMA KOTA LANGSA</div>
          <div style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '2px' }}>
            MADRASAH IBTIDAIYAH NEGERI 1 LANGSA
          </div>
          <div style={{ fontSize: '9pt' }}>NSM: 111111730001 · NPSN: 10105537</div>
          <div style={{ fontSize: '9pt' }}>
            Jl. T.M Bahrum No.2 Kel. Jawa Kec. Langsa Kota, Kota Langsa, 24412
          </div>
          <div style={{ fontSize: '9pt' }}>
            Telp: (0641) 426487 Email: minaborong@gmail.com
          </div>
        </div>

        {/* Judul Surat */}
        <div style={{ textAlign: 'center', marginBottom: '5px' }}>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '14pt' }}>
            {jenisSurat.templateJudul || jenisSurat.label.toUpperCase()}
          </div>
        </div>

        {/* Nomor Surat */}
        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '12pt' }}>
          {formatNomorSurat(surat.nomorSurat, surat.bulan, surat.tahun)}
        </div>

        {/* Isi Surat */}
        <div dangerouslySetInnerHTML={{ __html: parsedIsi }} />

        {/* Tanda Tangan */}
        {kepala && (
          <div style={{ marginTop: '40px', textAlign: 'right', paddingRight: '20px' }}>
            <div>Langsa, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div>Kepala Madrasah,</div>
            <div style={{ marginTop: '60px', fontWeight: 'bold', textDecoration: 'underline' }}>
              {kepala.nama}
            </div>
            <div>NIP. {kepala.nip}</div>
          </div>
        )}
      </div>
    </div>
  );
}
