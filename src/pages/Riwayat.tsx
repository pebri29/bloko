import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { 
  Search, 
  Calendar, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileStack,
  ChevronRight,
  ChevronDown,
  Package,
  Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';

type HistoryItem = {
  id: string | number;
  type: 'LS' | 'Masuk' | 'Keluar';
  tanggal: Date;
  keterangan: string;
  jumlah: number;
  jenis: string;
  status?: string;
  lsId?: string;
};

export const RiwayatPage = () => {
  const { lsList, barangMasukList, barangKeluarList } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLS, setExpandedLS] = useState<string | null>(null);

  // Grouping logic
  const allHistory: HistoryItem[] = [
    ...lsList.map(item => ({
      id: item.id,
      type: 'LS' as const,
      tanggal: item.tanggal,
      keterangan: `Usulan Permintaan LS`,
      jumlah: item.jumlahPaket,
      jenis: item.jenis,
      status: 'Usulan',
      lsId: item.id
    })),
    ...barangMasukList.map(item => ({
      id: item.id,
      type: 'Masuk' as const,
      tanggal: item.tanggal,
      keterangan: `Masuk dari: ${item.suplier}`,
      jumlah: item.jumlahPaket,
      jenis: item.jenis,
      status: item.status,
      lsId: item.lsId
    })),
    ...barangKeluarList.map(item => ({
      id: item.id,
      type: 'Keluar' as const,
      tanggal: item.tanggal,
      keterangan: `Keluar ke: ${item.penerima} (${item.kecamatan || '-'})`,
      jumlah: item.jumlahPaket,
      jenis: item.jenis,
      status: 'Terkirim',
      lsId: item.lsId
    }))
  ];

  // Group by LS ID
  const groups = lsList.reduce((acc, ls) => {
    acc[ls.id] = {
      ls,
      items: allHistory.filter(h => h.lsId === ls.id).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    };
    return acc;
  }, {} as Record<string, { ls: any, items: HistoryItem[] }>);

  // Manual entries
  const manualMasuk = barangMasukList.filter(m => !m.lsId);
  const manualKeluar = barangKeluarList.filter(k => !k.lsId);

  const lsIds = Object.keys(groups).sort((a, b) => {
    const dateA = new Date(groups[a].ls.tanggal).getTime();
    const dateB = new Date(groups[b].ls.tanggal).getTime();
    return dateB - dateA;
  });

  const filteredLSIds = lsIds.filter(id => {
    const ls = groups[id].ls;
    return id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           ls.jenis.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Riwayat Per LS</h1>
        <p className="text-slate-500 mt-1">Pantau alur barang berdasarkan ID Permintaan LS.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari ID LS atau Jenis..."
          className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLSIds.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-400">
            Tidak ada riwayat LS ditemukan.
          </GlassCard>
        ) : (
          filteredLSIds.map((id) => {
            const group = groups[id];
            const isExpanded = expandedLS === id;
            
            return (
              <div key={id}>
                <GlassCard 
                  className={cn(
                    "p-0 overflow-hidden transition-all duration-300",
                    isExpanded ? "ring-2 ring-blue-500/20 shadow-xl" : "hover:shadow-md"
                  )}
                >
                  <button 
                    onClick={() => setExpandedLS(isExpanded ? null : id)}
                    className="w-full p-6 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        group.ls.jenis === 'Sosial' ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"
                      )}>
                        <FileStack size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{id}</h3>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                            group.ls.jenis === 'Sosial' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {group.ls.jenis}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {format(new Date(group.ls.tanggal), 'dd MMM yyyy')} • {group.ls.jumlahPaket} Paket
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex flex-col items-end text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Alur</span>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div className={cn("w-8 h-0.5", group.items.some(i => i.type === 'Masuk') ? "bg-blue-500" : "bg-slate-200")} />
                          <div className={cn("w-2 h-2 rounded-full", group.items.some(i => i.type === 'Masuk') ? "bg-blue-500" : "bg-slate-200")} />
                        </div>
                      </div>
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isExpanded ? "bg-blue-50 text-blue-500" : "text-slate-400 group-hover:bg-slate-50"
                      )}>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50/30"
                      >
                        <div className="p-6 space-y-4">
                          <div className="relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {group.items.map((item, idx) => (
                              <div key={`${item.type}-${idx}`} className="relative pl-12 pb-6 last:pb-0">
                                <div className={cn(
                                  "absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center z-10",
                                  item.type === 'LS' ? "bg-amber-100 text-amber-600" :
                                  item.type === 'Masuk' ? "bg-blue-100 text-blue-600" :
                                  "bg-emerald-100 text-emerald-600"
                                )}>
                                  {item.type === 'LS' ? <FileStack size={18} /> :
                                   item.type === 'Masuk' ? <Truck size={18} /> :
                                   <ArrowUpCircle size={18} />}
                                </div>
                                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.type}</span>
                                    <span className="text-xs text-slate-500">{format(new Date(item.tanggal), 'dd MMM yyyy')}</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 mb-1">{item.keterangan}</p>
                                  <div className="flex items-center gap-2">
                                    <Package size={14} className="text-slate-400" />
                                    <span className="text-sm text-slate-600">{item.jumlah} Paket</span>
                                    <span className={cn(
                                      "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                                      item.status === 'Diterima' || item.status === 'Terkirim' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                      {item.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </div>
            );
          })
        )}

        {/* Manual Entries Section */}
        {(manualMasuk.length > 0 || manualKeluar.length > 0) && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 px-2">Aktivitas Tanpa Referensi LS</h2>
            
            {manualMasuk.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Barang Masuk Umum</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manualMasuk.map(item => (
                    <div key={item.id}>
                      <GlassCard className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                          <ArrowDownCircle size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{item.suplier}</h4>
                          <p className="text-xs text-slate-500">{format(new Date(item.tanggal), 'dd MMM yyyy')} • {item.jumlahPaket} Paket</p>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {manualKeluar.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Barang Keluar Umum</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manualKeluar.map(item => (
                    <div key={item.id}>
                      <GlassCard className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                          <ArrowUpCircle size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{item.penerima}</h4>
                          <p className="text-xs text-slate-500">{format(new Date(item.tanggal), 'dd MMM yyyy')} • {item.jumlahPaket} Paket</p>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
