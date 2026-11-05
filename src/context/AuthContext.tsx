import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, RoleInfo } from '../types';
import { StorageService } from '../services/storageService';

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  admin_sekolah: {
    id: 'admin_sekolah',
    name: 'Admin Sekolah (Super Admin)',
    badge: 'SUPER ADMIN',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Akses penuh seluruh modul, konfigurasi sistem, dan Google Sheets.'
  },
  admin_keuangan: {
    id: 'admin_keuangan',
    name: 'Admin Keuangan',
    badge: 'BENDAHARA',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Manajemen SPP, pembayaran, kas, jurnal umum akuntansi, dan kuitansi.'
  },
  admin_akademik: {
    id: 'admin_akademik',
    name: 'Admin Akademik',
    badge: 'WAKASEK KURIKULUM',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Database siswa, guru, rombel kelas, mapel, jadwal, dan kuncian nilai.'
  },
  staff_piket: {
    id: 'staff_piket',
    name: 'Staff Piket & Resepsionis',
    badge: 'PIKET & RESEPSIONIS',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Presensi harian, keterlambatan, buku tamu digital, dan izin/sakit.'
  },
  guru: {
    id: 'guru',
    name: 'Guru Mata Pelajaran',
    badge: 'TENAGA PENDIDIK',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Jadwal mengajar, input nilai siswa berbobot, presensi kelas, & catatan.'
  },
  siswa: {
    id: 'siswa',
    name: 'Siswa',
    badge: 'PESERTA DIDIK',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: 'Portal pribadi: Jadwal, riwayat presensi, rapor nilai, & tagihan SPP.'
  },
  orang_tua: {
    id: 'orang_tua',
    name: 'Orang Tua / Wali Murid',
    badge: 'WALI SISWA',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Monitoring kehadiran anak, nilai belajar, tagihan SPP, & unduh kuitansi.'
  }
};

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  roleInfo: RoleInfo | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    StorageService.init();
    // Default to admin or saved user session
    const savedUserJson = localStorage.getItem('sim_active_session');
    if (savedUserJson) {
      try {
        setCurrentUser(JSON.parse(savedUserJson));
      } catch {
        const users = StorageService.getUsers();
        setCurrentUser(users[0]);
      }
    } else {
      // By default for easy demonstration, initialize with Admin Sekolah
      const users = StorageService.getUsers();
      if (users.length > 0) {
        setCurrentUser(users[0]);
        localStorage.setItem('sim_active_session', JSON.stringify(users[0]));
      }
    }
  }, []);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const users = StorageService.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // Find user by email or username
    const found = users.find(
      u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!found) {
      return { success: false, message: 'Email atau username tidak ditemukan dalam database USERS.' };
    }

    if (found.status === 'nonaktif') {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh administrator sekolah.' };
    }

    // Strict password validation matching the USERS table
    const expectedPassword = (found.password || '').trim() || 'password123';
    if (cleanPass !== expectedPassword) {
      StorageService.addAuditLog({
        user_id: found.user_id,
        username: found.username,
        role: found.role_id,
        aksi: 'LOGIN_PASSWORD_MISMATCH',
        modul: 'Sistem',
        detail: `Percobaan login gagal untuk akun "${found.username}" (${found.email}): kata sandi tidak cocok dengan tabel USERS.`,
        status: 'gagal'
      });
      return {
        success: false,
        message: 'Kata sandi (password) salah. Pastikan password sesuai dengan akun di tabel USERS (bukan asal).'
      };
    }

    const updatedUser = {
      ...found,
      last_login: new Date().toISOString()
    };

    StorageService.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem('sim_active_session', JSON.stringify(updatedUser));

    StorageService.addAuditLog({
      user_id: updatedUser.user_id,
      username: updatedUser.username,
      role: updatedUser.role_id,
      aksi: 'USER_LOGIN',
      modul: 'Sistem',
      detail: `Pengguna berhasil login sebagai ${ROLE_DEFINITIONS[updatedUser.role_id].name}.`,
      status: 'sukses'
    });

    return { success: true };
  };

  const switchRole = (role: UserRole) => {
    const users = StorageService.getUsers();
    const targetUser = users.find(u => u.role_id === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('sim_active_session', JSON.stringify(targetUser));

      StorageService.addAuditLog({
        user_id: targetUser.user_id,
        username: targetUser.username,
        role: targetUser.role_id,
        aksi: 'SWITCH_ROLE_DEMO',
        modul: 'Sistem',
        detail: `Beralih peran secara cepat ke: ${ROLE_DEFINITIONS[role].name}.`,
        status: 'sukses'
      });
    }
  };

  const logout = () => {
    if (currentUser) {
      StorageService.addAuditLog({
        user_id: currentUser.user_id,
        username: currentUser.username,
        role: currentUser.role_id,
        aksi: 'USER_LOGOUT',
        modul: 'Sistem',
        detail: 'Pengguna mengakhiri sesi login (logout).',
        status: 'sukses'
      });
    }
    setCurrentUser(null);
    localStorage.removeItem('sim_active_session');
  };

  const roleInfo = currentUser ? ROLE_DEFINITIONS[currentUser.role_id] : null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role_id || null,
        roleInfo,
        isAuthenticated: !!currentUser,
        login,
        switchRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
