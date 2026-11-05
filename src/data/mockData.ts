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

export const INITIAL_SCHOOL_CONFIG: PengaturanSekolah = {
  nama_sekolah: 'SMA Unggulan Cendekia Bangsa',
  npsn: '20108921',
  akreditasi: 'A (Unggul - 98/100)',
  motto: 'Mencerdaskan Generasi, Berkarakter Islami & Berdaya Saing Global',
  visi: 'Menjadi institusi pendidikan berkarakter, berdaya saing global berbasis sains, teknologi dan budi pekerti luhur.',
  misi: [
    'Menyelenggarakan proses pembelajaran berbasis teknologi dan riset kolaboratif.',
    'Membangun karakter siswa yang religius, mandiri, berintegritas, dan toleran.',
    'Menghasilkan lulusan yang mampu bersaing di perguruan tinggi terbaik dunia dan dunia kerja.',
    'Menerapkan tata kelola sekolah yang transparan, akuntabel, dan ramah lingkungan.'
  ],
  kepala_sekolah: 'Dr. Hj. Siti Nurhaliza, M.Pd',
  nip_kepsek: '19750812 200003 2 004',
  alamat: 'Jl. Merdeka Ilmu No. 45, Kompleks Pendidikan Terpadu',
  kelurahan: 'Cempaka Putih',
  kecamatan: 'Kebayoran',
  kota_kab: 'Jakarta Selatan',
  provinsi: 'DKI Jakarta',
  kodepos: '12140',
  telepon: '(021) 7890-1234',
  whatsapp: '0812-9876-5432',
  email: 'info@cendekiabangsa.sch.id',
  website: 'https://cendekiabangsa.sch.id',
  warna_utama: '#1e40af', // Blue-800
  warna_sekunder: '#059669', // Emerald-600
  tahun_ajaran_aktif: '2026/2027',
  semester_aktif: 'Ganjil',
  bobot_tugas: 20,
  bobot_kuis: 15,
  bobot_praktik: 25,
  bobot_ujian: 40
};

export const INITIAL_USERS: User[] = [
  {
    user_id: 'USR-001',
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    password: 'admin123',
    nama_lengkap: 'Bagus Wicaksono, S.Kom (Super Admin)',
    role_id: 'admin_sekolah',
    reference_id: 'STF-001',
    status: 'aktif',
    created_at: '2026-01-10T08:00:00Z',
    last_login: '2026-11-04T07:15:00Z'
  },
  {
    user_id: 'USR-002',
    username: 'keuangan',
    email: 'keuangan@sekolah.sch.id',
    password: 'keuangan123',
    nama_lengkap: 'Dewi Lestari, S.E., Ak. (Bendahara)',
    role_id: 'admin_keuangan',
    reference_id: 'STF-002',
    status: 'aktif',
    created_at: '2026-01-10T08:00:00Z',
    last_login: '2026-11-04T06:50:00Z'
  },
  {
    user_id: 'USR-003',
    username: 'akademik',
    email: 'akademik@sekolah.sch.id',
    password: 'akademik123',
    nama_lengkap: 'Rahmat Hidayat, M.Pd (Wakasek Kurikulum)',
    role_id: 'admin_akademik',
    reference_id: 'STF-003',
    status: 'aktif',
    created_at: '2026-01-10T08:00:00Z',
    last_login: '2026-11-03T14:20:00Z'
  },
  {
    user_id: 'USR-004',
    username: 'piket',
    email: 'piket@sekolah.sch.id',
    password: 'piket123',
    nama_lengkap: 'Suryono (Staff Resepsionis & Piket)',
    role_id: 'staff_piket',
    reference_id: 'STF-004',
    status: 'aktif',
    created_at: '2026-01-10T08:00:00Z',
    last_login: '2026-11-04T06:30:00Z'
  },
  {
    user_id: 'USR-005',
    username: 'guru',
    email: 'guru@sekolah.sch.id',
    password: 'guru123',
    nama_lengkap: 'Drs. Budi Santoso, M.Pd (Guru Fisika)',
    role_id: 'guru',
    reference_id: 'GRU-001',
    status: 'aktif',
    created_at: '2026-01-10T08:00:00Z',
    last_login: '2026-11-04T07:05:00Z'
  },
  {
    user_id: 'USR-006',
    username: 'siswa',
    email: 'siswa@sekolah.sch.id',
    password: 'siswa123',
    nama_lengkap: 'Ahmad Fauzi (Siswa XI MIPA 1)',
    role_id: 'siswa',
    reference_id: 'SIS-001',
    status: 'aktif',
    created_at: '2026-07-15T08:00:00Z',
    last_login: '2026-11-03T19:30:00Z'
  },
  {
    user_id: 'USR-007',
    username: 'ortu',
    email: 'ortu@sekolah.sch.id',
    password: 'ortu123',
    nama_lengkap: 'Ir. Hendra Pratama (Wali Siswa)',
    role_id: 'orang_tua',
    reference_id: 'ORT-001',
    status: 'aktif',
    created_at: '2026-07-15T08:00:00Z',
    last_login: '2026-11-03T20:10:00Z'
  }
];

export const INITIAL_KELAS: Kelas[] = [
  { kelas_id: 'KLS-10-A', nama_kelas: 'X MIPA 1', tingkat: '10', jurusan: 'MIPA', wali_kelas_id: 'GRU-002', wali_kelas_nama: 'Sri Wahyuni, S.Pd', kapasitas: 36, tahun_ajaran: '2026/2027' },
  { kelas_id: 'KLS-10-B', nama_kelas: 'X MIPA 2', tingkat: '10', jurusan: 'MIPA', wali_kelas_id: 'GRU-003', wali_kelas_nama: 'Agus Salim, M.Si', kapasitas: 36, tahun_ajaran: '2026/2027' },
  { kelas_id: 'KLS-11-A', nama_kelas: 'XI MIPA 1', tingkat: '11', jurusan: 'MIPA', wali_kelas_id: 'GRU-001', wali_kelas_nama: 'Drs. Budi Santoso, M.Pd', kapasitas: 35, tahun_ajaran: '2026/2027' },
  { kelas_id: 'KLS-11-B', nama_kelas: 'XI IPS 1', tingkat: '11', jurusan: 'IPS', wali_kelas_id: 'GRU-004', wali_kelas_nama: 'Farida Nur, S.Pd', kapasitas: 35, tahun_ajaran: '2026/2027' },
  { kelas_id: 'KLS-12-A', nama_kelas: 'XII MIPA 1', tingkat: '12', jurusan: 'MIPA', wali_kelas_id: 'GRU-005', wali_kelas_nama: 'Eko Prasetyo, M.Kom', kapasitas: 34, tahun_ajaran: '2026/2027' }
];

