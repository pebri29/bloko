import React, { useState } from 'react';
import { format } from 'date-fns';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Heart, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Sector 
} from 'recharts';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-bold">{`${value} Pkt`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-[10px]">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const WaterTank = ({ value, label, color, max = 5000 }: { value: number; label: string; color: string; max?: number }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-40 bg-slate-50 rounded-t-3xl rounded-b-xl border-4 border-slate-200 overflow-hidden shadow-inner group">
        {/* Water Level */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 2, ease: "circOut" }}
          className="absolute bottom-0 left-0 right-0"
          style={{ backgroundColor: color }}
        >
          {/* Wave Effect */}
          <motion.div 
            animate={{ 
              y: [0, -5, 0],
              scaleX: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-3 left-[-10%] w-[120%] h-6 opacity-40"
            style={{ backgroundColor: color, borderRadius: '50%' }}
          />
        </motion.div>
        
        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/5 pointer-events-none" />
        
        {/* Value Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-base font-black text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
          >
            {value.toLocaleString()}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { lsList, barangMasukList, barangKeluarList, settings, dpaTargets } = useData();
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const totalMasuk = barangMasukList
    .filter(item => item.status === 'Diterima')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);
  
  const totalKeluar = barangKeluarList.reduce((acc, item) => acc + item.jumlahPaket, 0);
  const currentStock = totalMasuk - totalKeluar;
  const totalPenerima = new Set(barangKeluarList.map(item => item.nik)).size;

  // Category based calculations
  const keluarSosial = barangKeluarList
    .filter(item => item.jenis === 'Sosial')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);
  
  const keluarBencana = barangKeluarList
    .filter(item => item.jenis === 'Bencana')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);

  const masukSosial = barangMasukList
    .filter(item => item.jenis === 'Sosial' && item.status === 'Diterima')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);

  const masukBencana = barangMasukList
    .filter(item => item.jenis === 'Bencana' && item.status === 'Diterima')
    .reduce((acc, item) => acc + item.jumlahPaket, 0);

  const stokSosial = masukSosial - keluarSosial;
  const stokBencana = masukBencana - keluarBencana;

  const selisihSosial = dpaTargets.sosial - keluarSosial;
  const selisihBencana = dpaTargets.bencana - keluarBencana;

  const distributionData = [
    { name: 'Sosial', value: keluarSosial, color: '#3b82f6' },
    { name: 'Kebencanaan', value: keluarBencana, color: '#f59e0b' },
  ];

  const stats = [
    { label: 'Total Stok', value: currentStock.toLocaleString(), icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Barang Keluar', value: totalKeluar.toLocaleString(), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Permintaan LS', value: lsList.length.toString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', pulse: lsList.length > 0 },
    { label: 'Penerima Manfaat', value: totalPenerima.toString(), icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Halo, Admin</h1>
        <p className="text-slate-500 mt-1">{settings.appSubtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i}>
            <GlassCard className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
              {stat.pulse && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
              )}
            </GlassCard>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section: Distribusi Per Kategori (Chart) - Shrunk */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-900">Distribusi</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <PieIcon size={14} />
            </div>
          </div>
          <GlassCard className="h-[300px] flex items-center justify-center">
            {keluarSosial === 0 && keluarBencana === 0 ? (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <PieIcon size={24} />
                </div>
                <p className="text-sm text-slate-400">No data.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onClick={(_, index) => setActiveIndex(index)}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-xl border border-white/50">
                            <p className="text-[10px] font-bold text-slate-900 uppercase mb-1">{payload[0].name}</p>
                            <p className="text-sm font-bold text-blue-600">{payload[0].value.toLocaleString()} Pkt</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </div>

        {/* Section: Water Tanks (Stok) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-900">Ketersediaan Stok</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gudang Logistik</span>
          </div>
          <GlassCard className="h-[300px] flex items-center justify-around p-6">
            <WaterTank 
              value={stokSosial} 
              label="Sosial" 
              color="#3b82f6" 
              max={Math.max(masukSosial, 1000)} 
            />
            <WaterTank 
              value={stokBencana} 
              label="Bencana" 
              color="#f59e0b" 
              max={Math.max(masukBencana, 1000)} 
            />
          </GlassCard>
        </div>

        {/* Section: Realisasi vs DPA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-900">Realisasi vs DPA</h3>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kumulatif</span>
          </div>
          <div className="flex flex-col gap-4">
            <GlassCard className="group hover:ring-2 hover:ring-blue-500/20 transition-all cursor-default py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                  SOSIAL
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Keluar</p>
                  <p className="text-sm font-bold text-slate-900">{keluarSosial.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">DPA</p>
                  <p className="text-sm font-bold text-slate-700">{dpaTargets.sosial.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Sisa</p>
                  <p className={cn("text-sm font-bold", selisihSosial >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {selisihSosial.toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="group hover:ring-2 hover:ring-amber-500/20 transition-all cursor-default py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                  BENCANA
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Keluar</p>
                  <p className="text-sm font-bold text-slate-900">{keluarBencana.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">DPA</p>
                  <p className="text-sm font-bold text-slate-700">{dpaTargets.bencana.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Sisa</p>
                  <p className={cn("text-sm font-bold", selisihBencana >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {selisihBencana.toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
