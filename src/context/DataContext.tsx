import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  jumlah: string;
  jumlahPaket: number;
  jenis: 'Sosial' | 'Bencana';
  status: 'Diterima' | 'Proses';
  lsId?: string;
}

interface OutgoingGoods {
  id: string;
  tanggal: Date;
  penerima: string;
  nik: string;
  alamat: string;
  kecamatan?: string;
  jenis: 'Sosial' | 'Bencana';
  jumlahPaket: number;
  jenisPenyaluran: string;
  keterangan: string;
  status?: 'Selesai' | 'Belum Selesai';
  lsId?: string;
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

interface DataContextType {
  lsList: LSData[];
  addLS: (data: LSData) => Promise<void>;
  deleteLS: (id: string) => Promise<void>;
  updateLS: (data: LSData) => Promise<void>;
  barangMasukList: IncomingGoods[];
  addBarangMasuk: (data: Omit<IncomingGoods, 'id'>) => Promise<void>;
  deleteBarangMasuk: (id: string) => Promise<void>;
  updateBarangMasuk: (data: IncomingGoods) => Promise<void>;
  barangKeluarList: OutgoingGoods[];
  addBarangKeluar: (data: Omit<OutgoingGoods, 'id'>) => Promise<void>;
  deleteBarangKeluar: (id: string) => Promise<void>;
  updateBarangKeluar: (data: OutgoingGoods) => Promise<void>;
  dpaTargets: { sosial: number; bencana: number };
  updateDPATargets: (targets: { sosial: number; bencana: number }) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => Promise<void>;
  isLoading: boolean;
  isFirebaseConnected: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'BLOKO',
  appSubtitle: 'Blora Sembako Sosial',
  appLogo: 'https://i.ibb.co/v6yXy6p/bloko-logo.png',
  kopLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lambang_Kabupaten_Blora.png/400px-Lambang_Kabupaten_Blora.png',
  kepalaBidang: 'Nama Kepala Bidang Sosial',
  nip: '19XXXXXXXXXXXXXX',
  jabatan: 'Kepala Bidang Sosial',
  instansi: 'Dinas Sosial, P3A Kabupaten Blora'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lsList, setLsList] = useState<LSData[]>([]);
  const [barangMasukList, setBarangMasukList] = useState<IncomingGoods[]>([]);
  const [barangKeluarList, setBarangKeluarList] = useState<OutgoingGoods[]>([]);
  const [dpaTargets, setDpaTargets] = useState({ sosial: 5000, bencana: 2000 });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  useEffect(() => {
    // Check if Firebase is configured
    if (!db) {
      console.warn('Firestore is not initialized. Real-time sync will not work.');
      setIsLoading(false);
      setIsFirebaseConnected(false);
      return;
    }

    setIsFirebaseConnected(true);

    const unsubLS = onSnapshot(query(collection(db, 'lsList'), orderBy('tanggal', 'desc')), (snapshot) => {
      setLsList(snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        tanggal: doc.data().tanggal ? (doc.data().tanggal as Timestamp).toDate() : new Date()
      })) as LSData[]);
    }, (error) => {
      console.error('Error listening to LS list:', error);
      if (error.code === 'permission-denied') {
        console.error('Firestore Permission Denied: Check your security rules.');
      }
    });

    const unsubMasuk = onSnapshot(query(collection(db, 'barangMasuk'), orderBy('tanggal', 'desc')), (snapshot) => {
      setBarangMasukList(snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        tanggal: doc.data().tanggal ? (doc.data().tanggal as Timestamp).toDate() : new Date()
      })) as IncomingGoods[]);
    }, (error) => {
      console.error('Error listening to barang masuk:', error);
    });

    const unsubKeluar = onSnapshot(query(collection(db, 'barangKeluar'), orderBy('tanggal', 'desc')), (snapshot) => {
      setBarangKeluarList(snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        tanggal: doc.data().tanggal ? (doc.data().tanggal as Timestamp).toDate() : new Date()
      })) as OutgoingGoods[]);
    }, (error) => {
      console.error('Error listening to barang keluar:', error);
    });

    const unsubTargets = onSnapshot(doc(db, 'config', 'dpaTargets'), (doc) => {
      if (doc.exists()) {
        setDpaTargets(doc.data() as { sosial: number; bencana: number });
      }
    }, (error) => {
      console.error('Error listening to DPA targets:', error);
    });

    const unsubSettings = onSnapshot(doc(db, 'config', 'appSettings'), (doc) => {
      console.log('App settings snapshot received, exists:', doc.exists());
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to app settings:', error);
      if (error.code === 'permission-denied') {
        console.error('Firestore Permission Denied: Check your security rules.');
      }
      setIsLoading(false);
    });

    // Safety timeout: if data doesn't load in 5 seconds, show the app anyway
    const timeout = setTimeout(() => {
      setIsLoading(prev => {
        if (prev) {
          console.warn('Data loading timed out. Showing app with default/cached data.');
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      clearTimeout(timeout);
      unsubLS();
      unsubMasuk();
      unsubKeluar();
      unsubTargets();
      unsubSettings();
    };
  }, []);

  const addLS = async (data: LSData) => {
    if (!db) throw new Error('Database not connected');
    try {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'lsList', id), { ...rest, tanggal: Timestamp.fromDate(data.tanggal) });
    } catch (error) {
      console.error('Error adding LS:', error);
      throw error;
    }
  };
  const deleteLS = async (id: string) => {
    if (!db) throw new Error('Database not connected');
    try {
      await deleteDoc(doc(db, 'lsList', id));
    } catch (error) {
      console.error('Error deleting LS:', error);
      throw error;
    }
  };
  const updateLS = async (data: LSData) => {
    if (!db) throw new Error('Database not connected');
    try {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'lsList', id), { ...rest, tanggal: Timestamp.fromDate(data.tanggal) });
    } catch (error) {
      console.error('Error updating LS:', error);
      throw error;
    }
  };

  const addBarangMasuk = async (data: Omit<IncomingGoods, 'id'>) => {
    if (!db) throw new Error('Database not connected');
    try {
      await addDoc(collection(db, 'barangMasuk'), { ...data, tanggal: Timestamp.fromDate(data.tanggal) });
    } catch (error) {
      console.error('Error adding barang masuk:', error);
      throw error;
    }
  };
  const deleteBarangMasuk = async (id: string) => {
    if (!db) throw new Error('Database not connected');
    try {
      await deleteDoc(doc(db, 'barangMasuk', id));
    } catch (error) {
      console.error('Error deleting barang masuk:', error);
      throw error;
    }
  };
  const updateBarangMasuk = async (data: IncomingGoods) => {
    if (!db) throw new Error('Database not connected');
    try {
      const { id, ...rest } = data;
      await updateDoc(doc(db, 'barangMasuk', id), { ...rest, tanggal: Timestamp.fromDate(data.tanggal) });
    } catch (error) {
      console.error('Error updating barang masuk:', error);
      throw error;
    }
  };

  const addBarangKeluar = async (data: Omit<OutgoingGoods, 'id'>) => {
    if (!db) throw new Error('Database not connected');
    try {
      await addDoc(collection(db, 'barangKeluar'), { ...data, tanggal: Timestamp.fromDate(data.tanggal) });
    } catch (error) {
      console.error('Error adding barang keluar:', error);
      throw error;
    }
  };
  const deleteBarangKeluar = async (id: string) => {
    if (!db) throw new Error('Database not connected');
    try {
      await deleteDoc(doc(db, 'barangKeluar', id));
    } catch (error) {
      console.error('Error deleting barang keluar:', error);
      throw error;
    }
  };
  const updateBarangKeluar = async (data: OutgoingGoods) => {
    if (!db) throw new Error('Database not connected');
    try {
      const { id, ...rest } = data;
      await updateDoc(doc(db, 'barangKeluar', id), { ...rest, tanggal: Timestamp.fromDate(data.tanggal) });
    } catch (error) {
      console.error('Error updating barang keluar:', error);
      throw error;
    }
  };

  const updateDPATargets = async (targets: { sosial: number; bencana: number }) => {
    if (!db) throw new Error('Database not connected');
    try {
      await setDoc(doc(db, 'config', 'dpaTargets'), targets);
    } catch (error) {
      console.error('Error updating DPA targets:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    if (!db) throw new Error('Database not connected');
    try {
      await setDoc(doc(db, 'config', 'appSettings'), newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{ 
      lsList, addLS, deleteLS, updateLS,
      barangMasukList, addBarangMasuk, deleteBarangMasuk, updateBarangMasuk,
      barangKeluarList, addBarangKeluar, deleteBarangKeluar, updateBarangKeluar,
      dpaTargets, updateDPATargets,
      settings, updateSettings,
      isLoading,
      isFirebaseConnected
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
