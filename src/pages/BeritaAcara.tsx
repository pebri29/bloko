import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { 
  FileText, 
  Search, 
  Download, 
  User, 
  Calendar, 
  MapPin,
  ChevronRight,
  Printer
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';

export const BeritaAcaraPage = () => {
  const { barangKeluarList, settings, isLoading } = useData();
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

  const filteredList = barangKeluarList.filter(item => 
    item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nik.includes(searchTerm) ||
    item.kecamatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const generateBAST = async (item: any) => {
    const doc = new jsPDF();
    const today = format(new Date(), 'dd MMMM yyyy', { locale: id });
    const itemDate = format(new Date(item.tanggal), 'dd MMMM yyyy', { locale: id });

    // Logo (Blora Regency Logo)
    const logoUrl = settings.kopLogo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lambang_Kabupaten_Blora.png/400px-Lambang_Kabupaten_Blora.png';
    
    try {
      const img = await loadImage(logoUrl);
      doc.addImage(img, 'PNG', 20, 12, 22, 25);
    } catch (error) {
      console.error('Logo could not be loaded:', error);
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BERITA ACARA SERAH TERIMA (BAST)', 105, 55, { align: 'center' });

    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const startY = 65;
    const lineSpacing = 7;

    doc.text(`Pada hari ini, ${format(new Date(item.tanggal), 'EEEE', { locale: id })} Tanggal ${itemDate}, kami yang bertanda tangan di bawah ini:`, 20, startY);
    
    doc.text('1. Nama', 25, startY + lineSpacing);
    doc.text(`: ${settings.kepalaBidang || '-'}`, 60, startY + lineSpacing);
    doc.text('   NIP', 25, startY + lineSpacing * 2);
    doc.text(`: ${settings.nip || '-'}`, 60, startY + lineSpacing * 2);
    doc.text('   Jabatan', 25, startY + lineSpacing * 3);
    doc.text(`: ${settings.jabatan || '-'}`, 60, startY + lineSpacing * 3);
    doc.text('   Instansi', 25, startY + lineSpacing * 4);
    doc.text(`: ${settings.instansi || '-'}`, 60, startY + lineSpacing * 4);
    doc.text('Selanjutnya disebut sebagai PIHAK KESATU (Yang Menyerahkan).', 25, startY + lineSpacing * 5);

    doc.text('2. Nama', 25, startY + lineSpacing * 7);
    doc.text(`: ${item.penerima || '-'}`, 60, startY + lineSpacing * 7);
    doc.text('   NIK', 25, startY + lineSpacing * 8);
    doc.text(`: ${item.nik || '-'}`, 60, startY + lineSpacing * 8);
    doc.text('   Alamat', 25, startY + lineSpacing * 9);
    doc.text(`: ${item.alamat || '-'}, Kec. ${item.kecamatan || '-'}`, 60, startY + lineSpacing * 9);
    doc.text('Selanjutnya disebut sebagai PIHAK KEDUA (Yang Menerima).', 25, startY + lineSpacing * 10);

    const introText = `Dengan ini menerangkan bahwa PIHAK KESATU telah menyerahkan Barang Bantuan ${item.jenis} kepada PIHAK KEDUA dan PIHAK KEDUA telah menerima barang tersebut dari PIHAK KESATU dalam keadaan baik dan lengkap berupa :`;
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, 20, startY + lineSpacing * 11.5);

    // Item Table
    const tableY = startY + lineSpacing * 14;
    const rowHeight = 7;
    const tableRows = [
      ['1', 'Beras', `${10 * item.jumlahPaket} Kg`, `DIKEMAS DALAM ${item.jumlahPaket} PAKET`],
      ['2', 'Minyak Goreng', `${1 * item.jumlahPaket} Lt`, ''],
      ['3', 'Susu Kaleng', `${1 * item.jumlahPaket} kaleng`, ''],
      ['4', 'Sarden', `${1 * item.jumlahPaket} pcs`, ''],
      ['5', 'Gula', `${1 * item.jumlahPaket} Kg`, ''],
      ['6', 'Teh', `${1 * item.jumlahPaket} box`, ''],
      ['7', 'Mie Instan', `${5 * item.jumlahPaket} Pcs`, ''],
      ['8', 'Kardus', `${1 * item.jumlahPaket} Buah`, ''],
    ];

    const colX = [20, 30, 90, 120];

    // Draw Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    // Header
    doc.rect(20, tableY, 170, rowHeight);
    doc.text('NO', colX[0] + 5, tableY + 5, { align: 'center' });
    doc.text('JENIS BARANG', colX[1] + 30, tableY + 5, { align: 'center' });
    doc.text('JUMLAH', colX[2] + 15, tableY + 5, { align: 'center' });
    doc.text('KETERANGAN', colX[3] + 35, tableY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    tableRows.forEach((row, i) => {
      const y = tableY + (i + 1) * rowHeight;
      doc.rect(20, y, 170, rowHeight);
      doc.text(row[0], colX[0] + 5, y + 5, { align: 'center' });
      doc.text(row[1], colX[1] + 2, y + 5);
      doc.text(row[2], colX[2] + 15, y + 5, { align: 'center' });
      doc.text(row[3], colX[3] + 2, y + 5);
    });

    // Vertical lines
    doc.line(colX[1], tableY, colX[1], tableY + (tableRows.length + 1) * rowHeight);
    doc.line(colX[2], tableY, colX[2], tableY + (tableRows.length + 1) * rowHeight);
    doc.line(colX[3], tableY, colX[3], tableY + (tableRows.length + 1) * rowHeight);

    const tableBottom = tableY + (tableRows.length + 1) * rowHeight;

    doc.setFontSize(11);
    doc.text('Demikian Berita Acara Serah Terima ini dibuat untuk dapat dipergunakan sebagaimana mestinya.', 20, tableBottom + 10);

    // Signatures
    const sigY = tableBottom + 35;
    doc.text('PIHAK KEDUA', 45, sigY, { align: 'center' });
    doc.text('(Penerima)', 45, sigY + 5, { align: 'center' });
    
    doc.text('Blora, ' + today, 145, sigY - 10, { align: 'center' });
    doc.text('PIHAK KESATU', 145, sigY, { align: 'center' });
    doc.text(String(settings.jabatan || '-'), 145, sigY + 5, { align: 'center' });
    doc.text(String(settings.instansi || '-'), 145, sigY + 10, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.text(String(item.penerima || '-'), 45, sigY + 25, { align: 'center' });
    doc.text(String(settings.kepalaBidang || '-'), 145, sigY + 25, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.line(25, sigY + 26, 65, sigY + 26);
    doc.line(125, sigY + 26, 165, sigY + 26);
    doc.text(`NIP. ${settings.nip || '-'}`, 145, sigY + 30, { align: 'center' });

    doc.save(`BAST_${item.penerima.replace(' ', '_')}_${itemDate}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Berita Acara</h1>
          <p className="text-slate-500 mt-1">Cetak Berita Acara Serah Terima (BAST) untuk setiap penyaluran.</p>
        </div>
      </header>

      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Cari berdasarkan nama penerima, NIK, atau kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700"
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Penerima</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.penerima}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-sm">{format(new Date(item.tanggal), 'dd MMM yyyy', { locale: id })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                        item.jenis === 'Sosial' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{item.jumlahPaket} Paket</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => generateBAST(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                      >
                        <Printer size={14} />
                        Cetak BAST
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Tidak ada data ditemukan</h3>
                    <p className="text-sm text-slate-500">Coba gunakan kata kunci pencarian lain.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
};
