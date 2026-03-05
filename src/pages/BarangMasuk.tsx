import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  Search, 
  Plus, 
  Calendar,
  Truck,
  X,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronDown,
  Hash,
  Package,
  Filter,
  FileSpreadsheet,
  FileText as FilePdf
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { exportToExcel, exportToPDF } from '../lib/exportUtils';

export const BarangMasuk = () => {
  const { lsList, barangMasukList, addBarangMasuk, deleteBarangMasuk, updateBarangMasuk, isLoading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'pull'>('pull');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }
  
  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [selectedLSId, setSelectedLSId] = useState('');
  const [jumlahMasuk, setJumlahMasuk] = useState('');
  const [jumlahPaket, setJumlahPaket] = useState('');
  const [jenis, setJenis] = useState<'Sosial' | 'Bencana'>('Sosial');
  const [tanggalMasuk, setTanggalMasuk] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [suplier, setSuplier] = useState('');
  const [status, setStatus] = useState<'Diterima' | 'Proses'>('Proses');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getRemainingLS = (lsId: string) => {
    const ls = lsList.find(l => l.id === lsId);
    if (!ls) return 0;
    
    const pulledAmount = barangMasukList
      .filter(item => item.lsId === lsId && item.id !== selectedId)
      .reduce((acc, item) => acc + item.jumlahPaket, 0);
      
    return ls.jumlahPaket - pulledAmount;
  };

  const remainingLS = selectedLSId ? getRemainingLS(selectedLSId) : 0;

  const resetForm = () => {
    setSelectedLSId('');
    setJumlahMasuk('');
    setJumlahPaket('');
    setJenis('Sosial');
    setTanggalMasuk(format(new Date(), 'yyyy-MM-dd'));
    setSuplier('');
    setStatus('Proses');
    setSelectedId(null);
  };

  const handlePullClick = () => {
    setModalMode('pull');
    resetForm();
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode('add');
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setModalMode('edit');
    setSelectedId(item.id);
    setSuplier(item.suplier);
    setJumlahMasuk(item.jumlah);
    setJumlahPaket(item.jumlahPaket.toString());
    setJenis(item.jenis);
    setTanggalMasuk(format(new Date(item.tanggal), 'yyyy-MM-dd'));
    setStatus(item.status);
    setSelectedLSId(item.lsId || '');
    setIsModalOpen(true);
  };

  const handleViewClick = (item: any) => {
    setModalMode('view');
    setSelectedId(item.id);
    setSuplier(item.suplier);
    setJumlahMasuk(item.jumlah);
    setJumlahPaket(item.jumlahPaket.toString());
    setJenis(item.jenis);
    setTanggalMasuk(format(new Date(item.tanggal), 'yyyy-MM-dd'));
    setStatus(item.status);
    setSelectedLSId(item.lsId || '');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteBarangMasuk(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'view') return;

    const qty = parseInt(jumlahPaket);
    if (selectedLSId && qty > remainingLS) {
      alert(`Jumlah penarikan melebihi sisa LS! Sisa tersedia: ${remainingLS} paket.`);
      return;
    }

    const data = {
      tanggal: new Date(tanggalMasuk),
      suplier: suplier || (selectedLSId ? `Suplier LS (${selectedLSId})` : 'Suplier Umum'),
      jumlah: `${qty} Paket Sembako (${jenis})`,
      jumlahPaket: qty,
      jenis: jenis,
      status: status,
      lsId: selectedLSId || undefined
    };

    try {
      if (modalMode === 'add' || modalMode === 'pull') {
        await addBarangMasuk(data);
      } else if (selectedId) {
        await updateBarangMasuk({ ...data, id: selectedId });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving barang masuk:', error);
      alert('Gagal menyimpan data. Pastikan koneksi internet stabil dan Firebase sudah dikonfigurasi dengan benar.');
    }
  };

  const handleExportExcel = () => {
    const data = barangMasukList.map(item => ({
      'ID': item.id,
      'Tanggal': format(new Date(item.tanggal), 'dd/MM/yyyy'),
      'Suplier': item.suplier,
      'Jumlah Paket': item.jumlahPaket,
      'Jenis': item.jenis === 'Sosial' ? 'Sosial (Fasilitasi)' : 'Bencana (Penyedia Makanan)',
      'Status': item.status,
      'LS ID': item.lsId || '-'
    }));
    exportToExcel(data, 'Data_Barang_Masuk', 'BarangMasuk');
  };

  const handleExportPDF = () => {
    const headers = [['Tanggal', 'Suplier', 'LS ID', 'Jumlah', 'Jenis', 'Status']];
    const data = barangMasukList.map(item => [
      format(new Date(item.tanggal), 'dd/MM/yyyy'),
      item.suplier,
      item.lsId || '-',
      `${item.jumlahPaket} Pkt`,
      item.jenis === 'Sosial' ? 'Sosial (Fasilitasi)' : 'Bencana (Penyedia Makanan)',
      item.status
    ]);
    exportToPDF('Laporan Barang Masuk', headers, data, 'Laporan_Barang_Masuk');
  };

  const filteredData = barangMasukList.filter(item => 
    item.suplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jumlah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Barang Masuk</h1>
          <p className="text-slate-500 mt-1">Pantau stok sembako yang masuk ke gudang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-1">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all text-sm font-bold"
              title="Export to Excel"
            >
              <FileSpreadsheet size={18} />
              Excel
            </button>
            <div className="w-px h-6 bg-slate-200 self-center mx-1" />
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold"
              title="Export to PDF"
            >
              <FilePdf size={18} />
              PDF
            </button>
          </div>
          <button 
            onClick={handlePullClick}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-500 border-2 border-blue-500 rounded-2xl font-bold hover:bg-blue-50 transition-all active:scale-95"
          >
            <Truck size={20} />
            Tarik LS
          </button>
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95"
          >
            <Plus size={20} />
            Tambah Stok
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari suplier atau barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold border border-slate-100 hover:bg-slate-100 transition-all">
              <Filter size={20} />
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Suplier</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Barang</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data barang masuk.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{item.suplier}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md",
                              item.jenis === 'Sosial' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {item.jenis === 'Sosial' ? 'SOSIAL' : 'BENCANA'}
                            </span>
                            {item.lsId && (
                              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">Ref: {item.lsId}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.jumlahPaket}</span>
                          <span className="text-xs text-slate-500">Paket</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{format(item.tanggal, 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          item.status === 'Diterima' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {item.status === 'Diterima' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewClick(item)}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Modal Pull LS / Add / Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {modalMode === 'pull' ? 'Tarik dari Usulan LS' : 
                     modalMode === 'add' ? 'Tambah Stok Manual' : 
                     modalMode === 'edit' ? 'Edit Barang Masuk' : 'Detail Barang Masuk'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {modalMode === 'pull' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Pilih Usulan LS</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select 
                          required
                          value={selectedLSId}
                          onChange={(e) => {
                            const lsId = e.target.value;
                            setSelectedLSId(lsId);
                            const ls = lsList.find(l => l.id === lsId);
                            if (ls) {
                              const remaining = getRemainingLS(lsId);
                              setJumlahMasuk(`${remaining} Paket Sembako (${ls.jenis})`);
                              setJumlahPaket(remaining.toString());
                              setJenis(ls.jenis);
                            }
                          }}
                          className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                        >
                          <option value="">-- Pilih ID Permintaan LS --</option>
                          {lsList.map(ls => {
                            const remaining = getRemainingLS(ls.id);
                            if (remaining <= 0 && modalMode === 'pull') return null;
                            return (
                              <option key={ls.id} value={ls.id}>
                                {ls.id} ({remaining} Sisa - {ls.jenis === 'Sosial' ? 'Sosial (Fasilitasi)' : 'Bencana (Penyedia Makanan)'})
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  )}

                  {(modalMode === 'add' || modalMode === 'edit' || modalMode === 'view') && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Suplier</label>
                        <div className="relative">
                          <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            required
                            disabled={modalMode === 'view'}
                            placeholder="Nama Suplier"
                            value={suplier}
                            onChange={(e) => setSuplier(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Jenis Sembako</label>
                        <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                          {(['Sosial', 'Bencana'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              disabled={modalMode === 'view'}
                              onClick={() => setJenis(t)}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                                jenis === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400",
                                modalMode === 'view' && "cursor-default"
                              )}
                            >
                              {t === 'Sosial' ? 'Sosial (Fasilitasi)' : 'Bencana (Penyedia Makanan)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Jumlah Paket</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" 
                        required
                        disabled={modalMode === 'view'}
                        placeholder={selectedLSId ? `Maks: ${remainingLS}` : "Contoh: 500"}
                        value={jumlahPaket}
                        onChange={(e) => setJumlahPaket(e.target.value)}
                        className={cn(
                          "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50",
                          selectedLSId && parseInt(jumlahPaket) > remainingLS && "border-red-500 focus:ring-red-500/20"
                        )}
                      />
                    </div>
                    {selectedLSId && parseInt(jumlahPaket) > remainingLS && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">Jumlah melebihi sisa LS!</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Masuk</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="date" 
                        required
                        disabled={modalMode === 'view'}
                        value={tanggalMasuk}
                        onChange={(e) => setTanggalMasuk(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                    <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      {(['Diterima', 'Proses'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={modalMode === 'view'}
                          onClick={() => setStatus(s)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                            status === s ? "bg-white text-blue-600 shadow-sm" : "text-slate-400",
                            modalMode === 'view' && "cursor-default"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      {modalMode === 'view' ? 'Tutup' : 'Batal'}
                    </button>
                    {modalMode !== 'view' && (
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95"
                      >
                        {modalMode === 'edit' ? 'Simpan Perubahan' : 'Simpan Data'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Barang Masuk"
        message="Apakah Anda yakin ingin menghapus data barang masuk ini? Tindakan ini tidak dapat dibatalkan."
      />
    </motion.div>
  );
};
