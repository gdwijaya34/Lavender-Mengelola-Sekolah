import {
  User,
  Siswa,
  Guru,
  Staff,
  OrangTua,
  RelasiOrtuSiswa,
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

import {
  INITIAL_USERS,
  INITIAL_SISWA,
  INITIAL_GURU,
  INITIAL_STAFF,
  INITIAL_ORANG_TUA,
  INITIAL_RELASI_ORTU,
  INITIAL_KELAS,
  INITIAL_MAPEL,
  INITIAL_JADWAL,
  INITIAL_PRESENSI_SISWA,
  INITIAL_PRESENSI_GURU,
  INITIAL_NILAI,
  INITIAL_PRESTASI,
  INITIAL_BUKU_TAMU,
  INITIAL_MASTER_SPP,
  INITIAL_TAGIHAN_SPP,
  INITIAL_PEMBAYARAN_SPP,
  INITIAL_AKUN_AKUNTANSI,
  INITIAL_JURNAL_UMUM,
  INITIAL_TRANSAKSI_KEUANGAN,
  INITIAL_PENGUMUMAN,
  INITIAL_AUDIT_LOGS,
  INITIAL_SCHOOL_CONFIG,
  INITIAL_SHEETS_CONFIG
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'sim_users',
  SISWA: 'sim_siswa',
  GURU: 'sim_guru',
  STAFF: 'sim_staff',
  ORANG_TUA: 'sim_orang_tua',
  RELASI_ORTU: 'sim_relasi_ortu',
  KELAS: 'sim_kelas',
  MAPEL: 'sim_mapel',
  JADWAL: 'sim_jadwal',
  PRESENSI_SISWA: 'sim_presensi_siswa',
  PRESENSI_GURU: 'sim_presensi_guru',
  NILAI: 'sim_nilai',
  PRESTASI: 'sim_prestasi',
  BUKU_TAMU: 'sim_buku_tamu',
  MASTER_SPP: 'sim_master_spp',
  TAGIHAN_SPP: 'sim_tagihan_spp',
  PEMBAYARAN_SPP: 'sim_pembayaran_spp',
  AKUN_AKUNTANSI: 'sim_akun_akuntansi',
  JURNAL_UMUM: 'sim_jurnal_umum',
  TRANSAKSI_KEUANGAN: 'sim_transaksi_keuangan',
  PENGUMUMAN: 'sim_pengumuman',
  AUDIT_LOGS: 'sim_audit_logs',
  SCHOOL_CONFIG: 'sim_school_config',
  SHEETS_CONFIG: 'sim_sheets_config'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Initialization
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetAllData();
    }
  },

  resetAllData() {
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.SISWA, INITIAL_SISWA);
    setItem(STORAGE_KEYS.GURU, INITIAL_GURU);
    setItem(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    setItem(STORAGE_KEYS.ORANG_TUA, INITIAL_ORANG_TUA);
    setItem(STORAGE_KEYS.RELASI_ORTU, INITIAL_RELASI_ORTU);
    setItem(STORAGE_KEYS.KELAS, INITIAL_KELAS);
    setItem(STORAGE_KEYS.MAPEL, INITIAL_MAPEL);
    setItem(STORAGE_KEYS.JADWAL, INITIAL_JADWAL);
    setItem(STORAGE_KEYS.PRESENSI_SISWA, INITIAL_PRESENSI_SISWA);
    setItem(STORAGE_KEYS.PRESENSI_GURU, INITIAL_PRESENSI_GURU);
    setItem(STORAGE_KEYS.NILAI, INITIAL_NILAI);
    setItem(STORAGE_KEYS.PRESTASI, INITIAL_PRESTASI);
    setItem(STORAGE_KEYS.BUKU_TAMU, INITIAL_BUKU_TAMU);
    setItem(STORAGE_KEYS.MASTER_SPP, INITIAL_MASTER_SPP);
    setItem(STORAGE_KEYS.TAGIHAN_SPP, INITIAL_TAGIHAN_SPP);
    setItem(STORAGE_KEYS.PEMBAYARAN_SPP, INITIAL_PEMBAYARAN_SPP);
    setItem(STORAGE_KEYS.AKUN_AKUNTANSI, INITIAL_AKUN_AKUNTANSI);
    setItem(STORAGE_KEYS.JURNAL_UMUM, INITIAL_JURNAL_UMUM);
    setItem(STORAGE_KEYS.TRANSAKSI_KEUANGAN, INITIAL_TRANSAKSI_KEUANGAN);
    setItem(STORAGE_KEYS.PENGUMUMAN, INITIAL_PENGUMUMAN);
    setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setItem(STORAGE_KEYS.SCHOOL_CONFIG, INITIAL_SCHOOL_CONFIG);
    setItem(STORAGE_KEYS.SHEETS_CONFIG, INITIAL_SHEETS_CONFIG);
  },

  // Config & Branding
  getSchoolConfig(): PengaturanSekolah {
    return getItem(STORAGE_KEYS.SCHOOL_CONFIG, INITIAL_SCHOOL_CONFIG);
  },
  saveSchoolConfig(config: PengaturanSekolah) {
    setItem(STORAGE_KEYS.SCHOOL_CONFIG, config);
  },

  // Sheets Config
  getSheetsConfig(): GoogleSheetsConfig {
    const config = getItem<GoogleSheetsConfig>(STORAGE_KEYS.SHEETS_CONFIG, INITIAL_SHEETS_CONFIG);
    let updated = false;
    if (!config.spreadsheet_id_akademik || config.spreadsheet_id_akademik.includes('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')) {
      config.spreadsheet_id_akademik = '13ohWc_DhrKXXogQnK2JWwxQfGYwo0KVV5gu20cfAt68';
      config.spreadsheet_id_keuangan = '17vf-FEBzvboyiESP7QFKvP7dIUwT6XiChCOIQuuOJm0';
      updated = true;
    }
    if (config.auto_sync_enabled === undefined) {
      config.auto_sync_enabled = true;
      updated = true;
    }
    if (config.auto_sync_interval_mins === undefined || config.auto_sync_interval_mins === 15) {
      config.auto_sync_interval_mins = 1; // Default ke 1 menit sesuai permintaan pengguna
      updated = true;
    }
    if (updated) {
      this.saveSheetsConfig(config);
    }
    return config;
  },
  saveSheetsConfig(config: GoogleSheetsConfig) {
    setItem(STORAGE_KEYS.SHEETS_CONFIG, config);
  },

  // Users
  getUsers(): User[] {
    const list = getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    let hasBackfilled = false;
    const verified = list.map(u => {
      if (!u.password) {
        hasBackfilled = true;
        const initial = INITIAL_USERS.find(iu => iu.user_id === u.user_id || iu.username === u.username);
        return {
          ...u,
          password: initial?.password || `${u.username}123`
        };
      }
      return u;
    });

    if (hasBackfilled) {
      setItem(STORAGE_KEYS.USERS, verified);
    }
    return verified;
  },
  saveUser(user: User) {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.user_id === user.user_id);
    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.push(user);
    }
    setItem(STORAGE_KEYS.USERS, list);
  },
  deleteUser(userId: string) {
    const list = this.getUsers().filter(u => u.user_id !== userId);
    setItem(STORAGE_KEYS.USERS, list);
  },

  // Siswa
  getSiswa(): Siswa[] {
    return getItem(STORAGE_KEYS.SISWA, INITIAL_SISWA);
  },
  saveSiswa(siswa: Siswa) {
    const list = this.getSiswa();
    const idx = list.findIndex(s => s.siswa_id === siswa.siswa_id);
    if (idx >= 0) {
      list[idx] = siswa;
    } else {
      list.push(siswa);
    }
    setItem(STORAGE_KEYS.SISWA, list);
  },
  deleteSiswa(siswaId: string) {
    const list = this.getSiswa().filter(s => s.siswa_id !== siswaId);
    setItem(STORAGE_KEYS.SISWA, list);
  },

  // Guru
  getGuru(): Guru[] {
    return getItem(STORAGE_KEYS.GURU, INITIAL_GURU);
  },
  saveGuru(guru: Guru) {
    const list = this.getGuru();
    const idx = list.findIndex(g => g.guru_id === guru.guru_id);
    if (idx >= 0) {
      list[idx] = guru;
    } else {
      list.push(guru);
    }
    setItem(STORAGE_KEYS.GURU, list);
  },
  deleteGuru(guruId: string) {
    const list = this.getGuru().filter(g => g.guru_id !== guruId);
    setItem(STORAGE_KEYS.GURU, list);
  },

  // Staff
  getStaff(): Staff[] {
    return getItem(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },
  saveStaff(staff: Staff) {
    const list = this.getStaff();
    const idx = list.findIndex(s => s.staff_id === staff.staff_id);
    if (idx >= 0) {
      list[idx] = staff;
    } else {
      list.push(staff);
    }
    setItem(STORAGE_KEYS.STAFF, list);
  },
  deleteStaff(staffId: string) {
    const list = this.getStaff().filter(s => s.staff_id !== staffId);
    setItem(STORAGE_KEYS.STAFF, list);
  },

  // Orang Tua
  getOrangTua(): OrangTua[] {
    return getItem(STORAGE_KEYS.ORANG_TUA, INITIAL_ORANG_TUA);
  },
  saveOrangTua(ortu: OrangTua) {
    const list = this.getOrangTua();
    const idx = list.findIndex(o => o.ortu_id === ortu.ortu_id);
    if (idx >= 0) {
      list[idx] = ortu;
    } else {
      list.push(ortu);
    }
    setItem(STORAGE_KEYS.ORANG_TUA, list);
  },
  deleteOrangTua(ortuId: string) {
    const list = this.getOrangTua().filter(o => o.ortu_id !== ortuId);
    setItem(STORAGE_KEYS.ORANG_TUA, list);
    const relasi = this.getRelasiOrtuSiswa().filter(r => r.ortu_id !== ortuId);
    setItem(STORAGE_KEYS.RELASI_ORTU, relasi);
  },

  // Relasi Penghubung Orang Tua & Siswa
  getRelasiOrtuSiswa(): RelasiOrtuSiswa[] {
    return getItem(STORAGE_KEYS.RELASI_ORTU, INITIAL_RELASI_ORTU);
  },
  saveRelasiOrtuSiswa(relasi: RelasiOrtuSiswa) {
    const list = this.getRelasiOrtuSiswa();
    const idx = list.findIndex(r => r.id === relasi.id || (r.ortu_id === relasi.ortu_id && r.siswa_id === relasi.siswa_id));
    if (idx >= 0) {
      list[idx] = relasi;
    } else {
      list.push(relasi);
    }
    setItem(STORAGE_KEYS.RELASI_ORTU, list);
  },
  deleteRelasiOrtuSiswa(id: string) {
    const list = this.getRelasiOrtuSiswa().filter(r => r.id !== id);
    setItem(STORAGE_KEYS.RELASI_ORTU, list);
  },

  // Kelas
  getKelas(): Kelas[] {
    return getItem(STORAGE_KEYS.KELAS, INITIAL_KELAS);
  },
  saveKelas(k: Kelas) {
    const list = this.getKelas();
    const idx = list.findIndex(item => item.kelas_id === k.kelas_id);
    if (idx >= 0) {
      list[idx] = k;
    } else {
      list.push(k);
    }
    setItem(STORAGE_KEYS.KELAS, list);
  },

  // Mapel
  getMapel(): MataPelajaran[] {
    return getItem(STORAGE_KEYS.MAPEL, INITIAL_MAPEL);
  },
  saveMapel(m: MataPelajaran) {
    const list = this.getMapel();
    const idx = list.findIndex(item => item.mapel_id === m.mapel_id);
    if (idx >= 0) {
      list[idx] = m;
    } else {
      list.push(m);
    }
    setItem(STORAGE_KEYS.MAPEL, list);
  },

  // Jadwal
  getJadwal(): JadwalPelajaran[] {
    return getItem(STORAGE_KEYS.JADWAL, INITIAL_JADWAL);
  },
  saveJadwal(j: JadwalPelajaran) {
    const list = this.getJadwal();
    const idx = list.findIndex(item => item.jadwal_id === j.jadwal_id);
    if (idx >= 0) {
      list[idx] = j;
    } else {
      list.push(j);
    }
    setItem(STORAGE_KEYS.JADWAL, list);
  },

  // Presensi Siswa
  getPresensiSiswa(): PresensiSiswa[] {
    return getItem(STORAGE_KEYS.PRESENSI_SISWA, INITIAL_PRESENSI_SISWA);
  },
  recordPresensiSiswa(record: PresensiSiswa) {
    const list = this.getPresensiSiswa();
    // check if already recorded for this student on same date
    const idx = list.findIndex(p => p.siswa_id === record.siswa_id && p.tanggal === record.tanggal);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    setItem(STORAGE_KEYS.PRESENSI_SISWA, list);
  },

  // Presensi Guru
  getPresensiGuru(): PresensiGuru[] {
    return getItem(STORAGE_KEYS.PRESENSI_GURU, INITIAL_PRESENSI_GURU);
  },
  recordPresensiGuru(record: PresensiGuru) {
    const list = this.getPresensiGuru();
    const idx = list.findIndex(p => p.guru_id === record.guru_id && p.tanggal === record.tanggal);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    setItem(STORAGE_KEYS.PRESENSI_GURU, list);
  },

  // Nilai
  getNilai(): NilaiSiswa[] {
    return getItem(STORAGE_KEYS.NILAI, INITIAL_NILAI);
  },
  saveNilai(n: NilaiSiswa) {
    const config = this.getSchoolConfig();
    // Calculate final score using configured weights
    const finalScore = Number((
      (n.tugas * (config.bobot_tugas / 100)) +
      (n.kuis * (config.bobot_kuis / 100)) +
      (n.praktik * (config.bobot_praktik / 100)) +
      (n.ujian * (config.bobot_ujian / 100))
    ).toFixed(1));

    let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 88) predikat = 'A';
    else if (finalScore >= 75) predikat = 'B';
    else if (finalScore >= 65) predikat = 'C';

    const calculated: NilaiSiswa = {
      ...n,
      nilai_akhir: finalScore,
      predikat,
      updated_at: new Date().toISOString()
    };

    const list = this.getNilai();
    const idx = list.findIndex(item => item.nilai_id === calculated.nilai_id);
    if (idx >= 0) {
      list[idx] = calculated;
    } else {
      list.push(calculated);
    }
    setItem(STORAGE_KEYS.NILAI, list);
    return calculated;
  },

  // Prestasi
  getPrestasi(): PrestasiSiswa[] {
    return getItem(STORAGE_KEYS.PRESTASI, INITIAL_PRESTASI);
  },
  savePrestasi(prestasi: PrestasiSiswa) {
    const list = this.getPrestasi();
    const idx = list.findIndex(p => p.prestasi_id === prestasi.prestasi_id);
    if (idx >= 0) {
      list[idx] = prestasi;
    } else {
      list.unshift(prestasi);
    }
    setItem(STORAGE_KEYS.PRESTASI, list);
  },

  // Buku Tamu
  getBukuTamu(): BukuTamu[] {
    return getItem(STORAGE_KEYS.BUKU_TAMU, INITIAL_BUKU_TAMU);
  },
  addBukuTamu(entry: BukuTamu) {
    const list = this.getBukuTamu();
    list.unshift(entry);
    setItem(STORAGE_KEYS.BUKU_TAMU, list);
  },
  checkoutBukuTamu(tamuId: string, waktuKeluar: string) {
    const list = this.getBukuTamu();
    const idx = list.findIndex(t => t.tamu_id === tamuId);
    if (idx >= 0) {
      list[idx].waktu_keluar = waktuKeluar;
      setItem(STORAGE_KEYS.BUKU_TAMU, list);
    }
  },

  // Master SPP
  getMasterSPP(): MasterSPP[] {
    return getItem(STORAGE_KEYS.MASTER_SPP, INITIAL_MASTER_SPP);
  },
  saveMasterSPP(spp: MasterSPP) {
    const list = this.getMasterSPP();
    const idx = list.findIndex(item => item.spp_id === spp.spp_id);
    if (idx >= 0) {
      list[idx] = spp;
    } else {
      list.push(spp);
    }
    setItem(STORAGE_KEYS.MASTER_SPP, list);
  },

  // Tagihan SPP
  getTagihanSPP(): TagihanSPP[] {
    return getItem(STORAGE_KEYS.TAGIHAN_SPP, INITIAL_TAGIHAN_SPP);
  },
  saveTagihanSPP(t: TagihanSPP) {
    const list = this.getTagihanSPP();
    const idx = list.findIndex(item => item.tagihan_id === t.tagihan_id);
    if (idx >= 0) {
      list[idx] = t;
    } else {
      list.push(t);
    }
    setItem(STORAGE_KEYS.TAGIHAN_SPP, list);
  },

  // Automated Monthly SPP Bill Generator
  generateMonthlyBills(periodeBulan: string, tahunAjaran: string): { generated: number; skipped: number } {
    const siswaList = this.getSiswa().filter(s => s.status === 'aktif');
    const kelasList = this.getKelas();
    const masterSPPList = this.getMasterSPP();
    const existingBills = this.getTagihanSPP();

    let generated = 0;
    let skipped = 0;

    for (const siswa of siswaList) {
      // Check if bill already exists for this student and period
      const exists = existingBills.some(
        b => b.siswa_id === siswa.siswa_id && b.periode_bulan.toLowerCase() === periodeBulan.toLowerCase()
      );

      if (exists) {
        skipped++;
        continue;
      }

      const kelas = kelasList.find(k => k.kelas_id === siswa.kelas_id);
      const tingkat = kelas ? kelas.tingkat : '10';
      const jurusan = kelas ? kelas.jurusan : 'MIPA';

      // Find matching master SPP
      const master = masterSPPList.find(m => m.tingkat === tingkat && m.jurusan === jurusan) || masterSPPList[0];
      const nominal = master ? master.nominal_per_bulan : 800000;

      const newBill: TagihanSPP = {
        tagihan_id: `TGH-${Date.now().toString().slice(-6)}-${siswa.siswa_id}`,
        siswa_id: siswa.siswa_id,
        siswa_nama: siswa.nama_lengkap,
        kelas_nama: kelas ? kelas.nama_kelas : 'Kelas',
        periode_bulan: periodeBulan,
        tahun_ajaran: tahunAjaran,
        nominal_pokok: nominal,
        diskon_beasiswa: 0,
        denda: 0,
        total_tagihan: nominal,
        total_terbayar: 0,
        sisa_tagihan: nominal,
        status: 'belum_dibayar',
        jatuh_tempo: '2026-11-10',
        created_at: new Date().toISOString()
      };

      existingBills.unshift(newBill);
      generated++;
    }

    setItem(STORAGE_KEYS.TAGIHAN_SPP, existingBills);
    return { generated, skipped };
  },

  // Pembayaran SPP & Automatic Double-Entry Journaling
  getPembayaranSPP(): PembayaranSPP[] {
    return getItem(STORAGE_KEYS.PEMBAYARAN_SPP, INITIAL_PEMBAYARAN_SPP);
  },

  recordPembayaranSPP(
    tagihanId: string,
    nominalBayar: number,
    metode: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Virtual Account',
    referensi: string,
    kasirNama: string,
    catatan?: string
  ): { pembayaran: PembayaranSPP; jurnal: JurnalUmum } {
    const bills = this.getTagihanSPP();
    const billIdx = bills.findIndex(b => b.tagihan_id === tagihanId);
    if (billIdx === -1) {
      throw new Error('Tagihan tidak ditemukan');
    }

    const bill = bills[billIdx];
    const newTerbayar = bill.total_terbayar + nominalBayar;
    const newSisa = Math.max(0, bill.total_tagihan - newTerbayar);
    const newStatus = newSisa === 0 ? 'lunas' : 'dibayar_sebagian';

    bills[billIdx] = {
      ...bill,
      total_terbayar: newTerbayar,
      sisa_tagihan: newSisa,
      status: newStatus
    };
    setItem(STORAGE_KEYS.TAGIHAN_SPP, bills);

    // Generate Kuitansi ID & Jurnal ID
    const paymentId = `PBY-${Date.now().toString().slice(-8)}`;
    const kuitansiNo = `KWT/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;
    const jurnalId = `JRN-${Date.now().toString().slice(-8)}`;

    const payment: PembayaranSPP = {
      pembayaran_id: paymentId,
      nomor_kuitansi: kuitansiNo,
      tagihan_id: bill.tagihan_id,
      siswa_id: bill.siswa_id,
      siswa_nama: bill.siswa_nama,
      kelas_nama: bill.kelas_nama,
      periode_bulan: bill.periode_bulan,
      nominal_bayar: nominalBayar,
      metode_pembayaran: metode,
      nomor_referensi: referensi || `REF-${Date.now().toString().slice(-6)}`,
      tanggal_pembayaran: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      kasir_nama: kasirNama,
      catatan,
      jurnal_id: jurnalId
    };

    const paymentList = this.getPembayaranSPP();
    paymentList.unshift(payment);
    setItem(STORAGE_KEYS.PEMBAYARAN_SPP, paymentList);

    // AUTOMATED DOUBLE-ENTRY JOURNAL:
    // Debit: Kas (if Tunai) or Bank BSI (if Transfer/QRIS/VA)
    // Credit: Piutang SPP Siswa (Akun 112-01)
    const debitAccountCode = metode === 'Tunai' ? '111-01' : '111-02';
    const debitAccountName = metode === 'Tunai' ? 'Kas Operasional Tunai' : 'Bank BSI Rekening Yayasan';

    const jurnal: JurnalUmum = {
      jurnal_id: jurnalId,
      nomor_jurnal: `JU/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
      tanggal: new Date().toISOString().split('T')[0],
      referensi: kuitansiNo,
      keterangan: `Penerimaan SPP ${bill.periode_bulan} - ${bill.siswa_nama} (${metode})`,
      total_debit: nominalBayar,
      total_kredit: nominalBayar,
      is_balanced: true,
      detail: [
        { kode_akun: debitAccountCode, nama_akun: debitAccountName, debit: nominalBayar, kredit: 0 },
        { kode_akun: '112-01', nama_akun: 'Piutang SPP Siswa', debit: 0, kredit: nominalBayar }
      ],
      created_at: new Date().toISOString()
    };

    const journals = this.getJurnalUmum();
    journals.unshift(jurnal);
    setItem(STORAGE_KEYS.JURNAL_UMUM, journals);

    // Record as Financial Transaction as well
    const transactions = this.getTransaksiKeuangan();
    transactions.unshift({
      transaksi_id: `TRX-${Date.now().toString().slice(-6)}`,
      nomor_bukti: kuitansiNo,
      tanggal: new Date().toISOString().split('T')[0],
      tipe: 'pemasukan',
      kategori: 'SPP Siswa',
      keterangan: `Penerimaan SPP ${bill.periode_bulan} - ${bill.siswa_nama}`,
      nominal: nominalBayar,
      akun_kas: debitAccountName,
      dibuat_oleh: kasirNama,
      jurnal_id: jurnalId
    });
    setItem(STORAGE_KEYS.TRANSAKSI_KEUANGAN, transactions);

    // Update account balances
    this.updateAccountBalance(debitAccountCode, nominalBayar, 0);
    this.updateAccountBalance('112-01', 0, nominalBayar);

    return { pembayaran: payment, jurnal };
  },

  // Record General Expense with Automated Journal
  recordPengeluaran(
    kategori: string,
    keterangan: string,
    nominal: number,
    akunKasKode: string,
    bebanAkunKode: string,
    petugas: string
  ): { transaksi: TransaksiKeuangan; jurnal: JurnalUmum } {
    const buktiNo = `BKK/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;
    const jurnalId = `JRN-${Date.now().toString().slice(-8)}`;

    const accounts = this.getAkunAkuntansi();
    const kasAccount = accounts.find(a => a.kode_akun === akunKasKode) || accounts[0];
    const bebanAccount = accounts.find(a => a.kode_akun === bebanAkunKode) || accounts.find(a => a.tipe === 'Beban') || accounts[accounts.length - 1];

    const transaksi: TransaksiKeuangan = {
      transaksi_id: `TRX-${Date.now().toString().slice(-6)}`,
      nomor_bukti: buktiNo,
      tanggal: new Date().toISOString().split('T')[0],
      tipe: 'pengeluaran',
      kategori,
      keterangan,
      nominal,
      akun_kas: kasAccount.nama_akun,
      dibuat_oleh: petugas,
      jurnal_id: jurnalId
    };

    const trxList = this.getTransaksiKeuangan();
    trxList.unshift(transaksi);
    setItem(STORAGE_KEYS.TRANSAKSI_KEUANGAN, trxList);

    // Double-entry journal:
    // Debit: Beban
    // Credit: Kas/Bank
    const jurnal: JurnalUmum = {
      jurnal_id: jurnalId,
      nomor_jurnal: `JU/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
      tanggal: new Date().toISOString().split('T')[0],
      referensi: buktiNo,
      keterangan,
      total_debit: nominal,
      total_kredit: nominal,
      is_balanced: true,
      detail: [
        { kode_akun: bebanAccount.kode_akun, nama_akun: bebanAccount.nama_akun, debit: nominal, kredit: 0 },
        { kode_akun: kasAccount.kode_akun, nama_akun: kasAccount.nama_akun, debit: 0, kredit: nominal }
      ],
      created_at: new Date().toISOString()
    };

    const jrnList = this.getJurnalUmum();
    jrnList.unshift(jurnal);
    setItem(STORAGE_KEYS.JURNAL_UMUM, jrnList);

    // Update balances
    this.updateAccountBalance(bebanAccount.kode_akun, nominal, 0);
    this.updateAccountBalance(kasAccount.kode_akun, 0, nominal);

    return { transaksi, jurnal };
  },

  // Accounting & COA
  getAkunAkuntansi(): AkunAkuntansi[] {
    return getItem(STORAGE_KEYS.AKUN_AKUNTANSI, INITIAL_AKUN_AKUNTANSI);
  },
  saveAkunAkuntansi(akun: AkunAkuntansi) {
    const list = this.getAkunAkuntansi();
    const idx = list.findIndex(a => a.kode_akun === akun.kode_akun);
    if (idx >= 0) {
      list[idx] = akun;
    } else {
      list.push(akun);
    }
    setItem(STORAGE_KEYS.AKUN_AKUNTANSI, list);
  },
  updateAccountBalance(kodeAkun: string, debitAmount: number, creditAmount: number) {
    const list = this.getAkunAkuntansi();
    const idx = list.findIndex(a => a.kode_akun === kodeAkun);
    if (idx >= 0) {
      const acc = list[idx];
      if (acc.posisi_normal === 'Debit') {
        acc.saldo_berjalan += (debitAmount - creditAmount);
      } else {
        acc.saldo_berjalan += (creditAmount - debitAmount);
      }
      setItem(STORAGE_KEYS.AKUN_AKUNTANSI, list);
    }
  },

  getJurnalUmum(): JurnalUmum[] {
    return getItem(STORAGE_KEYS.JURNAL_UMUM, INITIAL_JURNAL_UMUM);
  },
  getTransaksiKeuangan(): TransaksiKeuangan[] {
    return getItem(STORAGE_KEYS.TRANSAKSI_KEUANGAN, INITIAL_TRANSAKSI_KEUANGAN);
  },

  // Pengumuman
  getPengumuman(): Pengumuman[] {
    return getItem(STORAGE_KEYS.PENGUMUMAN, INITIAL_PENGUMUMAN);
  },
  savePengumuman(p: Pengumuman) {
    const list = this.getPengumuman();
    const idx = list.findIndex(item => item.pengumuman_id === p.pengumuman_id);
    if (idx >= 0) {
      list[idx] = p;
    } else {
      list.unshift(p);
    }
    setItem(STORAGE_KEYS.PENGUMUMAN, list);
  },
  deletePengumuman(id: string) {
    const list = this.getPengumuman().filter(p => p.pengumuman_id !== id);
    setItem(STORAGE_KEYS.PENGUMUMAN, list);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(entry: Omit<AuditLog, 'log_id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...entry,
      log_id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200)); // keep last 200
  }
};