export const INITIAL_GURU: Guru[] = [
  { guru_id: 'GRU-001', nip: '19790514 200501 1 008', nama_lengkap: 'Drs. Budi Santoso, M.Pd', jenis_kelamin: 'L', mapel_utama: 'Fisika', email: 'budi.santoso@cendekiabangsa.sch.id', kontak: '0813-1122-3344', status_kepegawaian: 'PNS' },
  { guru_id: 'GRU-002', nip: '19840210 200801 2 015', nama_lengkap: 'Sri Wahyuni, S.Pd', jenis_kelamin: 'P', mapel_utama: 'Matematika Peminatan', email: 'sri.wahyuni@cendekiabangsa.sch.id', kontak: '0813-2233-4455', status_kepegawaian: 'PNS' },
  { guru_id: 'GRU-003', nip: '19881125 201402 1 003', nama_lengkap: 'Agus Salim, M.Si', jenis_kelamin: 'L', mapel_utama: 'Kimia', email: 'agus.salim@cendekiabangsa.sch.id', kontak: '0813-3344-5566', status_kepegawaian: 'Yayasan' },
  { guru_id: 'GRU-004', nip: '19900318 201601 2 009', nama_lengkap: 'Farida Nur, S.Pd', jenis_kelamin: 'P', mapel_utama: 'Bahasa Inggris', email: 'farida.nur@cendekiabangsa.sch.id', kontak: '0813-4455-6677', status_kepegawaian: 'GTT' },
  { guru_id: 'GRU-005', nip: '19820719 200901 1 007', nama_lengkap: 'Eko Prasetyo, M.Kom', jenis_kelamin: 'L', mapel_utama: 'Informatika & Coding', email: 'eko.prasetyo@cendekiabangsa.sch.id', kontak: '0813-5566-7788', status_kepegawaian: 'PNS' }
];

export const INITIAL_STAFF: Staff[] = [
  { staff_id: 'STF-001', nama_lengkap: 'Bagus Wicaksono, S.Kom', jabatan: 'Koordinator IT & Sistem', divisi: 'Teknologi Informasi', kontak: '0812-1111-2222', status: 'aktif' },
  { staff_id: 'STF-002', nama_lengkap: 'Dewi Lestari, S.E., Ak.', jabatan: 'Kepala Bagian Keuangan', divisi: 'Keuangan & Akuntansi', kontak: '0812-2222-3333', status: 'aktif' },
  { staff_id: 'STF-003', nama_lengkap: 'Rahmat Hidayat, M.Pd', jabatan: 'Koordinator Tata Usaha', divisi: 'Administrasi Akademik', kontak: '0812-3333-4444', status: 'aktif' },
  { staff_id: 'STF-004', nama_lengkap: 'Suryono', jabatan: 'Staff Resepsionis & Piket', divisi: 'Kesiswaan & Operasional', kontak: '0812-4444-5555', status: 'aktif' }
];

export const INITIAL_SISWA: Siswa[] = [
  {
    siswa_id: 'SIS-001',
    nis: '20251101',
    nisn: '0087654321',
    nama_lengkap: 'Ahmad Fauzi',
    jenis_kelamin: 'L',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2009-04-12',
    kelas_id: 'KLS-11-A',
    tahun_ajaran: '2026/2027',
    status: 'aktif',
    nama_ortu: 'Ir. Hendra Pratama',
    kontak_ortu: '0811-9876-1234',
    alamat: 'Jl. Melati Hijau Blok B4 No. 12, Kebayoran Baru, Jakarta Selatan'
  },
  {
    siswa_id: 'SIS-002',
    nis: '20251102',
    nisn: '0087654322',
    nama_lengkap: 'Siti Rahma',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2009-08-25',
    kelas_id: 'KLS-11-A',
    tahun_ajaran: '2026/2027',
    status: 'aktif',
    nama_ortu: 'Ir. Hendra Pratama',
    kontak_ortu: '0811-9876-1234',
    alamat: 'Jl. Melati Hijau Blok B4 No. 12, Kebayoran Baru, Jakarta Selatan'
  },
  {
    siswa_id: 'SIS-003',
    nis: '20251103',
    nisn: '0087654323',
    nama_lengkap: 'Rizky Ramadhan',
    jenis_kelamin: 'L',
    tempat_lahir: 'Tangerang',
    tanggal_lahir: '2009-01-18',
    kelas_id: 'KLS-11-A',
    tahun_ajaran: '2026/2027',
    status: 'aktif',
    nama_ortu: 'Drs. Sukardi',
    kontak_ortu: '0812-3344-5566',
    alamat: 'Jl. Dahlia No. 19, Cipete, Jakarta Selatan'
  },
  {
    siswa_id: 'SIS-004',
    nis: '20251104',
    nisn: '0087654324',
    nama_lengkap: 'Nadia Putri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Depok',
    tanggal_lahir: '2009-06-30',
    kelas_id: 'KLS-11-A',
    tahun_ajaran: '2026/2027',
    status: 'aktif',
    nama_ortu: 'Bambang Supriyanto',
    kontak_ortu: '0813-4455-6677',
    alamat: 'Jl. Anggrek No. 8, Cilandak, Jakarta Selatan'
  },
  {
    siswa_id: 'SIS-005',
    nis: '20261001',
    nisn: '0091122334',
    nama_lengkap: 'Dimas Aditya',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '2010-02-14',
    kelas_id: 'KLS-10-A',
    tahun_ajaran: '2026/2027',
    status: 'aktif',
    nama_ortu: 'Gunawan Prasetya',
    kontak_ortu: '0815-5566-7788',
    alamat: 'Jl. Flamboyan No. 2, Pasar Minggu, Jakarta Selatan'
  }
];

