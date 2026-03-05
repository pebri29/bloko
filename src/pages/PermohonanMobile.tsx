import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Hash, 
  MapPin, 
  Package, 
  Send, 
  CheckCircle2, 
  ChevronDown,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../lib/utils';

export const PermohonanMobile = () => {
  const { addBarangKeluar, settings } = useData();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [namaPemohon, setNamaPemohon] = useState('');
  const [penerima, setPenerima] = useState('');
  const [nik, setNik] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [jumlahPaket, setJumlahPaket] = useState('');
  const [ketLevel1, setKetLevel1] = useState('');
  const [ketLevel2, setKetLevel2] = useState('');
  const [ketLainnya, setKetLainnya] = useState('');

  const KECAMATAN_BLORA = [
    'Banjarejo', 'Blora', 'Bogorejo', 'Cepu', 'Japah', 'Jati', 'Jepon', 'Jiken',
    'Kedungtuban', 'Kradenan', 'Kunduran', 'Ngawen', 'Randublatung', 'Sambong',
    'Todanan', 'Tunjungan'
  ];

  const KET_OPTIONS = {
    'Bencana Alam': ['Gempa Bumi', 'Letusan Gunung', 'Banjir', 'Tanah longsor', 'Angin Kencang', 'lainnya (sebutkan)'],
    'Bencana Non Alam': ['Kebakaran akibat korsleting listrik', 'kecelakaan industri', 'pencemaran lingkungan', 'wabah penyakit', 'lainnya (sebutkan)'],
    'Sosial': ['anak telantar', 'lansia terlantar', 'disabilitas', 'gelandangan', 'ODGJ', 'fakir miskin', 'lainnya (sebutkan)']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let finalJenisPenyaluran = '';
    if (ketLevel1) {
      finalJenisPenyaluran = ketLevel1;
      if (ketLevel2) {
        finalJenisPenyaluran += ` - ${ketLevel2}`;
        if (ketLevel2 === 'lainnya (sebutkan)' && ketLainnya) {
          finalJenisPenyaluran += ` - ${ketLainnya}`;
        }
      }
    } else {
      finalJenisPenyaluran = ketLainnya;
    }

    const data = {
      tanggal: new Date(),
      penerima,
      nik,
      alamat,
      kecamatan,
      jenis: (ketLevel1 === 'Sosial' ? 'Sosial' : 'Bencana') as 'Sosial' | 'Bencana',
      jumlahPaket: parseInt(jumlahPaket),
      jenisPenyaluran: finalJenisPenyaluran,
      status: `Permohonan dari ${namaPemohon}` as any,
      keterangan: `Input via Mobile oleh ${namaPemohon}`
    };

    try {
      await addBarangKeluar(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Gagal mengirim permohonan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/10 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Berhasil Terkirim!</h2>
          <p className="text-slate-500 mb-8">Permohonan Anda telah masuk ke sistem dan akan segera diproses oleh petugas.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
          >
            Buat Permohonan Baru
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Mobile */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{settings.appName}</h1>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Form Permohonan Sembako</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 font-medium">Silakan isi data di bawah ini dengan lengkap untuk mengajukan bantuan sembako.</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 mt-8 space-y-6">
        {/* Section: Identitas Pemohon */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identitas Pemohon</h3>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Nama Pemohon (Anda)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Nama Lengkap Anda"
                  value={namaPemohon}
                  onChange={(e) => setNamaPemohon(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Data Penerima Manfaat */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data Penerima Manfaat (PM)</h3>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Nama Penerima</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Nama Lengkap PM"
                  value={penerima}
                  onChange={(e) => setPenerima(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">NIK PM (16 Digit)</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  maxLength={16}
                  placeholder="16 Digit NIK"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Kecamatan</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  required
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                >
                  <option value="">Pilih Kecamatan</option>
                  {KECAMATAN_BLORA.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Alamat Lengkap PM</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  required
                  placeholder="Alamat Lengkap PM"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Detail Bantuan */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Detail Bantuan</h3>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Jumlah Paket Sembako</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required
                  placeholder="Jumlah Paket"
                  value={jumlahPaket}
                  onChange={(e) => setJumlahPaket(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Kategori Penyaluran</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  required
                  value={ketLevel1}
                  onChange={(e) => {
                    setKetLevel1(e.target.value);
                    setKetLevel2('');
                    setKetLainnya('');
                  }}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                >
                  <option value="">Pilih Kategori</option>
                  {Object.keys(KET_OPTIONS).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {ketLevel1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Sub Kategori</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    required
                    value={ketLevel2}
                    onChange={(e) => {
                      setKetLevel2(e.target.value);
                      if (e.target.value !== 'lainnya (sebutkan)') setKetLainnya('');
                    }}
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                  >
                    <option value="">Pilih Sub Kategori</option>
                    {KET_OPTIONS[ketLevel1 as keyof typeof KET_OPTIONS].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
            )}

            {(ketLevel2 === 'lainnya (sebutkan)' || (!ketLevel1 && ketLainnya)) && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Keterangan Lainnya</label>
                <input 
                  type="text" 
                  required
                  placeholder="Sebutkan detail bantuan..."
                  value={ketLainnya}
                  onChange={(e) => setKetLainnya(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium"
                />
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-5 bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} />
              Kirim Permohonan
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center px-6">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aplikasi {settings.appName} &copy; 2024</p>
      </div>
    </div>
  );
};
