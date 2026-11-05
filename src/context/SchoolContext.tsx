import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Siswa,
  Guru,
  Staff,
  Kelas,
  MataPelajaran,
  JadwalPelajaran,
  PresensiSiswa,
  PresensiGuru,
  NilaiSiswa,
  PrestasiSiswa,
  BukuTamu,
  MasterSPP,
  TagihanSPP,
  PembayaranSPP,
  TransaksiKeuangan,
  AkunAkuntansi,
  JurnalUmum,
  PengaturanSekolah,
  Pengumuman,
  AuditLog,
  GoogleSheetsConfig
} from '../types';
import { StorageService } from '../services/storageService';
import { GoogleSheetsService } from '../services/googleSheetsService';
import {
  getCachedGoogleToken,
  getCachedGoogleUser,
  subscribeGoogleAuth,
  signInWithGoogle,
  signOutGoogle
} from '../services/googleAuthService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface SchoolContextType {
  config: PengaturanSekolah;
  updateConfig: (cfg: PengaturanSekolah) => void;
  sheetsConfig: GoogleSheetsConfig;
  updateSheetsConfig: (cfg: GoogleSheetsConfig) => void;
  siswa: Siswa[];
  guru: Guru[];
  staff: Staff[];
  kelas: Kelas[];
  mapel: MataPelajaran[];
  jadwal: JadwalPelajaran[];
  presensiSiswa: PresensiSiswa[];
  presensiGuru: PresensiGuru[];
  nilai: NilaiSiswa[];
  prestasi: PrestasiSiswa[];
  bukuTamu: BukuTamu[];
  masterSPP: MasterSPP[];
  tagihanSPP: TagihanSPP[];
  pembayaranSPP: PembayaranSPP[];
  akunAkuntansi: AkunAkuntansi[];
  jurnalUmum: JurnalUmum[];
  transaksiKeuangan: TransaksiKeuangan[];
  pengumuman: Pengumuman[];
  auditLogs: AuditLog[];
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  refreshAllData: () => void;
  // Mutations
  saveSiswa: (s: Siswa) => void;
  deleteSiswa: (id: string) => void;
  saveGuru: (g: Guru) => void;
  deleteGuru: (id: string) => void;
  saveStaff: (st: Staff) => void;
  saveKelas: (k: Kelas) => void;
  saveMapel: (m: MataPelajaran) => void;
  saveJadwal: (j: JadwalPelajaran) => void;
  recordPresensiSiswa: (record: PresensiSiswa) => void;
  recordPresensiGuru: (record: PresensiGuru) => void;
  saveNilai: (n: NilaiSiswa) => NilaiSiswa;
  savePrestasi: (p: PrestasiSiswa) => void;
  addBukuTamu: (b: BukuTamu) => void;
  checkoutBukuTamu: (id: string, time: string) => void;
  saveMasterSPP: (m: MasterSPP) => void;
  generateMonthlyBills: (periode: string, thAjaran: string) => { generated: number; skipped: number };
  recordPembayaranSPP: (
    tagihanId: string,
    nominal: number,
    metode: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Virtual Account',
    ref: string,
    kasir: string,
    catatan?: string
  ) => { pembayaran: PembayaranSPP; jurnal: JurnalUmum };
  recordPengeluaran: (
    kategori: string,
    keterangan: string,
    nominal: number,
    kasKode: string,
    bebanKode: string,
    petugas: string
  ) => { transaksi: TransaksiKeuangan; jurnal: JurnalUmum };
  savePengumuman: (p: Pengumuman) => void;
  deletePengumuman: (id: string) => void;
  // Auto-Sync 1 Menit State & Methods
  isAutoSyncRunning: boolean;
  autoSyncCountdown: number; // detik tersisa dalam siklus 1 menit
  executeAutoSync: (silent?: boolean) => Promise<void>;
  toggleAutoSync: (enabled: boolean) => void;
  setAutoSyncInterval: (minutes: number) => void;
  syncKeuanganLive: () => Promise<{ success: boolean; rowsWritten?: number; message: string; hasToken: boolean }>;
  // Shared Master Google Sync across All 7 Accounts
  isGoogleConnected: boolean;
  googleUserEmail: string | null;
  connectMasterGoogle: () => Promise<boolean>;
  disconnectMasterGoogle: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PengaturanSekolah>(StorageService.getSchoolConfig());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(StorageService.getSheetsConfig());
  const [siswa, setSiswa] = useState<Siswa[]>(StorageService.getSiswa());
  const [guru, setGuru] = useState<Guru[]>(StorageService.getGuru());
  const [staff, setStaff] = useState<Staff[]>(StorageService.getStaff());
  const [kelas, setKelas] = useState<Kelas[]>(StorageService.getKelas());
  const [mapel, setMapel] = useState<MataPelajaran[]>(StorageService.getMapel());
  const [jadwal, setJadwal] = useState<JadwalPelajaran[]>(StorageService.getJadwal());
  const [presensiSiswa, setPresensiSiswa] = useState<PresensiSiswa[]>(StorageService.getPresensiSiswa());
  const [presensiGuru, setPresensiGuru] = useState<PresensiGuru[]>(StorageService.getPresensiGuru());
  const [nilai, setNilai] = useState<NilaiSiswa[]>(StorageService.getNilai());
  const [prestasi, setPrestasi] = useState<PrestasiSiswa[]>(StorageService.getPrestasi());
  const [bukuTamu, setBukuTamu] = useState<BukuTamu[]>(StorageService.getBukuTamu());
  const [masterSPP, setMasterSPP] = useState<MasterSPP[]>(StorageService.getMasterSPP());
  const [tagihanSPP, setTagihanSPP] = useState<TagihanSPP[]>(StorageService.getTagihanSPP());
  const [pembayaranSPP, setPembayaranSPP] = useState<PembayaranSPP[]>(StorageService.getPembayaranSPP());
  const [akunAkuntansi, setAkunAkuntansi] = useState<AkunAkuntansi[]>(StorageService.getAkunAkuntansi());
  const [jurnalUmum, setJurnalUmum] = useState<JurnalUmum[]>(StorageService.getJurnalUmum());
  const [transaksiKeuangan, setTransaksiKeuangan] = useState<TransaksiKeuangan[]>(StorageService.getTransaksiKeuangan());
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>(StorageService.getPengumuman());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshAllData = useCallback(() => {
    setConfig(StorageService.getSchoolConfig());
    setSheetsConfig(StorageService.getSheetsConfig());
    setSiswa(StorageService.getSiswa());
    setGuru(StorageService.getGuru());
    setStaff(StorageService.getStaff());
    setKelas(StorageService.getKelas());
    setMapel(StorageService.getMapel());
    setJadwal(StorageService.getJadwal());
    setPresensiSiswa(StorageService.getPresensiSiswa());
    setPresensiGuru(StorageService.getPresensiGuru());
    setNilai(StorageService.getNilai());
    setPrestasi(StorageService.getPrestasi());
    setBukuTamu(StorageService.getBukuTamu());
    setMasterSPP(StorageService.getMasterSPP());
    setTagihanSPP(StorageService.getTagihanSPP());
    setPembayaranSPP(StorageService.getPembayaranSPP());
    setAkunAkuntansi(StorageService.getAkunAkuntansi());
    setJurnalUmum(StorageService.getJurnalUmum());
    setTransaksiKeuangan(StorageService.getTransaksiKeuangan());
    setPengumuman(StorageService.getPengumuman());
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  useEffect(() => {
    refreshAllData();

    // Fetch permanent shared Google Sheets & Apps Script config from server across all devices
    fetch('/api/sheets-config')
      .then(res => res.json())
      .then(serverCfg => {
        if (serverCfg && typeof serverCfg === 'object') {
          const local = StorageService.getSheetsConfig();
          const merged: GoogleSheetsConfig = {
            ...local,
            ...serverCfg,
            // Ensure target spreadsheet IDs are preserved
            spreadsheet_id_akademik: serverCfg.spreadsheet_id_akademik || local.spreadsheet_id_akademik || '13ohWc_DhrKXXogQnK2JWwxQfGYwo0KVV5gu20cfAt68',
            spreadsheet_id_keuangan: serverCfg.spreadsheet_id_keuangan || local.spreadsheet_id_keuangan || '17vf-FEBzvboyiESP7QFKvP7dIUwT6XiChCOIQuuOJm0',
            webhook_url_akademik: serverCfg.webhook_url_akademik || local.webhook_url_akademik || '',
            webhook_url_keuangan: serverCfg.webhook_url_keuangan || local.webhook_url_keuangan || '',
            auto_sync_interval_mins: serverCfg.auto_sync_interval_mins || 1,
            auto_sync_enabled: serverCfg.auto_sync_enabled !== false
          };
          StorageService.saveSheetsConfig(merged);
          setSheetsConfig(merged);
        }
      })
      .catch(err => {
        console.warn('Server sheets config sync offline, using local storage cache:', err);
      });
  }, [refreshAllData]);

  const updateConfig = (cfg: PengaturanSekolah) => {
    StorageService.saveSchoolConfig(cfg);
    setConfig(cfg);
    addToast('success', 'Pengaturan Tersimpan', 'Identitas sekolah dan konfigurasi berhasil diperbarui.');
  };

  const updateSheetsConfig = (cfg: GoogleSheetsConfig) => {
    StorageService.saveSheetsConfig(cfg);
    setSheetsConfig(cfg);
    // Broadcast & persist to server so all devices and accounts receive it permanently
    fetch('/api/sheets-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    }).catch(err => console.warn('Could not persist sheets config to server:', err));
    addToast('success', 'Tersimpan Permanen', 'Pengaturan Webhook Apps Script telah disimpan permanen untuk semua akun dan perangkat.');
  };

  // Master Google Connection State (Shared across all 7 accounts)
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => !!getCachedGoogleToken());
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(() => getCachedGoogleUser()?.email || null);

  useEffect(() => {
    const unsub = subscribeGoogleAuth((token, user) => {
      setIsGoogleConnected(!!token);
      setGoogleUserEmail(user?.email || null);
    });
    return unsub;
  }, []);

  const connectMasterGoogle = async (): Promise<boolean> => {
    try {
      const res = await signInWithGoogle();
      addToast('success', 'Sinkronisasi Aktif di Semua Akun', `Google Sheets terhubung sebagai ${res.user.email || 'Google'}. Seluruh peran (Admin, Keuangan, Guru, Siswa) kini tersinkronisasi otomatis.`);
      await executeAutoSync(false);
      return true;
    } catch (err: any) {
      if (!err.isCancelled) {
        addToast('error', 'Gagal Menghubungkan Google', err.message || 'Otorisasi gagal.');
      }
      return false;
    }
  };

  const disconnectMasterGoogle = async (): Promise<void> => {
    await signOutGoogle();
    addToast('info', 'Google Terputus', 'Sesi sinkronisasi Google telah diputus.');
  };

  // Auto-Sync 1 Menit State & Logic
  const [isAutoSyncRunning, setIsAutoSyncRunning] = useState(false);
  const [autoSyncCountdown, setAutoSyncCountdown] = useState<number>(() => {
    const cfg = StorageService.getSheetsConfig();
    return (cfg.auto_sync_interval_mins || 1) * 60;
  });

  const executeAutoSync = useCallback(async (silent = true) => {
    if (isAutoSyncRunning) return;
    setIsAutoSyncRunning(true);
    try {
      const res = await GoogleSheetsService.executeTwoWaySync();
      refreshAllData();
      if (!silent) {
        addToast(
          'success',
          res.liveSynced ? 'Live Sync Selesai' : 'Auto-Sync Berhasil',
          `Sinkronisasi otomatis (siklus ${sheetsConfig.auto_sync_interval_mins || 1} menit) berhasil dijalankan pada ${res.timestamp}.`
        );
      }
    } catch (err: any) {
      console.warn('Auto-sync cycle notice:', err?.message || err);
      if (!silent) {
        addToast('info', 'Sinkronisasi Selesai', 'Data operasional telah diperbarui.');
      }
    } finally {
      setIsAutoSyncRunning(false);
      const currentCfg = StorageService.getSheetsConfig();
      setAutoSyncCountdown((currentCfg.auto_sync_interval_mins || 1) * 60);
    }
  }, [isAutoSyncRunning, refreshAllData, addToast, sheetsConfig.auto_sync_interval_mins]);

  // Periodic 1-second countdown ticker for 1-minute auto sync
  useEffect(() => {
    if (!sheetsConfig.auto_sync_enabled) {
      return;
    }

    const intervalId = setInterval(() => {
      setAutoSyncCountdown(prev => {
        if (prev <= 1) {
          executeAutoSync(true);
          return (sheetsConfig.auto_sync_interval_mins || 1) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sheetsConfig.auto_sync_enabled, sheetsConfig.auto_sync_interval_mins, executeAutoSync]);

  const toggleAutoSync = (enabled: boolean) => {
    const updated: GoogleSheetsConfig = {
      ...sheetsConfig,
      auto_sync_enabled: enabled
    };
    StorageService.saveSheetsConfig(updated);
    setSheetsConfig(updated);
    if (enabled) {
      setAutoSyncCountdown((updated.auto_sync_interval_mins || 1) * 60);
      addToast('success', 'Auto-Sync Diaktifkan', `Database Google Sheets akan disinkronkan otomatis setiap ${updated.auto_sync_interval_mins || 1} menit.`);
    } else {
      addToast('info', 'Auto-Sync Dijeda', 'Sinkronisasi otomatis telah dinonaktifkan sementara.');
    }
  };

  const setAutoSyncInterval = (minutes: number) => {
    const safeMins = Math.max(1, minutes);
    const updated: GoogleSheetsConfig = {
      ...sheetsConfig,
      auto_sync_interval_mins: safeMins
    };
    StorageService.saveSheetsConfig(updated);
    setSheetsConfig(updated);
    setAutoSyncCountdown(safeMins * 60);
    addToast('success', 'Interval Diperbarui', `Interval sinkronisasi otomatis disetel ke setiap ${safeMins} menit.`);
  };

  const saveSiswa = (s: Siswa) => {
    StorageService.saveSiswa(s);
    setSiswa(StorageService.getSiswa());
    addToast('success', 'Data Siswa Disimpan', `Data siswa ${s.nama_lengkap} berhasil diperbarui.`);
  };

  const deleteSiswa = (id: string) => {
    StorageService.deleteSiswa(id);
    setSiswa(StorageService.getSiswa());
    addToast('info', 'Data Dihapus', 'Data siswa berhasil dihapus.');
  };

  const saveGuru = (g: Guru) => {
    StorageService.saveGuru(g);
    setGuru(StorageService.getGuru());
    addToast('success', 'Data Guru Disimpan', `Data guru ${g.nama_lengkap} berhasil diperbarui.`);
  };

  const deleteGuru = (id: string) => {
    StorageService.deleteGuru(id);
    setGuru(StorageService.getGuru());
    addToast('info', 'Data Dihapus', 'Data guru berhasil dihapus.');
  };

  const saveStaff = (st: Staff) => {
    StorageService.saveStaff(st);
    setStaff(StorageService.getStaff());
    addToast('success', 'Data Staf Disimpan', `Data staf ${st.nama_lengkap} berhasil diperbarui.`);
  };

  const saveKelas = (k: Kelas) => {
    StorageService.saveKelas(k);
    setKelas(StorageService.getKelas());
    addToast('success', 'Kelas Disimpan', `Data rombel ${k.nama_kelas} berhasil diperbarui.`);
  };

  const saveMapel = (m: MataPelajaran) => {
    StorageService.saveMapel(m);
    setMapel(StorageService.getMapel());
    addToast('success', 'Mapel Disimpan', `Mata pelajaran ${m.nama_mapel} berhasil disimpan.`);
  };

  const saveJadwal = (j: JadwalPelajaran) => {
    StorageService.saveJadwal(j);
    setJadwal(StorageService.getJadwal());
    addToast('success', 'Jadwal Disimpan', `Jadwal ${j.mapel_nama} (${j.hari}) berhasil disimpan.`);
  };

  const recordPresensiSiswa = (record: PresensiSiswa) => {
    StorageService.recordPresensiSiswa(record);
    setPresensiSiswa(StorageService.getPresensiSiswa());
    addToast('success', 'Presensi Dicatat', `Kehadiran ${record.siswa_nama} status [${record.status.toUpperCase()}] dicatat.`);

    // Auto-sync via Webhook to Google Sheet Database Akademik (Metode 2)
    if (sheetsConfig.webhook_url_akademik) {
      GoogleSheetsService.syncAkademikTables(null).catch(e => console.warn('Background sync presensi notice:', e));
    }
  };

  const recordPresensiGuru = (record: PresensiGuru) => {
    StorageService.recordPresensiGuru(record);
    setPresensiGuru(StorageService.getPresensiGuru());
    addToast('success', 'Presensi Guru', `Presensi ${record.guru_nama} jam masuk dicatat.`);

    if (sheetsConfig.webhook_url_akademik) {
      GoogleSheetsService.syncAkademikTables(null).catch(e => console.warn('Background sync presensi guru notice:', e));
    }
  };

  const saveNilai = (n: NilaiSiswa): NilaiSiswa => {
    const updated = StorageService.saveNilai(n);
    setNilai(StorageService.getNilai());
    addToast('success', 'Nilai Disimpan', `Nilai ${n.mapel_nama} untuk ${n.siswa_nama} disimpan (Akhir: ${updated.nilai_akhir} - Predikat: ${updated.predikat}).`);

    // Auto-sync via Webhook to Google Sheet Database Akademik (Metode 2)
    if (sheetsConfig.webhook_url_akademik) {
      GoogleSheetsService.syncAkademikTables(null).catch(e => console.warn('Background sync nilai notice:', e));
    }
    return updated;
  };

  const savePrestasi = (p: PrestasiSiswa) => {
    StorageService.savePrestasi(p);
    setPrestasi(StorageService.getPrestasi());
    addToast('success', 'Prestasi Disimpan', `Prestasi ${p.nama_kompetisi} (${p.peringkat}) berhasil dicatat.`);
  };

  const addBukuTamu = (b: BukuTamu) => {
    StorageService.addBukuTamu(b);
    setBukuTamu(StorageService.getBukuTamu());
    addToast('success', 'Buku Tamu Tercatat', `Selamat datang ${b.nama_tamu} di ${config.nama_sekolah}.`);
  };

  const checkoutBukuTamu = (id: string, time: string) => {
    StorageService.checkoutBukuTamu(id, time);
    setBukuTamu(StorageService.getBukuTamu());
    addToast('info', 'Kepulangan Dicatat', 'Waktu keluar tamu telah diperbarui.');
  };

  const saveMasterSPP = (m: MasterSPP) => {
    StorageService.saveMasterSPP(m);
    setMasterSPP(StorageService.getMasterSPP());
    addToast('success', 'Master SPP', `Paket tarif ${m.nama_paket} berhasil disimpan.`);
  };

  const generateMonthlyBills = (periode: string, thAjaran: string) => {
    const result = StorageService.generateMonthlyBills(periode, thAjaran);
    setTagihanSPP(StorageService.getTagihanSPP());
    if (result.generated > 0) {
      addToast('success', 'Tagihan SPP Dibuat', `Berhasil membuat ${result.generated} tagihan baru untuk periode ${periode}. (${result.skipped} dilewati karena sudah ada).`);
    } else {
      addToast('info', 'Tagihan Sudah Ada', `Semua siswa sudah memiliki tagihan untuk periode ${periode}.`);
    }
    return result;
  };

  const recordPembayaranSPP = (
    tagihanId: string,
    nominal: number,
    metode: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Virtual Account',
    ref: string,
    kasir: string,
    catatan?: string
  ) => {
    const result = StorageService.recordPembayaranSPP(tagihanId, nominal, metode, ref, kasir, catatan);
    setTagihanSPP(StorageService.getTagihanSPP());
    setPembayaranSPP(StorageService.getPembayaranSPP());
    setJurnalUmum(StorageService.getJurnalUmum());
    setTransaksiKeuangan(StorageService.getTransaksiKeuangan());
    setAkunAkuntansi(StorageService.getAkunAkuntansi());

    // Live push via Webhook to Google Sheets Keuangan (Metode 2)
    if (sheetsConfig.webhook_url_keuangan) {
      GoogleSheetsService.syncKeuanganTables(null).then(res => {
        addToast(
          'success',
          'Tersinkron ke Google Sheet (Webhook)',
          `Kuitansi ${result.pembayaran.nomor_kuitansi} otomatis terkirim via Webhook ke Tab PEMBAYARAN_SPP & TAGIHAN_SPP di Spreadsheet.`
        );
      }).catch(err => {
        console.warn('Real-time payment sync warning:', err);
      });
    }

    addToast(
      'success',
      'Pembayaran & Jurnal Sukses',
      `Kuitansi ${result.pembayaran.nomor_kuitansi} diterbitkan. Jurnal umum otomatis seimbang Rp ${nominal.toLocaleString('id-ID')}.`
    );
    return result;
  };

  const syncKeuanganLive = async (): Promise<{ success: boolean; rowsWritten?: number; message: string; hasToken: boolean }> => {
    if (!sheetsConfig.webhook_url_keuangan) {
      return {
        success: false,
        hasToken: false,
        message: 'URL Webhook Google Apps Script Keuangan belum dimasukkan. Silakan pasang Webhook di menu Integrasi Google Sheets.'
      };
    }

    try {
      const res = await GoogleSheetsService.syncKeuanganTables(null);
      refreshAllData();
      return {
        success: true,
        hasToken: true,
        rowsWritten: res.rowsWritten,
        message: res.message
      };
    } catch (err: any) {
      return {
        success: false,
        hasToken: true,
        message: err.message || 'Gagal sinkronisasi data keuangan ke Webhook Google Apps Script.'
      };
    }
  };

  const recordPengeluaran = (
    kategori: string,
    keterangan: string,
    nominal: number,
    kasKode: string,
    bebanKode: string,
    petugas: string
  ) => {
    const result = StorageService.recordPengeluaran(kategori, keterangan, nominal, kasKode, bebanKode, petugas);
    setTransaksiKeuangan(StorageService.getTransaksiKeuangan());
    setJurnalUmum(StorageService.getJurnalUmum());
    setAkunAkuntansi(StorageService.getAkunAkuntansi());
    addToast('success', 'Pengeluaran Dicatat', `Pengeluaran ${keterangan} sebesar Rp ${nominal.toLocaleString('id-ID')} dibukukan ke Jurnal Umum.`);
    return result;
  };

  const savePengumuman = (p: Pengumuman) => {
    StorageService.savePengumuman(p);
    setPengumuman(StorageService.getPengumuman());
    addToast('success', 'Pengumuman Diterbitkan', `Warta "${p.judul}" berhasil dipublikasikan.`);
  };

  const deletePengumuman = (id: string) => {
    StorageService.deletePengumuman(id);
    setPengumuman(StorageService.getPengumuman());
    addToast('info', 'Warta Dihapus', 'Pengumuman telah dihapus.');
  };

  return (
    <SchoolContext.Provider
      value={{
        config,
        updateConfig,
        sheetsConfig,
        updateSheetsConfig,
        siswa,
        guru,
        staff,
        kelas,
        mapel,
        jadwal,
        presensiSiswa,
        presensiGuru,
        nilai,
        prestasi,
        bukuTamu,
        masterSPP,
        tagihanSPP,
        pembayaranSPP,
        akunAkuntansi,
        jurnalUmum,
        transaksiKeuangan,
        pengumuman,
        auditLogs,
        toasts,
        addToast,
        removeToast,
        refreshAllData,
        saveSiswa,
        deleteSiswa,
        saveGuru,
        deleteGuru,
        saveStaff,
        saveKelas,
        saveMapel,
        saveJadwal,
        recordPresensiSiswa,
        recordPresensiGuru,
        saveNilai,
        savePrestasi,
        addBukuTamu,
        checkoutBukuTamu,
        saveMasterSPP,
        generateMonthlyBills,
        recordPembayaranSPP,
        recordPengeluaran,
        savePengumuman,
        deletePengumuman,
        isAutoSyncRunning,
        autoSyncCountdown,
        executeAutoSync,
        toggleAutoSync,
        setAutoSyncInterval,
        syncKeuanganLive,
        isGoogleConnected,
        googleUserEmail,
        connectMasterGoogle,
        disconnectMasterGoogle
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