export const INITIAL_ORANG_TUA: OrangTua[] = [
  {
    ortu_id: 'ORT-001',
    nama_lengkap: 'Ir. Hendra Pratama',
    hubungan: 'Ayah',
    pekerjaan: 'Engineer Senior di Perusahaan BUMN',
    kontak: '0811-9876-1234',
    email: 'hendra.pratama@gmail.com',
    alamat: 'Jl. Melati Hijau Blok B4 No. 12, Kebayoran Baru, Jakarta Selatan'
  },
  {
    ortu_id: 'ORT-002',
    nama_lengkap: 'Drs. Sukardi',
    hubungan: 'Ayah',
    pekerjaan: 'Wiraswasta',
    kontak: '0812-3344-5566',
    email: 'sukardi.toko@gmail.com',
    alamat: 'Jl. Dahlia No. 19, Cipete, Jakarta Selatan'
  }
];

export const INITIAL_RELASI_ORTU: RelasiOrtuSiswa[] = [
  { id: 'REL-001', ortu_id: 'ORT-001', siswa_id: 'SIS-001', status_verifikasi: 'terverifikasi' },
  { id: 'REL-002', ortu_id: 'ORT-001', siswa_id: 'SIS-002', status_verifikasi: 'terverifikasi' },
  { id: 'REL-003', ortu_id: 'ORT-002', siswa_id: 'SIS-003', status_verifikasi: 'terverifikasi' }
];

export const INITIAL_MAPEL: MataPelajaran[] = [
  { mapel_id: 'MPL-001', kode_mapel: 'FIS-11', nama_mapel: 'Fisika Lanjut', kategori: 'Peminatan', kkm: 75, beban_jam: 4 },
  { mapel_id: 'MPL-002', kode_mapel: 'MAT-11', nama_mapel: 'Matematika Peminatan', kategori: 'Peminatan', kkm: 78, beban_jam: 4 },
  { mapel_id: 'MPL-003', kode_mapel: 'KIM-11', nama_mapel: 'Kimia Analitik Dasar', kategori: 'Peminatan', kkm: 75, beban_jam: 3 },
  { mapel_id: 'MPL-004', kode_mapel: 'ENG-11', nama_mapel: 'Bahasa Inggris Academic', kategori: 'Wajib', kkm: 80, beban_jam: 3 },
  { mapel_id: 'MPL-005', kode_mapel: 'INF-11', nama_mapel: 'Informatika & AI Literacy', kategori: 'Wajib', kkm: 78, beban_jam: 3 },
  { mapel_id: 'MPL-006', kode_mapel: 'PAI-11', nama_mapel: 'Pendidikan Agama & Budi Pekerti', kategori: 'Wajib', kkm: 80, beban_jam: 2 }
];

export const INITIAL_JADWAL: JadwalPelajaran[] = [
  { jadwal_id: 'JDW-001', kelas_id: 'KLS-11-A', mapel_id: 'MPL-001', mapel_nama: 'Fisika Lanjut', guru_id: 'GRU-001', guru_nama: 'Drs. Budi Santoso, M.Pd', hari: 'Senin', jam_mulai: '07:30', jam_selesai: '09:00', ruang: 'Lab Fisika Modern' },
  { jadwal_id: 'JDW-002', kelas_id: 'KLS-11-A', mapel_id: 'MPL-002', mapel_nama: 'Matematika Peminatan', guru_id: 'GRU-002', guru_nama: 'Sri Wahyuni, S.Pd', hari: 'Senin', jam_mulai: '09:15', jam_selesai: '10:45', ruang: 'Ruang 204' },
  { jadwal_id: 'JDW-003', kelas_id: 'KLS-11-A', mapel_id: 'MPL-005', mapel_nama: 'Informatika & AI Literacy', guru_id: 'GRU-005', guru_nama: 'Eko Prasetyo, M.Kom', hari: 'Selasa', jam_mulai: '07:30', jam_selesai: '09:45', ruang: 'Lab Komputer 1' },
  { jadwal_id: 'JDW-004', kelas_id: 'KLS-11-A', mapel_id: 'MPL-004', mapel_nama: 'Bahasa Inggris Academic', guru_id: 'GRU-004', guru_nama: 'Farida Nur, S.Pd', hari: 'Rabu', jam_mulai: '10:00', jam_selesai: '11:30', ruang: 'Ruang 204' },
  { jadwal_id: 'JDW-005', kelas_id: 'KLS-11-A', mapel_id: 'MPL-003', mapel_nama: 'Kimia Analitik Dasar', guru_id: 'GRU-003', guru_nama: 'Agus Salim, M.Si', hari: 'Kamis', jam_mulai: '08:00', jam_selesai: '10:00', ruang: 'Lab Kimia Terpadu' }
];

