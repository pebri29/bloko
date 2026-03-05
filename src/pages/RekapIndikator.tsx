import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  MapPin, 
  FileSpreadsheet, 
  FileText as FilePdf,
  ChevronRight,
  X,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import { exportToExcel, exportToPDF } from '../lib/exportUtils';
import { cn } from '../lib/utils';

export const RekapIndikatorPage = () => {
  const { barangKeluarList, isLoading } = useData();
  const [selectedData, setSelectedData] = useState<any[] | null>(null);
  const [detailTitle, setDetailTitle] = useState('');

  // 1. Data by Kecamatan
  const kecamatanData = useMemo(() => {
    const stats: Record<string, { name: string; total: number; items: any[] }> = {};
    barangKeluarList.forEach(item => {
      const key = item.kecamatan || 'Lainnya';
      if (!stats[key]) stats[key] = { name: key, total: 0, items: [] };
      stats[key].total += item.jumlahPaket;
      stats[key].items.push(item);
    });
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [barangKeluarList]);

  // 2. Data by Jenis Bantuan (Sosial vs Bencana)
  const jenisData = useMemo(() => {
    const stats: Record<string, { name: string; value: number; items: any[] }> = {
      'Sosial': { name: 'Sosial (Fasilitasi)', value: 0, items: [] },
      'Bencana': { name: 'Bencana (Penyedia Makanan)', value: 0, items: [] }
    };
    barangKeluarList.forEach(item => {
      if (stats[item.jenis]) {
        stats[item.jenis].value += item.jumlahPaket;
        stats[item.jenis].items.push(item);
      }
    });
    return Object.values(stats);
  }, [barangKeluarList]);

  // 3. Data by Jenis Penyaluran (Sub Kategori)
  const subKategoriData = useMemo(() => {
    const stats: Record<string, { name: string; total: number; items: any[] }> = {};
    barangKeluarList.forEach(item => {
      // Try to extract sub-category from jenisPenyaluran "Category - SubCategory - Detail"
      const val = item.jenisPenyaluran || item.keterangan || '';
      const parts = val.split(' - ');
      const key = parts[1] || parts[0] || 'Lainnya';
      if (!stats[key]) stats[key] = { name: key, total: 0, items: [] };
      stats[key].total += item.jumlahPaket;
      stats[key].items.push(item);
    });
    return Object.values(stats).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [barangKeluarList]);

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  const handleChartClick = (data: any, title: string) => {
    if (data && data.items) {
      setSelectedData(data.items);
      setDetailTitle(title);
    }
  };

  const handleExportExcel = () => {
    const data = barangKeluarList.map(item => ({
      'Tanggal': format(new Date(item.tanggal), 'dd/MM/yyyy'),
      'Penerima': item.penerima,
      'NIK': item.nik,
      'Kecamatan': item.kecamatan || '-',
      'Jenis': item.jenis === 'Sosial' ? 'Sosial (Fasilitasi)' : 'Bencana (Penyedia Makanan)',
      'Jumlah Paket': item.jumlahPaket,
      'Jenis Penyaluran': item.jenisPenyaluran || item.keterangan || '-',
      'Keterangan Status': item.keterangan || '-',
      'Status': item.status || 'Belum Selesai'
    }));
    exportToExcel(data, 'Rekap_Indikator_Sembako', 'Rekap');
  };

  const handleExportPDF = () => {
    const headers = [['Tanggal', 'Penerima', 'Kecamatan', 'Jenis', 'Jumlah', 'Status']];
    const data = barangKeluarList.map(item => [
      format(new Date(item.tanggal), 'dd/MM/yyyy'),
      item.penerima,
      item.kecamatan || '-',
      item.jenis === 'Sosial' ? 'Sosial' : 'Bencana',
      `${item.jumlahPaket} Pkt`,
      item.status || 'Belum Selesai'
    ]);
    exportToPDF('Rekap Indikator Penyaluran Sembako', headers, data, 'Rekap_Indikator');
  };

  const handleExportDetailPDF = () => {
    if (!selectedData) return;
    const headers = [['Tanggal', 'Penerima', 'Kecamatan', 'Jumlah', 'Jenis Penyaluran', 'Status']];
    const data = selectedData.map(item => [
      format(new Date(item.tanggal), 'dd/MM/yyyy'),
      item.penerima,
      item.kecamatan || '-',
      `${item.jumlahPaket} Pkt`,
      item.jenisPenyaluran || item.keterangan || '-',
      item.status || 'Belum Selesai'
    ]);
    exportToPDF(`Detail Data: ${detailTitle}`, headers, data, `Detail_${detailTitle.replace(/\s+/g, '_')}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Rekap Indikator</h1>
          <p className="text-slate-500 mt-1">Visualisasi data penyaluran bantuan sembako.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-100 transition-all"
          >
            <FileSpreadsheet size={20} />
            Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all"
          >
            <FilePdf size={20} />
            PDF
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard 
          onClick={() => {
            setSelectedData(barangKeluarList);
            setDetailTitle('Semua Data Penerima');
          }}
          className="p-6 flex items-center gap-4 cursor-pointer hover:bg-white/80 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Penerima</p>
            <p className="text-2xl font-black text-slate-900">{barangKeluarList.length}</p>
          </div>
        </GlassCard>
        <GlassCard 
          onClick={() => {
            setSelectedData(barangKeluarList);
            setDetailTitle('Semua Data Penyaluran Paket');
          }}
          className="p-6 flex items-center gap-4 cursor-pointer hover:bg-white/80 transition-all group"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Paket Keluar</p>
            <p className="text-2xl font-black text-slate-900">
              {barangKeluarList.reduce((acc, curr) => acc + curr.jumlahPaket, 0)}
            </p>
          </div>
        </GlassCard>
        <GlassCard 
          onClick={() => {
            if (kecamatanData[0]) {
              setSelectedData(kecamatanData[0].items);
              setDetailTitle(`Kecamatan Terbanyak: ${kecamatanData[0].name}`);
            }
          }}
          className="p-6 flex items-center gap-4 cursor-pointer hover:bg-white/80 transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Kecamatan Terbanyak</p>
            <p className="text-2xl font-black text-slate-900">{kecamatanData[0]?.name || '-'}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart: Kecamatan */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <MapPin size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Penyaluran per Kecamatan</h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={kecamatanData} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20}>
                  {kecamatanData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      onClick={() => handleChartClick(entry, `Kecamatan: ${entry.name}`)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center italic">* Klik batang grafik untuk melihat detail data</p>
        </GlassCard>

        {/* Chart: Jenis Bantuan */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                <PieChartIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Proporsi Jenis Bantuan</h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jenisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => handleChartClick(data, `Jenis: ${data.name}`)}
                >
                  {jenisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#F59E0B'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center italic">* Klik bagian grafik untuk melihat detail data</p>
        </GlassCard>

        {/* Chart: Sub Kategori */}
        <GlassCard className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rekap Berdasarkan Kategori Bantuan</h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={subKategoriData}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                  {subKategoriData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      onClick={() => handleChartClick(entry, `Kategori: ${entry.name}`)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center italic">* Klik batang grafik untuk melihat detail data</p>
        </GlassCard>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedData(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Detail Data</h2>
                  <p className="text-blue-600 font-bold text-sm">{detailTitle}</p>
                </div>
                <button 
                  onClick={() => setSelectedData(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Penerima</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kecamatan</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis Penyaluran</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {format(new Date(item.tanggal), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">{item.penerima}</p>
                          <p className="text-[10px] text-slate-400">{item.nik}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.kecamatan || '-'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{item.jumlahPaket} Pkt</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{item.jenisPenyaluran || item.keterangan || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
                            item.status === 'Selesai' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {item.status || 'Belum Selesai'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={handleExportDetailPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-95"
                >
                  <FilePdf size={20} />
                  Cetak PDF
                </button>
                <button 
                  onClick={() => setSelectedData(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold transition-all active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
