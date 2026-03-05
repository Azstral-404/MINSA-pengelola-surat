import { useApp } from '@/contexts/AppContext';
import { Surat, JenisSurat, formatNomorSurat, KELAS_OPTIONS } from '@/lib/store';
import kemenagLogo from '@/assets/kemenag-logo.png';

interface A4PreviewProps {
  surat: Surat;
  jenisSurat: JenisSurat;
}

export function A4Preview({ surat, jenisSurat }: A4PreviewProps) {
  const { data } = useApp();
  const kepala = data.settings.kepalaMadrasah.find(k => k.id === surat.kepalaMadrasahId);
  const h = data.settings.suratHeader;
  const kabupaten = data.settings.kabupaten || '';

  const parseTemplate = (template: string) => {
    let result = template
      .replace(/\{nama\}/gi, '<b>' + surat.nama + '</b>')
      .replace(/\{tempat_lahir\}/gi, surat.tempatLahir)
      .replace(/\{tanggal_lahir\}/gi, surat.tanggalLahir)
      .replace(/\{jenis_kelamin\}/gi, surat.jenisKelamin)
      .replace(/\{kelas\}/gi, () => {
        const opt = KELAS_OPTIONS.find(o => o.value === surat.kelas);
        return opt ? opt.label : surat.kelas;
      })
      .replace(/\{no_induk\}/gi, surat.noInduk)
      .replace(/\{nisn\}/gi, surat.nisn)
      .replace(/\{nama_orang_tua\}/gi, surat.namaOrangTua)
      .replace(/\{alamat\}/gi, surat.alamat)
      .replace(/\{tahun_ajaran\}/gi, surat.tahunAjaran)
      .replace(/\{kabupaten\}/gi, kabupaten);

    const extras = surat.extraFields || {};
    const customFields = data.settings.customBiodata || [];
    for (const field of customFields) {
      const regex = new RegExp(field.placeholder.replace(/[{}]/g, '\\$&'), 'gi');
      result = result.replace(regex, extras[field.key] || '');
    }

    return result;
  };

  const parsedIsi = parseTemplate(jenisSurat.templateIsi);
  const logoSrc = h.logoUrl || (data.settings.customKemenagLogo || kemenagLogo);

  // city from kabupaten setting for TTD
  const cityForTtd = kabupaten
    ? kabupaten.replace(/^(Kota|Kabupaten)\s+/i, '').trim()
    : 'Langsa';

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
          lineHeight: '1.5', boxSizing: 'border-box',
        }}
      >
        {/* Header / KOP */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '8px', marginBottom: '20px', position: 'relative' }}>
          {logoSrc && (
            <img
              src={logoSrc}
              alt="Logo"
              style={{ position: 'absolute', left: '-10mm', bottom: '5px', width: `${h.logoSize || 22}mm`, height: `${h.logoSize || 22}mm`, objectFit: 'contain', zIndex: 10 }}
            />
          )}
          {h.line1 && <div style={{ fontSize: `${h.line1Size || 16}pt`, fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>{h.line1}</div>}
          {h.line2 && <div style={{ fontSize: `${h.line2Size || 14}pt`, fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>{h.line2}</div>}
          {h.school && <div style={{ fontSize: `${h.schoolSize || 12}pt`, fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>{h.school}</div>}
          {h.schoolSub && <div style={{ fontSize: `${h.schoolSubSize || 10}pt`, lineHeight: '1.0', margin: 0, padding: 0 }}>{h.schoolSub}</div>}
          {(h.address || h.contact) && <div style={{ fontSize: `${h.addressSize || 11}pt`, lineHeight: '1.0', margin: 0, padding: 0 }}>{h.address}{h.contact ? ` ${h.contact}` : ''}</div>}
        </div>

        {/* Judul */}
        <div style={{ textAlign: 'center', marginBottom: '0', marginTop: '0' }}>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '14pt' }}>
            {jenisSurat.templateJudul || jenisSurat.label.toUpperCase()}
          </div>
        </div>

        {/* Nomor - spacing: before 0pt, after 6pt, line 1.5 */}
        <div style={{
          textAlign: 'center',
          marginTop: '0pt',
          marginBottom: '6pt',
          fontSize: '12pt',
          fontWeight: 'bold',
          lineHeight: '1.5',
        }}>
          {formatNomorSurat(surat.nomorSurat, surat.bulan, surat.tahun, data.settings.nomorSuratFormat)}
        </div>

        {/* Isi - paragraph spacing: before 0pt, after 6pt, line-height 1.5 */}
        <style>{`
          #a4-isi-content p {
            margin-top: 0pt;
            margin-bottom: 6pt;
            line-height: 1.5;
          }
          #a4-isi-content div {
            margin-top: 0pt;
            margin-bottom: 6pt;
            line-height: 1.5;
          }
          #a4-isi-content br {
            display: block;
            content: '';
            margin-bottom: 6pt;
          }
        `}</style>
        <div
          id="a4-isi-content"
          style={{ textAlign: 'justify', lineHeight: '1.5' }}
          dangerouslySetInnerHTML={{ __html: parsedIsi }}
        />

        {/* TTD */}
        {kepala && (
          <div style={{ marginTop: '40px', paddingLeft: '100mm' }}>
            <div>{cityForTtd}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div>Kepala Madrasah,</div>
            <div style={{ marginTop: '60px', fontWeight: 'bold', textDecoration: 'underline' }}>{kepala.nama}</div>
            {kepala.nip && <div>NIP. {kepala.nip}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