export const INITIAL_PRESENSI_SISWA: PresensiSiswa[] = [
  { presensi_id: 'PRS-001', siswa_id: 'SIS-001', siswa_nama: 'Ahmad Fauzi', kelas_id: 'KLS-11-A', tanggal: '2026-11-04', status: 'hadir', diinput_oleh: 'Staff Piket', created_at: '2026-11-04T06:55:00Z' },
  { presensi_id: 'PRS-002', siswa_id: 'SIS-002', siswa_nama: 'Siti Rahma', kelas_id: 'KLS-11-A', tanggal: '2026-11-04', status: 'hadir', diinput_oleh: 'Staff Piket', created_at: '2026-11-04T06:58:00Z' },
  { presensi_id: 'PRS-003', siswa_id: 'SIS-003', siswa_nama: 'Rizky Ramadhan', kelas_id: 'KLS-11-A', tanggal: '2026-11-04', status: 'terlambat', menit_terlambat: 15, keterangan: 'Kendala ban motor bocor', diinput_oleh: 'Staff Piket', created_at: '2026-11-04T07:15:00Z' },
  { presensi_id: 'PRS-004', siswa_id: 'SIS-004', siswa_nama: 'Nadia Putri', kelas_id: 'KLS-11-A', tanggal: '2026-11-04', status: 'sakit', keterangan: 'Demam flu berobat ke Puskesmas', diinput_oleh: 'Staff Piket', created_at: '2026-11-04T07:30:00Z' },
  { presensi_id: 'PRS-005', siswa_id: 'SIS-005', siswa_nama: 'Dimas Aditya', kelas_id: 'KLS-10-A', tanggal: '2026-11-04', status: 'hadir', diinput_oleh: 'Staff Piket', created_at: '2026-11-04T06:50:00Z' },
  // Historical
  { presensi_id: 'PRS-006', siswa_id: 'SIS-001', siswa_nama: 'Ahmad Fauzi', kelas_id: 'KLS-11-A', tanggal: '2026-11-03', status: 'hadir', diinput_oleh: 'Guru Fisika', created_at: '2026-11-03T07:00:00Z' },
  { presensi_id: 'PRS-007', siswa_id: 'SIS-001', siswa_nama: 'Ahmad Fauzi', kelas_id: 'KLS-11-A', tanggal: '2026-11-02', status: 'hadir', diinput_oleh: 'Staff Piket', created_at: '2026-11-02T06:55:00Z' },
  { presensi_id: 'PRS-008', siswa_id: 'SIS-002', siswa_nama: 'Siti Rahma', kelas_id: 'KLS-11-A', tanggal: '2026-11-03', status: 'izin', keterangan: 'Olimpiade Biologi Tingkat Kota', diinput_oleh: 'Guru Biologi', created_at: '2026-11-03T07:00:00Z' }
];

export const INITIAL_PRESENSI_GURU: PresensiGuru[] = [
  { presensi_id: 'PRG-001', guru_id: 'GRU-001', guru_nama: 'Drs. Budi Santoso, M.Pd', tanggal: '2026-11-04', jam_masuk: '06:45', status: 'hadir' },
  { presensi_id: 'PRG-002', guru_id: 'GRU-002', guru_nama: 'Sri Wahyuni, S.Pd', tanggal: '2026-11-04', jam_masuk: '06:50', status: 'hadir' },
  { presensi_id: 'PRG-003', guru_id: 'GRU-003', guru_nama: 'Agus Salim, M.Si', tanggal: '2026-11-04', jam_masuk: '07:05', status: 'terlambat', keterangan: 'Macet di tol timur' },
  { presensi_id: 'PRG-004', guru_id: 'GRU-004', guru_nama: 'Farida Nur, S.Pd', tanggal: '2026-11-04', jam_masuk: '06:40', status: 'hadir' },
  { presensi_id: 'PRG-005', guru_id: 'GRU-005', guru_nama: 'Eko Prasetyo, M.Kom', tanggal: '2026-11-04', jam_masuk: '06:55', status: 'hadir' }
];

export const INITIAL_NILAI: NilaiSiswa[] = [
  {
    nilai_id: 'NLI-001',
    siswa_id: 'SIS-001',
    siswa_nama: 'Ahmad Fauzi',
    kelas_id: 'KLS-11-A',
    mapel_id: 'MPL-001',
    mapel_nama: 'Fisika Lanjut',
    guru_id: 'GRU-001',
    semester: 'Ganjil',
    tahun_ajaran: '2026/2027',
    tugas: 92,
    kuis: 88,
    praktik: 95,
    ujian: 90,
    nilai_akhir: 91.3, // (92*0.2) + (88*0.15) + (95*0.25) + (90*0.4) = 18.4 + 13.2 + 23.75 + 36 = 91.35
    predikat: 'A',
    catatan_guru: 'Pemahaman konsep mekanika kuantum dan hukum gerak sangat matang.',
    status_kunci: 'terpublikasi',
    updated_at: '2026-11-02T10:00:00Z'
  },
  {
    nilai_id: 'NLI-002',
    siswa_id: 'SIS-001',
    siswa_nama: 'Ahmad Fauzi',
    kelas_id: 'KLS-11-A',
    mapel_id: 'MPL-002',
    mapel_nama: 'Matematika Peminatan',
    guru_id: 'GRU-002',
    semester: 'Ganjil',
    tahun_ajaran: '2026/2027',
    tugas: 88,
    kuis: 85,
    praktik: 87,
    ujian: 89,
    nilai_akhir: 87.7,
    predikat: 'A',
    catatan_guru: 'Kemampuan kalkulus diferensial dan matriks sangat baik.',
    status_kunci: 'terpublikasi',
    updated_at: '2026-11-01T11:00:00Z'
  },
  {
    nilai_id: 'NLI-003',
    siswa_id: 'SIS-001',
    siswa_nama: 'Ahmad Fauzi',
    kelas_id: 'KLS-11-A',
    mapel_id: 'MPL-005',
    mapel_nama: 'Informatika & AI Literacy',
    guru_id: 'GRU-005',
    semester: 'Ganjil',
    tahun_ajaran: '2026/2027',
    tugas: 95,
    kuis: 94,
    praktik: 98,
    ujian: 92,
    nilai_akhir: 94.4,
    predikat: 'A',
    catatan_guru: 'Sangat piawai dalam logika algoritma dan pemrograman web terapan.',
    status_kunci: 'terpublikasi',
    updated_at: '2026-11-03T15:00:00Z'
  },
  {
    nilai_id: 'NLI-004',
    siswa_id: 'SIS-002',
    siswa_nama: 'Siti Rahma',
    kelas_id: 'KLS-11-A',
    mapel_id: 'MPL-001',
    mapel_nama: 'Fisika Lanjut',
    guru_id: 'GRU-001',
    semester: 'Ganjil',
    tahun_ajaran: '2026/2027',
    tugas: 85,
    kuis: 82,
    praktik: 88,
    ujian: 84,
    nilai_akhir: 84.9,
    predikat: 'B',
    catatan_guru: 'Aktif saat eksperimen laboratorium dan laporan tertata rapi.',
    status_kunci: 'terpublikasi',
    updated_at: '2026-11-02T10:00:00Z'
  },
  {
    nilai_id: 'NLI-005',
    siswa_id: 'SIS-003',
    siswa_nama: 'Rizky Ramadhan',
    kelas_id: 'KLS-11-A',
    mapel_id: 'MPL-001',
    mapel_nama: 'Fisika Lanjut',
    guru_id: 'GRU-001',
    semester: 'Ganjil',
    tahun_ajaran: '2026/2027',
    tugas: 78,
    kuis: 74,
    praktik: 80,
    ujian: 76,
    nilai_akhir: 77.1,
    predikat: 'B',
    catatan_guru: 'Tingkatkan latihan mandiri pada soal perbandingan vektor.',
    status_kunci: 'terpublikasi',
    updated_at: '2026-11-02T10:00:00Z'
  }
];

