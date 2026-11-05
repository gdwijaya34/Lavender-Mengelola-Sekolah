import React, { useState } from 'react';
import { useAuth, ROLE_DEFINITIONS } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const { login, switchRole } = useAuth();
  const { config, addToast } = useSchool();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        addToast('success', 'Autentikasi Berhasil', 'Selamat datang di SIM Sekolah Terintegrasi.');
        // determine role from stored session
        const session = localStorage.getItem('sim_active_session');
        const role = session ? JSON.parse(session).role_id : 'admin_sekolah';
        onLoginSuccess(role);
      } else {
        setErrorMsg(res.message || 'Login gagal. Silakan periksa kembali email dan kata sandi Anda.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan pada server saat memproses autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillCredentials = (acc: { username: string; email: string; password: string; role: UserRole }) => {
    setIdentifier(acc.username);
    setPassword(acc.password);
    setErrorMsg('');
    addToast('info', 'Formulir Diisi', `Akun ${acc.username} (${acc.email}) dengan password "${acc.password}" siap digunakan.`);
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    addToast('info', 'Demo Role Terpilih', `Masuk otomatis sebagai ${ROLE_DEFINITIONS[role].name}.`);
    onLoginSuccess(role);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Tautan Reset Terkirim', `Tautan reset sandi telah dikirim ke ${forgotEmail} (Masa berlaku 15 menit).`);
    setShowForgotModal(false);
    setForgotEmail('');
  };

  const demoAccounts: {
    role: UserRole;
    username: string;
    email: string;
    password: string;
    label: string;
    desc: string;
  }[] = [
    { role: 'admin_sekolah', username: 'admin', email: 'admin@sekolah.sch.id', password: 'admin123', label: 'Admin Sekolah (Super Admin)', desc: 'Akses penuh seluruh modul, konfigurasi, & sheets' },
    { role: 'admin_keuangan', username: 'keuangan', email: 'keuangan@sekolah.sch.id', password: 'keuangan123', label: 'Admin Keuangan', desc: 'Tagihan SPP, kuitansi kasir, jurnal & buku kas' },
    { role: 'admin_akademik', username: 'akademik', email: 'akademik@sekolah.sch.id', password: 'akademik123', label: 'Admin Akademik', desc: 'Master siswa/guru, rombel, mapel, & kuncian nilai' },
    { role: 'staff_piket', username: 'piket', email: 'piket@sekolah.sch.id', password: 'piket123', label: 'Staff Piket', desc: 'Presensi harian, buku tamu resepsionis, keterlambatan' },
    { role: 'guru', username: 'guru', email: 'guru@sekolah.sch.id', password: 'guru123', label: 'Guru (Drs. Budi Santoso)', desc: 'Jadwal mengajar, input nilai berbobot, presensi kelas' },
    { role: 'siswa', username: 'siswa', email: 'siswa@sekolah.sch.id', password: 'siswa123', label: 'Siswa (Ahmad Fauzi)', desc: 'Rapor nilai, grafik capaian, tagihan & kuitansi SPP' },
    { role: 'orang_tua', username: 'ortu', email: 'ortu@sekolah.sch.id', password: 'ortu123', label: 'Orang Tua / Wali', desc: 'Pantau kehadiran real-time & nilai akademik anak' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-slate-800">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* School Logo & Title */}
        <div className="text-center text-white space-y-2">
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{config.nama_sekolah}</h1>
              <p className="text-xs text-blue-300 font-medium">Sistem Informasi Manajemen Sekolah Terpadu</p>
            </div>
          </div>
        </div>

        {/* Login Box & Demo Selector Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Left: Login Form */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Otentikasi Pengguna
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">Masuk ke SIM Sekolah</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan email atau username terdaftar dan kata sandi Anda.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email atau Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="admin@sekolah.sch.id / username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Kata Sandi (Password)</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-300"
                    />
                    <span className="text-[11px] text-slate-600">Ingat sesi saya di peramban ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Memverifikasi akun...</span>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <button onClick={onNavigateHome} className="hover:text-slate-700">
                ← Kembali ke Website Utama
              </button>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                RBAC Session Protected
              </span>
            </div>
          </div>

          {/* Right: Quick Demo Role Selector */}
          <div className="md:col-span-5 bg-slate-50 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Akses Cepat Pengujian (1-Klik)</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                Pilih salah satu peran di bawah ini untuk langsung masuk dan menguji antarmuka dan batas kewenangan masing-masing role:
              </p>

              <div className="space-y-2">
                {demoAccounts.map(acc => {
                  const info = ROLE_DEFINITIONS[acc.role];
                  return (
                    <div
                      key={acc.role}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all text-xs flex flex-col gap-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] truncate">
                          {acc.label}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${info.color}`}>
                          {info.badge}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span>User: <strong className="text-slate-800">{acc.username}</strong></span>
                        <span className="text-slate-300">|</span>
                        <span>Pass: <strong className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">{acc.password}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleFillCredentials(acc)}
                          className="flex-1 py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition-colors text-center"
                          title="Isi email dan password ke formulir login"
                        >
                          Isi ke Formulir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDemo(acc.role)}
                          className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] transition-colors"
                          title="Masuk langsung sebagai role ini"
                        >
                          Masuk →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono">
              Kolom password diverifikasi 1:1 dengan Tabel USERS
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-base font-bold text-slate-900 mb-1">Reset Kata Sandi Akun</h3>
              <p className="text-xs text-slate-500 mb-4">
                Masukkan email Anda yang terdaftar pada sistem SIM Sekolah. Token pemulihan sementara akan dikirimkan.
              </p>
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    Kirim Tautan Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
