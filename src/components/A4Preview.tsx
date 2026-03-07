import { useApp } from '@/contexts/AppContext';
import { Surat, JenisSurat, formatNomorSurat, KELAS_OPTIONS } from '@/lib/store';
import kemnogLogo from '@/assets/kemenag-logo.png';

// Helper: Format Indonesian date (YYYY-MM-DD -> DD Month YYYY)
function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const monthName = months[month - 1] || '';
  return `${String(day).padStart(2, '0')} ${monthName} ${year}`;
}

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
      .replace(/\{nama\}/gi, '<b>' + surat.nama.toUpperCase() + '</b>')
      .replace(/\{tempat_lahir\}/gi, surat.tempatLahir)
      .replace(/\{tanggal_lahir\}/gi, formatIndonesianDate(surat.tanggalLahir))
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
  const logoSrc = h.logoUrl || (data.settings.customKemenagLogo || kemnogLogo);

  // city from kabupaten setting for TTD
  const cityForTtd = kabupaten
    ? kabupaten.replace(/^(Kota|Kabupaten)\s+/i, '').trim()
    : 'Langsa';

  // Format current date with leading zero
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className="flex justify-center">
      <div
        id="a4-print-area"
        className="bg-white text-black shadow-lg mx-auto"
        style={{
          width: '210mm', minHeight: '297mm',
          paddingTop: '4.2mm', paddingBottom: '25.4mm',
          paddingLeft: '25.4mm', paddingRight: '25.4mm',
          fontFamily: "'Times New Roman', serif", fontSize: '12pt',
          lineHeight: '1.0', boxSizing: 'border-box',
        }}
      >
        {/* Header / KOP */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid black', paddingBottom: '8px', marginBottom: '24px', position: 'relative' }}>
          {logoSrc && (
            <img
              src={logoSrc}
              alt="Logo"
              style={{ position: 'absolute', left: '-9.5mm', bottom: '3px', width: `${h.logoSize || 22}mm`, height: `${h.logoSize || 22}mm`, objectFit: 'contain', zIndex: 10 }}
            />
          )}
          {h.line1 && <div style={{ fontSize: `${h.line1Size || 16}pt`, fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>{h.line1}</div>}
          {h.line2 && <div style={{ fontSize: `${h.line2Size || 14}pt`, fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>{h.line2}</div>}
          {h.school && <div style={{ fontSize: `${h.schoolSize || 12}pt`, fontWeight: 'bold', lineHeight: '1.0', margin: 0, padding: 0 }}>{h.school}</div>}
          {(h.address || h.contact) && <div style={{ fontSize: `${h.addressSize || 11}pt`, lineHeight: '1.0', margin: 0, padding: 0 }}>{h.address}{h.contact ? ` ${h.contact}` : ''}</div>}
        </div>

        {/* Judul */}
        <div style={{ textAlign: 'center', marginBottom: '6px', marginTop: '12' }}>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '14pt', textUnderlineOffset: '4px' }}>
            {jenisSurat.templateJudul || jenisSurat.label.toUpperCase()}
          </div>
        </div>

        {/* Nomor - no space after, line-height 1.0 */}
        <div style={{
          textAlign: 'center',
          marginTop: '0',
          marginBottom: '36px',
          fontSize: '12pt',
          fontWeight: 'bold',
          lineHeight: '1.0',
        }}>
          {formatNomorSurat(surat.nomorSurat, surat.bulan, surat.tahun, data.settings.nomorSuratFormat)}
        </div>

        {/* Isi - paragraph spacing: before 0pt, after 0pt, line-height 1.0 */}
        <style>{`
          #a4-isi-content p {
            margin-top: 0;
            margin-bottom: 8px;
            line-height: 1.0;
          }
          #a4-isi-content div {
            margin-top: 0;
            margin-bottom: 8px;
            line-height: 1.5;
          }
          #a4-isi-content br {
            display: block;
            content: '';
            margin-bottom: 8px;
          }
          #a4-isi-content * {
            color: black !important;
          }
        `}</style>
        <div
          id="a4-isi-content"
          style={{ textAlign: 'justify', lineHeight: '1.0' }}
          dangerouslySetInnerHTML={{ __html: parsedIsi }}
        />

        {/* TTD - formatted date with leading zero */}
        {kepala && (
          <div style={{ marginTop: '40px', paddingLeft: '100mm' }}>
            <div>{cityForTtd}, {formattedDate}</div>
            <div>Kepala Madrasah,</div>
            <div
              style={{
                marginTop: '60px',
                fontWeight: 'bold',
                display: 'inline-block',          // shrink to text width
                position: 'relative',
                paddingBottom: kepala.nip ? '2px' : '0', // space for the line
                // native underline disabled – we’ll draw our own
                textDecoration: 'none',
                marginBottom: '3px',
              }}
            >
              {kepala.nama}
              {kepala.nip && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderBottom: '1px solid black',
                  }}
                />
              )}
            </div>
             {kepala.nip && <div>NIP. {kepala.nip}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
