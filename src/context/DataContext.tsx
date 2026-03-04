import React, { createContext, useContext, useState, useEffect } from 'react';

interface LSData {
  id: string;
  tanggal: Date;
  jumlahPaket: number;
  jenis: 'Sosial' | 'Bencana';
  totalRupiah: number;
  ppn: number;
  pph22: number;
  totalNet: number;
  sp2dUrl?: string;
}

interface IncomingGoods {
  id: string;
  tanggal: Date;
  suplier: string;
  jumlah: string; // Keep for display if needed, but we'll use numeric fields for logic
  jumlahPaket: number;
  jenis: 'Sosial' | 'Bencana';
  status: 'Diterima' | 'Proses';
  lsId?: string;
}

interface OutgoingGoods {
  id: number;
  tanggal: Date;
  penerima: string;
  nik: string;
  alamat: string;
  kecamatan?: string;
  jenis: 'Sosial' | 'Bencana';
  jumlahPaket: number;
  keterangan: string;
  lsId?: string;
}

interface DataContextType {
  lsList: LSData[];
  addLS: (data: LSData) => void;
  deleteLS: (id: string) => void;
  updateLS: (data: LSData) => void;
  barangMasukList: IncomingGoods[];
  addBarangMasuk: (data: IncomingGoods) => void;
  deleteBarangMasuk: (id: string) => void;
  updateBarangMasuk: (data: IncomingGoods) => void;
  barangKeluarList: OutgoingGoods[];
  addBarangKeluar: (data: OutgoingGoods) => void;
  deleteBarangKeluar: (id: number) => void;
  updateBarangKeluar: (data: OutgoingGoods) => void;
  dpaTargets: { sosial: number; bencana: number };
  updateDPATargets: (targets: { sosial: number; bencana: number }) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

interface AppSettings {
  appName: string;
  appSubtitle: string;
  appLogo: string;
  kopLogo: string;
  kepalaBidang: string;
  nip: string;
  jabatan: string;
  instansi: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lsList, setLsList] = useState<LSData[]>(() => {
    const saved = localStorage.getItem('sembako_ls_list');
    return saved ? JSON.parse(saved).map((item: any) => ({ ...item, tanggal: new Date(item.tanggal) })) : [];
  });

  const [barangMasukList, setBarangMasukList] = useState<IncomingGoods[]>(() => {
    const saved = localStorage.getItem('sembako_masuk_list');
    return saved ? JSON.parse(saved).map((item: any) => ({ ...item, tanggal: new Date(item.tanggal) })) : [];
  });

  const [barangKeluarList, setBarangKeluarList] = useState<OutgoingGoods[]>(() => {
    const saved = localStorage.getItem('sembako_keluar_list');
    return saved ? JSON.parse(saved).map((item: any) => ({ ...item, tanggal: new Date(item.tanggal) })) : [];
  });

  const [dpaTargets, setDpaTargets] = useState(() => {
    const saved = localStorage.getItem('sembako_dpa_targets');
    return saved ? JSON.parse(saved) : { sosial: 5000, bencana: 2000 }; // Default values
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('sembako_app_settings');
    return saved ? JSON.parse(saved) : {
      appName: 'SiSembako',
      appSubtitle: 'Sistem Informasi Logistik Sembako',
      appLogo: '', // Base64 or URL
      kopLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lambang_Kabupaten_Blora.png/400px-Lambang_Kabupaten_Blora.png',
      kepalaBidang: 'Nama Kepala Bidang Sosial',
      nip: '19XXXXXXXXXXXXXX',
      jabatan: 'Kepala Bidang Sosial',
      instansi: 'Dinas Sosial, P3A Kabupaten Blora'
    };
  });

  useEffect(() => {
    localStorage.setItem('sembako_ls_list', JSON.stringify(lsList));
  }, [lsList]);

  useEffect(() => {
    localStorage.setItem('sembako_masuk_list', JSON.stringify(barangMasukList));
  }, [barangMasukList]);

  useEffect(() => {
    localStorage.setItem('sembako_keluar_list', JSON.stringify(barangKeluarList));
  }, [barangKeluarList]);

  useEffect(() => {
    localStorage.setItem('sembako_dpa_targets', JSON.stringify(dpaTargets));
  }, [dpaTargets]);

  useEffect(() => {
    localStorage.setItem('sembako_app_settings', JSON.stringify(settings));
  }, [settings]);

  const addLS = (data: LSData) => setLsList(prev => [data, ...prev]);
  const deleteLS = (id: string) => setLsList(prev => prev.filter(item => item.id !== id));
  const updateLS = (data: LSData) => setLsList(prev => prev.map(item => item.id === data.id ? data : item));
  
  const addBarangMasuk = (data: IncomingGoods) => setBarangMasukList(prev => [data, ...prev]);
  const deleteBarangMasuk = (id: string) => setBarangMasukList(prev => prev.filter(item => item.id !== id));
  const updateBarangMasuk = (data: IncomingGoods) => setBarangMasukList(prev => prev.map(item => item.id === data.id ? data : item));

  const addBarangKeluar = (data: OutgoingGoods) => setBarangKeluarList(prev => [data, ...prev]);
  const deleteBarangKeluar = (id: number) => setBarangKeluarList(prev => prev.filter(item => item.id !== id));
  const updateBarangKeluar = (data: OutgoingGoods) => setBarangKeluarList(prev => prev.map(item => item.id === data.id ? data : item));

  const updateDPATargets = (targets: { sosial: number; bencana: number }) => setDpaTargets(targets);

  const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

  return (
    <DataContext.Provider value={{ 
      lsList, addLS, deleteLS, updateLS,
      barangMasukList, addBarangMasuk, deleteBarangMasuk, updateBarangMasuk,
      barangKeluarList, addBarangKeluar, deleteBarangKeluar, updateBarangKeluar,
      dpaTargets, updateDPATargets,
      settings, updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
