export type UserRole =
  | 'admin_sekolah'
  | 'admin_keuangan'
  | 'admin_akademik'
  | 'staff_piket'
  | 'guru'
  | 'siswa'
  | 'orang_tua';

export interface RoleInfo {
  id: UserRole;
  name: string;
  badge: string;
  color: string;
  description: string;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  password: string; // Password akun login terotentikasi (kolom password di tabel USERS)
  nama_lengkap: string;
  role_id: UserRole;
  reference_id: string; // ID siswa/guru/staf/ortu
  status: 'aktif' | 'nonaktif';
  foto?: string;
  last_login?: string;
  created_at: string;
}

export interface Siswa {
  siswa_id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  kelas_id: string;
  tahun_ajaran: string;
  status: 'aktif' | 'lulus' | 'mutasi' | 'nonaktif';
  nama_ortu: string;
  kontak_ortu: string;
  alamat: string;
  foto?: string;
}

export interface Guru {
  guru_id: string;
  nip: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  mapel_utama: string;
  email: string;
  kontak: string;
  status_kepegawaian: 'PNS' | 'GTT' | 'Yayasan';
  foto?: string;
}

export interface Staff {
  staff_id: string;
  nama_lengkap: string;
  jabatan: string;
  divisi: string;
  kontak: string;
  status: 'aktif' | 'nonaktif';
}

export interface OrangTua {
  ortu_id: string;
  nama_lengkap: string;
  hubungan: 'Ayah' | 'Ibu' | 'Wali';
  pekerjaan: string;
  kontak: string;
  email: string;
  alamat: string;
}

export interface RelasiOrtuSiswa {
  id: string;
  ortu_id: string;
  siswa_id: string;
  status_verifikasi: 'terverifikasi' | 'menunggu';
}

export interface Kelas {
  kelas_id: string;
  nama_kelas: string;
  tingkat: '10' | '11' | '12';
  jurusan: string;
  wali_kelas_id: string;
  wali_kelas_nama: string;
  kapasitas: number;
  tahun_ajaran: string;
}

export interface MataPelajaran {
  mapel_id: string;
  kode_mapel: string;
  nama_mapel: string;
  kategori: 'Wajib' | 'Peminatan' | 'Muatan Lokal';
  kkm: number;
  beban_jam: number;
}

export interface JadwalPelajaran {
  jadwal_id: string;
  kelas_id: string;
  mapel_id: string;
  mapel_nama: string;
  guru_id: string;
  guru_nama: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jam_mulai: string;
  jam_selesai: string;
  ruang: string;
}

export interface PresensiSiswa {
  presensi_id: string;
  siswa_id: string;
  siswa_nama: string;
  kelas_id: string;
  tanggal: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa' | 'terlambat';
  menit_terlambat?: number;
  keterangan?: string;
  diinput_oleh: string;
  created_at: string;
}

export interface PresensiGuru {
  presensi_id: string;
  guru_id: string;
  guru_nama: string;
  tanggal: string;
  jam_masuk: string;
  jam_pulang?: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa' | 'terlambat';
  keterangan?: string;
}

export interface NilaiSiswa {
  nilai_id: string;
  siswa_id: string;
  siswa_nama: string;
  kelas_id: string;
  mapel_id: string;
  mapel_nama: string;
  guru_id: string;
  semester: 'Ganjil' | 'Genap';
  tahun_ajaran: string;
  tugas: number;
  kuis: number;
  praktik: number;
  ujian: number;
  nilai_akhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatan_guru: string;
  status_kunci: 'draft' | 'terkunci' | 'terpublikasi';
  updated_at: string;
}

export interface PrestasiSiswa {
  prestasi_id: string;
  siswa_id: string;
  siswa_nama: string;
  kelas_nama: string;
  jenis_prestasi: 'Akademik' | 'Non-Akademik' | 'Seni' | 'Olahraga' | 'Teknologi';
  bidang: string;
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kota/Kab' | 'Provinsi' | 'Nasional' | 'Internasional';
  nama_kompetisi: string;
  penyelenggara: string;
  peringkat: string; // e.g. Juara 1, Medali Emas
  tanggal: string;
  deskripsi: string;
  foto_url?: string;
  tampilkan_di_web: boolean;
  status_verifikasi: 'terverifikasi' | 'menunggu' | 'ditolak';
}

export interface BukuTamu {
  tamu_id: string;
  nama_tamu: string;
  instansi: string;
  kontak: string;
  tujuan_kunjungan: string;
  bertemu_dengan: string;
  waktu_datang: string;
  waktu_keluar?: string;
  catatan?: string;
  foto_url?: string;
  created_at: string;
}