export const INITIAL_PRESTASI: PrestasiSiswa[] = [
  {
    prestasi_id: 'PRS-001',
    siswa_id: 'SIS-001',
    siswa_nama: 'Ahmad Fauzi',
    kelas_nama: 'XI MIPA 1',
    jenis_prestasi: 'Akademik',
    bidang: 'Fisika Terapan & Astronomi',
    tingkat: 'Nasional',
    nama_kompetisi: 'Olimpiade Sains Nasional (OSN) 2026',
    penyelenggara: 'Balai Pengembangan Talenta Indonesia (Kemendikbud)',
    peringkat: 'Medali Emas (Peringkat 1)',
    tanggal: '2026-09-18',
    deskripsi: 'Memperoleh medali emas bidang Fisika SMA dengan proyek analisis orbit satelit nano.',
    tampilkan_di_web: true,
    status_verifikasi: 'terverifikasi'
  },
  {
    prestasi_id: 'PRS-002',
    siswa_id: 'SIS-002',
    siswa_nama: 'Siti Rahma',
    kelas_nama: 'XI MIPA 1',
    jenis_prestasi: 'Teknologi',
    bidang: 'Karya Tulis Ilmiah Remaja',
    tingkat: 'Provinsi',
    nama_kompetisi: 'Lomba Peneliti Belia DKI Jakarta 2026',
    penyelenggara: 'Dinas Pendidikan DKI Jakarta',
    peringkat: 'Juara 1 Bidang Lingkungan',
    tanggal: '2026-10-12',
    deskripsi: 'Mengembangkan inovasi bioplastik dari limbah ampas kopi dan kitosan udang.',
    tampilkan_di_web: true,
    status_verifikasi: 'terverifikasi'
  },
  {
    prestasi_id: 'PRS-003',
    siswa_id: 'SIS-004',
    siswa_nama: 'Nadia Putri',
    kelas_nama: 'XI MIPA 1',
    jenis_prestasi: 'Seni',
    bidang: 'Debat Bahasa Inggris (NSDC)',
    tingkat: 'Nasional',
    nama_kompetisi: 'National Schools Debating Championship 2026',
    penyelenggara: 'Pusat Prestasi Nasional',
    peringkat: 'Best Speaker & 2nd Runner Up',
    tanggal: '2026-08-20',
    deskripsi: 'Penghargaan pembicara terbaik dalam mosi Sustainable Global Economics.',
    tampilkan_di_web: true,
    status_verifikasi: 'terverifikasi'
  }
];

export const INITIAL_BUKU_TAMU: BukuTamu[] = [
  {
    tamu_id: 'TMU-001',
    nama_tamu: 'Drs. Supriyanto, M.M.',
    instansi: 'Pengawas Sekolah Sudin Pendidikan Wilayah I Jakarta Selatan',
    kontak: '0812-7788-9900',
    tujuan_kunjungan: 'Supervisi Manajerial dan Peninjauan Lab Riset',
    bertemu_dengan: 'Kepala Sekolah (Dr. Hj. Siti Nurhaliza, M.Pd)',
    waktu_datang: '2026-11-04 08:30 WIB',
    waktu_keluar: '2026-11-04 11:00 WIB',
    catatan: 'Tata kelola kurikulum dan kebersihan lab fisika sangat prima.',
    created_at: '2026-11-04T08:30:00Z'
  },
  {
    tamu_id: 'TMU-002',
    nama_tamu: 'Prof. Dr. Ir. Gunawan Wibowo',
    instansi: 'Fakultas Teknik Universitas Indonesia',
    kontak: '0811-1234-5678',
    tujuan_kunjungan: 'Penandatanganan Nota Kesepahaman (MoU) Laboratorium Binaan',
    bertemu_dengan: 'Wakasek Kurikulum & Humas',
    waktu_datang: '2026-11-04 09:15 WIB',
    catatan: 'Rapat koordinasi program pembinaan robotika siswa.',
    created_at: '2026-11-04T09:15:00Z'
  },
  {
    tamu_id: 'TMU-003',
    nama_tamu: 'Ibu Ratna Dewi',
    instansi: 'Orang Tua Calon Peserta Didik Baru (PPDB)',
    kontak: '0817-6655-4433',
    tujuan_kunjungan: 'Konsultasi Peminatan Kelas Internasional & Beasiswa Tahfidz',
    bertemu_dengan: 'Panitia PPDB / Bagian Informasi Kesiswaan',
    waktu_datang: '2026-11-04 10:00 WIB',
    created_at: '2026-11-04T10:00:00Z'
  }
];

