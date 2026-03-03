import { useApp } from '@/contexts/AppContext';
import { Surat, JenisSurat, formatNomorSurat } from '@/lib/store';

interface A4PreviewProps {
  surat: Surat;
  jenisSurat: JenisSurat;
}

export function A4Preview({ surat, jenisSurat }: A4PreviewProps) {
  const { data } = useApp();
  const kepala = data.settings.kepalaMadrasah.find(k => k.id === surat.kepalaMadrasahId);
  const h = data.settings.suratHeader;

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
    <div className="flex justify-center">
      <div
        id="a4-print-area"
        className="bg-white text-black shadow-lg mx-auto"
        style={{
          width: '210mm', minHeight: '297mm', padding: '20mm',
          fontFamily: "'Times New Roman', serif", fontSize: '12pt',
          lineHeight: '1.6', boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '10px', marginBottom: '20px', position: 'relative' }}>
          {h.logoUrl && (
            <img src={h.logoUrl} alt="Logo" style={{ position: 'absolute', left: 0, top: 0, width: '70px', height: '70px', objectFit: 'contain' }} />
          )}
          <div style={{ fontSize: '11pt' }}>{h.line1}</div>
          <div style={{ fontSize: '11pt' }}>{h.line2}</div>
          <div style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '2px' }}>{h.school}</div>
          <div style={{ fontSize: '9pt' }}>{h.address}</div>
          <div style={{ fontSize: '9pt' }}>{h.contact}</div>
        </div>

        {/* Judul */}
        <div style={{ textAlign: 'center', marginBottom: '5px' }}>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '14pt' }}>
            {jenisSurat.templateJudul || jenisSurat.label.toUpperCase()}
          </div>
        </div>

        {/* Nomor */}
        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '12pt' }}>
          {formatNomorSurat(surat.nomorSurat, surat.bulan, surat.tahun)}
        </div>

        {/* Isi */}
        <div dangerouslySetInnerHTML={{ __html: parsedIsi }} />

        {/* TTD */}
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