export interface MasterSPP {
  spp_id: string;
  nama_paket: string;
  tingkat: string;
  jurusan: string;
  tahun_ajaran: string;
  nominal_per_bulan: number;
  tanggal_jatuh_tempo: number; // e.g. 10 tiap bulan
}

export interface TagihanSPP {
  tagihan_id: string;
  siswa_id: string;
  siswa_nama: string;
  kelas_nama: string;
  periode_bulan: string; // e.g. "November 2026"
  tahun_ajaran: string;
  nominal_pokok: number;
  diskon_beasiswa: number;
  denda: number;
  total_tagihan: number;
  total_terbayar: number;
  sisa_tagihan: number;
  status: 'belum_dibayar' | 'dibayar_sebagian' | 'lunas' | 'lewat_jatuh_tempo' | 'dibatalkan';
  jatuh_tempo: string;
  created_at: string;
}

export interface PembayaranSPP {
  pembayaran_id: string;
  nomor_kuitansi: string;
  tagihan_id: string;
  siswa_id: string;
  siswa_nama: string;
  kelas_nama: string;
  periode_bulan: string;
  nominal_bayar: number;
  metode_pembayaran: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Virtual Account';
  nomor_referensi: string;
  tanggal_pembayaran: string;
  kasir_nama: string;
  catatan?: string;
  jurnal_id?: string;
}

export interface TransaksiKeuangan {
  transaksi_id: string;
  nomor_bukti: string;
  tanggal: string;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori: string;
  keterangan: string;
  nominal: number;
  akun_kas: string; // e.g. "Kas Utama" | "Bank BSI"
  dibuat_oleh: string;
  jurnal_id?: string;
}

export interface AkunAkuntansi {
  kode_akun: string;
  nama_akun: string;
  tipe: 'Aset' | 'Kewajiban' | 'Ekuitas' | 'Pendapatan' | 'Beban';
  posisi_normal: 'Debit' | 'Kredit';
  saldo_berjalan: number;
}

export interface JurnalUmum {
  jurnal_id: string;
  nomor_jurnal: string;
  tanggal: string;
  referensi: string;
  keterangan: string;
  total_debit: number;
  total_kredit: number;
  is_balanced: boolean;
  detail: DetailJurnal[];
  created_at: string;
}

export interface DetailJurnal {
  kode_akun: string;
  nama_akun: string;
  debit: number;
  kredit: number;
}

export interface PengaturanSekolah {
  nama_sekolah: string;
  npsn: string;
  akreditasi: string;
  motto: string;
  visi: string;
  misi: string[];
  kepala_sekolah: string;
  nip_kepsek: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota_kab: string;
  provinsi: string;
  kodepos: string;
  telepon: string;
  whatsapp: string;
  email: string;
  website: string;
  warna_utama: string;
  warna_sekunder: string;
  tahun_ajaran_aktif: string;
  semester_aktif: 'Ganjil' | 'Genap';
  bobot_tugas: number;
  bobot_kuis: number;
  bobot_praktik: number;
  bobot_ujian: number;
}

export interface Pengumuman {
  pengumuman_id: string;
  judul: string;
  kategori: 'Akademik' | 'Keuangan' | 'Kegiatan' | 'Umum';
  konten: string;
  target_audiens: 'Semua' | 'Siswa' | 'Guru' | 'Orang Tua';
  tanggal_terbit: string;
  dibuat_oleh: string;
  is_pinned: boolean;
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  user_id: string;
  username: string;
  role: string;
  aksi: string;
  modul: 'Akademik' | 'Keuangan' | 'Presensi' | 'Nilai' | 'Buku Tamu' | 'Sistem' | 'Sheets';
  detail: string;
  ip_address?: string;
  status: 'sukses' | 'gagal';
}

export interface GoogleSheetsConfig {
  spreadsheet_id_akademik: string;
  spreadsheet_id_keuangan: string;
  api_key?: string;
  service_account_email?: string;
  auto_sync_interval_mins: number; // Interval sinkronisasi dalam menit (default: 1 menit)
  auto_sync_enabled?: boolean; // Status aktif/nonaktif auto-sync otomatis
  permanent_sync_active?: boolean; // Status sinkronisasi permanen di semua akun
  webhook_url_keuangan?: string; // Webhook Google Apps Script permanen (tanpa perlu login)
  webhook_url_akademik?: string; // Webhook Google Apps Script permanen (tanpa perlu login)
  last_sync_akademik?: string;
  last_sync_keuangan?: string;
  sync_status: 'terhubung' | 'terputus' | 'sinkronisasi' | 'error';
  last_error_message?: string;
}
