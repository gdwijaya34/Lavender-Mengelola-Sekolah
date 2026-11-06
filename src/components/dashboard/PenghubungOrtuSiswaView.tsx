import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { OrangTua, Siswa, RelasiOrtuSiswa } from '../../types';
import {
  HeartHandshake,
  Link2,
  Unlink,
  UserPlus,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Phone,
  Mail,
  Search,
  Building,
  Plus,
  ShieldCheck,
  Check,
  AlertTriangle
} from 'lucide-react';

interface PenghubungOrtuSiswaViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const PenghubungOrtuSiswaView: React.FC<PenghubungOrtuSiswaViewProps> = () => {
  const {
    siswa,
    orangTua,
    relasiOrtuSiswa,
    kelas,
    saveOrangTua,
    deleteOrangTua,
    hubungkanOrtuSiswa,
    putuskanOrtuSiswa,
    syncRelasiLive,
    sheetsConfig,
    addToast
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'terverifikasi' | 'menunggu'>('semua');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAddOrtuModal, setShowAddOrtuModal] = useState(false);

  // Connect Form State
  const [connectOrtuId, setConnectOrtuId] = useState('');
  const [connectSiswaId, setConnectSiswaId] = useState('');
  const [connectStatus, setConnectStatus] = useState<'terverifikasi' | 'menunggu'>('terverifikasi');

  // Add Ortu Form State
  const [newOrtuNama, setNewOrtuNama] = useState('');
  const [newOrtuHubungan, setNewOrtuHubungan] = useState<'Ayah' | 'Ibu' | 'Wali'>('Ayah');
  const [newOrtuPekerjaan, setNewOrtuPekerjaan] = useState('');
  const [newOrtuKontak, setNewOrtuKontak] = useState('');
  const [newOrtuEmail, setNewOrtuEmail] = useState('');
  const [newOrtuAlamat, setNewOrtuAlamat] = useState('');
  const [initialChildId, setInitialChildId] = useState('');

  // Stats calculation
  const totalOrtu = orangTua.length;
  const totalRelasi = relasiOrtuSiswa.length;
  const siswaTerhubungIds = new Set(relasiOrtuSiswa.map(r => r.siswa_id));
  const totalSiswaTerhubung = siswa.filter(s => siswaTerhubungIds.has(s.siswa_id)).length;
  const siswaBelumTerhubung = siswa.filter(s => !siswaTerhubungIds.has(s.siswa_id));

  // Filtered relations
  const filteredRelations = relasiOrtuSiswa.filter(rel => {
    const ortu = orangTua.find(o => o.ortu_id === rel.ortu_id);
    const s = siswa.find(item => item.siswa_id === rel.siswa_id);

    if (statusFilter !== 'semua' && rel.status_verifikasi !== statusFilter) return false;
    if (selectedKelasFilter !== 'semua' && s?.kelas_id !== selectedKelasFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrtu = ortu?.nama_lengkap.toLowerCase().includes(q) || ortu?.kontak.includes(q);
      const matchSiswa = s?.nama_lengkap.toLowerCase().includes(q) || s?.nisn.includes(q);
      return matchOrtu || matchSiswa;
    }

    return true;
  });

  const handleManualSyncSheets = async () => {
    if (!sheetsConfig.webhook_url_akademik) {
      addToast('warning', 'Webhook Belum Terpasang', 'Harap isi URL Webhook Akademik di menu Pengaturan Google Sheets.');
      return;
    }
    setIsSyncing(true);
    try {
      await syncRelasiLive();
      addToast(
        'success',
        'Sinkronisasi Sukses',
        'Tab ORANG_TUA dan RELASI_ORANG_TUA_SISWA berhasil diperbarui di Google Spreadsheet via Webhook!'
      );
    } catch (err: any) {
      addToast('error', 'Gagal Sinkron', err.message || 'Terjadi kesalahan saat menyinkronkan data penghubung.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProcessConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectOrtuId) {
      addToast('error', 'Pilih Wali Murid', 'Silakan pilih orang tua / wali terlebih dahulu.');
      return;
    }
    if (!connectSiswaId) {
      addToast('error', 'Pilih Siswa', 'Silakan pilih siswa yang ingin ditautkan.');
      return;
    }

    const res = await hubungkanOrtuSiswa(connectOrtuId, connectSiswaId, connectStatus);
    if (res.success) {
      setShowConnectModal(false);
      setConnectOrtuId('');
      setConnectSiswaId('');
    }
  };

  const handleProcessAddOrtu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrtuNama.trim()) {
      addToast('error', 'Nama Wajib Diisi', 'Silakan masukkan nama lengkap wali murid.');
      return;
    }

