import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PresensiSiswa, BukuTamu } from '../../types';
import {
  CheckSquare,
  Clock,
  BookMarked,
  Activity,
  AlertTriangle,
  UserCheck,
  Search,
  PlusCircle,
  FileText,
  ShieldCheck,
  Send,
  LogOut
} from 'lucide-react';

export const PiketDashboard: React.FC = () => {
  const {
    siswa,
    guru,
    kelas,
    presensiSiswa,
    presensiGuru,
    bukuTamu,
    recordPresensiSiswa,
    recordPresensiGuru,
    addBukuTamu,
    checkoutBukuTamu,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'presensi' | 'keterlambatan' | 'buku-tamu' | 'guru' | 'kejadian'>('presensi');
  const [selectedKelas, setSelectedKelas] = useState(kelas[0]?.kelas_id || 'KLS-11-A');
  const todayStr = '2026-11-04';

  // Fast Attendance Form states
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [presensiStatus, setPresensiStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpa' | 'terlambat'>('hadir');
  const [menitTerlambat, setMenitTerlambat] = useState(10);
  const [keteranganPresensi, setKeteranganPresensi] = useState('');

  // Daily incident state
  const [incidents, setIncidents] = useState<{ id: string; waktu: string; judul: string; kronologi: string; tindakan: string }[]>([
    {
      id: 'INC-01',
      waktu: '07:15 WIB',
      judul: 'Kemacetan Depan Pintu Gerbang Utama',
      kronologi: 'Terjadi antrean kendaraan pengantar akibat proyek perbaikan gorong-gorong jalan raya.',
      tindakan: 'Petugas piket mengarahkan drop-off ke gerbang barat, siswa terlambat <15 menit ditoleransi.'
    }
  ]);
  const [newIncidentJudul, setNewIncidentJudul] = useState('');
  const [newIncidentKronologi, setNewIncidentKronologi] = useState('');

  const handleRecordPresensi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) {
      addToast('error', 'Pilih Siswa', 'Silakan pilih siswa yang akan dicatat kehadirannya.');
      return;
    }

    const foundSiswa = siswa.find(s => s.siswa_id === selectedSiswaId);
    if (!foundSiswa) return;

    const record: PresensiSiswa = {
      presensi_id: `PRS-${Date.now().toString().slice(-6)}`,
      siswa_id: foundSiswa.siswa_id,
      siswa_nama: foundSiswa.nama_lengkap,
      kelas_id: foundSiswa.kelas_id,
      tanggal: todayStr,
      status: presensiStatus,
      menit_terlambat: presensiStatus === 'terlambat' ? menitTerlambat : undefined,
      keterangan: keteranganPresensi || undefined,
      diinput_oleh: 'Staff Piket Suryono',
      created_at: new Date().toISOString()
    };

    recordPresensiSiswa(record);
    setSelectedSiswaId('');
    setKeteranganPresensi('');
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentJudul || !newIncidentKronologi) return;
    setIncidents([
      {
        id: `INC-${Date.now().toString().slice(-4)}`,
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        judul: newIncidentJudul,
        kronologi: newIncidentKronologi,
        tindakan: 'Telah ditindaklanjuti oleh Staff Piket dan dikoordinasikan ke Kesiswaan.'
      },
      ...incidents
    ]);
    setNewIncidentJudul('');
    setNewIncidentKronologi('');
    addToast('success', 'Kejadian Tercatat', 'Catatan kejadian harian berhasil disimpan pada buku piket.');
  };

  // Metrics for today
  const presensiHariIni = presensiSiswa.filter(p => p.tanggal === todayStr);
  const countHadir = presensiHariIni.filter(p => p.status === 'hadir').length;
  const countTerlambat = presensiHariIni.filter(p => p.status === 'terlambat').length;
  const countIzinSakit = presensiHariIni.filter(p => p.status === 'izin' || p.status === 'sakit').length;
  const countAlpa = presensiHariIni.filter(p => p.status === 'alpa').length;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider bg-amber-900/80 px-2.5 py-1 rounded-md border border-amber-700">
            Meja Piket Harian & Resepsionis Sekolah
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Dashboard Staff Piket
          </h1>
          <p className="text-xs text-amber-200 mt-1">
            Pencatatan kedatangan siswa, guru, buku tamu resepsionis, keterlambatan, dan kejadian harian ({todayStr}).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
          <Clock className="w-4 h-4 text-amber-300" />
          <span>Status Meja: <strong>Aktif Piket</strong></span>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Siswa Hadir Tepat Waktu</span>
          <div className="text-2xl font-black text-emerald-600">{countHadir} Siswa</div>
          <span className="text-[10px] text-slate-400">Presensi {todayStr}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Keterlambatan Tercatat</span>
          <div className="text-2xl font-black text-amber-600">{countTerlambat} Siswa</div>
          <span className="text-[10px] text-amber-700 font-semibold">Tercatat di buku piket</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Izin & Sakit</span>
          <div className="text-2xl font-black text-blue-600">{countIzinSakit} Siswa</div>
          <span className="text-[10px] text-slate-400">Dengan surat keterangan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Tamu Berkunjung Hari Ini</span>
          <div className="text-2xl font-black text-purple-600">{bukuTamu.length} Tamu</div>
          <span className="text-[10px] text-purple-700 font-semibold">Terdaftar di Kiosk Digital</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'presensi', label: 'Input Presensi Siswa', icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'keterlambatan', label: 'Rekap Keterlambatan', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'buku-tamu', label: 'Buku Tamu Resepsionis', icon: <BookMarked className="w-4 h-4" /> },
          { id: 'guru', label: 'Presensi Jam Kerja Guru', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'kejadian', label: 'Buku Kejadian Sekolah', icon: <FileText className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Presensi Siswa */}
      {activeTab === 'presensi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Catat Kehadiran Siswa</h3>
            <p className="text-xs text-slate-500 mb-4">Input langsung oleh petugas piket gerbang / resepsionis.</p>

            <form onSubmit={handleRecordPresensi} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filter Rombel / Kelas</label>
                <select
                  value={selectedKelas}
                  onChange={e => setSelectedKelas(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {kelas.map(k => (
                    <option key={k.kelas_id} value={k.kelas_id}>
                      {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Siswa</label>
                <select
                  required
                  value={selectedSiswaId}
                  onChange={e => setSelectedSiswaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Pilih Siswa Kelas Terpilih --</option>
                  {siswa
                    .filter(s => s.kelas_id === selectedKelas)
                    .map(s => (
                      <option key={s.siswa_id} value={s.siswa_id}>
                        {s.nama_lengkap} (NIS: {s.nis})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Kehadiran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hadir', label: 'Hadir', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                    { id: 'terlambat', label: 'Terlambat', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { id: 'izin', label: 'Izin', color: 'bg-blue-50 text-blue-800 border-blue-300' },
                    { id: 'sakit', label: 'Sakit', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
                    { id: 'alpa', label: 'Alpa', color: 'bg-rose-50 text-rose-800 border-rose-300' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setPresensiStatus(st.id as any)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        presensiStatus === st.id
                          ? 'ring-2 ring-slate-900 ' + st.color
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {presensiStatus === 'terlambat' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Menit Terlambat</label>
                  <input
                    type="number"
                    min={1}
                    value={menitTerlambat}
                    onChange={e => setMenitTerlambat(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan / Keterangan</label>
                <input
                  type="text"
                  value={keteranganPresensi}
                  onChange={e => setKeteranganPresensi(e.target.value)}
                  placeholder="Misal: Surat dokter / macet ban pecah..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Simpan Presensi Siswa</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Log Presensi Siswa Hari Ini ({presensiHariIni.length})</h3>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
              {presensiHariIni.map(p => (
                <div key={p.presensi_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.siswa_nama}</span>
                    <span className="text-slate-500 text-[11px]">
                      Diinput oleh: {p.diinput_oleh} • {p.keterangan || 'Tanpa keterangan khusus'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'terlambat'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'sakit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.status.toUpperCase()}
                      {p.menit_terlambat ? ` (+${p.menit_terlambat}m)` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Buku Tamu Resepsionis */}
      {activeTab === 'buku-tamu' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Meja Buku Tamu Resepsionis Digital ({bukuTamu.length})</h3>
              <p className="text-xs text-slate-500">Tersinkron dengan Spreadsheet Akademik (tab: BUKU_TAMU).</p>
            </div>
          </div>

          <div className="space-y-3">
            {bukuTamu.map(tamu => (
              <div key={tamu.tamu_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{tamu.nama_tamu}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {tamu.instansi}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium mt-1">Keperluan: {tamu.tujuan_kunjungan}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Bertemu: <strong className="text-blue-700">{tamu.bertemu_dengan}</strong> • Jam Datang: {tamu.waktu_datang}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {tamu.waktu_keluar ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                      Keluar: {tamu.waktu_keluar}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const now = new Date();
                        checkoutBukuTamu(tamu.tamu_id, `${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Catat Jam Pulang</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Buku Kejadian Sekolah */}
      {activeTab === 'kejadian' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Catat Kejadian Penting Sekolah</h3>
            <p className="text-xs text-slate-500 mb-4">Mendokumentasikan insiden atau catatan operasional harian.</p>

            <form onSubmit={handleAddIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul / Pokok Kejadian</label>
                <input
                  type="text"
                  required
                  value={newIncidentJudul}
                  onChange={e => setNewIncidentJudul(e.target.value)}
                  placeholder="Misal: Siswa pingsan saat upacara bendera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kronologi & Tindakan</label>
                <textarea
                  required
                  rows={4}
                  value={newIncidentKronologi}
                  onChange={e => setNewIncidentKronologi(e.target.value)}
                  placeholder="Jelaskan detail kronologi dan langkah penanganan yang telah dilakukan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Simpan ke Buku Kejadian</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 mb-3">Log Buku Kejadian Hari Ini ({incidents.length})</h3>
            {incidents.map(inc => (
              <div key={inc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{inc.judul}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{inc.waktu}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{inc.kronologi}</p>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px]">
                  <strong>Tindakan:</strong> {inc.tindakan}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
