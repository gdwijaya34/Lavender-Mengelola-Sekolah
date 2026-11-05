import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PembayaranSPP } from '../../types';
import { PrintReceiptModal } from '../../components/common/PrintReceiptModal';
import {
  GraduationCap,
  Calendar,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const SiswaDashboard: React.FC = () => {
  const {
    siswa,
    jadwal,
    presensiSiswa,
    nilai,
    prestasi,
    tagihanSPP,
    pembayaranSPP,
    config
  } = useSchool();

  // Active student: Ahmad Fauzi
  const currentSiswa = siswa.find(s => s.nis === '20251101') || siswa[0];

  const [activeTab, setActiveTab] = useState<'profil' | 'jadwal' | 'presensi' | 'nilai' | 'spp' | 'prestasi'>('nilai');
  const [selectedReceipt, setSelectedReceipt] = useState<PembayaranSPP | null>(null);

  // Student's specific data
  const mySchedule = jadwal.filter(j => j.kelas_id === currentSiswa.kelas_id);
  const myAttendance = presensiSiswa.filter(p => p.siswa_id === currentSiswa.siswa_id);
  const myGrades = nilai.filter(n => n.siswa_id === currentSiswa.siswa_id);
  const myBills = tagihanSPP.filter(t => t.siswa_id === currentSiswa.siswa_id);
  const myPayments = pembayaranSPP.filter(p => p.siswa_id === currentSiswa.siswa_id);
  const myAchievements = prestasi.filter(p => p.siswa_nama.includes(currentSiswa.nama_lengkap));

  // Attendance metrics
  const totalDays = myAttendance.length || 1;
  const countHadir = myAttendance.filter(p => p.status === 'hadir').length;
  const countTerlambat = myAttendance.filter(p => p.status === 'terlambat').length;
  const attendanceRate = Number((((countHadir + countTerlambat) / totalDays) * 100).toFixed(1));

  // Chart data for grades
  const chartGradeData = myGrades.map(g => ({
    mapel: g.mapel_nama.split(' ')[0],
    nilai: g.nilai_akhir,
    tugas: g.tugas,
    ujian: g.ujian
  }));

  // Average score
  const avgScore =
    myGrades.length > 0
      ? Number((myGrades.reduce((acc, g) => acc + g.nilai_akhir, 0) / myGrades.length).toFixed(1))
      : 89.5;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            AF
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider bg-cyan-800/80 px-2.5 py-0.5 rounded-md border border-cyan-700">
              Portal Peserta Didik
            </span>
            <h1 className="text-2xl font-extrabold mt-1 tracking-tight">{currentSiswa.nama_lengkap}</h1>
            <p className="text-xs text-cyan-200">
              NIS: {currentSiswa.nis} • NISN: {currentSiswa.nisn} • Rombel: XI MIPA 1
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
            <span className="block text-xl font-black text-cyan-300">{avgScore}</span>
            <span className="text-[10px] text-cyan-100 uppercase">IPK / Rata Rapor</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
            <span className="block text-xl font-black text-emerald-300">{attendanceRate}%</span>
            <span className="text-[10px] text-cyan-100 uppercase">Kehadiran</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'nilai', label: 'Rapor Nilai Akademik', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'jadwal', label: 'Jadwal Pelajaran', icon: <Calendar className="w-4 h-4" /> },
          { id: 'presensi', label: 'Riwayat Kehadiran', icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'spp', label: 'Tagihan & SPP Saya', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'prestasi', label: 'Sertifikat Prestasi', icon: <Award className="w-4 h-4" /> },
          { id: 'profil', label: 'Biodata Diri', icon: <GraduationCap className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* TAB 1: Rapor Nilai & Grafik */}
      {activeTab === 'nilai' && (
        <div className="space-y-6">
          {/* Chart Progression */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Grafik Performa Nilai Mata Pelajaran</h3>
                <p className="text-xs text-slate-500">Nilai akhir tugas, ujian, dan praktikum</p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Semester Ganjil 2026/2027
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartGradeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mapel" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="nilai" name="Nilai Akhir" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ujian" name="Nilai Ujian" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Rapor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Transkrip Hasil Belajar Sementara</h3>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Nilai</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 text-center">Tugas</th>
                    <th className="py-2.5 px-3 text-center">Kuis</th>
                    <th className="py-2.5 px-3 text-center">Praktik</th>
                    <th className="py-2.5 px-3 text-center">Ujian</th>
                    <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                    <th className="py-2.5 px-3 text-center">Predikat</th>
                    <th className="py-2.5 px-3">Catatan Guru Pembimbing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myGrades.map(g => (
                    <tr key={g.nilai_id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{g.mapel_nama}</td>
                      <td className="py-2.5 px-3 text-center">{g.tugas}</td>
                      <td className="py-2.5 px-3 text-center">{g.kuis}</td>
                      <td className="py-2.5 px-3 text-center">{g.praktik}</td>
                      <td className="py-2.5 px-3 text-center">{g.ujian}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700 text-sm">{g.nilai_akhir}</td>
                      <td className="py-2.5 px-3 text-center font-black text-slate-800">{g.predikat}</td>
                      <td className="py-2.5 px-3 text-slate-600 italic text-[11px] max-w-xs">{g.catatan_guru}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tagihan & SPP Saya */}
      {activeTab === 'spp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Informasi Tagihan & Riwayat Pembayaran SPP</h3>
              <p className="text-xs text-slate-500">Transparansi iuran sekolah dan kuitansi pelunasan elektronik.</p>
            </div>
          </div>

          {/* Bills List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Tagihan Terdaftar</h4>
            {myBills.map(b => (
              <div key={b.tagihan_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">SPP Periode {b.periode_bulan}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Nominal: Rp {b.nominal_pokok.toLocaleString('id-ID')}
                    {b.diskon_beasiswa > 0 && ` • Beasiswa OSN: -Rp ${b.diskon_beasiswa.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 block">
                    Rp {b.total_tagihan.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Terbayar: Rp {b.total_terbayar.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Payments & Receipts */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Bukti Kuitansi Pembayaran</h4>
            {myPayments.map(p => (
              <div key={p.pembayaran_id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-700">{p.nomor_kuitansi}</span>
                  <p className="text-slate-700 font-medium">{p.catatan}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{p.tanggal_pembayaran} • {p.metode_pembayaran}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600 text-sm">Rp {p.nominal_bayar.toLocaleString('id-ID')}</span>
                  <button
                    onClick={() => setSelectedReceipt(p)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Kuitansi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Prestasi & Sertifikat */}
      {activeTab === 'prestasi' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1">Capaian Prestasi & Kejuaraan Saya</h3>
            <p className="text-xs text-slate-500 mb-4">Portofolio penghargaan yang telah diverifikasi oleh sekolah.</p>

            <div className="space-y-3">
              {myAchievements.map(p => (
                <div key={p.prestasi_id} className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 text-xs flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-slate-900 text-sm">{p.nama_kompetisi}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        {p.tingkat}
                      </span>
                    </div>
                    <span className="text-blue-700 font-bold block mt-1">{p.peringkat}</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{p.deskripsi}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{p.tanggal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        payment={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
