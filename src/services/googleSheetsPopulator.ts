import { StorageService } from './storageService';
import {
  fetchSpreadsheetInfo,
  createMissingSheets,
  writeSheetData
} from './googleAuthService';
import {
  INITIAL_ORANG_TUA,
  INITIAL_RELASI_ORTU
} from '../data/mockData';

export interface PopulateProgress {
  currentTab: string;
  spreadsheet: 'AKADEMIK' | 'KEUANGAN';
  currentStep: number;
  totalSteps: number;
  message: string;
}

export const GoogleSheetsPopulator = {
  // Returns all tables formatted as [headers, ...rows]
  getAkademikData(): Record<string, any[][]> {
    const users = StorageService.getUsers();
    const siswa = StorageService.getSiswa();
    const guru = StorageService.getGuru();
    const staff = StorageService.getStaff();
    const kelas = StorageService.getKelas();
    const mapel = StorageService.getMapel();
    const jadwal = StorageService.getJadwal();
    const presensiSiswa = StorageService.getPresensiSiswa();
    const presensiGuru = StorageService.getPresensiGuru();
    const nilai = StorageService.getNilai();
    const prestasi = StorageService.getPrestasi();
    const bukuTamu = StorageService.getBukuTamu();
    const pengumuman = StorageService.getPengumuman();
    const config = StorageService.getSchoolConfig();
    const logs = StorageService.getAuditLogs().filter(l => l.modul !== 'Keuangan');

    return {
      USERS: [
        ['user_id', 'username', 'email', 'password', 'nama_lengkap', 'role_id', 'reference_id', 'status', 'created_at'],
        ...users.map(u => [u.user_id, u.username, u.email, u.password || 'password123', u.nama_lengkap, u.role_id, u.reference_id, u.status, u.created_at])
      ],
      ROLES: [
        ['role_id', 'nama_role', 'level_akses', 'deskripsi'],
        ['admin_sekolah', 'Admin Sekolah (Super Admin)', '1', 'Akses penuh seluruh modul sekolah'],
        ['admin_keuangan', 'Admin Keuangan (Bendahara)', '2', 'Akses pengelolaan SPP, kas, kuitansi, dan akuntansi'],
        ['admin_akademik', 'Admin Akademik (Kurikulum)', '2', 'Akses data siswa, guru, rombel, mapel, dan kuncian nilai'],
        ['staff_piket', 'Staff Piket & Resepsionis', '3', 'Akses presensi harian siswa, guru, dan buku tamu digital'],
        ['guru', 'Guru Mata Pelajaran', '4', 'Akses jadwal mengajar, input nilai siswa, dan catatan binaan'],
        ['siswa', 'Peserta Didik (Siswa)', '5', 'Akses pribadi melihat rapor, jadwal, presensi, & tagihan SPP'],
        ['orang_tua', 'Orang Tua / Wali Murid', '5', 'Akses pemantauan kehadiran, nilai, dan kuitansi anak']
      ],
      SISWA: [
        ['siswa_id', 'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kelas_id', 'tahun_ajaran', 'status', 'nama_ortu', 'kontak_ortu', 'alamat'],
        ...siswa.map(s => [s.siswa_id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin, s.tempat_lahir, s.tanggal_lahir, s.kelas_id, s.tahun_ajaran, s.status, s.nama_ortu, s.kontak_ortu, s.alamat])
      ],
      GURU: [
        ['guru_id', 'nip', 'nama_lengkap', 'jenis_kelamin', 'mapel_utama', 'email', 'kontak', 'status_kepegawaian'],
        ...guru.map(g => [g.guru_id, g.nip, g.nama_lengkap, g.jenis_kelamin, g.mapel_utama, g.email, g.kontak, g.status_kepegawaian])
      ],
      STAFF: [
        ['staff_id', 'nama_lengkap', 'jabatan', 'divisi', 'kontak', 'status'],
        ...staff.map(st => [st.staff_id, st.nama_lengkap, st.jabatan, st.divisi, st.kontak, st.status])
      ],
      ORANG_TUA: [
        ['ortu_id', 'nama_lengkap', 'hubungan', 'pekerjaan', 'kontak', 'email', 'alamat'],
        ...INITIAL_ORANG_TUA.map(o => [o.ortu_id, o.nama_lengkap, o.hubungan, o.pekerjaan, o.kontak, o.email, o.alamat])
      ],
      RELASI_ORANG_TUA_SISWA: [
        ['id', 'ortu_id', 'siswa_id', 'status_verifikasi'],
        ...INITIAL_RELASI_ORTU.map(r => [r.id, r.ortu_id, r.siswa_id, r.status_verifikasi])
      ],
      KELAS: [
        ['kelas_id', 'nama_kelas', 'tingkat', 'jurusan', 'wali_kelas_id', 'wali_kelas_nama', 'kapasitas', 'tahun_ajaran'],
        ...kelas.map(k => [k.kelas_id, k.nama_kelas, k.tingkat, k.jurusan, k.wali_kelas_id, k.wali_kelas_nama, k.kapasitas, k.tahun_ajaran])
      ],
      MATA_PELAJARAN: [
        ['mapel_id', 'kode_mapel', 'nama_mapel', 'kategori', 'kkm', 'beban_jam'],
        ...mapel.map(m => [m.mapel_id, m.kode_mapel, m.nama_mapel, m.kategori, m.kkm, m.beban_jam])
      ],
      JADWAL: [
        ['jadwal_id', 'kelas_id', 'mapel_id', 'mapel_nama', 'guru_id', 'guru_nama', 'hari', 'jam_mulai', 'jam_selesai', 'ruang'],
        ...jadwal.map(j => [j.jadwal_id, j.kelas_id, j.mapel_id, j.mapel_nama, j.guru_id, j.guru_nama, j.hari, j.jam_mulai, j.jam_selesai, j.ruang])
      ],
      PRESENSI_SISWA: [
        ['presensi_id', 'siswa_id', 'siswa_nama', 'kelas_id', 'tanggal', 'status', 'menit_terlambat', 'keterangan', 'diinput_oleh'],
        ...presensiSiswa.map(p => [p.presensi_id, p.siswa_id, p.siswa_nama, p.kelas_id, p.tanggal, p.status, p.menit_terlambat || '', p.keterangan || '', p.diinput_oleh])
      ],
      PRESENSI_GURU: [
        ['presensi_id', 'guru_id', 'guru_nama', 'tanggal', 'jam_masuk', 'jam_pulang', 'status', 'keterangan'],
        ...presensiGuru.map(p => [p.presensi_id, p.guru_id, p.guru_nama, p.tanggal, p.jam_masuk, p.jam_pulang || '', p.status, p.keterangan || ''])
      ],
      NILAI: [
        ['nilai_id', 'siswa_id', 'siswa_nama', 'kelas_id', 'mapel_id', 'mapel_nama', 'semester', 'tahun_ajaran', 'tugas', 'kuis', 'praktik', 'ujian', 'nilai_akhir', 'predikat'],
        ...nilai.map(n => [n.nilai_id, n.siswa_id, n.siswa_nama, n.kelas_id, n.mapel_id, n.mapel_nama, n.semester, n.tahun_ajaran, n.tugas, n.kuis, n.praktik, n.ujian, n.nilai_akhir, n.predikat])
      ],
      KOMPONEN_NILAI: [
        ['komponen_id', 'nama_komponen', 'bobot_persen', 'keterangan'],
        ['KMP-01', 'Tugas Terstruktur', config.bobot_tugas, 'Tugas mandiri dan portofolio'],
        ['KMP-02', 'Kuis Harian', config.bobot_kuis, 'Kuis cepat pemahaman materi'],
        ['KMP-03', 'Praktikum & Proyek', config.bobot_praktik, 'Eksperimen laboratorium dan karya'],
        ['KMP-04', 'Ujian Semester (PAS/PAT)', config.bobot_ujian, 'Asesmen sumatif akhir semester']
      ],
      PRESTASI: [
        ['prestasi_id', 'siswa_id', 'siswa_nama', 'kelas_nama', 'jenis_prestasi', 'bidang', 'tingkat', 'nama_kompetisi', 'penyelenggara', 'peringkat', 'tanggal', 'deskripsi', 'tampilkan_di_web'],
        ...prestasi.map(p => [p.prestasi_id, p.siswa_id, p.siswa_nama, p.kelas_nama, p.jenis_prestasi, p.bidang, p.tingkat, p.nama_kompetisi, p.penyelenggara, p.peringkat, p.tanggal, p.deskripsi, p.tampilkan_di_web ? 'YA' : 'TIDAK'])
      ],
      BUKU_TAMU: [
        ['tamu_id', 'nama_tamu', 'instansi', 'kontak', 'tujuan_kunjungan', 'bertemu_dengan', 'waktu_datang', 'waktu_keluar', 'catatan'],
        ...bukuTamu.map(b => [b.tamu_id, b.nama_tamu, b.instansi, b.kontak, b.tujuan_kunjungan, b.bertemu_dengan, b.waktu_datang, b.waktu_keluar || '', b.catatan || ''])
      ],
      PENGUMUMAN: [
        ['pengumuman_id', 'judul', 'kategori', 'konten', 'target_audiens', 'tanggal_terbit', 'dibuat_oleh'],
        ...pengumuman.map(pg => [pg.pengumuman_id, pg.judul, pg.kategori, pg.konten, pg.target_audiens, pg.tanggal_terbit, pg.dibuat_oleh])
      ],
      PENGATURAN_SEKOLAH: [
        ['nama_sekolah', 'npsn', 'akreditasi', 'motto', 'visi', 'kepala_sekolah', 'nip_kepsek', 'alamat', 'telepon', 'whatsapp', 'email', 'tahun_ajaran_aktif', 'semester_aktif'],
        [config.nama_sekolah, config.npsn, config.akreditasi, config.motto, config.visi, config.kepala_sekolah, config.nip_kepsek, config.alamat, config.telepon, config.whatsapp, config.email, config.tahun_ajaran_aktif, config.semester_aktif]
      ],
      AUDIT_LOG_AKADEMIK: [
        ['log_id', 'timestamp', 'user_id', 'username', 'role', 'aksi', 'modul', 'detail', 'status'],
        ...logs.map(l => [l.log_id, l.timestamp, l.user_id, l.username, l.role, l.aksi, l.modul, l.detail, l.status])
      ]
    };
  },

  getKeuanganData(): Record<string, any[][]> {
    const masterSPP = StorageService.getMasterSPP();
    const tagihan = StorageService.getTagihanSPP();
    const pembayaran = StorageService.getPembayaranSPP();
    const coa = StorageService.getAkunAkuntansi();
    const jurnal = StorageService.getJurnalUmum();
    const trx = StorageService.getTransaksiKeuangan();
    const logs = StorageService.getAuditLogs().filter(l => l.modul === 'Keuangan');

    // Detail jurnal unrolled
    const detailJurnalRows: any[][] = [];
    jurnal.forEach(j => {
      j.detail.forEach(d => {
        detailJurnalRows.push([j.jurnal_id, j.nomor_jurnal, j.tanggal, d.kode_akun, d.nama_akun, d.debit, d.kredit]);
      });
    });

    // Buku kas rows
    const kasRows: any[][] = [
      ['2026-11-01', 'SALDO-AWAL', 'Saldo Awal Bulan November 2026', 15000000, 0, 15000000],
      ...pembayaran.map(p => [p.tanggal_pembayaran.split(' ')[0], p.nomor_kuitansi, `Setoran SPP ${p.siswa_nama} (${p.periode_bulan})`, p.nominal_bayar, 0, 15000000 + p.nominal_bayar]),
      ...trx.filter(t => t.tipe === 'pengeluaran').map(t => [t.tanggal, t.nomor_bukti, t.keterangan, 0, t.nominal, 14000000])
    ];

    return {
      MASTER_SPP: [
        ['spp_id', 'nama_paket', 'tingkat', 'jurusan', 'tahun_ajaran', 'nominal_per_bulan', 'tanggal_jatuh_tempo'],
        ...masterSPP.map(m => [m.spp_id, m.nama_paket, m.tingkat, m.jurusan, m.tahun_ajaran, m.nominal_per_bulan, m.tanggal_jatuh_tempo])
      ],
      TAGIHAN_SPP: [
        ['tagihan_id', 'siswa_id', 'siswa_nama', 'kelas_nama', 'periode_bulan', 'tahun_ajaran', 'nominal_pokok', 'diskon_beasiswa', 'denda', 'total_tagihan', 'total_terbayar', 'sisa_tagihan', 'status', 'jatuh_tempo'],
        ...tagihan.map(t => [t.tagihan_id, t.siswa_id, t.siswa_nama, t.kelas_nama, t.periode_bulan, t.tahun_ajaran, t.nominal_pokok, t.diskon_beasiswa, t.denda, t.total_tagihan, t.total_terbayar, t.sisa_tagihan, t.status, t.jatuh_tempo])
      ],
      PEMBAYARAN_SPP: [
        ['pembayaran_id', 'nomor_kuitansi', 'tagihan_id', 'siswa_nama', 'kelas_nama', 'periode_bulan', 'nominal_bayar', 'metode_pembayaran', 'nomor_referensi', 'tanggal_pembayaran', 'kasir_nama', 'catatan', 'jurnal_id'],
        ...pembayaran.map(p => [p.pembayaran_id, p.nomor_kuitansi, p.tagihan_id, p.siswa_nama, p.kelas_nama, p.periode_bulan, p.nominal_bayar, p.metode_pembayaran, p.nomor_referensi, p.tanggal_pembayaran, p.kasir_nama, p.catatan || '', p.jurnal_id || ''])
      ],
      DISKON_BEASISWA: [
        ['diskon_id', 'siswa_id', 'siswa_nama', 'kategori_beasiswa', 'potongan_nominal', 'keterangan'],
        ['DSK-01', 'SIS-001', 'Ahmad Fauzi', 'Beasiswa Juara OSN Nasional', 150000, 'Potongan prestasi bulanan'],
        ['DSK-02', 'SIS-002', 'Siti Rahma', 'Keringanan Prestasi Riset LKTI', 100000, 'Keringanan semester ganjil']
      ],
      PEMASUKAN: [
        ['transaksi_id', 'nomor_bukti', 'tanggal', 'kategori', 'keterangan', 'nominal', 'akun_kas', 'dibuat_oleh'],
        ...trx.filter(t => t.tipe === 'pemasukan').map(t => [t.transaksi_id, t.nomor_bukti, t.tanggal, t.kategori, t.keterangan, t.nominal, t.akun_kas, t.dibuat_oleh])
      ],
      PENGELUARAN: [
        ['transaksi_id', 'nomor_bukti', 'tanggal', 'kategori', 'keterangan', 'nominal', 'akun_kas', 'dibuat_oleh'],
        ...trx.filter(t => t.tipe === 'pengeluaran').map(t => [t.transaksi_id, t.nomor_bukti, t.tanggal, t.kategori, t.keterangan, t.nominal, t.akun_kas, t.dibuat_oleh])
      ],
      AKUN_AKUNTANSI: [
        ['kode_akun', 'nama_akun', 'tipe', 'posisi_normal', 'saldo_berjalan'],
        ...coa.map(c => [c.kode_akun, c.nama_akun, c.tipe, c.posisi_normal, c.saldo_berjalan])
      ],
      JURNAL_UMUM: [
        ['jurnal_id', 'nomor_jurnal', 'tanggal', 'referensi', 'keterangan', 'total_debit', 'total_kredit', 'is_balanced'],
        ...jurnal.map(j => [j.jurnal_id, j.nomor_jurnal, j.tanggal, j.referensi, j.keterangan, j.total_debit, j.total_kredit, j.is_balanced ? 'SEIMBANG' : 'TIDAK SEIMBANG'])
      ],
      DETAIL_JURNAL: [
        ['jurnal_id', 'nomor_jurnal', 'tanggal', 'kode_akun', 'nama_akun', 'debit', 'kredit'],
        ...detailJurnalRows
      ],
      BUKU_KAS: [
        ['tanggal', 'nomor_bukti', 'keterangan', 'debit', 'kredit', 'saldo'],
        ...kasRows
      ],
      REKONSILIASI: [
        ['periode', 'akun_bank', 'saldo_buku', 'saldo_rekening_koran', 'selisih', 'status'],
        ['Oktober 2026', 'Bank BSI Rekening Yayasan', 184500000, 184500000, 0, 'COCOK (MATCH)'],
        ['November 2026', 'Bank BSI Rekening Yayasan', 186350000, 186350000, 0, 'COCOK (MATCH)']
      ],
      AUDIT_LOG_KEUANGAN: [
        ['log_id', 'timestamp', 'user_id', 'username', 'role', 'aksi', 'modul', 'detail', 'status'],
        ...logs.map(l => [l.log_id, l.timestamp, l.user_id, l.username, l.role, l.aksi, l.modul, l.detail, l.status])
      ]
    };
  },

  // Populates both Google Spreadsheets with all tabs and full row data
  async populateAllSpreadsheets(
    token: string,
    onProgress?: (progress: PopulateProgress) => void
  ): Promise<{ success: boolean; akademikTabsCreated: number; keuanganTabsCreated: number; totalRowsWritten: number }> {
    const config = StorageService.getSheetsConfig();
    const akademikData = this.getAkademikData();
    const keuanganData = this.getKeuanganData();

    const akademikTabNames = Object.keys(akademikData);
    const keuanganTabNames = Object.keys(keuanganData);
    const totalTabs = akademikTabNames.length + keuanganTabNames.length;
    let step = 0;
    let totalRows = 0;

    // 1. Process Database Akademik (19 tabs)
    const akademikInfo = await fetchSpreadsheetInfo(config.spreadsheet_id_akademik, token);
    const existingAkademikTitles = akademikInfo.sheets.map(s => s.title);
    const missingAkademik = akademikTabNames.filter(name => !existingAkademikTitles.includes(name));

    if (missingAkademik.length > 0) {
      if (onProgress) {
        onProgress({
          currentTab: 'Setup Tabs',
          spreadsheet: 'AKADEMIK',
          currentStep: step,
          totalSteps: totalTabs,
          message: `Membuat ${missingAkademik.length} tab baru di Spreadsheet Akademik...`
        });
      }
      await createMissingSheets(config.spreadsheet_id_akademik, missingAkademik, token);
    }

    for (const tabName of akademikTabNames) {
      step++;
      const rows = akademikData[tabName];
      totalRows += rows.length;

      if (onProgress) {
        onProgress({
          currentTab: tabName,
          spreadsheet: 'AKADEMIK',
          currentStep: step,
          totalSteps: totalTabs,
          message: `Menulis ${rows.length} baris data ke tab [${tabName}]...`
        });
      }

      await writeSheetData(
        config.spreadsheet_id_akademik,
        `'${tabName}'!A1`,
        rows,
        token
      );
    }

    // 2. Process Database Keuangan (12 tabs)
    const keuanganInfo = await fetchSpreadsheetInfo(config.spreadsheet_id_keuangan, token);
    const existingKeuanganTitles = keuanganInfo.sheets.map(s => s.title);
    const missingKeuangan = keuanganTabNames.filter(name => !existingKeuanganTitles.includes(name));

    if (missingKeuangan.length > 0) {
      if (onProgress) {
        onProgress({
          currentTab: 'Setup Tabs',
          spreadsheet: 'KEUANGAN',
          currentStep: step,
          totalSteps: totalTabs,
          message: `Membuat ${missingKeuangan.length} tab baru di Spreadsheet Keuangan...`
        });
      }
      await createMissingSheets(config.spreadsheet_id_keuangan, missingKeuangan, token);
    }

    for (const tabName of keuanganTabNames) {
      step++;
      const rows = keuanganData[tabName];
      totalRows += rows.length;

      if (onProgress) {
        onProgress({
          currentTab: tabName,
          spreadsheet: 'KEUANGAN',
          currentStep: step,
          totalSteps: totalTabs,
          message: `Menulis ${rows.length} baris data ke tab [${tabName}]...`
        });
      }

      await writeSheetData(
        config.spreadsheet_id_keuangan,
        `'${tabName}'!A1`,
        rows,
        token
      );
    }

    // Log the event
    StorageService.addAuditLog({
      user_id: 'SYSTEM',
      username: 'google_sheets_populator',
      role: 'SYSTEM',
      aksi: 'POPULATE_ALL_DATA',
      modul: 'Sheets',
      detail: `Berhasil mengisi 31 tab data lengkap ke Spreadsheet Akademik (${config.spreadsheet_id_akademik}) & Keuangan (${config.spreadsheet_id_keuangan}). Total ${totalRows} baris tersimpan.`,
      status: 'sukses'
    });

    const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
    StorageService.saveSheetsConfig({
      ...config,
      sync_status: 'terhubung',
      last_sync_akademik: timestamp,
      last_sync_keuangan: timestamp
    });

    return {
      success: true,
      akademikTabsCreated: missingAkademik.length,
      keuanganTabsCreated: missingKeuangan.length,
      totalRowsWritten: totalRows
    };
  },

  // Generates standalone Apps Script for Database Akademik with full initial dataset
  generateAppsScriptAkademik(): string {
    const data = this.getAkademikData();
    const jsonStr = JSON.stringify(data, null, 2);

    return `/**
 * GOOGLE APPS SCRIPT: INISIALISASI DATABASE AKADEMIK (19 TAB)
 * -------------------------------------------------------------
 * Panduan:
 * 1. Buka spreadsheet Database Akademik Anda di browser
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script"
 * 3. Hapus seluruh kode default yang ada di editor
 * 4. Salin & tempel (paste) seluruh script ini ke editor
 * 5. Klik tombol "Simpan" (Ctrl+S) lalu klik tombol "Jalankan" (Run)
 * 6. Jika muncul dialog perizinan Google, klik "Tinjau Izin" -> Pilih akun Google Anda -> "Lanjutan" -> "Buka (tidak aman)" -> "Izinkan"
 * 7. Tunggu sekitar 5-10 detik hingga muncul notifikasi sukses!
 */

function getTargetSpreadsheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  if (!ss) {
    ss = SpreadsheetApp.openById("13ohWc_DhrKXXogQnK2JWwxQfGYwo0KVV5gu20cfAt68");
  }
  return ss;
}

function inisialisasiDatabaseAkademik() {
  const ss = getTargetSpreadsheet();
  Logger.log("Memulai inisialisasi 19 Tab Database Akademik pada: " + ss.getName());

  const datasets = ${jsonStr};

  let totalTabs = 0;
  let totalRows = 0;

  for (const sheetName in datasets) {
    totalTabs++;
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    const rows = datasets[sheetName];
    if (rows && rows.length > 0) {
      totalRows += rows.length;
      sheet.clear();
      
      const numRows = rows.length;
      const numCols = rows[0].length;
      
      // Tulis seluruh baris dan kolom
      sheet.getRange(1, 1, numRows, numCols).setValues(rows);
      
      // Format baris header
      const headerRange = sheet.getRange(1, 1, 1, numCols);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1e293b"); // Slate 800
      headerRange.setFontColor("#f8fafc"); // Slate 50
      headerRange.setHorizontalAlignment("center");
      
      // Bekukan baris pertama agar header selalu terlihat saat scroll
      sheet.setFrozenRows(1);
      
      // Auto-resize kolom agar rapi
      for (let col = 1; col <= Math.min(numCols, 15); col++) {
        sheet.autoResizeColumn(col);
      }
    }
  }

  // Hapus Sheet1 default jika sudah tidak digunakan
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Halaman1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Abaikan jika tidak dapat dihapus
    }
  }

  // Otomatis Pasang Trigger Sinkronisasi Permanen 1 Menit di Google Cloud
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let hasTrigger = false;
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "inisialisasiDatabaseAkademik" || triggers[i].getHandlerFunction() === "pasangAutoSyncTrigger1Menit") {
        hasTrigger = true;
        break;
      }
    }
    if (!hasTrigger) {
      ScriptApp.newTrigger("inisialisasiDatabaseAkademik")
        .timeBased()
        .everyMinutes(1)
        .create();
    }
  } catch (errTrigger) {
    Logger.log("Trigger notice: " + errTrigger.message);
  }

  SpreadsheetApp.getUi().alert(
    "✅ Inisialisasi Database Akademik Berhasil!\\n\\n" +
    "Total " + totalTabs + " tab telah dibuat dan diisi dengan " + totalRows + " baris data awal.\\n" +
    "⏰ Trigger sinkronisasi otomatis tiap 1 menit telah AKTIF PERMANEN di Google Cloud.\\n\\n" +
    "Langkah Terakhir: Klik 'Deploy' -> 'New deployment' -> Pilih 'Web app' (Who has access: Anyone) -> Salin Web app URL untuk SIM Sekolah."
  );
}

/**
 * PERMANENT WEBHOOK ENDPOINT (Aktif 24/7 untuk Semua Akun Tanpa Perlu Login Google di Browser)
 * Petunjuk Deploy:
 * 1. Di editor Apps Script, klik tombol biru "Deploy" (Terapkan) -> "New deployment" (Penerapan baru)
 * 2. Pilih ikon gerigi: "Web app" (Aplikasi Web)
 * 3. Description: "Webhook SIM Sekolah Akademik"
 * 4. Execute as: "Me (email Anda)"
 * 5. Who has access: "Anyone" (Siapa saja)
 * 6. Klik "Deploy" -> Salin "Web app URL" (akhiran /exec)
 * 7. Tempel URL tersebut ke menu Pengaturan Google Sheets di aplikasi SIM Sekolah
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);
    const ss = getTargetSpreadsheet();

    // 1. Ping / Test connection
    if (body.action === 'test_ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Koneksi Webhook Akademik Aktif & Terhubung ke: " + ss.getName(),
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        time: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Full Sync (All tabs)
    if (body.action === 'sync_all' && body.datasets) {
      let count = 0;
      for (const sheetName in body.datasets) {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
        const rows = body.datasets[sheetName];
        if (rows && rows.length > 0) {
          sheet.clear();
          sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
          const hRange = sheet.getRange(1, 1, 1, rows[0].length);
          hRange.setFontWeight("bold");
          hRange.setBackground("#0f172a");
          hRange.setFontColor("#f8fafc");
          hRange.setHorizontalAlignment("center");
          sheet.setFrozenRows(1);
          count++;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Sinkronisasi Akademik berhasil diperbarui via Webhook (" + count + " tab)!",
        updatedTabs: count,
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Single Tab Sync
    if (body.action === 'sync_table' && body.sheetName && body.rows) {
      let sheet = ss.getSheetByName(body.sheetName);
      if (!sheet) sheet = ss.insertSheet(body.sheetName);
      sheet.clear();
      sheet.getRange(1, 1, body.rows.length, body.rows[0].length).setValues(body.rows);
      const hRange = sheet.getRange(1, 1, 1, body.rows[0].length);
      hRange.setFontWeight("bold");
      hRange.setBackground("#0f172a");
      hRange.setFontColor("#f8fafc");
      sheet.setFrozenRows(1);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Tab " + body.sheetName + " berhasil diperbarui via Webhook!",
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Append row
    if (body.action === 'append_row' && body.sheetName && body.row) {
      let sheet = ss.getSheetByName(body.sheetName);
      if (!sheet) sheet = ss.insertSheet(body.sheetName);
      sheet.appendRow(body.row);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Baris baru berhasil ditambahkan ke " + body.sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "OK" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const ss = getTargetSpreadsheet();
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "SIM Sekolah Akademik Webhook Sync",
    spreadsheet: ss.getName(),
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * FUNGSI OPSIONAL: TRIGGER SINKRONISASI OTOMATIS TIAP 1 MENIT
 * Pilih fungsi 'pasangAutoSyncTrigger1Menit' pada menu Run untuk menjalankan otomatis tiap 60 detik di Google Cloud.
 */
function pasangAutoSyncTrigger1Menit() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "inisialisasiDatabaseAkademik") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("inisialisasiDatabaseAkademik")
    .timeBased()
    .everyMinutes(1)
    .create();

  SpreadsheetApp.getUi().alert("✅ Trigger Otomatis Setiap 1 Menit Berhasil Diaktifkan di Spreadsheet Akademik!");
}
`;
  },

  // Generates standalone Apps Script for Database Keuangan with full initial dataset
  generateAppsScriptKeuangan(): string {
    const data = this.getKeuanganData();
    const jsonStr = JSON.stringify(data, null, 2);

    return `/**
 * GOOGLE APPS SCRIPT: INISIALISASI DATABASE KEUANGAN (12 TAB)
 * ------------------------------------------------------------
 * Panduan:
 * 1. Buka spreadsheet Database Keuangan Anda di browser
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script"
 * 3. Hapus seluruh kode default yang ada di editor
 * 4. Salin & tempel (paste) seluruh script ini ke editor
 * 5. Klik tombol "Simpan" (Ctrl+S) lalu klik tombol "Jalankan" (Run)
 * 6. Jika muncul dialog perizinan Google, klik "Tinjau Izin" -> Pilih akun Google Anda -> "Lanjutan" -> "Buka (tidak aman)" -> "Izinkan"
 * 7. Tunggu sekitar 5-10 detik hingga muncul notifikasi sukses!
 */

function getTargetSpreadsheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  if (!ss) {
    ss = SpreadsheetApp.openById("17vf-FEBzvboyiESP7QFKvP7dIUwT6XiChCOIQuuOJm0");
  }
  return ss;
}

function inisialisasiDatabaseKeuangan() {
  const ss = getTargetSpreadsheet();
  Logger.log("Memulai inisialisasi 12 Tab Database Keuangan pada: " + ss.getName());

  const datasets = ${jsonStr};

  let totalTabs = 0;
  let totalRows = 0;

  for (const sheetName in datasets) {
    totalTabs++;
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    const rows = datasets[sheetName];
    if (rows && rows.length > 0) {
      totalRows += rows.length;
      sheet.clear();
      
      const numRows = rows.length;
      const numCols = rows[0].length;
      
      // Tulis seluruh baris dan kolom
      sheet.getRange(1, 1, numRows, numCols).setValues(rows);
      
      // Format baris header hijau akuntansi
      const headerRange = sheet.getRange(1, 1, 1, numCols);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#064e3b"); // Emerald 900
      headerRange.setFontColor("#ecfdf5"); // Emerald 50
      headerRange.setHorizontalAlignment("center");
      
      // Bekukan baris pertama
      sheet.setFrozenRows(1);
      
      // Auto-resize kolom
      for (let col = 1; col <= Math.min(numCols, 15); col++) {
        sheet.autoResizeColumn(col);
      }
    }
  }

  // Hapus Sheet1 default jika sudah tidak digunakan
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Halaman1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Abaikan jika tidak dapat dihapus
    }
  }

  // Otomatis Pasang Trigger Sinkronisasi Permanen 1 Menit di Google Cloud
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let hasTrigger = false;
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "inisialisasiDatabaseKeuangan" || triggers[i].getHandlerFunction() === "pasangAutoSyncTrigger1Menit") {
        hasTrigger = true;
        break;
      }
    }
    if (!hasTrigger) {
      ScriptApp.newTrigger("inisialisasiDatabaseKeuangan")
        .timeBased()
        .everyMinutes(1)
        .create();
    }
  } catch (errTrigger) {
    Logger.log("Trigger notice: " + errTrigger.message);
  }

  SpreadsheetApp.getUi().alert(
    "✅ Inisialisasi Database Keuangan Berhasil!\\n\\n" +
    "Total " + totalTabs + " tab telah dibuat dan diisi dengan " + totalRows + " baris data awal.\\n" +
    "⏰ Trigger sinkronisasi otomatis tiap 1 menit telah AKTIF PERMANEN di Google Cloud.\\n\\n" +
    "Langkah Terakhir: Klik 'Deploy' -> 'New deployment' -> Pilih 'Web app' (Who has access: Anyone) -> Salin Web app URL untuk SIM Sekolah."
  );
}

/**
 * PERMANENT WEBHOOK ENDPOINT (Aktif 24/7 untuk Semua Akun Tanpa Perlu Login Google di Browser)
 * Petunjuk Deploy:
 * 1. Di editor Apps Script, klik tombol biru "Deploy" (Terapkan) -> "New deployment" (Penerapan baru)
 * 2. Pilih ikon gerigi: "Web app" (Aplikasi Web)
 * 3. Description: "Webhook SIM Sekolah Keuangan"
 * 4. Execute as: "Me (email Anda)"
 * 5. Who has access: "Anyone" (Siapa saja)
 * 6. Klik "Deploy" -> Salin "Web app URL" (akhiran /exec)
 * 7. Tempel URL tersebut ke menu Pengaturan Google Sheets di aplikasi SIM Sekolah
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);
    const ss = getTargetSpreadsheet();

    // 1. Ping / Test connection
    if (body.action === 'test_ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Koneksi Webhook Keuangan Aktif & Terhubung ke: " + ss.getName(),
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        time: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Full Sync (All tabs)
    if (body.action === 'sync_all' && body.datasets) {
      let count = 0;
      for (const sheetName in body.datasets) {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
        const rows = body.datasets[sheetName];
        if (rows && rows.length > 0) {
          sheet.clear();
          sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
          const hRange = sheet.getRange(1, 1, 1, rows[0].length);
          hRange.setFontWeight("bold");
          hRange.setBackground("#064e3b");
          hRange.setFontColor("#ecfdf5");
          hRange.setHorizontalAlignment("center");
          sheet.setFrozenRows(1);
          count++;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Sinkronisasi Keuangan & Pembayaran SPP berhasil diperbarui via Webhook (" + count + " tab)!",
        updatedTabs: count,
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Single Tab Sync
    if (body.action === 'sync_table' && body.sheetName && body.rows) {
      let sheet = ss.getSheetByName(body.sheetName);
      if (!sheet) sheet = ss.insertSheet(body.sheetName);
      sheet.clear();
      sheet.getRange(1, 1, body.rows.length, body.rows[0].length).setValues(body.rows);
      const hRange = sheet.getRange(1, 1, 1, body.rows[0].length);
      hRange.setFontWeight("bold");
      hRange.setBackground("#064e3b");
      hRange.setFontColor("#ecfdf5");
      sheet.setFrozenRows(1);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Tab " + body.sheetName + " berhasil diperbarui via Webhook!",
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Append row (misal kuitansi pembayaran baru)
    if (body.action === 'append_row' && body.sheetName && body.row) {
      let sheet = ss.getSheetByName(body.sheetName);
      if (!sheet) sheet = ss.insertSheet(body.sheetName);
      sheet.appendRow(body.row);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Baris baru berhasil ditambahkan ke " + body.sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "OK" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const ss = getTargetSpreadsheet();
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "SIM Sekolah Keuangan Webhook Sync",
    spreadsheet: ss.getName(),
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * FUNGSI OPSIONAL: TRIGGER SINKRONISASI OTOMATIS TIAP 1 MENIT
 * Pilih fungsi 'pasangAutoSyncTrigger1Menit' pada menu Run untuk menjalankan otomatis tiap 60 detik di Google Cloud.
 */
function pasangAutoSyncTrigger1Menit() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "inisialisasiDatabaseKeuangan") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("inisialisasiDatabaseKeuangan")
    .timeBased()
    .everyMinutes(1)
    .create();

  SpreadsheetApp.getUi().alert("✅ Trigger Otomatis Setiap 1 Menit Berhasil Diaktifkan di Spreadsheet Keuangan!");
}
`;
  },

  // Generates combined helper
  generateAppsScriptCode(spreadsheetIdAkademik: string, spreadsheetIdKeuangan: string): string {
    return this.generateAppsScriptAkademik();
  }
};
