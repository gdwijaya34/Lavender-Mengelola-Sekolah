import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NilaiSiswa, PrestasiSiswa } from '../../types';
import {
  GraduationCap,
  Calendar,
  CheckSquare,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  Save,
  CheckCircle2,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';

export const GuruDashboard: React.FC = () => {
  const {
    guru,
    kelas,
    siswa,
    jadwal,
    nilai,
    prestasi,
    saveNilai,
    savePrestasi,
    config,
    addToast
  } = useSchool();

  const currentGuru = guru[0] || {
    guru_id: 'GRU-001',
    nama_lengkap: 'Drs. Budi Santoso, M.Pd',
    mapel_utama: 'Fisika Lanjut',
    nip: '19790514 200501 1 008',
    status_kepegawaian: 'PNS'
  };

  const [activeTab, setActiveTab] = useState<'jadwal' | 'nilai' | 'prestasi' | 'catatan'>('jadwal');
  const [selectedKelasId, setSelectedKelasId] = useState('KLS-11-A');

  // Grade Form State for Teacher
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState('');
  const [nilaiTugas, setNilaiTugas] = useState(85);
  const [nilaiKuis, setNilaiKuis] = useState(80);
  const [nilaiPraktik, setNilaiPraktik] = useState(90);
  const [nilaiUjian, setNilaiUjian] = useState(85);
  const [catatanGuru, setCatatanGuru] = useState('');

  // Prestasi submission form
  const [namaSiswaPrestasi, setNamaSiswaPrestasi] = useState('');
  const [kompetisiNama, setKompetisiNama] = useState('');
  const [tingkatKompetisi, setTingkatKompetisi] = useState<'Nasional' | 'Provinsi' | 'Kota/Kab'>('Nasional');
  const [peringkat, setPeringkat] = useState('Juara 1');
  const [deskripsiPrestasi, setDeskripsiPrestasi] = useState('');

  // Teaching schedules for this teacher
  const mySchedules = jadwal.filter(j => j.guru_id === currentGuru.guru_id || j.guru_nama.includes(currentGuru.nama_lengkap));

  // Grades submitted by this teacher
  const myGrades = nilai.filter(n => n.guru_id === currentGuru.guru_id || n.mapel_nama.includes('Fisika'));

  const handleSaveNilai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForGrade) {
      addToast('error', 'Pilih Siswa', 'Silakan pilih siswa yang akan dinilai.');
      return;
    }

    const foundSiswa = siswa.find(s => s.siswa_id === selectedStudentForGrade);
    if (!foundSiswa) return;

    const existingGrade = nilai.find(
      n => n.siswa_id === foundSiswa.siswa_id && n.mapel_nama.includes(currentGuru.mapel_utama)
    );

    const gradePayload: NilaiSiswa = {
      nilai_id: existingGrade ? existingGrade.nilai_id : `NLI-${Date.now().toString().slice(-6)}`,
      siswa_id: foundSiswa.siswa_id,
      siswa_nama: foundSiswa.nama_lengkap,
      kelas_id: foundSiswa.kelas_id,
      mapel_id: 'MPL-001',
      mapel_nama: currentGuru.mapel_utama,
      guru_id: currentGuru.guru_id,
      semester: config.semester_aktif,
      tahun_ajaran: config.tahun_ajaran_aktif,
      tugas: nilaiTugas,
      kuis: nilaiKuis,
      praktik: nilaiPraktik,
      ujian: nilaiUjian,
      nilai_akhir: 0, // auto-calculated by service with weights
      predikat: 'B',
      catatan_guru: catatanGuru || 'Siswa menunjukkan antusiasme belajar yang baik pada materi praktikum.',
      status_kunci: 'terkunci',
      updated_at: new Date().toISOString()
    };

    saveNilai(gradePayload);
    setSelectedStudentForGrade('');
    setCatatanGuru('');
  };

  const handleSubmitPrestasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswaPrestasi || !kompetisiNama) {
      addToast('error', 'Validasi Gagal', 'Lengkapi nama siswa dan kompetisi.');
      return;
    }

    const newPrestasi: PrestasiSiswa = {
      prestasi_id: `PRS-${Date.now().toString().slice(-4)}`,
      siswa_id: 'SIS-001',
      siswa_nama: namaSiswaPrestasi,
      kelas_nama: 'XI MIPA 1',
      jenis_prestasi: 'Akademik',
      bidang: currentGuru.mapel_utama,
      tingkat: tingkatKompetisi,
      nama_kompetisi: kompetisiNama,
      penyelenggara: 'Balai Talenta / Kemendikbud',
      peringkat,
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: deskripsiPrestasi,
      tampilkan_di_web: true,
      status_verifikasi: 'terverifikasi'
    };

    savePrestasi(newPrestasi);
    setNamaSiswaPrestasi('');
    setKompetisiNama('');
    setDeskripsiPrestasi('');
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-800/80 px-2.5 py-1 rounded-md border border-indigo-700">
            Portal Tenaga Pendidik
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Selamat Datang, {currentGuru.nama_lengkap}
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            NIP: {currentGuru.nip} • Guru Pengampu: {currentGuru.mapel_utama} ({currentGuru.status_kepegawaian})
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs">
          <span>Bobot Penilaian Sekolah: </span>
          <strong className="text-amber-300">
            T:{config.bobot_tugas}% K:{config.bobot_kuis}% P:{config.bobot_praktik}% U:{config.bobot_ujian}%
          </strong>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'jadwal', label: 'Jadwal Mengajar Saya', icon: <Calendar className="w-4 h-4" /> },
          { id: 'nilai', label: 'Input & Kelola Nilai Siswa', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'prestasi', label: 'Ajukan Prestasi Siswa', icon: <Award className="w-4 h-4" /> },
          { id: 'catatan', label: 'Catatan Perkembangan', icon: <FileText className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Jadwal Mengajar */}
      {activeTab === 'jadwal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Jadwal Mengajar Mingguan ({mySchedules.length} Sesi)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mySchedules.map(j => (
              <div key={j.jadwal_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Hari {j.hari} • {j.jam_mulai} - {j.jam_selesai} WIB
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{j.ruang}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{j.mapel_nama}</h4>
                <p className="text-slate-600">Rombongan Belajar: <strong className="text-slate-800">{j.kelas_id}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Input & Kelola Nilai Berbobot */}
      {activeTab === 'nilai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Input Nilai Siswa (Bobot Otomatis)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nilai akhir dihitung secara otomatis berdasarkan konfigurasi kurikulum.
            </p>

            <form onSubmit={handleSaveNilai} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas</label>
                <select
                  value={selectedKelasId}
                  onChange={e => setSelectedKelasId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  {kelas.map(k => (
                    <option key={k.kelas_id} value={k.kelas_id}>
                      {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  required
                  value={selectedStudentForGrade}
                  onChange={e => {
                    setSelectedStudentForGrade(e.target.value);
                    const existing = nilai.find(n => n.siswa_id === e.target.value);
                    if (existing) {
                      setNilaiTugas(existing.tugas);
                      setNilaiKuis(existing.kuis);
                      setNilaiPraktik(existing.praktik);
                      setNilaiUjian(existing.ujian);
                      setCatatanGuru(existing.catatan_guru);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- Pilih Siswa Kelas Terpilih --</option>
                  {siswa
                    .filter(s => s.kelas_id === selectedKelasId)
                    .map(s => (
                      <option key={s.siswa_id} value={s.siswa_id}>
                        {s.nama_lengkap} (NIS: {s.nis})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tugas ({config.bobot_tugas}%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={nilaiTugas}
                    onChange={e => setNilaiTugas(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kuis ({config.bobot_kuis}%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={nilaiKuis}
                    onChange={e => setNilaiKuis(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Praktik ({config.bobot_praktik}%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={nilaiPraktik}
                    onChange={e => setNilaiPraktik(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ujian ({config.bobot_ujian}%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={nilaiUjian}
                    onChange={e => setNilaiUjian(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Perkembangan Siswa</label>
                <textarea
                  rows={2}
                  value={catatanGuru}
                  onChange={e => setCatatanGuru(e.target.value)}
                  placeholder="Catatan kelebihan atau aspek yang perlu ditingkatkan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nilai Berbobot</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Rekap Nilai Siswa Binaan ({myGrades.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-3 text-center">T</th>
                    <th className="py-2 px-3 text-center">K</th>
                    <th className="py-2 px-3 text-center">P</th>
                    <th className="py-2 px-3 text-center">U</th>
                    <th className="py-2 px-3 text-center">Akhir</th>
                    <th className="py-2 px-3 text-center">Predikat</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myGrades.map(n => (
                    <tr key={n.nilai_id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-semibold text-slate-900">{n.siswa_nama}</td>
                      <td className="py-2 px-3 text-center">{n.tugas}</td>
                      <td className="py-2 px-3 text-center">{n.kuis}</td>
                      <td className="py-2 px-3 text-center">{n.praktik}</td>
                      <td className="py-2 px-3 text-center">{n.ujian}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-700">{n.nilai_akhir}</td>
                      <td className="py-2 px-3 text-center font-bold">{n.predikat}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {n.status_kunci}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Ajukan Prestasi Siswa */}
      {activeTab === 'prestasi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Pengajuan Capaian Prestasi Siswa</h3>
          </div>
          <p className="text-xs text-slate-500">
            Prestasi yang Anda inputkan akan diteruskan ke publikasi landing page sekolah setelah diverifikasi.
          </p>

          <form onSubmit={handleSubmitPrestasi} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Siswa Berprestasi</label>
              <input
                type="text"
                required
                value={namaSiswaPrestasi}
                onChange={e => setNamaSiswaPrestasi(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Ajang Kompetisi / Lomba</label>
              <input
                type="text"
                required
                value={kompetisiNama}
                onChange={e => setKompetisiNama(e.target.value)}
                placeholder="Contoh: Olimpiade Sains Nasional (OSN) Fisika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Kompetisi</label>
                <select
                  value={tingkatKompetisi}
                  onChange={(e: any) => setTingkatKompetisi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Nasional">Nasional</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Kota/Kab">Kota / Kabupaten</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peringkat / Penghargaan</label>
                <input
                  type="text"
                  required
                  value={peringkat}
                  onChange={e => setPeringkat(e.target.value)}
                  placeholder="Contoh: Juara 1 / Medali Emas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Inovasi Capaian</label>
              <textarea
                rows={3}
                required
                value={deskripsiPrestasi}
                onChange={e => setDeskripsiPrestasi(e.target.value)}
                placeholder="Jelaskan judul karya atau raihan kompetisi..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pengajuan Prestasi</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
