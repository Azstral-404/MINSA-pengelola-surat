import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { A4Preview } from '@/components/A4Preview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PreviewSurat = () => {
  const { jenisSlug, id } = useParams<{ jenisSlug: string; id: string }>();
  const { data } = useApp();
  const navigate = useNavigate();

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);
  const surat = data.surat.find(s => s.id === id);

  if (!jenisSurat || !surat) {
    return <div className="text-center py-10 text-muted-foreground">Surat tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>
      <A4Preview surat={surat} jenisSurat={jenisSurat} />
    </div>
  );
};

export default PreviewSurat;
