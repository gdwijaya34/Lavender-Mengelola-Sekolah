import React from 'react';
import { useAuth, ROLE_DEFINITIONS } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calendar,
  CheckSquare,
  CreditCard,
  FileSpreadsheet,
  Award,
  BookMarked,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  UserCheck,
  Building,
  Activity,
  Receipt
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onNavigateSection: (section: string) => void;
  onNavigateHome: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigateSection,
  onNavigateHome
}) => {
  const { currentRole, currentUser, logout } = useAuth();
  const { config, sheetsConfig } = useSchool();

  if (!currentRole) return null;

  const roleInfo = ROLE_DEFINITIONS[currentRole];

  // Configure menus strictly per role
  let menuItems: MenuItem[] = [];

  switch (currentRole) {
    case 'admin_sekolah':
      menuItems = [
        { id: 'overview', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'siswa', label: 'Database Siswa', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'guru-staf', label: 'Guru & Tenaga Pendidik', icon: <Users className="w-4 h-4" /> },
        { id: 'akademik', label: 'Rombel, Mapel & Jadwal', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'keuangan', label: 'Keuangan & SPP', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'presensi', label: 'Presensi Terpadu', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'nilai', label: 'Sistem Penilaian Rapor', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'prestasi', label: 'Prestasi Siswa', icon: <Award className="w-4 h-4" /> },
        { id: 'buku-tamu', label: 'Buku Tamu Resepsionis', icon: <BookMarked className="w-4 h-4" /> },
        { id: 'sheets', label: 'Integrasi Google Sheets', icon: <FileSpreadsheet className="w-4 h-4" />, badge: sheetsConfig.sync_status === 'terhubung' ? 'LIVE' : 'SYNC' },
        { id: 'users', label: 'Pengelolaan Akun (USERS)', icon: <UserCheck className="w-4 h-4" />, badge: 'PASSWORD' },
        { id: 'branding', label: 'Identitas Sekolah & CMS', icon: <Building className="w-4 h-4" /> },
        { id: 'audit-log', label: 'Audit Log & Keamanan', icon: <ShieldAlert className="w-4 h-4" /> },
        { id: 'testing', label: 'Panduan Pengujian SIM', icon: <Activity className="w-4 h-4" /> }
      ];
      break;

    case 'admin_keuangan':
      menuItems = [
        { id: 'overview', label: 'Dashboard Keuangan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'tagihan', label: 'Tagihan SPP Bulanan', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'pembayaran', label: 'Input Pembayaran & Kasir', icon: <Receipt className="w-4 h-4" /> },
        { id: 'pengeluaran', label: 'Kas & Belanja Sekolah', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'jurnal', label: 'Jurnal Umum Double-Entry', icon: <FileText className="w-4 h-4" /> },
        { id: 'coa', label: 'Bagan Akun (COA)', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'laporan', label: 'Laporan Keuangan & Piutang', icon: <TrendingUp className="w-4 h-4" /> }
      ];
      break;

    case 'admin_akademik':
      menuItems = [
        { id: 'overview', label: 'Dashboard Akademik', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'siswa', label: 'Data Induk Siswa', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'guru', label: 'Data Tenaga Pendidik', icon: <Users className="w-4 h-4" /> },
        { id: 'kelas', label: 'Kelas & Rombel Belajar', icon: <Building className="w-4 h-4" /> },
        { id: 'mapel', label: 'Mata Pelajaran & KKM', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'jadwal', label: 'Jadwal Pembelajaran', icon: <Calendar className="w-4 h-4" /> },
        { id: 'presensi', label: 'Rekap Presensi Siswa', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'nilai', label: 'Verifikasi & Kunci Nilai', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'prestasi', label: 'Data Prestasi Siswa', icon: <Award className="w-4 h-4" /> }
      ];
      break;

    case 'staff_piket':
      menuItems = [
        { id: 'overview', label: 'Dashboard Piket', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'presensi-siswa', label: 'Presensi Siswa Harian', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'presensi-guru', label: 'Presensi Jam Kerja Guru', icon: <Clock className="w-4 h-4" /> },
        { id: 'keterlambatan', label: 'Pendataan Keterlambatan', icon: <Activity className="w-4 h-4" /> },
        { id: 'izin-sakit', label: 'Pendataan Izin & Sakit', icon: <FileText className="w-4 h-4" /> },
        { id: 'buku-tamu', label: 'Buku Tamu Resepsionis', icon: <BookMarked className="w-4 h-4" /> },
        { id: 'kejadian', label: 'Buku Kejadian Sekolah', icon: <ShieldAlert className="w-4 h-4" /> }
      ];
      break;

    case 'guru':
      menuItems = [
        { id: 'overview', label: 'Dashboard Guru', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'jadwal', label: 'Jadwal Mengajar Saya', icon: <Calendar className="w-4 h-4" /> },
        { id: 'presensi', label: 'Input Presensi Kelas', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'nilai', label: 'Input Nilai Siswa (Bobot)', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'catatan', label: 'Catatan Perkembangan', icon: <FileText className="w-4 h-4" /> },
        { id: 'prestasi', label: 'Pengajuan Prestasi', icon: <Award className="w-4 h-4" /> }
      ];
      break;

    case 'siswa':
      menuItems = [
        { id: 'overview', label: 'Portal Siswa', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'profil', label: 'Profil Saya', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'jadwal', label: 'Jadwal Pelajaran', icon: <Calendar className="w-4 h-4" /> },
        { id: 'presensi', label: 'Riwayat Kehadiran', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'nilai', label: 'Rapor Nilai Akademik', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'spp', label: 'Tagihan & SPP Saya', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'prestasi', label: 'Prestasi & Sertifikat', icon: <Award className="w-4 h-4" /> }
      ];
      break;

    case 'orang_tua':
      menuItems = [
        { id: 'overview', label: 'Dashboard Wali Murid', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'anak', label: 'Profil & Pantau Anak', icon: <Users className="w-4 h-4" /> },
        { id: 'presensi', label: 'Kehadiran Anak Real-time', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'nilai', label: 'Hasil Belajar & Rapor', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'spp', label: 'Tagihan SPP & Pembayaran', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'kuitansi', label: 'Unduh Bukti Kuitansi', icon: <Receipt className="w-4 h-4" /> }
      ];
      break;
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 no-print select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-sm truncate tracking-tight">SIM {config.nama_sekolah}</h1>
            <p className="text-[10px] text-blue-400 font-mono truncate">T.A. {config.tahun_ajaran_aktif} ({config.semester_aktif})</p>
          </div>
        </div>

        {/* Current Active Role Card */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Peran Aktif</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${roleInfo.color}`}>
              {roleInfo.badge}
            </span>
          </div>
          <p className="text-xs font-semibold text-white truncate">{currentUser?.nama_lengkap}</p>
          <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Menu Operasional
        </div>
        {menuItems.map(item => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Lihat Website Publik</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi (Logout)</span>
        </button>
      </div>
    </aside>
  );
};
