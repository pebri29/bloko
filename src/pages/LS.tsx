import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Calculator, 
  Upload, 
  X,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  Hash,
  Download,
  FileSpreadsheet,
  FileText as FilePdf
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { exportToExcel, exportToPDF } from '../lib/exportUtils';

const PRICE_PER_PACKAGE = 311000;

export const LSPage = () => {
  const { lsList, barangMasukList, addLS, deleteLS, updateLS, isLoading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  const [manualId, setManualId] = useState('');
  const [tanggal, setTanggal] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [jumlahPaket, setJumlahPaket] = useState(0);
  const [jenis, setJenis] = useState<'Sosial' | 'Bencana'>('Sosial');
  const [file, setFile] = useState<File | null>(null);

  // Calculations
  const totalRupiah = jumlahPaket * PRICE_PER_PACKAGE;
  const ppn = (totalRupiah / 1.11) * 0.11;
  const pph22 = (totalRupiah / 1.11) * 0.015;
  const totalNet = totalRupiah - (ppn + pph22);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getRemainingLS = (lsId: string, totalPaket: number) => {
    const pulledAmount = barangMasukList
      .filter(item => item.lsId === lsId)
      .reduce((acc, item) => acc + item.jumlahPaket, 0);
      
    return totalPaket - pulledAmount;
  };

  const resetForm = () => {
    const nextNum = (lsList.length + 1).toString().padStart(3, '0');
    const year = new Date().getFullYear();
    setManualId(`LS-${year}-${nextNum}`);
    setTanggal(format(new Date(), 'yyyy-MM-dd'));
    setJumlahPaket(0);
    setJenis('Sosial');
    setFile(null);
    setSelectedId(null);
  };

  const handleAddClick = () => {
    setModalMode('add');
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setModalMode('edit');
    setSelectedId(item.id);
    setManualId(item.id);
    setTanggal(format(new Date(item.tanggal), 'yyyy-MM-dd'));
    setJumlahPaket(item.jumlahPaket);
    setJenis(item.jenis);
    setIsModalOpen(true);
  };

  const handleViewClick = (item: any) => {
    setModalMode('view');
    setSelectedId(item.id);
    setManualId(item.id);
    setTanggal(format(new Date(item.tanggal), 'yyyy-MM-dd'));
    setJumlahPaket(item.jumlahPaket);
    setJenis(item.jenis);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteLS(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'view') return;

    const data = {
      id: manualId,
      tanggal: new Date(tanggal),
      jumlahPaket,
      jenis,
      totalRupiah,
      ppn,
      pph22,
      totalNet,
    };

    try {
      if (modalMode === 'add') {
        if (lsList.some(item => item.id === data.id)) {
          alert('ID Permintaan sudah ada. Gunakan ID lain.');
          return;
        }
        await addLS(data);
      } else if (selectedId) {
        await updateLS({ ...data, id: selectedId });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving LS:', error);
      alert('Gagal menyimpan data. Pastikan koneksi internet stabil dan Firebase sudah dikonfigurasi dengan benar.');
    }
  };

  const handleExportExcel = () => {
    const data = lsList.map(item => ({
      'ID Permintaan': item.id,
      'Tanggal': format(new Date(item.tanggal), 'dd/MM/yyyy'),
      'Jumlah Paket': item.jumlahPaket,
      'Jenis': item.jenis,
      'Total Rupiah': item.totalRupiah,
      'PPN': item.ppn,
      'PPH22': item.pph22,
      'Total Bersih': item.totalNet
    }));
    exportToExcel(data, 'Data_Permintaan_LS', 'LS');
  };

  const handleExportPDF = () => {
    const headers = [['ID', 'Tanggal', 'Paket', 'Jenis', 'Total Bruto', 'Total Net']];
    const data = lsList.map(item => [
      item.id,
      format(new Date(item.tanggal), 'dd/MM/yyyy'),
      `${item.jumlahPaket} Pkt`,
      item.jenis,
      formatCurrency(item.totalRupiah),
      formatCurrency(item.totalNet)
    ]);
    exportToPDF('Laporan Permintaan LS', headers, data, 'Laporan_LS');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Permintaan LS</h1>
          <p className="text-slate-500 mt-1">Kelola permintaan ke suplier sebelum barang masuk.</p>
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
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95"
          >
            <Plus size={20} />
            Tambah LS
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID & Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Paket & Jenis</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Paket</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rupiah</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pajak (PPN/PPH)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bersih</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Belum ada data permintaan LS.
                    </td>
                  </tr>
                ) : (
                  lsList.map((item) => {
                    const remaining = getRemainingLS(item.id, item.jumlahPaket);
                    const isCompleted = remaining <= 0;

                    return (
                      <tr key={item.id} className={cn(
                        "hover:bg-slate-50/50 transition-colors group",
                        isCompleted && "bg-emerald-50/30"
                      )}>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.id}</span>
                              {isCompleted && (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              )}
                            </div>
                            <span className="text-xs text-slate-500">{format(item.tanggal, 'dd MMM yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{item.jumlahPaket} Paket</span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mt-1",
                              item.jenis === 'Sosial' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {item.jenis === 'Sosial' ? 'Sosial (Fasilitasi)' : 'Bencana (Penyedia Makanan)'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-sm font-bold",
                            isCompleted ? "text-emerald-600" : "text-slate-900"
                          )}>
                            {remaining} Paket
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {formatCurrency(item.totalRupiah)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs text-slate-500">
                            <span>PPN: {formatCurrency(item.ppn)}</span>
                            <span>PPH22: {formatCurrency(item.pph22)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          {formatCurrency(item.totalNet)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Modal Form */}
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
              className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {modalMode === 'add' ? 'Tambah Permintaan LS' : modalMode === 'edit' ? 'Edit Permintaan LS' : 'Detail Permintaan LS'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">ID Permintaan</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          required
                          placeholder="Otomatis"
                          disabled={true}
                          value={manualId}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all opacity-70 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Tanggal</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="date" 
                          required
                          disabled={modalMode === 'view'}
                          value={tanggal}
                          onChange={(e) => setTanggal(e.target.value)}
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

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Jumlah Paket</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="number" 
                          required
                          min="1"
                          disabled={modalMode === 'view'}
                          placeholder="0"
                          value={jumlahPaket || ''}
                          onChange={(e) => setJumlahPaket(parseInt(e.target.value) || 0)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Upload SP2D (PDF)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".pdf"
                          disabled={modalMode === 'view'}
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden" 
                          id="sp2d-upload"
                        />
                        <label 
                          htmlFor="sp2d-upload"
                          className={cn(
                            "flex items-center gap-2 w-full px-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all text-slate-500 text-sm",
                            modalMode === 'view' && "cursor-default opacity-50"
                          )}
                        >
                          <Upload size={18} />
                          {file ? file.name : 'Pilih file PDF (Opsional)'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Automatic Calculations Display */}
                  <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Calculator size={18} />
                      <span className="text-sm font-bold uppercase tracking-wider">Rincian Otomatis</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="text-slate-500">Total Rupiah (Bruto)</span>
                      <span className="text-right font-bold text-slate-900">{formatCurrency(totalRupiah)}</span>
                      
                      <span className="text-slate-500">PPN (11%)</span>
                      <span className="text-right font-bold text-amber-600">-{formatCurrency(ppn)}</span>
                      
                      <span className="text-slate-500">PPH 22 (1.5%)</span>
                      <span className="text-right font-bold text-amber-600">-{formatCurrency(pph22)}</span>
                      
                      <div className="col-span-2 border-t border-blue-100 my-1" />
                      
                      <span className="text-slate-700 font-bold">Total Bersih (Net)</span>
                      <span className="text-right font-extrabold text-emerald-600 text-lg">{formatCurrency(totalNet)}</span>
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
                        {modalMode === 'add' ? 'Simpan Permintaan' : 'Simpan Perubahan'}
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
        title="Hapus Permintaan LS"
        message="Apakah Anda yakin ingin menghapus data permintaan LS ini? Tindakan ini tidak dapat dibatalkan."
      />
    </motion.div>
  );
};
