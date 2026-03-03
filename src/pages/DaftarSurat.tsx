import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { BULAN_NAMES } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DaftarSurat = () => {
  const { jenisSlug } = useParams<{ jenisSlug: string }>();
  const { data, updateData } = useApp();
  const navigate = useNavigate();

  const jenisSurat = data.settings.jenisSurat.find(j => j.slug === jenisSlug);
  if (!jenisSurat) {
    return <div className="text-center py-10 text-muted-foreground">Jenis surat tidak ditemukan.</div>;
  }

  const suratList = data.surat.filter(s => s.jenisSuratId === jenisSurat.id);

  // Group by tahun then bulan
  const grouped: Record<number, Record<number, typeof suratList>> = {};
  suratList.forEach(s => {
    if (!grouped[s.tahun]) grouped[s.tahun] = {};
    if (!grouped[s.tahun][s.bulan]) grouped[s.tahun][s.bulan] = [];
    grouped[s.tahun][s.bulan].push(s);
  });

  const deleteSurat = (id: string) => {
    updateData(d => ({ ...d, surat: d.surat.filter(s => s.id !== id) }));
    toast.success('Surat dihapus');
  };

  const sortedYears = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{jenisSurat.label}</h1>
        <Link to={`/surat/${jenisSlug}/tambah`}>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Tambah Surat</Button>
        </Link>
      </div>

      {suratList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Belum ada surat. Klik tombol "Tambah Surat" untuk memulai.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Tahun</TableHead>
                  <TableHead className="w-28">Bulan</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>No. Surat</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedYears.map(tahun => {
                  const bulanKeys = Object.keys(grouped[tahun]).map(Number).sort((a, b) => a - b);
                  const totalRowsForYear = bulanKeys.reduce((sum, b) => sum + grouped[tahun][b].length, 0);
                  let yearRendered = false;

                  return bulanKeys.map(bulan => {
                    const items = grouped[tahun][bulan];
                    let bulanRendered = false;

                    return items.map((s, idx) => {
                      const showYear = !yearRendered;
                      const showBulan = !bulanRendered;
                      if (showYear) yearRendered = true;
                      if (showBulan) bulanRendered = true;

                      return (
                        <TableRow key={s.id}>
                          {showYear && (
                            <TableCell rowSpan={totalRowsForYear} className="font-bold text-center align-top bg-muted/50">
                              {tahun}
                            </TableCell>
                          )}
                          {showBulan && (
                            <TableCell rowSpan={items.length} className="font-medium align-top bg-muted/30">
                              {BULAN_NAMES[bulan]}
                            </TableCell>
                          )}
                          <TableCell>{s.nama}</TableCell>
                          <TableCell className="text-xs">{s.nomorSurat || '-'}</TableCell>
                          <TableCell>{s.kelas}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/surat/${jenisSlug}/${s.id}/preview`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteSurat(s.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  });
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DaftarSurat;
