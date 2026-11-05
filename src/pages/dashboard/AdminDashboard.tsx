import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  GraduationCap,
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  Award,
  Activity,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileText,
  Key
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface AdminDashboardProps {
  onNavigateSection: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSection }) => {
  const {
    siswa,
    guru,
    staff,
    kelas,
    presensiSiswa,
    presensiGuru,
    tagihanSPP,
    pembayaranSPP,
    transaksiKeuangan,
    prestasi,
    auditLogs,
    config,
    generateMonthlyBills
  } = useSchool();

  // Metric 1: Total siswa aktif
  const totalSiswaAktif = siswa.filter(s => s.status === 'aktif').length;

  // Metric 2: Total guru
  const totalGuru = guru.length;

  // Metric 3: Total staf
  const totalStaff = staff.length;

  // Metric 4: Jumlah kelas
  const jumlahKelas = kelas.length;

  // Metric 5: % Presensi Siswa (hari ini)
  const todayStr = '2026-11-04';
  const presensiHariIniSiswa = presensiSiswa.filter(p => p.tanggal === todayStr);
  const siswaHadir = presensiHariIniSiswa.filter(p => p.status === 'hadir' || p.status === 'terlambat').length;
  const persenKehadiranSiswa =
    presensiHariIniSiswa.length > 0
      ? Number(((siswaHadir / presensiHariIniSiswa.length) * 100).toFixed(1))
      : 96.5;

  // Metric 6: % Presensi Guru (hari ini)
  const presensiHariIniGuru = presensiGuru.filter(p => p.tanggal === todayStr);
  const guruHadir = presensiHariIniGuru.filter(p => p.status === 'hadir' || p.status === 'terlambat').length;
  const persenKehadiranGuru =
    presensiHariIniGuru.length > 0
      ? Number(((guruHadir / presensiHariIniGuru.length) * 100).toFixed(1))
      : 100;

  // Metric 7: Total tagihan SPP bulan berjalan
  const tagihanBulanIni = tagihanSPP.filter(t => t.periode_bulan.includes('November 2026'));
  const totalTagihanBulanBerjalan = tagihanBulanIni.reduce((acc, t) => acc + t.total_tagihan, 0);

  // Metric 8: Total SPP terbayar bulan berjalan
  const totalSPPTerbayar = tagihanBulanIni.reduce((acc, t) => acc + t.total_terbayar, 0);

  // Metric 9: Total tunggakan SPP
  const totalTunggakanSPP = tagihanSPP.reduce((acc, t) => acc + t.sisa_tagihan, 0);

  // Metric 10: Total pemasukan dan pengeluaran
  const totalPemasukan = transaksiKeuangan
    .filter(t => t.tipe === 'pemasukan')
    .reduce((acc, t) => acc + t.nominal, 0);
  const totalPengeluaran = transaksiKeuangan
    .filter(t => t.tipe === 'pengeluaran')
    .reduce((acc, t) => acc + t.nominal, 0);

  // Cashflow chart data
  const chartCashflowData = [
    { bulan: 'Juli', pemasukan: 24500000, pengeluaran: 18200000 },
    { bulan: 'Agustus', pemasukan: 28000000, pengeluaran: 21500000 },
    { bulan: 'September', pemasukan: 31200000, pengeluaran: 19800000 },
    { bulan: 'Oktober', pemasukan: 33500000, pengeluaran: 22400000 },
    { bulan: 'November', pemasukan: 1850000 + totalPemasukan, pengeluaran: totalPengeluaran }
  ];

  // Attendance trend chart data
  const chartAttendanceData = [
    { hari: 'Senin', siswa: 97.2, guru: 100 },
    { hari: 'Selasa', siswa: 96.5, guru: 98 },
    { hari: 'Rabu', siswa: 95.8, guru: 96 },
    { hari: 'Kamis', siswa: 98.1, guru: 100 },
    { hari: 'Jumat', siswa: 96.4, guru: 100 }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-700">
            Pusat Komando Administrasi Terpadu
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Dashboard Super Admin Sekolah
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Status operasional, keuangan, kehadiran, dan sinkronisasi data real-time dengan Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => generateMonthlyBills('November 2026', config.tahun_ajaran_aktif)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generate SPP Nov</span>
          </button>
          <button
            onClick={() => onNavigateSection('sheets')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets Hub</span>
          </button>
          <button
            onClick={() => onNavigateSection('users')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-amber-300" />
            <span>Akun & Password (USERS)</span>
          </button>
          <button
            onClick={() => onNavigateSection('testing')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Checklist Uji SIM</span>
          </button>
        </div>
      </div>

      {/* 12 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">1. Siswa Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSiswaAktif} Siswa</div>
          <p className="text-[11px] text-slate-400 mt-1">Terbagi dalam {jumlahKelas} rombel</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">2. Tenaga Pendidik</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalGuru} Guru</div>
          <p className="text-[11px] text-slate-400 mt-1">PNS, GTT & Yayasan</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">3. Tenaga Staf/TU</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStaff} Staf</div>
          <p className="text-[11px] text-slate-400 mt-1">IT, Keuangan, TU, & Piket</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">4. Rombel / Kelas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{jumlahKelas} Kelas</div>
          <p className="text-[11px] text-slate-400 mt-1">Tingkat X, XI, XII MIPA/IPS</p>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">5. Kehadiran Siswa</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{persenKehadiranSiswa}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Presensi tanggal {todayStr}</p>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">6. Kehadiran Guru</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{persenKehadiranGuru}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Kehadiran jam mengajar</p>
        </div>

        {/* Metric 7 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">7. Tagihan SPP Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            Rp {(totalTagihanBulanBerjalan / 1000).toLocaleString('id-ID')}k
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Periode November 2026</p>
        </div>

        {/* Metric 8 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">8. SPP Terbayar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600">
            Rp {(totalSPPTerbayar / 1000).toLocaleString('id-ID')}k
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {totalTagihanBulanBerjalan > 0 ? ((totalSPPTerbayar / totalTagihanBulanBerjalan) * 100).toFixed(1) : 0}% Terkumpul
          </p>
        </div>

        {/* Metric 9 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">9. Total Tunggakan SPP</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600">
            Rp {(totalTunggakanSPP / 1000).toLocaleString('id-ID')}k
          </div>
          <p className="text-[11px] text-rose-500 font-medium mt-1">Total Piutang Siswa Aktif</p>
        </div>

        {/* Metric 10 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">10. Pemasukan vs Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-600">
            +Rp {(totalPemasukan / 1000).toLocaleString('id-ID')}k
          </div>
          <div className="text-sm font-bold text-rose-600">
            -Rp {(totalPengeluaran / 1000).toLocaleString('id-ID')}k
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Buku Kas Operasional</p>
        </div>

        {/* Metric 11 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">11. Prestasi Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{prestasi.length} Juara</div>
          <p className="text-[11px] text-slate-400 mt-1">Tingkat Nasional & Provinsi</p>
        </div>

        {/* Metric 12 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">12. Aktivitas & Audit Log</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{auditLogs.length} Log</div>
          <p className="text-[11px] text-slate-400 mt-1">Terekam dalam sistem</p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cashflow Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Arus Kas Sekolah (Pemasukan vs Pengeluaran)</h3>
              <p className="text-xs text-slate-500">Rekapitulasi 5 bulan berjalan (Rupiah)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Surplus Operasional
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCashflowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}Jt`} />
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="pemasukan" name="Pemasukan (SPP & BOS)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Belanja & Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tren Kehadiran Mingguan (%)</h3>
              <p className="text-xs text-slate-500">Persentase kedatangan siswa dan guru</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Rata-rata 97.4%
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hari" tick={{ fontSize: 11 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="siswa" name="Kehadiran Siswa" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="guru" name="Kehadiran Guru" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Latest Prestasi Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prestasi Siswa Terbaru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Prestasi Siswa Terbaru (Terverifikasi)</h3>
              </div>
              <button
                onClick={() => onNavigateSection('prestasi')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Kelola Prestasi →
              </button>
            </div>

            <div className="space-y-3">
              {prestasi.slice(0, 3).map(p => (
                <div key={p.prestasi_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.nama_kompetisi}</span>
                    <span className="text-blue-700 font-semibold">{p.peringkat}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {p.siswa_nama} • {p.kelas_nama} ({p.bidang})
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0 border border-amber-300">
                    {p.tingkat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Log Aktivitas Sistem Terkini</h3>
              </div>
              <button
                onClick={() => onNavigateSection('audit-log')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Lihat Semua Log →
              </button>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 4).map(l => (
                <div key={l.log_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 font-mono text-[11px]">{l.aksi}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                        {l.modul}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate mt-0.5">{l.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(l.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
