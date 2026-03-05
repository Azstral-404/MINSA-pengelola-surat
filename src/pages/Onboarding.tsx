import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { detectMadrasahInfo } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Onboarding = () => {
  const { updateData } = useApp();
  const navigate = useNavigate();
  const [appName, setAppName] = useState('MANAJEMEN SURAT');
  const [schoolName, setSchoolName] = useState('');
  const [nsm, setNsm] = useState('');
  const [npsn, setNpsn] = useState('');

  const madrasahInfo = detectMadrasahInfo(schoolName);

  const getSchoolLine = (info: NonNullable<ReturnType<typeof detectMadrasahInfo>>) => {
    const cityUpper = info.city.toUpperCase();
    const statusStr = info.status ? ` ${info.status}` : '';
    switch (info.baseType) {
      case 'RA': return `RAUDHATHUL ATHFAL ${cityUpper}`;
      case 'MI': return `MADRASAH IBTIDAIYAH${statusStr} ${cityUpper}`;
      case 'MTS': return `MADRASAH TSANAWIYAH${statusStr} ${cityUpper}`;
      case 'MA': return `MADRASAH ALIYAH${statusStr} ${cityUpper}`;
      default: return '';
    }
  };

  const handleSubmit = () => {
    if (!appName.trim()) { toast.error('Nama aplikasi wajib diisi'); return; }
    if (!schoolName.trim()) { toast.error('Nama sekolah wajib diisi'); return; }

    const info = detectMadrasahInfo(schoolName.trim());

    const headerDefaults = info?.isMadrasah ? {
      line1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
      line2: `KANTOR KEMENTERIAN AGAMA KOTA ${info.city.toUpperCase()}`,
      school: getSchoolLine(info),
    } : {
      line1: '',
      line2: '',
      school: '',
    };

    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        appName: appName.trim(),
        schoolName: schoolName.trim(),
        nsm: nsm.trim(),
        npsn: npsn.trim(),
        onboarded: true,
        suratHeader: {
          ...d.settings.suratHeader,
          ...headerDefaults,
        },
      },
    }));
    toast.success('Selamat datang!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Selamat Datang 👋</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Atur identitas aplikasi Anda untuk memulai.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Nama Aplikasi (Sidebar)</Label>
            <Input
              value={appName}
              onChange={e => setAppName(e.target.value)}
              placeholder="cth: MANAJEMEN SURAT"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Akan ditampilkan di sidebar sebagai judul aplikasi.</p>
          </div>

          <div>
            <Label>Nama Sekolah</Label>
            <Input
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="cth: MIN 1 Langsa"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Akan ditampilkan di header dan dashboard.</p>
            {madrasahInfo && schoolName.trim() && (
              <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  {madrasahInfo.isMadrasah
                    ? `Kementerian Agama Kota ${madrasahInfo.city}`
                    : 'Kementerian Pendidikan'}
                </p>
                <p className="text-xs text-muted-foreground">Terdeteksi otomatis dari nama sekolah</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>NSM</Label>
              <Input
                value={nsm}
                onChange={e => { if (/^\d*$/.test(e.target.value)) setNsm(e.target.value); }}
                placeholder="Opsional"
                inputMode="numeric"
                className="mt-1"
              />
            </div>
            <div>
              <Label>NPSN</Label>
              <Input
                value={npsn}
                onChange={e => { if (/^\d*$/.test(e.target.value)) setNpsn(e.target.value); }}
                placeholder="Opsional"
                inputMode="numeric"
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Mulai Menggunakan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
