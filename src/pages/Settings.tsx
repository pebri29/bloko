import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  Image as ImageIcon,
  User,
  Type,
  Layout,
  CheckCircle2,
  Trash2,
  Building2,
  Briefcase,
  Database,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../lib/utils';

export const SettingsPage = () => {
  const { settings, updateSettings, isLoading, isFirebaseConnected } = useData();
  const [formData, setFormData] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  };

  const isConfigComplete = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

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
  
  const appLogoRef = useRef<HTMLInputElement>(null);
  const kopLogoRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'appLogo' | 'kopLogo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (field: 'appLogo' | 'kopLogo') => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      if (error.code === 'permission-denied') {
        alert('Gagal memperbarui: Izin ditolak. Periksa Firestore Rules.');
      } else {
        alert(`Gagal memperbarui pengaturan: ${error.message}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Firebase Status Card */}
      <GlassCard className="p-6 border-l-4 border-l-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
              isFirebaseConnected ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
            )}>
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Status Koneksi Firebase
                {isFirebaseConnected ? (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    <CheckCircle size={10} /> Terhubung
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    <AlertCircle size={10} /> Terputus
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {isConfigComplete 
                  ? `Menggunakan Project ID: ${firebaseConfig.projectId}` 
                  : 'Konfigurasi Firebase belum lengkap. Silakan atur di menu Settings AI Studio.'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <ExternalLink size={14} /> Firebase Console
            </a>
            {!isFirebaseConnected && (
              <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-2">
                <AlertCircle size={14} /> Cek Firestore Rules
              </div>
            )}
          </div>
        </div>

        {!isFirebaseConnected && isConfigComplete && (
          <div className="mt-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-sm text-amber-800">
            <p className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Troubleshooting:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs font-medium opacity-80">
              <li>Pastikan <b>Project ID</b> sudah benar (cek di Firebase Console).</li>
              <li>Pastikan <b>Firestore Database</b> sudah dibuat di Firebase Console.</li>
              <li>Pastikan <b>Firestore Rules</b> diatur ke: <code className="bg-white px-1 rounded">allow read, write: if true;</code> (untuk testing).</li>
              <li>Refresh halaman ini setelah melakukan perubahan.</li>
            </ul>
          </div>
        )}
      </GlassCard>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Pengaturan</h1>
          <p className="text-slate-500 mt-1">Sesuaikan identitas dan konfigurasi aplikasi.</p>
        </div>
        
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-bold text-sm"
          >
            <CheckCircle2 size={18} />
            Pengaturan Berhasil Disimpan
          </motion.div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="space-y-8">
            <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Layout size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900">Identitas Aplikasi</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <Type size={14} /> Nama Aplikasi
                  </label>
                  <input 
                    type="text"
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Contoh: SiSembako"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <Type size={14} /> Subtitle Aplikasi
                  </label>
                  <input 
                    type="text"
                    value={formData.appSubtitle}
                    onChange={(e) => setFormData({ ...formData, appSubtitle: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Contoh: Sistem Informasi Logistik Sembako"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <User size={14} /> Kepala Bidang Sosial
                  </label>
                  <input 
                    type="text"
                    value={formData.kepalaBidang}
                    onChange={(e) => setFormData({ ...formData, kepalaBidang: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Nama Lengkap Beserta Gelar"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <CheckCircle2 size={14} /> NIP
                  </label>
                  <input 
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Contoh: 19850101 201001 1 001"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <Briefcase size={14} /> Jabatan
                  </label>
                  <input 
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Contoh: Kepala Bidang Sosial"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <Building2 size={14} /> Instansi
                  </label>
                  <input 
                    type="text"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Contoh: Dinas Sosial, P3A Kabupaten Blora"
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Logo Settings */}
          <div className="space-y-8">
            <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900">Visual & Branding</h3>
              </div>

              <div className="space-y-6">
                {/* App Logo */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Logo Aplikasi (Sidebar)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
                      {formData.appLogo ? (
                        <img src={formData.appLogo} alt="App Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={32} />
                      )}
                      <button 
                        type="button"
                        onClick={() => appLogoRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Upload size={20} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-2">Gunakan gambar persegi (1:1) dengan latar belakang transparan untuk hasil terbaik.</p>
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => appLogoRef.current?.click()}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                          Pilih Gambar
                        </button>
                        {formData.appLogo && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveLogo('appLogo')}
                            className="text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={appLogoRef} 
                      onChange={(e) => handleFileChange(e, 'appLogo')} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* KOP Logo */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Logo KOP (Laporan PDF)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
                      {formData.kopLogo ? (
                        <img src={formData.kopLogo} alt="KOP Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={32} />
                      )}
                      <button 
                        type="button"
                        onClick={() => kopLogoRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Upload size={20} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-2">Logo resmi instansi yang akan muncul di header laporan PDF.</p>
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => kopLogoRef.current?.click()}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                          Pilih Gambar
                        </button>
                        {formData.kopLogo && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveLogo('kopLogo')}
                            className="text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={kopLogoRef} 
                      onChange={(e) => handleFileChange(e, 'kopLogo')} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Save size={20} />
            Simpan Semua Perubahan
          </button>
        </div>
      </form>
    </motion.div>
  );
};