export const INITIAL_MASTER_SPP: MasterSPP[] = [
  { spp_id: 'SPP-10-MIPA', nama_paket: 'SPP Reguler Kelas 10 MIPA', tingkat: '10', jurusan: 'MIPA', tahun_ajaran: '2026/2027', nominal_per_bulan: 750000, tanggal_jatuh_tempo: 10 },
  { spp_id: 'SPP-10-IPS', nama_paket: 'SPP Reguler Kelas 10 IPS', tingkat: '10', jurusan: 'IPS', tahun_ajaran: '2026/2027', nominal_per_bulan: 700000, tanggal_jatuh_tempo: 10 },
  { spp_id: 'SPP-11-MIPA', nama_paket: 'SPP Reguler Kelas 11 MIPA', tingkat: '11', jurusan: 'MIPA', tahun_ajaran: '2026/2027', nominal_per_bulan: 800000, tanggal_jatuh_tempo: 10 },
  { spp_id: 'SPP-11-IPS', nama_paket: 'SPP Reguler Kelas 11 IPS', tingkat: '11', jurusan: 'IPS', tahun_ajaran: '2026/2027', nominal_per_bulan: 750000, tanggal_jatuh_tempo: 10 },
  { spp_id: 'SPP-12-MIPA', nama_paket: 'SPP Reguler Kelas 12 MIPA', tingkat: '12', jurusan: 'MIPA', tahun_ajaran: '2026/2027', nominal_per_bulan: 850000, tanggal_jatuh_tempo: 10 }
];

export const INITIAL_TAGIHAN_SPP: TagihanSPP[] = [
  {
    tagihan_id: 'TGH-202611-001',
    siswa_id: 'SIS-001',
    siswa_nama: 'Ahmad Fauzi',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    tahun_ajaran: '2026/2027',
    nominal_pokok: 800000,
    diskon_beasiswa: 150000, // Beasiswa Juara OSN
    denda: 0,
    total_tagihan: 650000,
    total_terbayar: 650000,
    sisa_tagihan: 0,
    status: 'lunas',
    jatuh_tempo: '2026-11-10',
    created_at: '2026-11-01T00:00:00Z'
  },
  {
    tagihan_id: 'TGH-202611-002',
    siswa_id: 'SIS-002',
    siswa_nama: 'Siti Rahma',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    tahun_ajaran: '2026/2027',
    nominal_pokok: 800000,
    diskon_beasiswa: 0,
    denda: 0,
    total_tagihan: 800000,
    total_terbayar: 400000,
    sisa_tagihan: 400000,
    status: 'dibayar_sebagian',
    jatuh_tempo: '2026-11-10',
    created_at: '2026-11-01T00:00:00Z'
  },
  {
    tagihan_id: 'TGH-202611-003',
    siswa_id: 'SIS-003',
    siswa_nama: 'Rizky Ramadhan',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    tahun_ajaran: '2026/2027',
    nominal_pokok: 800000,
    diskon_beasiswa: 0,
    denda: 0,
    total_tagihan: 800000,
    total_terbayar: 0,
    sisa_tagihan: 800000,
    status: 'belum_dibayar',
    jatuh_tempo: '2026-11-10',
    created_at: '2026-11-01T00:00:00Z'
  },
  {
    tagihan_id: 'TGH-202611-004',
    siswa_id: 'SIS-004',
    siswa_nama: 'Nadia Putri',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    tahun_ajaran: '2026/2027',
    nominal_pokok: 800000,
    diskon_beasiswa: 0,
    denda: 0,
    total_tagihan: 800000,
    total_terbayar: 800000,
    sisa_tagihan: 0,
    status: 'lunas',
    jatuh_tempo: '2026-11-10',
    created_at: '2026-11-01T00:00:00Z'
  },
  {
    tagihan_id: 'TGH-202610-003',
    siswa_id: 'SIS-003',
    siswa_nama: 'Rizky Ramadhan',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'Oktober 2026',
    tahun_ajaran: '2026/2027',
    nominal_pokok: 800000,
    diskon_beasiswa: 0,
    denda: 25000,
    total_tagihan: 825000,
    total_terbayar: 0,
    sisa_tagihan: 825000,
    status: 'lewat_jatuh_tempo',
    jatuh_tempo: '2026-10-10',
    created_at: '2026-10-01T00:00:00Z'
  }
];

export const INITIAL_PEMBAYARAN_SPP: PembayaranSPP[] = [
  {
    pembayaran_id: 'PBY-202611-001',
    nomor_kuitansi: 'KWT/2026/XI/0081',
    tagihan_id: 'TGH-202611-001',
    siswa_id: 'SIS-001',
    siswa_nama: 'Ahmad Fauzi',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    nominal_bayar: 650000,
    metode_pembayaran: 'Transfer Bank',
    nomor_referensi: 'TRF-BSI-992144',
    tanggal_pembayaran: '2026-11-02 09:30',
    kasir_nama: 'Dewi Lestari, S.E., Ak.',
    catatan: 'Lunas SPP November (Potongan Beasiswa OSN Rp 150.000)',
    jurnal_id: 'JRN-202611-001'
  },
  {
    pembayaran_id: 'PBY-202611-002',
    nomor_kuitansi: 'KWT/2026/XI/0082',
    tagihan_id: 'TGH-202611-002',
    siswa_id: 'SIS-002',
    siswa_nama: 'Siti Rahma',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    nominal_bayar: 400000,
    metode_pembayaran: 'QRIS',
    nomor_referensi: 'QRS-8899110022',
    tanggal_pembayaran: '2026-11-03 14:15',
    kasir_nama: 'Dewi Lestari, S.E., Ak.',
    catatan: 'Cicilan 1 SPP November (Sisa Rp 400.000)',
    jurnal_id: 'JRN-202611-002'
  },
  {
    pembayaran_id: 'PBY-202611-003',
    nomor_kuitansi: 'KWT/2026/XI/0083',
    tagihan_id: 'TGH-202611-004',
    siswa_id: 'SIS-004',
    siswa_nama: 'Nadia Putri',
    kelas_nama: 'XI MIPA 1',
    periode_bulan: 'November 2026',
    nominal_bayar: 800000,
    metode_pembayaran: 'Virtual Account',
    nomor_referensi: 'VA-MANDIRI-449102',
    tanggal_pembayaran: '2026-11-03 16:40',
    kasir_nama: 'Dewi Lestari, S.E., Ak.',
    catatan: 'Lunas SPP November',
    jurnal_id: 'JRN-202611-003'
  }
];

