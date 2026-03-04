import { useApp } from '@/contexts/AppContext';
import { Surat, JenisSurat, formatNomorSurat } from '@/lib/store';
import kemenagLogo from '@/assets/kemenag-logo.png';

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

  // Use uploaded logo or fallback to default kemenag logo
  const logoSrc = h.logoUrl || kemenagLogo;

  return (
    <div className="flex justify-center">
      <div
        id="a4-print-area"
        className="bg-white text-black shadow-lg mx-auto"
        style={{
          width: '210mm', minHeight: '297mm',
          paddingTop: '3.2mm', paddingBottom: '25.4mm',
          paddingLeft: '25.4mm', paddingRight: '25.4mm',
          fontFamily: "'Times New Roman', serif", fontSize: '12pt',
          lineHeight: '1.0', boxSizing: 'border-box',
        }}
      >
        {/* Header / KOP */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '8px', marginBottom: '20px', position: 'relative' }}>
          <img
            src={logoSrc}
            alt="Logo"
            style={{ position: 'absolute', left: '-12.9mm', top: '-1.7mm', width: '25.47mm', height: '25.59mm', objectFit: 'contain', zIndex: 10 }}
          />
          <div style={{ fontSize: '16pt', fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>
            {h.line1}
          </div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>
            {h.line2}
          </div>
          <div style={{ fontSize: '12pt', fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>
            {h.school}
          </div>
          <div style={{ fontSize: '11pt', lineHeight: '1.0', margin: 0, padding: 0 }}>
            {h.address}{h.contact ? ` ${h.contact}` : ''}
          </div>
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
        <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: parsedIsi }} />

        {/* TTD - starts at 100mm from left margin */}
        {kepala && (
          <div style={{ marginTop: '40px', paddingLeft: '100mm' }}>
            <div>Langsa, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div>Kepala Madrasah,</div>
            <div style={{ marginTop: '60px', fontWeight: 'bold', textDecoration: 'underline' }}>
              {kepala.nama}
            </div>
            {kepala.nip && <div>NIP. {kepala.nip}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
