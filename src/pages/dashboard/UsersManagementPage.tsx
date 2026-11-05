import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { useSchool } from '../../context/SchoolContext';
import { ROLE_DEFINITIONS } from '../../context/AuthContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Key,
  ShieldCheck,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Lock,
  Mail,
  UserCheck,
  Calendar
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const { addToast } = useSchool();
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showPasswords, setShowPasswords] = useState(false);

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    user_id: string;
    username: string;
    email: string;
    password: string;
    nama_lengkap: string;
    role_id: UserRole;
    reference_id: string;
    status: 'aktif' | 'nonaktif';
  }>({
    user_id: '',
    username: '',
    email: '',
    password: '',
    nama_lengkap: '',
    role_id: 'guru',
    reference_id: '',
    status: 'aktif'
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    setFormData({
      user_id: newId,
      username: '',
      email: '',
      password: '',
      nama_lengkap: '',
      role_id: 'guru',
      reference_id: 'REF-NEW',
      status: 'aktif'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      password: user.password || 'password123',
      nama_lengkap: user.nama_lengkap,
      role_id: user.role_id,
      reference_id: user.reference_id,
      status: user.status
    });
    setShowModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      addToast('error', 'Form Tidak Lengkap', 'Username, email, dan kata sandi wajib diisi.');
      return;
    }

    const payload: User = {
      ...formData,
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim(),
      created_at: editingUser?.created_at || new Date().toISOString(),
      last_login: editingUser?.last_login
    };

    StorageService.saveUser(payload);
    const updated = StorageService.getUsers();
    setUsers(updated);
    setShowModal(false);

    StorageService.addAuditLog({
      user_id: payload.user_id,
      username: payload.username,
      role: payload.role_id,
      aksi: editingUser ? 'UPDATE_USER_CREDENTIALS' : 'CREATE_NEW_USER',
      modul: 'Sistem',
      detail: `Akun "${payload.username}" (${payload.email}) berhasil ${editingUser ? 'diperbarui password/kredensialnya' : 'dibuat baru'}.`,
      status: 'sukses'
    });

    addToast(
      'success',
      editingUser ? 'Akun Diperbarui' : 'Akun Dibuat',
      `Kredensial login untuk ${payload.nama_lengkap} (Password: "${payload.password}") berhasil disimpan ke tabel USERS.`
    );
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (userId === 'USR-001' || username === 'admin') {
      addToast('error', 'Proteksi Super Admin', 'Akun Super Admin utama (admin) tidak dapat dihapus demi keamanan sistem.');
      return;
    }

    if (window.confirm(`Hapus akun "${username}" dari sistem dan database USERS?`)) {
      StorageService.deleteUser(userId);
      const updated = StorageService.getUsers();
      setUsers(updated);
      addToast('info', 'Akun Dihapus', `Akun ${username} telah dihapus dari tabel USERS.`);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['user_id', 'username', 'email', 'password', 'nama_lengkap', 'role_id', 'reference_id', 'status', 'created_at'];
    const rows = users.map(u => [
      u.user_id,
      u.username,
      u.email,
      u.password,
      `"${u.nama_lengkap}"`,
      u.role_id,
      u.reference_id,
      u.status,
      u.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `USERS_DATABASE_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Ekspor CSV Berhasil', 'Data kredensial USERS telah diunduh.');
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.reference_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role_id === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800">
            Modul Manajemen Kredensial & Role (RBAC)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight flex items-center gap-3">
            <span>Tabel Pengguna & Password (USERS)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Kelola akun, hak akses role, serta kata sandi login resmi yang disinkronkan 1:1 dengan lembar kerja <strong>USERS</strong> di Spreadsheet Akademik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV USERS</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Security & Verification Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm">Otentikasi Akun Menggunakan Kolom Password di Tabel USERS</span>
          <p className="mt-0.5 text-emerald-800 leading-relaxed">
            Setiap pengguna yang masuk melalui halaman <code>/login</code> divalidasi secara ketat berdasarkan kecocokan <strong>email/username</strong> dan <strong>kolom password</strong> pada tabel ini. Pengisian password tidak boleh asal dan harus sesuai dengan data kredensial terdaftar.
          </p>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari username, email, nama pengguna..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white"
          >
            <option value="all">Semua Peran (7 Role)</option>
            {Object.keys(ROLE_DEFINITIONS).map(r => (
              <option key={r} value={r}>
                {ROLE_DEFINITIONS[r as UserRole].name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            {showPasswords ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-blue-600" />}
            <span>{showPasswords ? 'Sembunyikan Sandi' : 'Tampilkan Kolom Password'}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Kata Sandi (Password)</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Peran (Role RBAC)</th>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const roleInfo = ROLE_DEFINITIONS[u.role_id];
                return (
                  <tr key={u.user_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{u.user_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{u.username}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      {showPasswords ? (
                        <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          {u.password}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400 text-xs">••••••••</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{u.nama_lengkap}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.color}`}>
                        {roleInfo.badge}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{u.reference_id}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Ubah password / data akun"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.user_id, u.username)}
                          disabled={u.user_id === 'USR-001'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.user_id === 'USR-001'
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Hapus akun"
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

      {/* Modal Add / Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingUser ? 'Ubah Password & Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kredensial disimpan langsung ke tabel USERS & diverifikasi saat login.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">User ID</label>
                  <input
                    type="text"
                    disabled
                    value={formData.user_id}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="aktif">Aktif (Dapat Login)</option>
                    <option value="nonaktif">Nonaktif (Dilarang Login)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Dra. Sri Wahyuni, M.Pd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="misal: bu_sri"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-600" />
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password login akun"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-mono font-bold text-amber-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Login <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@sekolah.sch.id"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran (Role RBAC)</label>
                  <select
                    value={formData.role_id}
                    onChange={e => setFormData({ ...formData, role_id: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    {Object.keys(ROLE_DEFINITIONS).map(r => (
                      <option key={r} value={r}>
                        {ROLE_DEFINITIONS[r as UserRole].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={formData.reference_id}
                    onChange={e => setFormData({ ...formData, reference_id: e.target.value })}
                    placeholder="ID Siswa / Guru / Staf"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  Simpan Kredensial USERS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