export const INITIAL_AKUN_AKUNTANSI: AkunAkuntansi[] = [
  { kode_akun: '111-01', nama_akun: 'Kas Operasional Tunai', tipe: 'Aset', posisi_normal: 'Debit', saldo_berjalan: 15450000 },
  { kode_akun: '111-02', nama_akun: 'Bank BSI Rekening Yayasan', tipe: 'Aset', posisi_normal: 'Debit', saldo_berjalan: 184500000 },
  { kode_akun: '112-01', nama_akun: 'Piutang SPP Siswa', tipe: 'Aset', posisi_normal: 'Debit', saldo_berjalan: 1625000 },
  { kode_akun: '211-01', nama_akun: 'Hutang Gaji & Honor Guru', tipe: 'Kewajiban', posisi_normal: 'Kredit', saldo_berjalan: 0 },
  { kode_akun: '311-01', nama_akun: 'Modal Awal Yayasan', tipe: 'Ekuitas', posisi_normal: 'Kredit', saldo_berjalan: 150000000 },
  { kode_akun: '411-01', nama_akun: 'Pendapatan SPP Siswa', tipe: 'Pendapatan', posisi_normal: 'Kredit', saldo_berjalan: 38500000 },
  { kode_akun: '411-02', nama_akun: 'Pendapatan Dana BOS', tipe: 'Pendapatan', posisi_normal: 'Kredit', saldo_berjalan: 75000000 },
  { kode_akun: '511-01', nama_akun: 'Beban Gaji & Tunjangan Pegawai', tipe: 'Beban', posisi_normal: 'Debit', saldo_berjalan: 42000000 },
  { kode_akun: '511-02', nama_akun: 'Beban Operasional Listrik & Air', tipe: 'Beban', posisi_normal: 'Debit', saldo_berjalan: 4500000 },
  { kode_akun: '511-03', nama_akun: 'Beban Praktikum & Lab Sains', tipe: 'Beban', posisi_normal: 'Debit', saldo_berjalan: 8200000 },
  { kode_akun: '511-04', nama_akun: 'Beban Pemeliharaan Sarana & IT', tipe: 'Beban', posisi_normal: 'Debit', saldo_berjalan: 3600000 }
];

export const INITIAL_JURNAL_UMUM: JurnalUmum[] = [
  {
    jurnal_id: 'JRN-202611-001',
    nomor_jurnal: 'JU/2026/11/001',
    tanggal: '2026-11-02',
    referensi: 'KWT/2026/XI/0081',
    keterangan: 'Penerimaan SPP Nov 2026 - Ahmad Fauzi (BSI)',
    total_debit: 650000,
    total_kredit: 650000,
    is_balanced: true,
    detail: [
      { kode_akun: '111-02', nama_akun: 'Bank BSI Rekening Yayasan', debit: 650000, kredit: 0 },
      { kode_akun: '112-01', nama_akun: 'Piutang SPP Siswa', debit: 0, kredit: 650000 }
    ],
    created_at: '2026-11-02T09:30:00Z'
  },
  {
    jurnal_id: 'JRN-202611-002',
    nomor_jurnal: 'JU/2026/11/002',
    tanggal: '2026-11-03',
    referensi: 'KWT/2026/XI/0082',
    keterangan: 'Penerimaan Cicilan SPP Nov 2026 - Siti Rahma (QRIS)',
    total_debit: 400000,
    total_kredit: 400000,
    is_balanced: true,
    detail: [
      { kode_akun: '111-02', nama_akun: 'Bank BSI Rekening Yayasan', debit: 400000, kredit: 0 },
      { kode_akun: '112-01', nama_akun: 'Piutang SPP Siswa', debit: 0, kredit: 400000 }
    ],
    created_at: '2026-11-03T14:15:00Z'
  },
  {
    jurnal_id: 'JRN-202611-003',
    nomor_jurnal: 'JU/2026/11/003',
    tanggal: '2026-11-03',
    referensi: 'BKK/2026/11/0012',
    keterangan: 'Pembelian Reagen Kimia & Kit Uji Lab Sains',
    total_debit: 1250000,
    total_kredit: 1250000,
    is_balanced: true,
    detail: [
      { kode_akun: '511-03', nama_akun: 'Beban Praktikum & Lab Sains', debit: 1250000, kredit: 0 },
      { kode_akun: '111-01', nama_akun: 'Kas Operasional Tunai', debit: 0, kredit: 1250000 }
    ],
    created_at: '2026-11-03T15:30:00Z'
  }
];

