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
  const [appName, setAppName] = useState('MINSA');
  const [schoolName, setSchoolName] = useState('');

  const madrasahInfo = detectMadrasahInfo(schoolName);

  const handleSubmit = () => {
    if (!appName.trim()) { toast.error('Nama aplikasi wajib diisi'); return; }
    if (!schoolName.trim()) { toast.error('Nama sekolah wajib diisi'); return; }

    updateData(d => ({
      ...d,
      settings: {
        ...d.settings,
        appName: appName.trim(),
        schoolName: schoolName.trim(),
        onboarded: true,
        ...(madrasahInfo ? {
          suratHeader: {
            ...d.settings.suratHeader,
            line2: `KANTOR KEMENTERIAN AGAMA KOTA ${madrasahInfo.city.toUpperCase()}`,
          }
        } : {}),
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
              placeholder="cth: MINSA"
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
            {madrasahInfo && (
              <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  Kementerian Agama Kota {madrasahInfo.city}
                </p>
                <p className="text-xs text-muted-foreground">Terdeteksi otomatis dari nama sekolah</p>
              </div>
            )}
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
