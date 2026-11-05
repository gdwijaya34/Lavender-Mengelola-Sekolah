import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BukuTamu } from '../../types';
import {
  BookMarked,
  UserCheck,
  Building,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  Users,
  ShieldCheck,
  Search,
  LogOut,
  Calendar
} from 'lucide-react';

interface BukuTamuPageProps {
  onNavigateHome: () => void;
}

export const BukuTamuPage: React.FC<BukuTamuPageProps> = ({ onNavigateHome }) => {
  const { config, bukuTamu, addBukuTamu, checkoutBukuTamu, addToast } = useSchool();

  const [namaTamu, setNamaTamu] = useState('');
  const [instansi, setInstansi] = useState('');
  const [kontak, setKontak] = useState('');
  const [tujuanKunjungan, setTujuanKunjungan] = useState('');
  const [bertemuDengan, setBertemuDengan] = useState('Kepala Sekolah');
  const [catatan, setCatatan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Anti-spam captcha
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [num1] = useState(4);
  const [num2] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaAnswer) !== num1 + num2) {
      addToast('error', 'Verifikasi Keamanan Gagal', 'Jawaban perhitungan anti-spam belum tepat.');
      return;
    }

    const now = new Date();
    const timeFormatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    const newTamu: BukuTamu = {
      tamu_id: `TMU-${Date.now().toString().slice(-6)}`,
      nama_tamu: namaTamu,
      instansi: instansi || 'Pribadi / Wali Murid',
      kontak: kontak || '-',
      tujuan_kunjungan: tujuanKunjungan,
      bertemu_dengan: bertemuDengan,
      waktu_datang: timeFormatted,
      catatan: catatan || undefined,
      created_at: now.toISOString()
    };

    addBukuTamu(newTamu);
    setSubmittedSuccess(true);
    setNamaTamu('');
    setInstansi('');
    setKontak('');
    setTujuanKunjungan('');
    setCatatan('');
    setCaptchaAnswer('');
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  const handleCheckout = (tamuId: string) => {
    const now = new Date();
    const timeFormatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    checkoutBukuTamu(tamuId, timeFormatted);
  };

  const filteredTamu = bukuTamu.filter(
    t =>
      t.nama_tamu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.instansi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tujuan_kunjungan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Kiosk */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <BookMarked className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Terminal Resepsionis & Kiosk Publik
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Buku Tamu Digital Sekolah</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.nama_sekolah} • {config.alamat}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sinkron ke Spreadsheet A</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {submittedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Pendaftaran Tamu Berhasil</h4>
              <p className="text-xs text-emerald-700">
                Data kedatangan Anda telah tercatat secara resmi pada log resepsionis sekolah.
              </p>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Registrasi Tamu */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Formulir Kunjungan Tamu</h3>
                <p className="text-[11px] text-slate-500">Silakan isi formulir kedatangan Anda di bawah ini.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Tamu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaTamu}
                  onChange={e => setNamaTamu(e.target.value)}
                  placeholder="Contoh: Drs. Bambang Sugito, M.M."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instansi / Lembaga / Perusahaan
                </label>
                <input
                  type="text"
                  value={instansi}
                  onChange={e => setInstansi(e.target.value)}
                  placeholder="Contoh: Dinas Pendidikan / Wali Siswa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  value={kontak}
                  onChange={e => setKontak(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bertemu Dengan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bertemuDengan}
                  onChange={e => setBertemuDengan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                >
                  <option value="Kepala Sekolah (Dr. Hj. Siti Nurhaliza, M.Pd)">Kepala Sekolah</option>
                  <option value="Wakasek Kurikulum & Akademik">Wakasek Kurikulum & Akademik</option>
                  <option value="Wakasek Kesiswaan">Wakasek Kesiswaan</option>
                  <option value="Bagian Keuangan & Administrasi SPP">Bagian Keuangan & Administrasi SPP</option>
                  <option value="Guru Bimbingan Konseling (BK)">Guru Bimbingan Konseling (BK)</option>
                  <option value="Guru Kelas / Wali Kelas">Guru Kelas / Wali Kelas</option>
                  <option value="Panitia Penerimaan Peserta Didik Baru (PPDB)">Panitia PPDB</option>
                  <option value="Staff Tata Usaha">Staff Tata Usaha</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tujuan / Keperluan Kunjungan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={tujuanKunjungan}
                  onChange={e => setTujuanKunjungan(e.target.value)}
                  placeholder="Jelaskan maksud dan tujuan kunjungan secara ringkas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Misal: Membawa dokumen resmi, surat tugas, dll."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              {/* Anti-spam captcha */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">
                  Verifikasi Anti-Spam: Berapakah {num1} + {num2}? <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={captchaAnswer}
                  onChange={e => setCaptchaAnswer(e.target.value)}
                  placeholder="Masukkan angka hasil..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Simpan Kedatangan Tamu</span>
              </button>
            </form>
          </div>

          {/* Right Log: Daftar Tamu Hari Ini */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Daftar Tamu Sekolah ({filteredTamu.length})</h3>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nama / instansi..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Guest Log List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredTamu.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <BookMarked className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Belum ada catatan tamu yang sesuai.</p>
                  </div>
                ) : (
                  filteredTamu.map(tamu => (
                    <div
                      key={tamu.tamu_id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{tamu.nama_tamu}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {tamu.instansi}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-1">
                            Keperluan: <span className="text-slate-800">{tamu.tujuan_kunjungan}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Bertemu: <span className="font-semibold text-blue-700">{tamu.bertemu_dengan}</span>
                            {tamu.kontak && tamu.kontak !== '-' && ` • Kontak: ${tamu.kontak}`}
                          </p>
                        </div>

                        {/* Status Check-in / Checkout */}
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Masuk: {tamu.waktu_datang}
                          </span>
                          {tamu.waktu_keluar ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block mt-1">
                              Keluar: {tamu.waktu_keluar.split(' ')[1] || tamu.waktu_keluar}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckout(tamu.tamu_id)}
                              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Catat Keluar</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {tamu.catatan && (
                        <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200 italic">
                          "{tamu.catatan}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Data tersinkron otomatis ke Google Spreadsheet Akademik (tab: BUKU_TAMU)</span>
              <span className="font-mono">IDEMPOTENT • SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
