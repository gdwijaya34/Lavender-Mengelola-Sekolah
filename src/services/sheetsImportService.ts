import { StorageService } from './storageService';
import {
  User,
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
  AkunAkuntansi,
  JurnalUmum,
  TransaksiKeuangan,
  Pengumuman
} from '../types';

export interface TableImportDefinition {
  id: string;
  name: string;
  category: 'Akademik' | 'Keuangan' | 'Pengguna';
  spreadsheet: 'AKADEMIK' | 'KEUANGAN';
  description: string;
  primaryKey: string;
  expectedHeaders: string[];
}

export const SUPPORTED_IMPORT_TABLES: TableImportDefinition[] = [
  // AKADEMIK (19 Tab)
  {
    id: 'USERS',
    name: 'USERS (Akun & Password Pengguna)',
    category: 'Pengguna',
    spreadsheet: 'AKADEMIK',
    description: 'Data akun login, username, email, dan password untuk 7 role pengguna.',
    primaryKey: 'username',
    expectedHeaders: ['user_id', 'username', 'email', 'password', 'nama_lengkap', 'role_id', 'reference_id', 'status', 'created_at']
  },
  {
    id: 'SISWA',
    name: 'SISWA (Data Induk Peserta Didik)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Data biodata siswa, NIS, NISN, kelas, orang tua, dan alamat.',
    primaryKey: 'nis',
    expectedHeaders: ['siswa_id', 'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kelas_id', 'tahun_ajaran', 'status', 'nama_ortu', 'kontak_ortu', 'alamat']
  },
  {
    id: 'GURU',
    name: 'GURU (Tenaga Pendidik)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Data guru, NIP, mapel utama, kontak, dan status kepegawaian.',
    primaryKey: 'nip',
    expectedHeaders: ['guru_id', 'nip', 'nama_lengkap', 'jenis_kelamin', 'mapel_utama', 'email', 'kontak', 'status_kepegawaian']
  },
  {
    id: 'STAFF',
    name: 'STAFF (Tenaga Kependidikan)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Data staf tata usaha, pustakawan, dan keamanan.',
    primaryKey: 'staff_id',
    expectedHeaders: ['staff_id', 'nama_lengkap', 'jabatan', 'divisi', 'kontak', 'status']
  },
  {
    id: 'KELAS',
    name: 'KELAS (Rombel Belajar)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Daftar kelas rombel, tingkat, jurusan, dan wali kelas.',
    primaryKey: 'kelas_id',
    expectedHeaders: ['kelas_id', 'nama_kelas', 'tingkat', 'jurusan', 'wali_kelas_id', 'wali_kelas_nama', 'kapasitas', 'tahun_ajaran']
  },
  {
    id: 'MATA_PELAJARAN',
    name: 'MATA_PELAJARAN (Kurikulum & KKM)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Mata pelajaran, kategori, standar KKM, dan beban jam.',
    primaryKey: 'mapel_id',
    expectedHeaders: ['mapel_id', 'kode_mapel', 'nama_mapel', 'kategori', 'kkm', 'beban_jam']
  },
  {
    id: 'JADWAL_PELAJARAN',
    name: 'JADWAL_PELAJARAN (Jadwal KBM)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Jadwal tatap muka kelas, mapel, guru pengampu, jam, dan ruangan.',
    primaryKey: 'jadwal_id',
    expectedHeaders: ['jadwal_id', 'kelas_id', 'mapel_id', 'mapel_nama', 'guru_id', 'guru_nama', 'hari', 'jam_mulai', 'jam_selesai', 'ruang']
  },
  {
    id: 'PRESENSI_SISWA',
    name: 'PRESENSI_SISWA (Kehadiran Harian Siswa)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Rekap kehadiran siswa, izin, sakit, alpa, dan keterlambatan.',
    primaryKey: 'presensi_id',
    expectedHeaders: ['presensi_id', 'siswa_id', 'siswa_nama', 'kelas_id', 'tanggal', 'status', 'menit_terlambat', 'keterangan', 'diinput_oleh', 'created_at']
  },
  {
    id: 'PRESENSI_GURU',
    name: 'PRESENSI_GURU (Kehadiran Guru)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Rekap kehadiran jam masuk dan pulang guru piket.',
    primaryKey: 'presensi_id',
    expectedHeaders: ['presensi_id', 'guru_id', 'guru_nama', 'tanggal', 'jam_masuk', 'jam_pulang', 'status', 'keterangan']
  },
  {
    id: 'NILAI_SISWA',
    name: 'NILAI_SISWA (Rapor & Asesmen)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Data nilai tugas, kuis, praktik, ujian, dan nilai akhir rapor.',
    primaryKey: 'nilai_id',
    expectedHeaders: ['nilai_id', 'siswa_id', 'siswa_nama', 'kelas_id', 'mapel_id', 'mapel_nama', 'guru_id', 'semester', 'tahun_ajaran', 'tugas', 'kuis', 'praktik', 'ujian', 'nilai_akhir', 'predikat', 'catatan_guru', 'status_kunci', 'updated_at']
  },
  {
    id: 'PRESTASI',
    name: 'PRESTASI (Penghargaan & Juara)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Data prestasi akademik, olahraga, seni, dan teknologi.',
    primaryKey: 'prestasi_id',
    expectedHeaders: ['prestasi_id', 'siswa_id', 'siswa_nama', 'kelas_nama', 'jenis_prestasi', 'bidang', 'tingkat', 'nama_kompetisi', 'penyelenggara', 'peringkat', 'tanggal', 'deskripsi', 'tampilkan_di_web', 'status_verifikasi']
  },
  {
    id: 'BUKU_TAMU',
    name: 'BUKU_TAMU (Tamu Resepsionis)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Buku tamu kunjungan ke sekolah.',
    primaryKey: 'tamu_id',
    expectedHeaders: ['tamu_id', 'nama_tamu', 'instansi', 'kontak', 'tujuan_kunjungan', 'bertemu_dengan', 'waktu_datang', 'waktu_keluar', 'catatan', 'created_at']
  },
  {
    id: 'PENGUMUMAN',
    name: 'PENGUMUMAN (Informasi Sekolah)',
    category: 'Akademik',
    spreadsheet: 'AKADEMIK',
    description: 'Papan pengumuman resmi sekolah.',
    primaryKey: 'pengumuman_id',
    expectedHeaders: ['pengumuman_id', 'judul', 'isi', 'tanggal', 'pembuat', 'target_role', 'penting']
  },

  // KEUANGAN (12 Tab)
  {
    id: 'TAGIHAN_SPP',
    name: 'TAGIHAN_SPP (Piutang SPP Bulanan)',
    category: 'Keuangan',
    spreadsheet: 'KEUANGAN',
    description: 'Tagihan iuran bulanan siswa dan status pembayaran.',
    primaryKey: 'tagihan_id',
    expectedHeaders: ['tagihan_id', 'siswa_id', 'siswa_nama', 'kelas_nama', 'periode_bulan', 'tahun_ajaran', 'nominal_pokok', 'diskon_beasiswa', 'denda', 'total_tagihan', 'total_terbayar', 'sisa_tagihan', 'status', 'jatuh_tempo', 'created_at']
  },
  {
    id: 'PEMBAYARAN_SPP',
    name: 'PEMBAYARAN_SPP (Kuitansi Penerimaan Kasir)',
    category: 'Keuangan',
    spreadsheet: 'KEUANGAN',
    description: 'Riwayat transaksi penerimaan pembayaran SPP dan nomor kuitansi.',
    primaryKey: 'nomor_kuitansi',
    expectedHeaders: ['pembayaran_id', 'nomor_kuitansi', 'tagihan_id', 'siswa_id', 'siswa_nama', 'kelas_nama', 'periode_bulan', 'nominal_bayar', 'metode_pembayaran', 'nomor_referensi', 'tanggal_pembayaran', 'kasir_nama', 'catatan', 'jurnal_id']
  },
  {
    id: 'AKUN_AKUNTANSI',
    name: 'AKUN_AKUNTANSI (Chart of Accounts / COA)',
    category: 'Keuangan',
    spreadsheet: 'KEUANGAN',
    description: 'Daftar akun buku besar (Kas, Piutang, Pendapatan, Beban).',
    primaryKey: 'kode_akun',
    expectedHeaders: ['kode_akun', 'nama_akun', 'tipe', 'posisi_normal', 'saldo_berjalan']
  },
  {
    id: 'JURNAL_UMUM',
    name: 'JURNAL_UMUM (Double-Entry Ledger)',
    category: 'Keuangan',
    spreadsheet: 'KEUANGAN',
    description: 'Pencatatan pembukuan akuntansi debit dan kredit.',
    primaryKey: 'jurnal_id',
    expectedHeaders: ['jurnal_id', 'nomor_bukti', 'tanggal', 'keterangan', 'kode_debit', 'nama_debit', 'kode_kredit', 'nama_kredit', 'nominal', 'modul']
  },
  {
    id: 'TRANSAKSI_KEUANGAN',
    name: 'TRANSAKSI_KEUANGAN (Arus Kas Masuk & Keluar)',
    category: 'Keuangan',
    spreadsheet: 'KEUANGAN',
    description: 'Buku kas operasional pemasukan dan pengeluaran.',
    primaryKey: 'transaksi_id',
    expectedHeaders: ['transaksi_id', 'nomor_bukti', 'tanggal', 'tipe', 'kategori', 'keterangan', 'nominal', 'akun_kas', 'dibuat_oleh', 'jurnal_id']
  }
];