    const newOrtuId = `ORT-${Date.now().toString().slice(-4)}`;
    const newOrtu: OrangTua = {
      ortu_id: newOrtuId,
      nama_lengkap: newOrtuNama.trim(),
      hubungan: newOrtuHubungan,
      pekerjaan: newOrtuPekerjaan.trim() || 'Wiraswasta / Pegawai',
      kontak: newOrtuKontak.trim() || '0812-0000-0000',
      email: newOrtuEmail.trim() || `${newOrtuNama.toLowerCase().replace(/[^a-z0-9]/g, '')}@sekolah.id`,
      alamat: newOrtuAlamat.trim() || 'Alamat domisili belum diisi'
    };

    saveOrangTua(newOrtu);

    // If an initial child was selected, connect right away
    if (initialChildId) {
      await hubungkanOrtuSiswa(newOrtuId, initialChildId, 'terverifikasi');
    }

    setShowAddOrtuModal(false);
    setNewOrtuNama('');
    setNewOrtuPekerjaan('');
    setNewOrtuKontak('');
    setNewOrtuEmail('');
    setNewOrtuAlamat('');
    setInitialChildId('');
  };

  const handleQuickConnectUnlinked = (s: Siswa) => {
    // Try to auto-find parent with matching name
    const match = orangTua.find(o => o.nama_lengkap.toLowerCase().includes(s.nama_ortu.toLowerCase()));
    if (match) {
      setConnectOrtuId(match.ortu_id);
    } else {
      setConnectOrtuId(orangTua[0]?.ortu_id || '');
    }
    setConnectSiswaId(s.siswa_id);
    setShowConnectModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>MODUL PENGHUBUNG ORANG TUA & SISWA (RELASI 1:N)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Penghubung Data Wali Murid & Peserta Didik
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Menghubungkan akun orang tua dengan satu atau banyak anak sekaligus. Setiap relasi secara otomatis tersinkronisasi 
            ke Google Spreadsheet (Tab <code className="text-rose-300 font-mono">RELASI_ORANG_TUA_SISWA</code> & <code className="text-rose-300 font-mono">ORANG_TUA</code>) via Webhook Apps Script.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleManualSyncSheets}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddOrtuModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Tambah Wali Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
            <span>Hubungkan Siswa & Wali</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Wali Murid</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalOrtu}</div>
          <span className="text-[10px] text-slate-400">Akun orang tua terdaftar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tautan Siswa Aktif</span>
            <Link2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRelasi}</div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{totalSiswaTerhubung} dari {siswa.length} siswa</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Belum Terhubung</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{siswaBelumTerhubung.length}</div>
          <span className="text-[10px] text-amber-700 font-medium">Perlu penautan wali</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Status Google Sheet</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tab RELASI Siap</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">19 Tab Akademik</span>
        </div>
      </div>

      {/* Main Connector Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama orang tua, siswa, kontak, atau NISN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedKelasFilter}
              onChange={e => setSelectedKelasFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white"
            >
              <option value="semua">Semua Rombel Kelas</option>
              {kelas.map(k => (
                <option key={k.kelas_id} value={k.kelas_id}>{k.nama_kelas}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="terverifikasi">Terverifikasi Saja</option>
              <option value="menunggu">Menunggu Konfirmasi</option>
            </select>
          </div>
        </div>

        {/* Relations Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Wali Murid / Orang Tua</th>
                <th className="py-3 px-4">Kontak & Alamat</th>
                <th className="py-3 px-4">Siswa Binaan (Anak)</th>
                <th className="py-3 px-4">Kelas / Rombel</th>
                <th className="py-3 px-4">Status Tautan</th>
                <th className="py-3 px-4 text-center">Aksi Penghubung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRelations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <HeartHandshake className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>Tidak ada relasi penghubung orang tua - siswa yang sesuai filter.</span>
                  </td>
                </tr>
              ) : (
                filteredRelations.map(rel => {
                  const ortu = orangTua.find(o => o.ortu_id === rel.ortu_id);
                  const s = siswa.find(item => item.siswa_id === rel.siswa_id);
                  const kls = kelas.find(k => k.kelas_id === s?.kelas_id);

                  return (
                    <tr key={rel.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ortu?.nama_lengkap || rel.ortu_id}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                            {ortu?.hubungan || 'Wali'}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">{rel.ortu_id}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{ortu?.kontak || '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                          {ortu?.alamat || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{s?.nama_lengkap || rel.siswa_id}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NISN: {s?.nisn || '-'} • NIS: {s?.nis || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {kls?.nama_kelas || s?.kelas_id || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {rel.status_verifikasi === 'terverifikasi' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Terverifikasi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {rel.status_verifikasi !== 'terverifikasi' && (
                            <button
                              type="button"
                              onClick={() => hubungkanOrtuSiswa(rel.ortu_id, rel.siswa_id, 'terverifikasi')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                              title="Verifikasi Tautan"
                            >
                              Verifikasi
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => putuskanOrtuSiswa(rel.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                            title="Putuskan Hubungan Siswa & Wali"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Siswa Belum Terhubung (Warning & Quick Actions) */}
      {siswaBelumTerhubung.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Daftar Siswa Belum Memiliki Akun / Tautan Wali Murid ({siswaBelumTerhubung.length} Siswa)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Data di bawah ini tercatat di Buku Induk Siswa tetapi belum memiliki tautan relasi akun wali di sistem SIM Sekolah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {siswaBelumTerhubung.slice(0, 6).map(s => (
              <div key={s.siswa_id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{s.nama_lengkap}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">NISN: {s.nisn} • Kelas: {s.kelas_id}</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Ortu Tercatat: <strong>{s.nama_ortu}</strong> ({s.kontak_ortu})
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/60 px-2 py-0.5 rounded">
                    Belum Ditautkan
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickConnectUnlinked(s)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Tautkan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Hubungkan Siswa & Wali Murid */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Hubungkan Siswa & Wali Murid</h3>
                  <span className="text-xs text-slate-500">Membentuk relasi data dan pemantauan nilai</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessConnect} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Orang Tua / Wali Murid:
                </label>
                <select
                  value={connectOrtuId}
                  onChange={e => setConnectOrtuId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white font-medium"
                >
                  <option value="">-- Pilih Orang Tua / Wali --</option>
                  {orangTua.map(o => (
                    <option key={o.ortu_id} value={o.ortu_id}>
                      {o.nama_lengkap} ({o.hubungan}) - {o.kontak}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik (Siswa):
                </label>
                <select
                  value={connectSiswaId}
                  onChange={e => setConnectSiswaId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white font-medium"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswa.map(s => (
                    <option key={s.siswa_id} value={s.siswa_id}>
                      {s.nama_lengkap} (NISN: {s.nisn} - Kelas: {s.kelas_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Verifikasi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    connectStatus === 'terverifikasi' ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="connectStatus"
                      checked={connectStatus === 'terverifikasi'}
                      onChange={() => setConnectStatus('terverifikasi')}
                      className="text-emerald-600"
                    />
                    <span>Terverifikasi (Resmi)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    connectStatus === 'menunggu' ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="connectStatus"
                      checked={connectStatus === 'menunggu'}
                      onChange={() => setConnectStatus('menunggu')}
                      className="text-amber-600"
                    />
                    <span>Menunggu Verifikasi</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Dampak Penautan:</span>
                <div>• Wali dapat memantau kehadiran harian & kuitansi SPP anak secara real-time.</div>
                <div>• Nilai rapor dan rekap akademik siswa akan otomatis dapat diakses di portal orang tua.</div>
                <div>• Tautan langsung terkirim ke Tab <strong>RELASI_ORANG_TUA_SISWA</strong> di Google Sheet Akademik.</div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Simpan Hubungan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Data Orang Tua Baru */}
      {showAddOrtuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Data Orang Tua / Wali Baru</h3>
                  <span className="text-xs text-slate-500">Mendaftarkan wali murid ke database sekolah</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOrtuModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessAddOrtu} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Orang Tua / Wali:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Drs. Bambang Suryanto"
                  value={newOrtuNama}
                  onChange={e => setNewOrtuNama(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hubungan Keluarga:
                  </label>
                  <select
                    value={newOrtuHubungan}
                    onChange={e => setNewOrtuHubungan(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white"
                  >
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Wali">Wali</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pekerjaan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Wiraswasta / PNS"
                    value={newOrtuPekerjaan}
                    onChange={e => setNewOrtuPekerjaan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / Telp:
                  </label>
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={newOrtuKontak}
                    onChange={e => setNewOrtuKontak(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={newOrtuEmail}
                    onChange={e => setNewOrtuEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Domisili:
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Mawar No. 12, Jakarta Selatan"
                  value={newOrtuAlamat}
                  onChange={e => setNewOrtuAlamat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautkan Langsung ke Siswa (Opsional):
                </label>
                <select
                  value={initialChildId}
                  onChange={e => setInitialChildId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="">-- Pilih Siswa untuk Ditautkan Sekarang --</option>
                  {siswa.map(s => (
                    <option key={s.siswa_id} value={s.siswa_id}>
                      {s.nama_lengkap} (Kelas: {s.kelas_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddOrtuModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Simpan Data Wali</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
