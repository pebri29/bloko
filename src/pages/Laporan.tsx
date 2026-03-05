import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { 
  FileText, 
  Calendar, 
  Download, 
  TrendingDown, 
  TrendingUp, 
  Target,
  Info,
  ChevronDown,
  Settings,
  Package
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const LaporanPage = () => {
  const { barangMasukList, barangKeluarList, dpaTargets, updateDPATargets, settings, isLoading } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditingDPA, setIsEditingDPA] = useState(false);
  const [tempDPA, setTempDPA] = useState(dpaTargets);

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

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    'Januari - Desember (1 Tahun)'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Filter data based on selection
  const filteredKeluar = barangKeluarList.filter(item => {
    const date = new Date(item.tanggal);
    const matchesYear = date.getFullYear() === selectedYear;
    if (selectedMonth === 12) return matchesYear; // Full Year
    return date.getMonth() === selectedMonth && matchesYear;
  });

  const totalKeluarSosial = filteredKeluar
    .filter(item => item.jenis === 'Sosial')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);

  const totalKeluarBencana = filteredKeluar
    .filter(item => item.jenis === 'Bencana')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);

  // Current Stock (Total)
  const totalInSosial = barangMasukList
    .filter(item => item.jenis === 'Sosial' && item.status === 'Diterima')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);
  const totalInBencana = barangMasukList
    .filter(item => item.jenis === 'Bencana' && item.status === 'Diterima')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);
  
  const totalOutSosial = barangKeluarList
    .filter(item => item.jenis === 'Sosial')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);
  const totalOutBencana = barangKeluarList
    .filter(item => item.jenis === 'Bencana')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);

  const currentStockSosial = totalInSosial - totalOutSosial;
  const currentStockBencana = totalInBencana - totalOutBencana;

  const handleSaveDPA = async () => {
    try {
      await updateDPATargets(tempDPA);
      setIsEditingDPA(false);
    } catch (error) {
      console.error('Error updating DPA targets:', error);
      alert('Gagal memperbarui target DPA.');
    }
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const exportFormalPDF = async () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'dd MMMM yyyy', { locale: id });
    const isFullYear = selectedMonth === 12;
    const period = isFullYear ? `Tahun ${selectedYear}` : `${months[selectedMonth]} ${selectedYear}`;

    // Yearly totals for the table (as requested: "biar realisasi pengeluaran sudah betul per tahun")
    const yearlyKeluarSosial = barangKeluarList
      .filter(item => item.jenis === 'Sosial' && new Date(item.tanggal).getFullYear() === selectedYear)
      .reduce((acc, item) => acc + item.jumlahPaket, 0);

    const yearlyKeluarBencana = barangKeluarList
      .filter(item => item.jenis === 'Bencana' && new Date(item.tanggal).getFullYear() === selectedYear)
      .reduce((acc, item) => acc + item.jumlahPaket, 0);

    // Logo (Blora Regency Logo)
    const logoUrl = settings.kopLogo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lambang_Kabupaten_Blora.png/400px-Lambang_Kabupaten_Blora.png';
    
    try {
      const img = await loadImage(logoUrl);
      doc.addImage(img, 'PNG', 20, 12, 22, 25);
    } catch (error) {
      console.error('Logo could not be loaded:', error);
      // Continue without logo if it fails
    }
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH KABUPATEN BLORA', 110, 18, { align: 'center' });
    doc.setFontSize(16);
    doc.text('DINAS SOSIAL PEMBERDAYAAN PEREMPUAN', 110, 25, { align: 'center' });
    doc.text('DAN PERLINDUNGAN ANAK', 110, 32, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Pemuda No.16 A Blora 58215, No. Tlp: (0296) 5298541', 110, 38, { align: 'center' });
    doc.text('Website : dinsos.blorakab.go.id / E-mail : dinsosp3a.bla.com', 110, 43, { align: 'center' });
    
    doc.setLineWidth(0.8);
    doc.line(20, 48, 190, 48);
    doc.setLineWidth(0.2);
    doc.line(20, 49, 190, 49);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN REKAPITULASI DISTRIBUSI SEMBAKO', 105, 60, { align: 'center' });
    doc.text(`PERIODE: ${period.toUpperCase()}`, 105, 66, { align: 'center' });

    // Narrative
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const narrative = `Berdasarkan data operasional logistik sembako di Kabupaten Blora untuk periode ${period}, dilaporkan bahwa telah dilaksanakan penyaluran bantuan sosial dan penanggulangan bencana dengan rincian sebagai berikut. Total distribusi pada periode ini mencakup ${totalKeluarSosial + totalKeluarBencana} paket sembako.`;
    
    const splitNarrative = doc.splitTextToSize(narrative, 170);
    doc.text(splitNarrative, 20, 80);

    // Table
    const tableData = [
      ['Kategori', 'Target DPA', `Realisasi (${isFullYear ? 'Kumulatif Tahun' : 'Bulan Ini'})`, 'Sisa Stok Gudang', 'Selisih DPA'],
      ['Sosial', dpaTargets.sosial, totalKeluarSosial, currentStockSosial, dpaTargets.sosial - totalOutSosial],
      ['Kebencanaan', dpaTargets.bencana, totalKeluarBencana, currentStockBencana, dpaTargets.bencana - totalOutBencana],
    ];

    autoTable(doc, {
      startY: 95,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // Monthly Chart Section (Only for Full Year)
    let stockY = (doc as any).lastAutoTable.finalY + 15;

    if (isFullYear) {
      const chartY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFont('helvetica', 'bold');
      doc.text('Grafik Distribusi Bulanan (Paket):', 20, chartY);
      
      // Legend
      doc.setFontSize(8);
      doc.setFillColor(59, 130, 246); doc.rect(140, chartY - 3, 4, 4, 'F');
      doc.text('Sosial', 146, chartY);
      doc.setFillColor(245, 158, 11); doc.rect(165, chartY - 3, 4, 4, 'F');
      doc.text('Bencana', 171, chartY);

      const monthlySosial = months.slice(0, 12).map((_, i) => {
        return barangKeluarList
          .filter(item => {
            const d = new Date(item.tanggal);
            return d.getMonth() === i && d.getFullYear() === selectedYear && item.jenis === 'Sosial';
          })
          .reduce((acc, item) => acc + item.jumlahPaket, 0);
      });

      const monthlyBencana = months.slice(0, 12).map((_, i) => {
        return barangKeluarList
          .filter(item => {
            const d = new Date(item.tanggal);
            return d.getMonth() === i && d.getFullYear() === selectedYear && item.jenis === 'Bencana';
          })
          .reduce((acc, item) => acc + item.jumlahPaket, 0);
      });

      const maxVal = Math.max(...monthlySosial, ...monthlyBencana, 1);
      const chartHeight = 35;
      const chartWidth = 160;
      const groupWidth = chartWidth / 12;
      const barWidth = (groupWidth - 4) / 2;
      const startX = 25;
      const startY = chartY + 45;

      // Draw Bars
      for (let i = 0; i < 12; i++) {
        const xGroup = startX + i * groupWidth;
        
        // Sosial Bar
        const hSosial = (monthlySosial[i] / maxVal) * chartHeight;
        doc.setFillColor(59, 130, 246);
        doc.rect(xGroup, startY - hSosial, barWidth, hSosial, 'F');
        
        // Value Label Sosial
        if (monthlySosial[i] > 0) {
          doc.setFontSize(5);
          doc.setTextColor(59, 130, 246);
          doc.text(monthlySosial[i].toString(), xGroup + barWidth/2, startY - hSosial - 1, { align: 'center' });
        }
        
        // Bencana Bar
        const hBencana = (monthlyBencana[i] / maxVal) * chartHeight;
        doc.setFillColor(245, 158, 11);
        doc.rect(xGroup + barWidth + 1, startY - hBencana, barWidth, hBencana, 'F');

        // Value Label Bencana
        if (monthlyBencana[i] > 0) {
          doc.setFontSize(5);
          doc.setTextColor(245, 158, 11);
          doc.text(monthlyBencana[i].toString(), xGroup + barWidth + 1 + barWidth/2, startY - hBencana - 1, { align: 'center' });
        }
        
        // Month Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(months[i].substring(0, 3), xGroup + groupWidth/2 - 2, startY + 5, { align: 'center' });
      }

      // Baseline
      doc.setDrawColor(200);
      doc.line(startX - 5, startY, startX + chartWidth, startY);
      doc.setTextColor(0);
      
      stockY = startY + 15; // Tightened spacing
    }

    // Stock Info
    doc.setFontSize(10); // Slightly smaller font to save space
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Stok Terkini:', 20, stockY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Per tanggal cetak (${today}), total ketersediaan stok fisik di gudang adalah sebanyak ${currentStockSosial + currentStockBencana} paket (Sosial: ${currentStockSosial}, Bencana: ${currentStockBencana}).`, 20, stockY + 6, { maxWidth: 170 });

    // Closing
    const closingY = stockY + 18; // Tightened spacing
    doc.text('Demikian laporan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.', 20, closingY);

    // Signature
    const sigY = closingY + 15; // Adjusted signature position
    doc.text('Blora, ' + today, 140, sigY);
    doc.text('Kepala Bidang Sosial,', 140, sigY + 7);
    
    doc.setFont('helvetica', 'bold');
    doc.text(String(settings.kepalaBidang || '-'), 140, sigY + 30);
    // Draw underline
    const textWidth = doc.getTextWidth(String(settings.kepalaBidang || '-'));
    doc.line(140, sigY + 31, 140 + textWidth, sigY + 31);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${settings.nip || '-'}`, 140, sigY + 36);

    doc.save(`Laporan_Formal_Blora_${period.replace(' ', '_')}.pdf`);
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
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Laporan Bulanan</h1>
          <p className="text-slate-500 mt-1">Rekapitulasi formal distribusi sembako Kabupaten Blora.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-1">
            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="pl-4 pr-10 py-2 bg-transparent text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="w-px h-6 bg-slate-200 self-center mx-1" />
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="pl-4 pr-10 py-2 bg-transparent text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <button 
            onClick={exportFormalPDF}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Download size={20} />
            Export PDF Formal
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Summary Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distribusi Sosial</p>
                  <h3 className="text-2xl font-bold text-slate-900">{totalKeluarSosial} <span className="text-sm font-medium text-slate-500">Paket</span></h3>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Target DPA: {dpaTargets.sosial}</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  totalKeluarSosial > dpaTargets.sosial ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {((totalKeluarSosial / dpaTargets.sosial) * 100).toFixed(1)}% Realisasi
                </span>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distribusi Bencana</p>
                  <h3 className="text-2xl font-bold text-slate-900">{totalKeluarBencana} <span className="text-sm font-medium text-slate-500">Paket</span></h3>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Target DPA: {dpaTargets.bencana}</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  totalKeluarBencana > dpaTargets.bencana ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {((totalKeluarBencana / dpaTargets.bencana) * 100).toFixed(1)}% Realisasi
                </span>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Info size={20} className="text-blue-500" />
              <h3 className="text-lg font-bold text-slate-900">Narasi Laporan</h3>
            </div>
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 italic text-slate-600 leading-relaxed">
              "Berdasarkan data operasional logistik sembako di Kabupaten Blora untuk periode {selectedMonth === 12 ? `Tahun ${selectedYear}` : `${months[selectedMonth]} ${selectedYear}`}, dilaporkan bahwa telah dilaksanakan penyaluran bantuan sosial dan penanggulangan bencana dengan rincian sebagai berikut. Total distribusi pada periode ini mencakup {totalKeluarSosial + totalKeluarBencana} paket sembako. Stok terkini di gudang per tanggal {format(new Date(), 'dd MMMM yyyy', { locale: id })} adalah {currentStockSosial + currentStockBencana} paket."
            </div>
          </GlassCard>
        </div>

        {/* Sidebar: DPA Settings & Stock Info */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">Target DPA</h3>
              </div>
              <button 
                onClick={() => setIsEditingDPA(!isEditingDPA)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
              >
                <Settings size={18} />
              </button>
            </div>

            {isEditingDPA ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Sosial</label>
                  <input 
                    type="number"
                    value={tempDPA.sosial}
                    onChange={(e) => setTempDPA({ ...tempDPA, sosial: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bencana</label>
                  <input 
                    type="number"
                    value={tempDPA.bencana}
                    onChange={(e) => setTempDPA({ ...tempDPA, bencana: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleSaveDPA}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20"
                  >
                    Simpan
                  </button>
                  <button 
                    onClick={() => {
                      setTempDPA(dpaTargets);
                      setIsEditingDPA(false);
                    }}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-sm text-slate-600">Sosial</span>
                  <span className="font-bold text-slate-900">{dpaTargets.sosial} Pkt</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-sm text-slate-600">Bencana</span>
                  <span className="font-bold text-slate-900">{dpaTargets.bencana} Pkt</span>
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 bg-emerald-50/30 border-emerald-100/50">
            <h3 className="text-base font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Package size={18} />
              Stok Fisik Terkini
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">Sosial</span>
                <span className="font-bold text-emerald-900">{currentStockSosial} Pkt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">Bencana</span>
                <span className="font-bold text-emerald-900">{currentStockBencana} Pkt</span>
              </div>
              <div className="pt-3 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-900">Total</span>
                <span className="font-extrabold text-emerald-900">{currentStockSosial + currentStockBencana} Pkt</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};