export const SheetsImportService = {
  // Robust CSV parser supporting quotes, commas, and newlines
  parseCsv(csvText: string): string[][] {
    const lines: string[][] = [];
    let row: string[] = [];
    let col = '';
    let insideQuote = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          col += '"';
          i++; // skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(col.trim());
        col = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip CRLF
        }
        row.push(col.trim());
        if (row.some(cell => cell.length > 0)) {
          lines.push(row);
        }
        row = [];
        col = '';
      } else {
        col += char;
      }
    }

    if (col || row.length > 0) {
      row.push(col.trim());
      if (row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
    }

    return lines;
  },

  // Normalizes header key for fuzzy matching (e.g. "Nama Siswa" -> "nama_lengkap" or "namasiswa")
  normalizeKey(key: string): string {
    return (key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  },

  // Converts 2D array from Google Sheet into typed domain objects
  convertRawToTyped(tableName: string, rawRows: any[][]): any[] {
    if (!rawRows || rawRows.length < 2) return [];

    const headers = rawRows[0].map(h => String(h || '').trim());
    const dataRows = rawRows.slice(1).filter(r => r && r.some(c => c !== null && c !== undefined && String(c).trim() !== ''));

    // Create header index map
    const headerMap = new Map<string, number>();
    headers.forEach((h, idx) => {
      headerMap.set(this.normalizeKey(h), idx);
      headerMap.set(h.toLowerCase(), idx);
      headerMap.set(h, idx);
    });

    const getVal = (row: any[], possibleKeys: string[], fallback: any = ''): any => {
      for (const k of possibleKeys) {
        const norm = this.normalizeKey(k);
        if (headerMap.has(norm)) {
          const val = row[headerMap.get(norm)!];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return val;
          }
        }
      }
      return fallback;
    };

    switch (tableName.toUpperCase()) {
      case 'USERS':
        return dataRows.map((r, idx) => {
          const username = String(getVal(r, ['username', 'user', 'nama_user', 'id_user'], `user_${idx + 1}`)).trim();
          const email = String(getVal(r, ['email', 'surel', 'mail'], `${username}@sekolah.id`)).trim();
          const password = String(getVal(r, ['password', 'sandi', 'pass', 'kunci'], 'password123')).trim();
          const roleId = String(getVal(r, ['role_id', 'role', 'peran', 'jabatan'], 'siswa')).trim() as any;
          return {
            user_id: String(getVal(r, ['user_id', 'id'], `USR-${idx + 100}`)),
            username,
            email,
            password: password || 'password123',
            nama_lengkap: String(getVal(r, ['nama_lengkap', 'nama', 'fullname', 'name'], username)),
            role_id: ['admin_sekolah', 'admin_keuangan', 'admin_akademik', 'staff_piket', 'guru', 'siswa', 'orang_tua'].includes(roleId) ? roleId : 'siswa',
            reference_id: String(getVal(r, ['reference_id', 'ref_id', 'id_relasi'], '')),
            status: String(getVal(r, ['status'], 'aktif')).toLowerCase().includes('non') ? 'nonaktif' : 'aktif',
            created_at: String(getVal(r, ['created_at', 'tanggal'], new Date().toISOString().split('T')[0]))
          } as User;
        });

      case 'SISWA':
        return dataRows.map((r, idx) => {
          const nis = String(getVal(r, ['nis', 'no_induk'], `2026${String(idx + 1).padStart(3, '0')}`)).trim();
          const nisn = String(getVal(r, ['nisn', 'no_nisn'], `008${String(idx + 1).padStart(7, '0')}`)).trim();
          const nama = String(getVal(r, ['nama_lengkap', 'nama', 'nama_siswa'], `Siswa ${idx + 1}`)).trim();
          return {
            siswa_id: String(getVal(r, ['siswa_id', 'id'], `SISWA-${nis}`)),
            nis,
            nisn,
            nama_lengkap: nama,
            jenis_kelamin: String(getVal(r, ['jenis_kelamin', 'jk', 'gender'], 'L')).toUpperCase().startsWith('P') ? 'P' : 'L',
            tempat_lahir: String(getVal(r, ['tempat_lahir', 'tempat'], 'Jakarta')),
            tanggal_lahir: String(getVal(r, ['tanggal_lahir', 'tgl_lahir'], '2009-01-01')),
            kelas_id: String(getVal(r, ['kelas_id', 'kelas', 'rombel'], 'KLS-10A')),
            tahun_ajaran: String(getVal(r, ['tahun_ajaran', 'thn_ajaran'], '2026/2027')),
            status: 'aktif',
            nama_ortu: String(getVal(r, ['nama_ortu', 'wali', 'orang_tua'], `Orang Tua ${nama}`)),
            kontak_ortu: String(getVal(r, ['kontak_ortu', 'no_hp', 'telepon'], '08123456789')),
            alamat: String(getVal(r, ['alamat', 'domisili'], 'Jl. Pendidikan No. 1'))
          } as Siswa;
        });

      case 'GURU':
        return dataRows.map((r, idx) => {
          const nip = String(getVal(r, ['nip', 'no_pegawai'], `1985${String(idx + 1).padStart(6, '0')}`)).trim();
          return {
            guru_id: String(getVal(r, ['guru_id', 'id'], `GURU-${nip}`)),
            nip,
            nama_lengkap: String(getVal(r, ['nama_lengkap', 'nama', 'nama_guru'], `Guru ${idx + 1}`)),
            jenis_kelamin: String(getVal(r, ['jenis_kelamin', 'jk'], 'L')).toUpperCase().startsWith('P') ? 'P' : 'L',
            mapel_utama: String(getVal(r, ['mapel_utama', 'mapel', 'mata_pelajaran'], 'Umum')),
            email: String(getVal(r, ['email', 'surel'], `guru${idx + 1}@sekolah.id`)),
            kontak: String(getVal(r, ['kontak', 'no_hp', 'telepon'], '08129876543')),
            status_kepegawaian: String(getVal(r, ['status_kepegawaian', 'status'], 'PNS')) as any
          } as Guru;
        });

      case 'KELAS':
        return dataRows.map((r, idx) => ({
          kelas_id: String(getVal(r, ['kelas_id', 'id'], `KLS-${idx + 1}`)),
          nama_kelas: String(getVal(r, ['nama_kelas', 'kelas', 'nama'], `Kelas ${idx + 1}`)),
          tingkat: String(getVal(r, ['tingkat'], '10')) as any,
          jurusan: String(getVal(r, ['jurusan', 'kejuruan'], 'MIPA')),
          wali_kelas_id: String(getVal(r, ['wali_kelas_id', 'id_wali'], 'GURU-01')),
          wali_kelas_nama: String(getVal(r, ['wali_kelas_nama', 'nama_wali', 'wali'], 'Wali Kelas')),
          kapasitas: Number(getVal(r, ['kapasitas', 'kuota'], 36)) || 36,
          tahun_ajaran: String(getVal(r, ['tahun_ajaran', 'thn'], '2026/2027'))
        } as Kelas));

      case 'MATA_PELAJARAN':
        return dataRows.map((r, idx) => ({
          mapel_id: String(getVal(r, ['mapel_id', 'id'], `MP-${idx + 1}`)),
          kode_mapel: String(getVal(r, ['kode_mapel', 'kode'], `MP${idx + 1}`)),
          nama_mapel: String(getVal(r, ['nama_mapel', 'mapel', 'nama'], `Mata Pelajaran ${idx + 1}`)),
          kategori: String(getVal(r, ['kategori'], 'Wajib')) as any,
          kkm: Number(getVal(r, ['kkm', 'standar'], 75)) || 75,
          beban_jam: Number(getVal(r, ['beban_jam', 'jam'], 2)) || 2
        } as MataPelajaran));

      case 'TAGIHAN_SPP':
        return dataRows.map((r, idx) => {
          const pokok = Number(getVal(r, ['nominal_pokok', 'nominal', 'biaya'], 800000)) || 800000;
          const diskon = Number(getVal(r, ['diskon_beasiswa', 'potongan', 'diskon'], 0)) || 0;
          const totalTagihan = Number(getVal(r, ['total_tagihan', 'total'], pokok - diskon)) || (pokok - diskon);
          const totalBayar = Number(getVal(r, ['total_terbayar', 'bayar', 'terbayar'], 0)) || 0;
          const sisa = Math.max(0, totalTagihan - totalBayar);
          return {
            tagihan_id: String(getVal(r, ['tagihan_id', 'id'], `TAG-${idx + 1000}`)),
            siswa_id: String(getVal(r, ['siswa_id', 'id_siswa'], 'SISWA-01')),
            siswa_nama: String(getVal(r, ['siswa_nama', 'nama'], 'Siswa')),
            kelas_nama: String(getVal(r, ['kelas_nama', 'kelas'], '10 MIPA 1')),
            periode_bulan: String(getVal(r, ['periode_bulan', 'periode', 'bulan'], 'November 2026')),
            tahun_ajaran: String(getVal(r, ['tahun_ajaran', 'thn'], '2026/2027')),
            nominal_pokok: pokok,
            diskon_beasiswa: diskon,
            denda: Number(getVal(r, ['denda'], 0)) || 0,
            total_tagihan: totalTagihan,
            total_terbayar: totalBayar,
            sisa_tagihan: sisa,
            status: sisa === 0 ? 'lunas' : totalBayar > 0 ? 'dibayar_sebagian' : 'belum_dibayar',
            jatuh_tempo: String(getVal(r, ['jatuh_tempo', 'tempo'], '2026-11-10')),
            created_at: String(getVal(r, ['created_at'], '2026-11-01'))
          } as TagihanSPP;
        });

      case 'PEMBAYARAN_SPP':
        return dataRows.map((r, idx) => ({
          pembayaran_id: String(getVal(r, ['pembayaran_id', 'id'], `PAY-${idx + 1000}`)),
          nomor_kuitansi: String(getVal(r, ['nomor_kuitansi', 'kuitansi', 'no_kuitansi'], `KW-2026-${String(idx + 1).padStart(4, '0')}`)),
          tagihan_id: String(getVal(r, ['tagihan_id', 'id_tagihan'], 'TAG-1000')),
          siswa_id: String(getVal(r, ['siswa_id', 'id_siswa'], 'SISWA-01')),
          siswa_nama: String(getVal(r, ['siswa_nama', 'nama'], 'Siswa')),
          kelas_nama: String(getVal(r, ['kelas_nama', 'kelas'], '10 MIPA 1')),
          periode_bulan: String(getVal(r, ['periode_bulan', 'periode'], 'November 2026')),
          nominal_bayar: Number(getVal(r, ['nominal_bayar', 'nominal', 'jumlah'], 800000)) || 800000,
          metode_pembayaran: String(getVal(r, ['metode_pembayaran', 'metode'], 'Transfer Bank')) as any,
          nomor_referensi: String(getVal(r, ['nomor_referensi', 'ref', 'no_transaksi'], `TRX-${Date.now()}`)),
          tanggal_pembayaran: String(getVal(r, ['tanggal_pembayaran', 'tanggal', 'tgl'], new Date().toISOString().split('T')[0])),
          kasir_nama: String(getVal(r, ['kasir_nama', 'kasir', 'petugas'], 'Bendahara Sekolah')),
          catatan: String(getVal(r, ['catatan', 'keterangan'], 'Lunas via Import Google Sheet')),
          jurnal_id: String(getVal(r, ['jurnal_id'], `JRN-${idx + 100}`))
        } as PembayaranSPP));

      case 'AKUN_AKUNTANSI':
        return dataRows.map((r, idx) => ({
          kode_akun: String(getVal(r, ['kode_akun', 'kode', 'no_akun'], `111-${String(idx + 1).padStart(2, '0')}`)),
          nama_akun: String(getVal(r, ['nama_akun', 'nama'], `Akun ${idx + 1}`)),
          tipe: String(getVal(r, ['tipe', 'kategori'], 'Aset')) as any,
          posisi_normal: String(getVal(r, ['posisi_normal', 'posisi'], 'Debit')) as any,
          saldo_berjalan: Number(getVal(r, ['saldo_berjalan', 'saldo'], 0)) || 0
        } as AkunAkuntansi));

      case 'JURNAL_UMUM':
        return dataRows.map((r, idx) => {
          const nominal = Number(getVal(r, ['nominal', 'jumlah', 'total'], 0)) || 0;
          const kodeDebit = String(getVal(r, ['kode_debit', 'debit'], '111-01'));
          const namaDebit = String(getVal(r, ['nama_debit'], 'Kas Utama'));
          const kodeKredit = String(getVal(r, ['kode_kredit', 'kredit'], '411-01'));
          const namaKredit = String(getVal(r, ['nama_kredit'], 'Pendapatan SPP'));
          const tgl = String(getVal(r, ['tanggal', 'tgl'], new Date().toISOString().split('T')[0]));
          const noJurnal = String(getVal(r, ['nomor_jurnal', 'nomor_bukti', 'bukti'], `JRN-${idx + 1000}`));

          return {
            jurnal_id: String(getVal(r, ['jurnal_id', 'id'], `JRN-${idx + 1000}`)),
            nomor_jurnal: noJurnal,
            tanggal: tgl,
            referensi: String(getVal(r, ['referensi', 'ref', 'nomor_bukti'], noJurnal)),
            keterangan: String(getVal(r, ['keterangan', 'deskripsi'], 'Transaksi Jurnal Import')),
            total_debit: nominal,
            total_kredit: nominal,
            is_balanced: true,
            detail: [
              { kode_akun: kodeDebit, nama_akun: namaDebit, debit: nominal, kredit: 0 },
              { kode_akun: kodeKredit, nama_akun: namaKredit, debit: 0, kredit: nominal }
            ],
            created_at: tgl
          } as JurnalUmum;
        });

      case 'TRANSAKSI_KEUANGAN':
        return dataRows.map((r, idx) => ({
          transaksi_id: String(getVal(r, ['transaksi_id', 'id'], `TRX-${idx + 1000}`)),
          nomor_bukti: String(getVal(r, ['nomor_bukti', 'bukti'], `BKT-${idx + 1}`)),
          tanggal: String(getVal(r, ['tanggal', 'tgl'], new Date().toISOString().split('T')[0])),
          tipe: String(getVal(r, ['tipe'], 'pemasukan')).toLowerCase() === 'pengeluaran' ? 'pengeluaran' : 'pemasukan',
          kategori: String(getVal(r, ['kategori'], 'Operasional')),
          keterangan: String(getVal(r, ['keterangan', 'deskripsi'], 'Transaksi')),
          nominal: Number(getVal(r, ['nominal', 'jumlah'], 0)) || 0,
          akun_kas: String(getVal(r, ['akun_kas', 'kas'], 'Kas Utama')),
          dibuat_oleh: String(getVal(r, ['dibuat_oleh', 'petugas'], 'Bendahara')),
          jurnal_id: String(getVal(r, ['jurnal_id'], ''))
        } as TransaksiKeuangan));

      default:
        // Generic row object mapping based on headers
        return dataRows.map(row => {
          const obj: any = {};
          headers.forEach((h, colIdx) => {
            if (h) {
              obj[h] = row[colIdx];
            }
          });
          return obj;
        });
    }
  },

  // Applies converted records into local storage with chosen strategy
  applyImport(
    tableName: string,
    newRecords: any[],
    mode: 'replace' | 'merge' | 'append'
  ): { added: number; updated: number; total: number } {
    if (!newRecords || newRecords.length === 0) {
      return { added: 0, updated: 0, total: 0 };
    }

    const tableDef = SUPPORTED_IMPORT_TABLES.find(t => t.id === tableName.toUpperCase());
    const pk = tableDef ? tableDef.primaryKey : 'id';

    let currentList: any[] = [];
    switch (tableName.toUpperCase()) {
      case 'USERS': currentList = StorageService.getUsers(); break;
      case 'SISWA': currentList = StorageService.getSiswa(); break;
      case 'GURU': currentList = StorageService.getGuru(); break;
      case 'STAFF': currentList = StorageService.getStaff(); break;
      case 'KELAS': currentList = StorageService.getKelas(); break;
      case 'MATA_PELAJARAN': currentList = StorageService.getMapel(); break;
      case 'JADWAL_PELAJARAN': currentList = StorageService.getJadwal(); break;
      case 'PRESENSI_SISWA': currentList = StorageService.getPresensiSiswa(); break;
      case 'PRESENSI_GURU': currentList = StorageService.getPresensiGuru(); break;
      case 'NILAI_SISWA': currentList = StorageService.getNilai(); break;
      case 'PRESTASI': currentList = StorageService.getPrestasi(); break;
      case 'BUKU_TAMU': currentList = StorageService.getBukuTamu(); break;
      case 'TAGIHAN_SPP': currentList = StorageService.getTagihanSPP(); break;
      case 'PEMBAYARAN_SPP': currentList = StorageService.getPembayaranSPP(); break;
      case 'AKUN_AKUNTANSI': currentList = StorageService.getAkunAkuntansi(); break;
      case 'JURNAL_UMUM': currentList = StorageService.getJurnalUmum(); break;
      case 'TRANSAKSI_KEUANGAN': currentList = StorageService.getTransaksiKeuangan(); break;
      case 'PENGUMUMAN': currentList = StorageService.getPengumuman(); break;
      default: currentList = [];
    }

    let finalRecords: any[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    if (mode === 'replace') {
      finalRecords = [...newRecords];
      addedCount = newRecords.length;
    } else {
      finalRecords = [...currentList];
      const existingMap = new Map<string, number>();
      finalRecords.forEach((item, idx) => {
        const keyVal = String(item[pk] || item.id || idx);
        existingMap.set(keyVal.toLowerCase(), idx);
      });

      for (const item of newRecords) {
        const keyVal = String(item[pk] || item.id || '').toLowerCase();
        if (keyVal && existingMap.has(keyVal)) {
          if (mode === 'merge') {
            const idx = existingMap.get(keyVal)!;
            finalRecords[idx] = { ...finalRecords[idx], ...item };
            updatedCount++;
          }
        } else {
          finalRecords.push(item);
          addedCount++;
          if (keyVal) {
            existingMap.set(keyVal, finalRecords.length - 1);
          }
        }
      }
    }

    // Save final array to StorageService
    switch (tableName.toUpperCase()) {
      case 'USERS': StorageService.setAllUsers(finalRecords); break;
      case 'SISWA': StorageService.setAllSiswa(finalRecords); break;
      case 'GURU': StorageService.setAllGuru(finalRecords); break;
      case 'STAFF': StorageService.setAllStaff(finalRecords); break;
      case 'KELAS': StorageService.setAllKelas(finalRecords); break;
      case 'MATA_PELAJARAN': StorageService.setAllMapel(finalRecords); break;
      case 'JADWAL_PELAJARAN': StorageService.setAllJadwal(finalRecords); break;
      case 'PRESENSI_SISWA': StorageService.setAllPresensiSiswa(finalRecords); break;
      case 'PRESENSI_GURU': StorageService.setAllPresensiGuru(finalRecords); break;
      case 'NILAI_SISWA': StorageService.setAllNilai(finalRecords); break;
      case 'PRESTASI': StorageService.setAllPrestasi(finalRecords); break;
      case 'BUKU_TAMU': StorageService.setAllBukuTamu(finalRecords); break;
      case 'TAGIHAN_SPP': StorageService.setAllTagihanSPP(finalRecords); break;
      case 'PEMBAYARAN_SPP': StorageService.setAllPembayaranSPP(finalRecords); break;
      case 'AKUN_AKUNTANSI': StorageService.setAllAkunAkuntansi(finalRecords); break;
      case 'JURNAL_UMUM': StorageService.setAllJurnalUmum(finalRecords); break;
      case 'TRANSAKSI_KEUANGAN': StorageService.setAllTransaksiKeuangan(finalRecords); break;
      case 'PENGUMUMAN': StorageService.setAllPengumuman(finalRecords); break;
    }

    // Audit Log
    StorageService.addAuditLog({
      user_id: 'ADMIN-01',
      username: 'admin',
      role: 'Super Admin',
      aksi: 'Import Google Sheet',
      modul: 'Sheets',
      detail: `Import database ke tabel ${tableName}: ${addedCount} baris baru, ${updatedCount} baris diperbarui (Mode: ${mode}).`,
      status: 'sukses'
    });

    return {
      added: addedCount,
      updated: updatedCount,
      total: finalRecords.length
    };
  },

  // Fetch full database from Google Apps Script Webhook
  async fetchFromWebhook(type: 'akademik' | 'keuangan'): Promise<Record<string, any[][]>> {
    const res = await fetch('/api/sheets-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'webhook', type })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Gagal menghubungi server' }));
      throw new Error(err.message || `Gagal mengambil data dari Webhook ${type}`);
    }

    const data = await res.json();
    return data.tables || {};
  },

  // Fetch single table from public Google Sheet via CSV
  async fetchFromPublicSheetCsv(spreadsheetId: string, sheetName: string): Promise<string[][]> {
    const res = await fetch('/api/sheets-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'url', spreadsheetId, sheetName })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Gagal mengunduh CSV' }));
      throw new Error(err.message || `Gagal mengambil tab ${sheetName} dari spreadsheet.`);
    }

    const data = await res.json();
    return this.parseCsv(data.csv || '');
  }
};
