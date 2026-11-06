import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { PembayaranSPP, Siswa } from '../../types';
import { PrintReceiptModal } from '../../components/common/PrintReceiptModal';
import {
  Users,
  GraduationCap,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Printer,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Link2,
  Plus,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export const OrangTuaDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    siswa,
    orangTua,
    presensiSiswa,
    nilai,
    tagihanSPP,
    pembayaranSPP,
    config,
    getSiswaByOrtuId,
    klaimAnakDenganNisn,
    addToast
  } = useSchool();

  // Reference to logged in parent
  const currentOrtuId = currentUser?.reference_id || 'ORT-001';
  const currentOrtu = orangTua.find(o => o.ortu_id === currentOrtuId);

  // Dynamic children through the connector relation (fallback to first 2 students if newly initialized)
  const linkedChildren = getSiswaByOrtuId(currentOrtuId);
  const myChildren = linkedChildren.length > 0 
    ? linkedChildren 
    : siswa.filter(s => s.siswa_id === 'SIS-001' || s.siswa_id === 'SIS-002');

  const [selectedChildId, setSelectedChildId] = useState(myChildren[0]?.siswa_id || '');
  const [activeTab, setActiveTab] = useState<'presensi' | 'nilai' | 'spp'>('presensi');
  const [selectedReceipt, setSelectedReceipt] = useState<PembayaranSPP | null>(null);

  // Claim child by NISN modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimNisn, setClaimNisn] = useState('');
  const [claimTglLahir, setClaimTglLahir] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!selectedChildId && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].siswa_id);
    } else if (selectedChildId && !myChildren.some(c => c.siswa_id === selectedChildId) && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].siswa_id);
    }
  }, [myChildren, selectedChildId]);

  const activeChild = myChildren.find(c => c.siswa_id === selectedChildId) || myChildren[0];

  // Specific data for active child
  const childAttendance = presensiSiswa.filter(p => p.siswa_id === activeChild?.siswa_id);
  const childGrades = nilai.filter(n => n.siswa_id === activeChild?.siswa_id);
  const childBills = tagihanSPP.filter(t => t.siswa_id === activeChild?.siswa_id);
  const childPayments = pembayaranSPP.filter(p => p.siswa_id === activeChild?.siswa_id);

  // Today's attendance status
  const todayStatus = childAttendance.find(p => p.tanggal === '2026-11-04');

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimNisn || !claimTglLahir) {
      addToast('error', 'Lengkapi Formulir', 'Harap isi NISN dan tanggal lahir siswa secara lengkap.');
      return;
    }
    setIsClaiming(true);
    try {
      const res = await klaimAnakDenganNisn(currentOrtuId, claimNisn, claimTglLahir);
      if (res.success && res.siswa) {
        setSelectedChildId(res.siswa.siswa_id);
        setShowClaimModal(false);
        setClaimNisn('');
        setClaimTglLahir('');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider bg-rose-900/80 px-2.5 py-1 rounded-md border border-rose-800">
            Portal Wali Murid & Orang Tua
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Pemantauan Belajar & Keuangan Siswa
          </h1>
          <p className="text-xs text-rose-200 mt-1">
            Akun Wali: {currentOrtu?.nama_lengkap || currentUser?.nama_lengkap || 'Ir. Hendra Pratama'} • Kontak: {currentOrtu?.kontak || '0811-9876-1234'}
          </p>
        </div>

        {/* Multi-Child Selector & Connector */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-rose-200 uppercase font-semibold block">
              Pilih Siswa / Anak Binaan:
            </span>
            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="text-[11px] text-rose-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hubungkan Anak Baru</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {myChildren.map(child => (
              <button
                key={child.siswa_id}
                type="button"
                onClick={() => setSelectedChildId(child.siswa_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedChildId === child.siswa_id
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {child.nama_lengkap.split(' ')[0]} ({child.jenis_kelamin === 'L' ? 'Putra' : 'Putri'})
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 text-rose-200 border border-dashed border-rose-300/40 flex items-center gap-1 cursor-pointer"
              title="Hubungkan anak lain dengan NISN & Tanggal Lahir"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tautkan Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Child Info Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
            {activeChild.nama_lengkap.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{activeChild.nama_lengkap}</h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                Kelas {activeChild.kelas_id === 'KLS-11-A' ? 'XI MIPA 1' : activeChild.kelas_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              NIS: {activeChild.nis} • NISN: {activeChild.nisn} • Wali Kelas: Drs. Budi Santoso, M.Pd
            </p>
          </div>
        </div>

        {/* Today's live attendance indicator */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px]">Kehadiran Hari Ini (04 Nov):</span>
            <span
              className={`font-bold capitalize ${
                todayStatus?.status === 'hadir'
                  ? 'text-emerald-600'
                  : todayStatus?.status === 'terlambat'
                  ? 'text-amber-600'
                  : 'text-slate-700'
              }`}
            >
              {todayStatus ? `${todayStatus.status.toUpperCase()} (Tercatat)` : 'Hadir Tepat Waktu'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'presensi', label: 'Kehadiran & Absensi', icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'nilai', label: 'Hasil Nilai & Rapor Belajar', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'spp', label: 'Tagihan & Kuitansi SPP', icon: <CreditCard className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Kehadiran */}
      {activeTab === 'presensi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Riwayat Kehadiran Ananda ({childAttendance.length} Catatan)</h3>
          <div className="space-y-2.5">
            {childAttendance.map(p => (
              <div key={p.presensi_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold font-mono text-slate-800">{p.tanggal}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Petugas Pencatat: {p.diinput_oleh} {p.keterangan ? `• "${p.keterangan}"` : ''}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    p.status === 'hadir'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.status === 'terlambat'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {p.status.toUpperCase()}
                  {p.menit_terlambat ? ` (+${p.menit_terlambat} Menit)` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Nilai Rapor */}
      {activeTab === 'nilai' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Capaian Akademik Ananda ({childGrades.length} Mata Pelajaran)</h3>
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
                  <th className="py-2.5 px-3">Catatan Perkembangan Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childGrades.map(g => (
                  <tr key={g.nilai_id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{g.mapel_nama}</td>
                    <td className="py-2.5 px-3 text-center">{g.tugas}</td>
                    <td className="py-2.5 px-3 text-center">{g.kuis}</td>
                    <td className="py-2.5 px-3 text-center">{g.praktik}</td>
                    <td className="py-2.5 px-3 text-center">{g.ujian}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700">{g.nilai_akhir}</td>
                    <td className="py-2.5 px-3 text-center font-black">{g.predikat}</td>
                    <td className="py-2.5 px-3 text-slate-600 italic text-[11px] max-w-xs">{g.catatan_guru}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Tagihan SPP */}
      {activeTab === 'spp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Status Iuran & SPP Sekolah</h3>
            <p className="text-xs text-slate-500">
              Pembayaran dapat dilakukan melalui Transfer Bank BSI Yayasan atau Virtual Account.
            </p>
          </div>

          <div className="space-y-3">
            {childBills.map(b => (
              <div key={b.tagihan_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">SPP Periode {b.periode_bulan}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'dibayar_sebagian'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Nominal Tagihan: Rp {b.total_tagihan.toLocaleString('id-ID')}
                    {b.diskon_beasiswa > 0 && ` (Potongan Beasiswa OSN Rp ${b.diskon_beasiswa.toLocaleString('id-ID')})`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Terbayar: Rp {b.total_terbayar.toLocaleString('id-ID')}</span>
                  <span className="font-bold text-rose-600 text-sm">
                    {b.sisa_tagihan === 0 ? '✓ Lunas' : `Sisa: Rp ${b.sisa_tagihan.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Child's Receipts */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Kuitansi Pembayaran Terverifikasi</h4>
            {childPayments.map(p => (
              <div key={p.pembayaran_id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-700">{p.nomor_kuitansi}</span>
                  <p className="text-slate-600">{p.catatan}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{p.tanggal_pembayaran}</span>
                </div>
                <button
                  onClick={() => setSelectedReceipt(p)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat Kuitansi</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        payment={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Modal Hubungkan Anak dengan NISN & Tanggal Lahir */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Hubungkan Anak / Siswa</h3>
                  <span className="text-[11px] text-slate-500">Verifikasi NISN & Tanggal Lahir</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NISN Siswa (10 Digit):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0098765432"
                  value={claimNisn}
                  onChange={e => setClaimNisn(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Lahir Siswa:
                </label>
                <input
                  type="date"
                  value={claimTglLahir}
                  onChange={e => setClaimTglLahir(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Verifikasi keamanan agar hanya wali sah yang dapat mengakses data presensi & nilai anak.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isClaiming}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{isClaiming ? 'Memverifikasi...' : 'Hubungkan Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
