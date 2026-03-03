import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BULAN_NAMES } from '@/lib/store';

const Index = () => {
  const { data } = useApp();
  const { jenisSurat } = data.settings;
  const recentSurat = [...data.surat].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Surat</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.surat.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jenis Surat</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jenisSurat.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tahun Ajaran</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.settings.tahunAjaran.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Per Jenis Surat */}
      {jenisSurat.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jenisSurat.map(js => {
            const count = data.surat.filter(s => s.jenisSuratId === js.id).length;
            return (
              <Link to={`/surat/${js.slug}`} key={js.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{js.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{count} surat</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent */}
      {recentSurat.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Surat Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSurat.map(s => {
                const js = jenisSurat.find(j => j.id === s.jenisSuratId);
                return (
                  <div key={s.id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                    <div>
                      <span className="font-medium">{s.nama}</span>
                      <span className="text-muted-foreground ml-2">— {js?.label}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {BULAN_NAMES[s.bulan]} {s.tahun}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {jenisSurat.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Belum ada jenis surat. Silakan tambahkan di{' '}
            <Link to="/pengaturan" className="text-primary underline">Pengaturan</Link>.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
