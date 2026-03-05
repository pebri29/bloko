import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { BarangKeluar } from './pages/BarangKeluar';
import { BarangMasuk } from './pages/BarangMasuk';
import { LSPage } from './pages/LS';
import { RiwayatPage } from './pages/Riwayat';
import { LaporanPage } from './pages/Laporan';
import { SettingsPage } from './pages/Settings';
import { BeritaAcaraPage } from './pages/BeritaAcara';
import { RekapIndikatorPage } from './pages/RekapIndikator';
import { AnimatePresence } from 'motion/react';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>Halaman ini sedang dalam pengembangan.</p>
  </div>
);

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-600">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-200/30 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-emerald-100/20 blur-[150px] rounded-full" />
      </div>

      <Sidebar />

      <main className="px-4 lg:pl-32 lg:pr-8 pt-8 lg:pt-12 pb-28 lg:pb-24 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ls" element={<LSPage />} />
              <Route path="/keluar" element={<BarangKeluar />} />
              <Route path="/berita-acara" element={<BeritaAcaraPage />} />
              <Route path="/masuk" element={<BarangMasuk />} />
              <Route path="/opname" element={<RiwayatPage />} />
              <Route path="/rekap" element={<RekapIndikatorPage />} />
              <Route path="/laporan" element={<LaporanPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}