export const INITIAL_TRANSAKSI_KEUANGAN: TransaksiKeuangan[] = [
  {
    transaksi_id: 'TRX-001',
    nomor_bukti: 'BKM/2026/11/0081',
    tanggal: '2026-11-02',
    tipe: 'pemasukan',
    kategori: 'SPP Siswa',
    keterangan: 'Penerimaan SPP Nov 2026 - Ahmad Fauzi',
    nominal: 650000,
    akun_kas: 'Bank BSI Rekening Yayasan',
    dibuat_oleh: 'Dewi Lestari, S.E., Ak.',
    jurnal_id: 'JRN-202611-001'
  },
  {
    transaksi_id: 'TRX-002',
    nomor_bukti: 'BKM/2026/11/0082',
    tanggal: '2026-11-03',
    tipe: 'pemasukan',
    kategori: 'SPP Siswa',
    keterangan: 'Penerimaan Cicilan SPP Nov 2026 - Siti Rahma',
    nominal: 400000,
    akun_kas: 'Bank BSI Rekening Yayasan',
    dibuat_oleh: 'Dewi Lestari, S.E., Ak.',
    jurnal_id: 'JRN-202611-002'
  },
  {
    transaksi_id: 'TRX-003',
    nomor_bukti: 'BKK/2026/11/0012',
    tanggal: '2026-11-03',
    tipe: 'pengeluaran',
    kategori: 'Operasional Praktikum Lab',
    keterangan: 'Pembelian bahan praktikum Kimia semester ganjil',
    nominal: 1250000,
    akun_kas: 'Kas Operasional Tunai',
    dibuat_oleh: 'Dewi Lestari, S.E., Ak.',
    jurnal_id: 'JRN-202611-003'
  },
  {
    transaksi_id: 'TRX-004',
    nomor_bukti: 'BKK/2026/11/0013',
    tanggal: '2026-11-04',
    tipe: 'pengeluaran',
    kategori: 'Pemeliharaan IT & Internet',
    keterangan: 'Langganan Dedicated Bandwidth Internet Fiber 200Mbps',
    nominal: 1800000,
    akun_kas: 'Bank BSI Rekening Yayasan',
    dibuat_oleh: 'Dewi Lestari, S.E., Ak.'
  }
];

export const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    pengumuman_id: 'PGM-001',
    judul: 'Pelaksanaan Penilaian Akhir Semester (PAS) Ganjil TA 2026/2027',
    kategori: 'Akademik',
    konten: 'Diberitahukan kepada seluruh siswa dan wali murid bahwa pelaksanaan PAS Ganjil akan dimulai pada tanggal 1-12 Desember 2026 berbasis Computer-Based Test (CBT). Harap menuntaskan administrasi akademik dan kehadiran minimal 85%.',
    target_audiens: 'Semua',
    tanggal_terbit: '2026-11-01',
    dibuat_oleh: 'Wakasek Kurikulum',
    is_pinned: true
  },
  {
    pengumuman_id: 'PGM-002',
    judul: 'Batas Akhir Pembayaran SPP Bulan November 2026',
    kategori: 'Keuangan',
    konten: 'Jatuh tempo pembayaran SPP setiap bulan adalah tanggal 10. Pembayaran dapat dilakukan via Transfer Bank BSI, Mandiri VA, QRIS, atau langsung di loket kasir sekolah.',
    target_audiens: 'Orang Tua',
    tanggal_terbit: '2026-11-01',
    dibuat_oleh: 'Bagian Keuangan',
    is_pinned: false
  },
  {
    pengumuman_id: 'PGM-003',
    judul: 'Prestasi Gemilang Kontingen OSN Nasional di Balikpapan',
    kategori: 'Kegiatan',
    konten: 'Selamat atas keberhasilan ananda Ahmad Fauzi (XI MIPA 1) yang berhasil meraih Medali Emas Bidang Fisika Terapan dalam Olimpiade Sains Nasional tingkat Nasional 2026.',
    target_audiens: 'Semua',
    tanggal_terbit: '2026-10-20',
    dibuat_oleh: 'Kepala Sekolah',
    is_pinned: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    log_id: 'LOG-001',
    timestamp: '2026-11-04T08:30:12Z',
    user_id: 'USR-004',
    username: 'piket',
    role: 'staff_piket',
    aksi: 'CHECKIN_TAMU',
    modul: 'Buku Tamu',
    detail: 'Mencatat kedatangan tamu Pengawas Sekolah (Drs. Supriyanto, M.M.)',
    status: 'sukses'
  },
  {
    log_id: 'LOG-002',
    timestamp: '2026-11-04T07:15:20Z',
    user_id: 'USR-004',
    username: 'piket',
    role: 'staff_piket',
    aksi: 'INPUT_KETERLAMBATAN',
    modul: 'Presensi',
    detail: 'Mencatat keterlambatan 15 menit siswa Rizky Ramadhan (XI MIPA 1)',
    status: 'sukses'
  },
  {
    log_id: 'LOG-003',
    timestamp: '2026-11-03T14:15:44Z',
    user_id: 'USR-002',
    username: 'keuangan',
    role: 'admin_keuangan',
    aksi: 'INPUT_PEMBAYARAN_SPP',
    modul: 'Keuangan',
    detail: 'Menerbitkan Kuitansi KWT/2026/XI/0082 sebesar Rp 400.000 (Siti Rahma)',
    status: 'sukses'
  },
  {
    log_id: 'LOG-004',
    timestamp: '2026-11-03T15:00:19Z',
    user_id: 'USR-005',
    username: 'guru',
    role: 'guru',
    aksi: 'UPDATE_NILAI',
    modul: 'Nilai',
    detail: 'Menyimpan nilai Informatika dan AI Literacy kelas XI MIPA 1',
    status: 'sukses'
  },
  {
    log_id: 'LOG-005',
    timestamp: '2026-11-03T09:00:00Z',
    user_id: 'USR-001',
    username: 'admin',
    role: 'admin_sekolah',
    aksi: 'SYNC_SHEETS_AKADEMIK',
    modul: 'Sheets',
    detail: 'Sinkronisasi dua arah Spreadsheet Akademik (19 worksheet terverifikasi)',
    status: 'sukses'
  }
];

export const INITIAL_SHEETS_CONFIG: GoogleSheetsConfig = {
  spreadsheet_id_akademik: '13ohWc_DhrKXXogQnK2JWwxQfGYwo0KVV5gu20cfAt68',
  spreadsheet_id_keuangan: '17vf-FEBzvboyiESP7QFKvP7dIUwT6XiChCOIQuuOJm0',
  api_key: 'AIzaSyDemo-SIM-Sekolah-Sheets-Key-2026',
  service_account_email: 'sim-sekolah-service@academic-cloud-2026.iam.gserviceaccount.com',
  auto_sync_interval_mins: 1, // Sinkronisasi otomatis setiap 1 menit
  auto_sync_enabled: true,
  last_sync_akademik: 'Hari ini',
  last_sync_keuangan: 'Hari ini',
  sync_status: 'terhubung'
};
