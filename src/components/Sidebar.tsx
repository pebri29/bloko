import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileStack,
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileText,
  History, 
  BarChart3,
  PieChart,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileStack, label: 'LS (Permintaan)', path: '/ls' },
  { icon: ArrowDownCircle, label: 'Barang Masuk', path: '/masuk' },
  { icon: ArrowUpCircle, label: 'Barang Keluar', path: '/keluar' },
  { icon: FileText, label: 'Berita Acara', path: '/berita-acara' },
  { icon: History, label: 'Riwayat', path: '/opname' },
  { icon: PieChart, label: 'Rekap Indikator', path: '/rekap' },
  { icon: BarChart3, label: 'Laporan', path: '/laporan' },
];

export const Sidebar = () => {
  const { settings } = useData();
  const [isLogoHovered, setIsLogoHovered] = React.useState(false);

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:right-auto z-50 p-4 lg:p-0"
    >
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] lg:rounded-[2.5rem] p-2 lg:p-3 shadow-2xl flex flex-row lg:flex-col items-center justify-around lg:justify-start gap-2 lg:gap-4 max-w-md mx-auto lg:max-w-none">
        <div 
          className="hidden lg:flex relative"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 overflow-hidden shrink-0 cursor-pointer transition-transform duration-500 hover:rotate-12 hover:scale-110">
            {settings.appLogo ? (
              <img src={settings.appLogo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-white font-bold text-xl">{settings.appName.charAt(0)}</span>
            )}
          </div>

          <AnimatePresence>
            {isLogoHovered && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 64, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 20, scale: 0.8, filter: 'blur(10px)' }}
                className="absolute left-0 top-0 bg-white/90 backdrop-blur-xl border border-white/40 p-5 rounded-[2rem] shadow-2xl pointer-events-none z-[60] min-w-[240px] flex flex-col gap-1"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-blue-600 font-black text-2xl leading-none tracking-tighter">{settings.appName}</h2>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 line-clamp-2">{settings.appSubtitle}</p>
                </motion.div>
                <div className="absolute -left-2 top-6 w-4 h-4 bg-white/90 border-l border-t border-white/40 rotate-45 -z-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl transition-all duration-300 group relative shrink-0",
              isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white/80 hover:text-blue-500",
              (item.label === 'Berita Acara' || item.label === 'Riwayat' || item.label === 'Rekap Indikator') && "hidden lg:flex"
            )}
          >
            <item.icon className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            <span className="hidden lg:block absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </NavLink>
        ))}
        
        <div className="hidden lg:block lg:mt-auto lg:pt-4 lg:border-t lg:border-white/20">
          <NavLink 
            to="/settings"
            className={({ isActive }) => cn(
              "w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl transition-all duration-300 group relative shrink-0",
              isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white/80 hover:text-blue-500"
            )}
          >
            <Settings className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            <span className="hidden lg:block absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              Pengaturan
            </span>
          </NavLink>
        </div>
      </div>
    </motion.div>
  );
};
