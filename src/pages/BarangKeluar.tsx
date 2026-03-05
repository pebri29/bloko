import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  Search, 
  Plus, 
  Calendar, 
  Eye,
  Edit2,
  Trash2,
  X,
  User,
  Hash,
  MapPin,
  FileText,
  Image as ImageIcon,
  Filter,
  ChevronDown,
  FileSpreadsheet,
  FileText as FilePdf
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { exportToExcel, exportToPDF } from '../lib/exportUtils';

export const BarangKeluar = () => {
  const { lsList, barangMasukList, barangKeluarList, deleteBarangKeluar, addBarangKeluar, updateBarangKeluar, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
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
  const [penerima, setPenerima] = useState('');
  const [nik, setNik] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [jenis, setJenis] = useState<'Sosial' | 'Bencana'>('Sosial');
  const [jumlahPaket, setJumlahPaket] = useState('');
  const [tanggal, setTanggal] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [keterangan, setKeterangan] = useState('');

  const KECAMATAN_BLORA = [
    'Banjarejo', 'Blora', 'Bogorejo', 'Cepu', 'Japah', 'Jati', 'Jepon', 'Jiken',
    'Kedungtuban', 'Kradenan', 'Kunduran', 'Ngawen', 'Randublatung', 'Sambong',
    'Todanan', 'Tunjungan'
  ];

  const resetForm = () => {
    setPenerima('');
    setNik('');
    setAlamat('');
    setKecamatan('');
    setJenis('Sosial');
    setJumlahPaket('');
    setTanggal(format(new Date(), 'yyyy-MM-dd'));
    setKeterangan('');
    setSelectedId(null);
  };

  const getAvailableStock = (type: 'Sosial' | 'Bencana') => {
    const totalIn = barangMasukList
      .filter(item => item.jenis === type && item.status === 'Diterima')
      .reduce((acc, item) => acc + item.jumlahPaket, 0);
    
    const totalOut = barangKeluarList
      .filter(item => item.jenis === type && item.id !== selectedId)
      .reduce((acc, item) => acc + item.jumlahPaket, 0);
      
    return totalIn - totalOut;
  };

  const availableStock = getAvailableStock(jenis);
  const stockSosial = getAvailableStock('Sosial');
  const stockBencana = getAvailableStock('Bencana');

  const handleAddClick = () => {
    setModalMode('add');
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setModalMode('edit');
    setSelectedId(item.id);
    setPenerima(item.penerima);
    setNik(item.nik);
    setAlamat(item.alamat);
    setKecamatan(item.kecamatan || '');
    setJenis(item.jenis);
    setJumlahPaket(item.jumlahPaket.toString());
    setTanggal(format(new Date(item.tanggal), 'yyyy-MM-dd'));
    setKeterangan(item.keterangan);
    setIsModalOpen(true);
  };

  const handleViewClick = (item: any) => {
    setModalMode('view');
    setSelectedId(item.id);
    setPenerima(item.penerima);
    setNik(item.nik);
    setAlamat(item.alamat);
    setKecamatan(item.kecamatan || '');
    setJenis(item.jenis);
    setJumlahPaket(item.jumlahPaket.toString());
    setTanggal(format(new Date(item.tanggal), 'yyyy-MM-dd'));
    setKeterangan(item.keterangan);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteBarangKeluar(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'view') return;

    const qty = parseInt(jumlahPaket);
    if (qty > availableStock) {
      alert(`Stok tidak mencukupi! Stok tersedia untuk ${jenis}: ${availableStock} paket.`);
      return;
    }

    const data = {
      tanggal: new Date(tanggal),
      penerima,
      nik,
      alamat,
      kecamatan,
      jenis,
      jumlahPaket: qty,
      keterangan
    };

    try {
      if (modalMode === 'add') {
        await addBarangKeluar(data);
      } else if (selectedId) {
        await updateBarangKeluar({ ...data, id: selectedId });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving barang keluar:', error);
      alert('Gagal menyimpan data. Pastikan koneksi internet stabil dan Firebase sudah dikonfigurasi dengan benar.');
    }
  };

  const handleExportExcel = () => {
    const data = barangKeluarList.map(item => ({
      'ID': item.id,
      'Tanggal': format(new Date(item.tanggal), 'dd/MM/yyyy'),
      'Penerima': item.penerima,
      'NIK': item.nik,
      'Alamat': item.alamat,
      'Kecamatan': item.kecamatan || '-',
      'Jenis': item.jenis,
      'Jumlah Paket': item.jumlahPaket,
      'Keterangan': item.keterangan || '-'
    }));
    exportToExcel(data, 'Data_Barang_Keluar', 'BarangKeluar');
  };

  const handleExportPDF = () => {
    const headers = [['Tanggal', 'Penerima', 'Kecamatan', 'Jumlah', 'Jenis', 'Keterangan']];
    const data = barangKeluarList.map(item => [
      format(new Date(item.tanggal), 'dd/MM/yyyy'),
      item.penerima,
      item.kecamatan || '-',
      `${item.jumlahPaket} Pkt`,
      item.jenis,
      item.keterangan || '-'
    ]);
    exportToPDF('Laporan Barang Keluar', headers, data, 'Laporan_Barang_Keluar');
  };

  const filteredData = barangKeluarList.filter(item => {
    const matchesSearch = item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.nik.includes(searchTerm);
    const matchesFilter = filterType === 'Semua' || item.jenis === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Barang Keluar</h1>
          <p className="text-slate-500 mt-1">Kelola distribusi sembako kepada masyarakat.</p>
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
            Tambah Data
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama penerima atau NIK..."
            className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['Semua', 'Sosial', 'Bencana'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                filterType === type 
                  ? "bg-slate-900 text-white" 
                  : "bg-white/60 backdrop-blur-xl border border-white/40 text-slate-600 hover:bg-white/80"
              )}
            >
              {type === 'Bencana' ? 'Kebencanaan' : type}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Penerima</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis & Jumlah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data barang keluar.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.penerima}</span>
                        <span className="text-xs text-slate-500">{item.kecamatan || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-1",
                          item.jenis === 'Sosial' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {item.jenis}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{item.jumlahPaket} Paket</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 line-clamp-1">{item.keterangan || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {format(item.tanggal, 'dd MMM yyyy')}
                      </div>
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
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

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
                    {modalMode === 'add' ? 'Tambah Data Pengeluaran' : modalMode === 'edit' ? 'Edit Data Pengeluaran' : 'Detail Pengeluaran'}
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
                      <label className="text-sm font-bold text-slate-700 ml-1">Nama Penerima</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          required
                          disabled={modalMode === 'view'}
                          placeholder="Nama Lengkap"
                          value={penerima}
                          onChange={(e) => setPenerima(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">NIK</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          required
                          disabled={modalMode === 'view'}
                          placeholder="16 Digit NIK"
                          value={nik}
                          onChange={(e) => setNik(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Kecamatan (Blora)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select 
                          required
                          disabled={modalMode === 'view'}
                          value={kecamatan}
                          onChange={(e) => setKecamatan(e.target.value)}
                          className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none disabled:opacity-50"
                        >
                          <option value="">-- Pilih Kecamatan --</option>
                          {KECAMATAN_BLORA.map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Alamat</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3 text-slate-400" size={18} />
                        <textarea 
                          required
                          disabled={modalMode === 'view'}
                          placeholder="Alamat Lengkap"
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px] disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Jenis Bantuan</label>
                      <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                        {(['Sosial', 'Bencana'] as const).map((t) => {
                          const stock = t === 'Sosial' ? stockSosial : stockBencana;
                          const isDisabled = stock <= 0 && modalMode !== 'view';
                          
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={modalMode === 'view' || isDisabled}
                              onClick={() => setJenis(t)}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center",
                                jenis === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400",
                                isDisabled && "opacity-50 grayscale cursor-not-allowed",
                                modalMode === 'view' && "cursor-default"
                              )}
                            >
                              <span>{t === 'Bencana' ? 'Kebencanaan' : t}</span>
                              <span className="text-[9px] opacity-70">Stok: {stock}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Jumlah Paket</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="number" 
                          required
                          disabled={modalMode === 'view'}
                          placeholder={`Maks: ${availableStock}`}
                          value={jumlahPaket}
                          onChange={(e) => setJumlahPaket(e.target.value)}
                          className={cn(
                            "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50",
                            parseInt(jumlahPaket) > availableStock && "border-red-500 focus:ring-red-500/20"
                          )}
                        />
                      </div>
                      {parseInt(jumlahPaket) > availableStock && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">Jumlah melebihi stok tersedia!</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Keluar</label>
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
                      <label className="text-sm font-bold text-slate-700 ml-1">Keterangan</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          disabled={modalMode === 'view'}
                          placeholder="Opsional"
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                        />
                      </div>
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
                        {modalMode === 'add' ? 'Simpan Data' : 'Simpan Perubahan'}
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
        title="Hapus Data Pengeluaran"
        message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
      />
    </motion.div>
  );
};
