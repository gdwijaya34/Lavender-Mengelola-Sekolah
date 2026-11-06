import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Siswa, Guru, Kelas, MataPelajaran, JadwalPelajaran } from '../../types';
import {
  GraduationCap,
  Users,
  Building,
  BookOpen,
  Calendar,
  CheckSquare,
  TrendingUp,
  Award,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Download,
  HeartHandshake
} from 'lucide-react';
import { PenghubungOrtuSiswaView } from '../../components/dashboard/PenghubungOrtuSiswaView';

interface AkademikDashboardProps {
  initialTab?: string;
}

export const AkademikDashboard: React.FC<AkademikDashboardProps> = ({ initialTab = 'siswa' }) => {
  const {
    siswa,
    guru,
    kelas,
    mapel,
    jadwal,
    nilai,
    prestasi,
    relasiOrtuSiswa,
    saveSiswa,
    deleteSiswa,
    saveGuru,
    saveKelas,
    saveMapel,
    saveNilai,
    config,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Siswa Form
  const [showSiswaModal, setShowSiswaModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [formSiswa, setFormSiswa] = useState<Partial<Siswa>>({
    nis: '',
    nisn: '',
    nama_lengkap: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2009-01-01',
    kelas_id: kelas[0]?.kelas_id || 'KLS-10-A',
    tahun_ajaran: config.tahun_ajaran_aktif,
    status: 'aktif',
    nama_ortu: '',
    kontak_ortu: '',
    alamat: ''
  });

  const handleOpenAddSiswa = () => {
    setEditingSiswa(null);
    setFormSiswa({
      nis: `2026${Math.floor(1000 + Math.random() * 9000)}`,
      nisn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      nama_lengkap: '',
      jenis_kelamin: 'L',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '2009-05-15',
      kelas_id: kelas[0]?.kelas_id || 'KLS-10-A',
      tahun_ajaran: config.tahun_ajaran_aktif,
      status: 'aktif',
      nama_ortu: '',
      kontak_ortu: '',
      alamat: ''
    });
    setShowSiswaModal(true);
  };

  const handleOpenEditSiswa = (s: Siswa) => {
    setEditingSiswa(s);
    setFormSiswa(s);
    setShowSiswaModal(true);
  };

  const handleSaveSiswaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiswa.nama_lengkap || !formSiswa.nis) {
      addToast('error', 'Validasi Gagal', 'Nama lengkap dan NIS wajib diisi.');
      return;
    }

    const newSiswa: Siswa = {
      siswa_id: editingSiswa ? editingSiswa.siswa_id : `SIS-${Date.now().toString().slice(-4)}`,
      nis: formSiswa.nis!,
      nisn: formSiswa.nisn || '',
      nama_lengkap: formSiswa.nama_lengkap!,
      jenis_kelamin: (formSiswa.jenis_kelamin as 'L' | 'P') || 'L',
      tempat_lahir: formSiswa.tempat_lahir || 'Jakarta',
      tanggal_lahir: formSiswa.tanggal_lahir || '2009-01-01',
      kelas_id: formSiswa.kelas_id || 'KLS-10-A',
      tahun_ajaran: formSiswa.tahun_ajaran || config.tahun_ajaran_aktif,
      status: formSiswa.status || 'aktif',
      nama_ortu: formSiswa.nama_ortu || '',
      kontak_ortu: formSiswa.kontak_ortu || '',
      alamat: formSiswa.alamat || ''
    };

    saveSiswa(newSiswa);
    setShowSiswaModal(false);
  };

  const handleLockGrade = (gradeId: string, currentStatus: string) => {
    const found = nilai.find(n => n.nilai_id === gradeId);
    if (found) {
      const newStatus = currentStatus === 'terkunci' ? 'terpublikasi' : 'terkunci';
      saveNilai({ ...found, status_kunci: newStatus });
      addToast('info', 'Status Nilai Berubah', `Nilai ${found.mapel_nama} (${found.siswa_nama}) diubah status menjadi [${newStatus}].`);
    }
  };

  // Filtered lists
  const filteredSiswa = siswa.filter(
    s =>
      s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery)
  );

  const filteredGuru = guru.filter(
    g =>
      g.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.includes(searchQuery) ||
      g.mapel_utama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-700">
            Administrasi Kurikulum & Kesiswaan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Dashboard Admin Akademik
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Pengelolaan rombongan belajar, kurikulum, distribusi guru, jadwal pelajaran, & kuncian nilai rapor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddSiswa}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'siswa', label: `Data Siswa (${siswa.length})`, icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'relasi_ortu', label: `Penghubung Wali & Siswa (${relasiOrtuSiswa.length})`, icon: <HeartHandshake className="w-4 h-4 text-rose-500" /> },
          { id: 'guru', label: `Data Guru (${guru.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'kelas', label: `Kelas & Rombel (${kelas.length})`, icon: <Building className="w-4 h-4" /> },
          { id: 'mapel', label: `Mata Pelajaran (${mapel.length})`, icon: <BookOpen className="w-4 h-4" /> },
          { id: 'jadwal', label: `Jadwal Pelajaran (${jadwal.length})`, icon: <Calendar className="w-4 h-4" /> },
          { id: 'nilai', label: `Verifikasi Nilai Rapor (${nilai.length})`, icon: <TrendingUp className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: Data Siswa */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Buku Induk Peserta Didik ({filteredSiswa.length})</h3>
              <p className="text-xs text-slate-500">Tersinkron dengan Spreadsheet Akademik (tab: SISWA).</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIS, NISN..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NIS / NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Nama Orang Tua</th>
                  <th className="py-2.5 px-3">Kontak Ortu</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.map(s => {
                  const k = kelas.find(item => item.kelas_id === s.kelas_id);
                  return (
                    <tr key={s.siswa_id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700 font-bold">
                        {s.nis} <span className="text-slate-400 font-normal">/ {s.nisn}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.nama_lengkap}</td>
                      <td className="py-2.5 px-3">{s.jenis_kelamin}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{k?.nama_kelas || s.kelas_id}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.nama_ortu}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{s.kontak_ortu}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditSiswa(s)}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data siswa ${s.nama_lengkap}?`)) {
                                deleteSiswa(s.siswa_id);
                              }
                            }}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Penghubung Orang Tua & Siswa */}
      {activeTab === 'relasi_ortu' && (
        <PenghubungOrtuSiswaView />
      )}

      {/* TAB: Data Guru */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Database Tenaga Pendidik / Guru ({filteredGuru.length})</h3>
              <p className="text-xs text-slate-500">Tersinkron dengan Spreadsheet Akademik (tab: GURU).</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-section', { detail: 'guru-staf' }))}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Data Guru & Staff</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NIP / NUPTK</th>
                  <th className="py-2.5 px-3">Nama Lengkap & Gelar</th>
                  <th className="py-2.5 px-3">Mata Pelajaran Utama</th>
                  <th className="py-2.5 px-3">Status Pegawai</th>
                  <th className="py-2.5 px-3">Email Dinas</th>
                  <th className="py-2.5 px-3">Kontak WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuru.map(g => (
                  <tr key={g.guru_id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 font-medium">{g.nip}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{g.nama_lengkap}</td>
                    <td className="py-2.5 px-3 text-blue-700 font-semibold">{g.mapel_utama}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {g.status_kepegawaian}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{g.email}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{g.kontak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Rombel & Kelas */}
      {activeTab === 'kelas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kelas.map(k => (
            <div key={k.kelas_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Tingkat {k.tingkat} • {k.jurusan}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {k.kelas_id}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">{k.nama_kelas}</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Wali Kelas: <strong className="text-slate-800">{k.wali_kelas_nama}</strong></p>
                <p>Kapasitas Belajar: {k.kapasitas} Siswa</p>
                <p>Tahun Ajaran: {k.tahun_ajaran}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Nilai & Kuncian Rapor */}
      {activeTab === 'nilai' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Verifikasi & Penguncian Nilai Akademik</h3>
              <p className="text-xs text-slate-500">
                Nilai yang telah berstatus "Terpublikasi" dapat dilihat oleh Siswa dan Orang Tua pada rapor elektronik.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 text-center">Tugas (20%)</th>
                  <th className="py-2.5 px-3 text-center">Kuis (15%)</th>
                  <th className="py-2.5 px-3 text-center">Praktik (25%)</th>
                  <th className="py-2.5 px-3 text-center">Ujian (40%)</th>
                  <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                  <th className="py-2.5 px-3 text-center">Predikat</th>
                  <th className="py-2.5 px-3 text-center">Status Kunci</th>
                  <th className="py-2.5 px-3 text-center">Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nilai.map(n => (
                  <tr key={n.nilai_id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{n.siswa_nama}</td>
                    <td className="py-2.5 px-3 text-slate-700">{n.mapel_nama}</td>
                    <td className="py-2.5 px-3 text-center">{n.tugas}</td>
                    <td className="py-2.5 px-3 text-center">{n.kuis}</td>
                    <td className="py-2.5 px-3 text-center">{n.praktik}</td>
                    <td className="py-2.5 px-3 text-center">{n.ujian}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700 text-sm">{n.nilai_akhir}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{n.predikat}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          n.status_kunci === 'terpublikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {n.status_kunci}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleLockGrade(n.nilai_id, n.status_kunci)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        {n.status_kunci === 'terpublikasi' ? (
                          <>
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Kunci Nilai</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>Publikasikan</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Siswa Form */}
      {showSiswaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingSiswa ? 'Ubah Data Siswa' : 'Tambah Peserta Didik Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Data tersimpan ke Spreadsheet Akademik pada worksheet SISWA.
            </p>

            <form onSubmit={handleSaveSiswaSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    required
                    value={formSiswa.nis}
                    onChange={e => setFormSiswa({ ...formSiswa, nis: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN Nasional</label>
                  <input
                    type="text"
                    value={formSiswa.nisn}
                    onChange={e => setFormSiswa({ ...formSiswa, nisn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formSiswa.nama_lengkap}
                  onChange={e => setFormSiswa({ ...formSiswa, nama_lengkap: e.target.value })}
                  placeholder="Nama Lengkap Sesuai Akta Kelahiran"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formSiswa.jenis_kelamin}
                    onChange={e => setFormSiswa({ ...formSiswa, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel Kelas</label>
                  <select
                    value={formSiswa.kelas_id}
                    onChange={e => setFormSiswa({ ...formSiswa, kelas_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {kelas.map(k => (
                      <option key={k.kelas_id} value={k.kelas_id}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Wali / Orang Tua</label>
                  <input
                    type="text"
                    value={formSiswa.nama_ortu}
                    onChange={e => setFormSiswa({ ...formSiswa, nama_ortu: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kontak WhatsApp Wali</label>
                  <input
                    type="text"
                    value={formSiswa.kontak_ortu}
                    onChange={e => setFormSiswa({ ...formSiswa, kontak_ortu: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={formSiswa.alamat}
                  onChange={e => setFormSiswa({ ...formSiswa, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSiswaModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
