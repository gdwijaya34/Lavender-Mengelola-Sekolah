import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TagihanSPP, PembayaranSPP } from '../../types';
import { PrintReceiptModal } from '../../components/common/PrintReceiptModal';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import {
  DollarSign,
  CreditCard,
  Receipt,
  FileText,
  TrendingUp,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Key,
  Sparkles,
  Zap
} from 'lucide-react';

interface KeuanganDashboardProps {
  initialTab?: string;
}

export const KeuanganDashboard: React.FC<KeuanganDashboardProps> = ({ initialTab = 'overview' }) => {
  const {
    tagihanSPP,
    pembayaranSPP,
    akunAkuntansi,
    jurnalUmum,
    transaksiKeuangan,
    generateMonthlyBills,
    recordPembayaranSPP,
    recordPengeluaran,
    config,
    sheetsConfig,
    syncKeuanganLive,
    autoSyncCountdown,
    isAutoSyncRunning,
    isGoogleConnected,
    googleUserEmail,
    connectMasterGoogle,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState<PembayaranSPP | null>(null);

  // Metode 2 Webhook Google Apps Script status (24/7 otomatis tanpa login)
  const isSyncActive = !!sheetsConfig.webhook_url_keuangan;
  const [isSyncingFinancial, setIsSyncingFinancial] = useState<boolean>(false);
  const [lastSyncSuccess, setLastSyncSuccess] = useState<string | null>(null);

  // Form states for Pembayaran Kasir
  const [selectedTagihanId, setSelectedTagihanId] = useState('');
  const [nominalBayar, setNominalBayar] = useState<number>(800000);
  const [metodeBayar, setMetodeBayar] = useState<'Tunai' | 'Transfer Bank' | 'QRIS' | 'Virtual Account'>('Transfer Bank');
  const [referensiBayar, setReferensiBayar] = useState('');
  const [catatanBayar, setCatatanBayar] = useState('');

  // Form states for Pengeluaran
  const [kategoriBeban, setKategoriBeban] = useState('Operasional Praktikum Lab');
  const [keteranganBeban, setKeteranganBeban] = useState('');
  const [nominalBeban, setNominalBeban] = useState<number>(500000);
  const [kasSumber, setKasSumber] = useState('111-01'); // Kas Tunai
  const [akunBebanTujuan, setAkunBebanTujuan] = useState('511-03');

  // Metrics
  const totalSPPTagihan = tagihanSPP.reduce((acc, t) => acc + t.total_tagihan, 0);
  const totalSPPTerbayar = tagihanSPP.reduce((acc, t) => acc + t.total_terbayar, 0);
  const totalPiutangSPP = tagihanSPP.reduce((acc, t) => acc + t.sisa_tagihan, 0);

  const kasTunai = akunAkuntansi.find(a => a.kode_akun === '111-01')?.saldo_berjalan || 0;
  const kasBank = akunAkuntansi.find(a => a.kode_akun === '111-02')?.saldo_berjalan || 0;

  const totalPemasukan = transaksiKeuangan.filter(t => t.tipe === 'pemasukan').reduce((acc, t) => acc + t.nominal, 0);
  const totalPengeluaran = transaksiKeuangan.filter(t => t.tipe === 'pengeluaran').reduce((acc, t) => acc + t.nominal, 0);

  // Handlers
  const handleGenerateBills = () => {
    generateMonthlyBills('November 2026', config.tahun_ajaran_aktif);
  };

  const handleManualSyncFinancial = async () => {
    if (!sheetsConfig.webhook_url_keuangan) {
      addToast(
        'warning',
        'Webhook Belum Dipasang',
        'Harap pasang URL Webhook Apps Script Keuangan di menu Integrasi Google Sheets.'
      );
      return;
    }

    setIsSyncingFinancial(true);
    try {
      const syncRes = await GoogleSheetsService.syncKeuanganTables();
      setLastSyncSuccess(syncRes.timestamp);
      addToast(
        'success',
        'Kuitansi & SPP Tersinkron',
        `Berhasil menyinkronkan data kuitansi pembayaran dan seluruh tagihan ke Google Sheet Keuangan via Webhook (${syncRes.rowsWritten} baris diperbarui)!`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Sinkronisasi Webhook', err.message || 'Terjadi kesalahan saat menghubungi Webhook.');
    } finally {
      setIsSyncingFinancial(false);
    }
  };

  const handleProsesPembayaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagihanId) {
      addToast('error', 'Pilih Tagihan', 'Harap pilih tagihan siswa terlebih dahulu.');
      return;
    }
    if (nominalBayar <= 0) {
      addToast('error', 'Nominal Tidak Valid', 'Nominal pembayaran harus lebih dari 0.');
      return;
    }

    try {
      const result = recordPembayaranSPP(
        selectedTagihanId,
        nominalBayar,
        metodeBayar,
        referensiBayar,
        'Dewi Lestari, S.E., Ak.',
        catatanBayar
      );
      setSelectedPaymentForPrint(result.pembayaran);
      setSelectedTagihanId('');
      setCatatanBayar('');
      setReferensiBayar('');

      if (!isSyncActive) {
        addToast(
          'info',
          'Sesi Google Belum Aktif',
          'Pembayaran tersimpan di database lokal. Hubungkan Akun Master atau masukkan URL Webhook di menu Integrasi agar kuitansi langsung tercatat permanen di Google Sheet.'
        );
      }
    } catch (err: any) {
      addToast('error', 'Gagal Memproses', err.message || 'Gagal menyimpan transaksi.');
    }
  };

  const handleProsesPengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keteranganBeban || nominalBeban <= 0) {
      addToast('error', 'Data Belum Lengkap', 'Isi keterangan dan nominal pengeluaran secara valid.');
      return;
    }

    recordPengeluaran(
      kategoriBeban,
      keteranganBeban,
      nominalBeban,
      kasSumber,
      akunBebanTujuan,
      'Dewi Lestari, S.E., Ak.'
    );
    setKeteranganBeban('');
    setNominalBeban(500000);
  };

  // Filtered bills
  const filteredTagihan = tagihanSPP.filter(t => {
    const matchStatus = filterStatus === 'semua' || t.status === filterStatus;
    const matchSearch =
      t.siswa_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tagihan_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.kelas_nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const header = 'Tagihan_ID,Siswa_ID,Nama_Siswa,Kelas,Periode,Total_Tagihan,Terbayar,Sisa,Status,Jatuh_Tempo\n';
    const rows = tagihanSPP
      .map(
        t =>
          `${t.tagihan_id},${t.siswa_id},"${t.siswa_nama}","${t.kelas_nama}",${t.periode_bulan},${t.total_tagihan},${t.total_terbayar},${t.sisa_tagihan},${t.status},${t.jatuh_tempo}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Keuangan_SPP_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Ekspor Selesai', 'Data tagihan dan piutang SPP berhasil diunduh dalam format CSV.');
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-800/80 px-2.5 py-1 rounded-md border border-emerald-700">
            Modul Bendahara & Akuntansi Sekolah
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Sistem Keuangan & SPP Terpadu
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Jurnal Umum Double-Entry otomatis seimbang, tagihan berkala, kuitansi resmi, dan rekapitulasi kas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateBills}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generate Tagihan SPP Nov</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Financial Database Live Sync Status Card (Metode 2 Webhook) */}
      <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
        isSyncActive 
          ? 'bg-emerald-50/90 border-emerald-200' 
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isSyncActive ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Sinkronisasi Database Keuangan Google Sheet
                </h4>
                {isSyncActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Metode 2: Webhook Apps Script Aktif (24/7)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Webhook Keuangan Belum Dipasang
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Target Spreadsheet: <span className="font-mono font-semibold text-slate-800">{sheetsConfig.spreadsheet_id_keuangan}</span>
                {' • '}
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_keuangan}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                >
                  Buka Spreadsheet <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isSyncActive ? (
                  <>
                    Data kuitansi pembayaran ({pembayaranSPP.length} kuitansi), status tagihan ({tagihanSPP.length}), buku kas, dan jurnal otomatis disinkronkan ke Spreadsheet via Webhook Apps Script. {lastSyncSuccess ? `Terakhir disinkronkan: ${lastSyncSuccess}.` : `Auto-sync berjalan tiap 1 menit (${autoSyncCountdown}s).`}
                  </>
                ) : (
                  <>
                    <strong className="text-amber-800">Perhatian:</strong> Data pembayaran tersimpan aman di database lokal. Agar kuitansi dan status tagihan langsung terkirim otomatis ke Tab <code className="bg-amber-100 px-1 rounded font-bold">PEMBAYARAN_SPP</code> dan <code className="bg-amber-100 px-1 rounded font-bold">TAGIHAN_SPP</code> pada Google Sheet 24/7, silakan pasang URL Webhook Apps Script.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSyncActive ? (
              <button
                onClick={handleManualSyncFinancial}
                disabled={isSyncingFinancial}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                {isSyncingFinancial ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{isSyncingFinancial ? 'Menyinkronkan...' : 'Sinkronkan Pembayaran Sekarang'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-section', { detail: 'sheets' }))}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Pasang Webhook Keuangan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Kas Operasional Tunai</span>
          <div className="text-xl font-black text-slate-900">Rp {kasTunai.toLocaleString('id-ID')}</div>
          <span className="text-[10px] text-slate-400 font-mono">Akun 111-01</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Rekening Bank BSI Yayasan</span>
          <div className="text-xl font-black text-blue-700">Rp {kasBank.toLocaleString('id-ID')}</div>
          <span className="text-[10px] text-blue-500 font-mono">Akun 111-02</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total SPP Terkumpul</span>
          <div className="text-xl font-black text-emerald-600">Rp {totalSPPTerbayar.toLocaleString('id-ID')}</div>
          <span className="text-[10px] text-emerald-600 font-medium">{pembayaranSPP.length} Kuitansi Diterbitkan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Piutang SPP (Tunggakan)</span>
          <div className="text-xl font-black text-rose-600">Rp {totalPiutangSPP.toLocaleString('id-ID')}</div>
          <span className="text-[10px] text-rose-500 font-medium">Akun 112-01 (Piutang Siswa)</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Ringkasan & Tagihan', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'kasir', label: 'Loket Kasir & Pembayaran', icon: <Receipt className="w-4 h-4" /> },
          { id: 'pengeluaran', label: 'Catat Pengeluaran Sekolah', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'jurnal', label: 'Jurnal Umum (Double-Entry)', icon: <Scale className="w-4 h-4" /> },
          { id: 'coa', label: 'Bagan Akun Akuntansi (COA)', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'riwayat', label: 'Riwayat Kuitansi Pembayaran', icon: <Printer className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Tagihan SPP Bulanan */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daftar Tagihan SPP Siswa ({filteredTagihan.length})</h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan status pembayaran dan sisa tunggakan per siswa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="semua">Semua Status</option>
                <option value="belum_dibayar">Belum Dibayar</option>
                <option value="dibayar_sebagian">Dibayar Sebagian</option>
                <option value="lunas">Lunas</option>
                <option value="lewat_jatuh_tempo">Lewat Jatuh Tempo</option>
              </select>

              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa / kelas..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Tagihan</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3 text-right">Pokok</th>
                  <th className="py-2.5 px-3 text-right">Potongan</th>
                  <th className="py-2.5 px-3 text-right">Terbayar</th>
                  <th className="py-2.5 px-3 text-right">Sisa Tagihan</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTagihan.map(t => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.status}
                    </span>
                  );
                  if (t.status === 'lunas') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Lunas
                      </span>
                    );
                  } else if (t.status === 'dibayar_sebagian') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Cicilan
                      </span>
                    );
                  } else if (t.status === 'belum_dibayar') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Belum Bayar
                      </span>
                    );
                  } else if (t.status === 'lewat_jatuh_tempo') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Terlambat
                      </span>
                    );
                  }

                  return (
                    <tr key={t.tagihan_id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{t.tagihan_id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{t.siswa_nama}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.kelas_nama}</td>
                      <td className="py-2.5 px-3 text-slate-700">{t.periode_bulan}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        Rp {t.nominal_pokok.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                        {t.diskon_beasiswa > 0 ? `-Rp ${t.diskon_beasiswa.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                        Rp {t.total_terbayar.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                        Rp {t.sisa_tagihan.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center">{statusBadge}</td>
                      <td className="py-2.5 px-3 text-center">
                        {t.status !== 'lunas' ? (
                          <button
                            onClick={() => {
                              setSelectedTagihanId(t.tagihan_id);
                              setNominalBayar(t.sisa_tagihan);
                              setActiveTab('kasir');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200"
                          >
                            Bayar di Kasir
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">✓ Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Loket Kasir Pembayaran SPP */}
      {activeTab === 'kasir' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Input Pembayaran SPP Kasir</h3>
            <p className="text-xs text-slate-500 mb-5">
              Setiap pembayaran otomatis menerbitkan nomor kuitansi resmi dan mencatat jurnal akuntansi seimbang.
            </p>

            <form onSubmit={handleProsesPembayaran} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Tagihan Siswa <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedTagihanId}
                  onChange={e => {
                    setSelectedTagihanId(e.target.value);
                    const found = tagihanSPP.find(t => t.tagihan_id === e.target.value);
                    if (found) setNominalBayar(found.sisa_tagihan);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Pilih Siswa & Tagihan Aktif --</option>
                  {tagihanSPP
                    .filter(t => t.status !== 'lunas')
                    .map(t => (
                      <option key={t.tagihan_id} value={t.tagihan_id}>
                        {t.siswa_nama} - {t.kelas_nama} ({t.periode_bulan}) - Sisa: Rp {t.sisa_tagihan.toLocaleString('id-ID')}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal yang Disetorkan (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  value={nominalBayar}
                  onChange={e => setNominalBayar(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Mendukung pembayaran penuh maupun cicilan / pembayaran sebagian.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metode Setoran</label>
                  <select
                    value={metodeBayar}
                    onChange={(e: any) => setMetodeBayar(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="Transfer Bank">Transfer Bank (BSI)</option>
                    <option value="Tunai">Tunai di Kasir</option>
                    <option value="QRIS">QRIS Statis/Dinamis</option>
                    <option value="Virtual Account">Virtual Account</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Referensi / Bukti</label>
                  <input
                    type="text"
                    value={referensiBayar}
                    onChange={e => setReferensiBayar(e.target.value)}
                    placeholder="Contoh: TRF-BSI-102938"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={catatanBayar}
                  onChange={e => setCatatanBayar(e.target.value)}
                  placeholder="Misal: Lunas via teller sekolah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className={`p-3 rounded-xl border text-[11px] ${
                isSyncActive
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50/70 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isSyncActive
                      ? 'Sinkronisasi Google Sheets Aktif (Semua Akun)'
                      : 'Perhatian: Google Sheets Belum Terhubung'}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {isSyncActive
                    ? 'Kuitansi pembayaran ini otomatis dikirim ke Tab PEMBAYARAN_SPP, TAGIHAN_SPP, BUKU_KAS, dan JURNAL di Google Spreadsheet.'
                    : 'Kuitansi akan dicatat di database lokal. Agar otomatis masuk ke Google Sheet di semua role, hubungkan akun Master di banner atas atau pasang Webhook permanen.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Simpan Transaksi & Terbitkan Kuitansi</span>
              </button>
            </form>
          </div>

          {/* Right explanation: Accounting Double Entry */}
          <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Otomatisasi Jurnal Double-Entry</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Sistem SIM Sekolah menerapkan kaidah akuntansi baku. Ketika Anda memproses pembayaran SPP:
            </p>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-blue-700">
                <span>[DEBIT] {metodeBayar === 'Tunai' ? '111-01 Kas Tunai' : '111-02 Bank BSI Yayasan'}</span>
                <span>Rp {nominalBayar.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-rose-700 pl-4">
                <span>[KREDIT] 112-01 Piutang SPP Siswa</span>
                <span>Rp {nominalBayar.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-slate-500 text-[10px] flex justify-between">
                <span>Status Keseimbangan:</span>
                <span className="text-emerald-600 font-bold">BALANCED (SEIMBANG) ✓</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
              💡 <strong>Idempotency Protection:</strong> Transaksi dilindungi oleh nomor kuitansi unik dan Jurnal ID untuk mencegah pencatatan berulang jika sinkronisasi Google Sheets diulang.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Catat Pengeluaran */}
      {activeTab === 'pengeluaran' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Catat Pengeluaran & Belanja Sekolah</h3>
            <p className="text-xs text-slate-500 mb-5">
              Pencatatan pengeluaran operasional sekolah langsung menghasilkan Jurnal Pengeluaran Kas (BKK).
            </p>

            <form onSubmit={handleProsesPengeluaran} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Belanja</label>
                <select
                  value={kategoriBeban}
                  onChange={e => setKategoriBeban(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="Operasional Praktikum Lab">Operasional Praktikum Lab (511-03)</option>
                  <option value="Pemeliharaan IT & Internet">Pemeliharaan IT & Internet (511-04)</option>
                  <option value="Operasional Listrik & Air">Operasional Listrik & Air (511-02)</option>
                  <option value="Gaji & Tunjangan Pegawai">Gaji & Tunjangan Pegawai (511-01)</option>
                  <option value="Konsumsi & Rapat Dinas">Konsumsi & Rapat Dinas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Belanja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={keteranganBeban}
                  onChange={e => setKeteranganBeban(e.target.value)}
                  placeholder="Contoh: Pembelian tinta printer dan kabel LAN lab komputer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pengeluaran (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  value={nominalBeban}
                  onChange={e => setNominalBeban(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sumber Kas / Bank</label>
                  <select
                    value={kasSumber}
                    onChange={e => setKasSumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="111-01">111-01 Kas Tunai</option>
                    <option value="111-02">111-02 Bank BSI Yayasan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Akun Beban Akuntansi</label>
                  <select
                    value={akunBebanTujuan}
                    onChange={e => setAkunBebanTujuan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="511-03">511-03 Beban Praktikum Lab</option>
                    <option value="511-04">511-04 Beban IT & Jaringan</option>
                    <option value="511-02">511-02 Beban Listrik & Air</option>
                    <option value="511-01">511-01 Beban Gaji Pegawai</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-rose-400" />
                <span>Simpan Pengeluaran & Update Saldo Kas</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Daftar Transaksi Keuangan Terakhir</h3>
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
              {transaksiKeuangan.map(t => (
                <div key={t.transaksi_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold text-slate-900">{t.nomor_bukti}</span>
                      <span className="text-slate-400">• {t.tanggal}</span>
                    </div>
                    <p className="text-slate-700 font-medium mt-0.5">{t.keterangan}</p>
                    <span className="text-[10px] text-slate-400">{t.akun_kas}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm block ${
                        t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {t.tipe === 'pemasukan' ? '+' : '-'}Rp {t.nominal.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{t.kategori}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Jurnal Umum Double-Entry */}
      {activeTab === 'jurnal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Jurnal Umum Akuntansi (Double-Entry)</h3>
              <p className="text-xs text-slate-500">
                Pencatatan berpasangan seimbang antara akun Debit dan Kredit sesuai prinsip akuntansi.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Semua Jurnal 100% Balanced</span>
            </span>
          </div>

          <div className="space-y-4">
            {jurnalUmum.map(j => (
              <div key={j.jurnal_id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-slate-900">{j.nomor_jurnal}</span>
                    <span className="text-slate-400 font-mono">Ref: {j.referensi}</span>
                    <span className="text-slate-500">• {j.tanggal}</span>
                  </div>
                  <span className="text-slate-700 font-medium italic">{j.keterangan}</span>
                </div>

                <table className="w-full text-xs">
                  <thead className="bg-white text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-4 text-left font-medium">Kode Akun</th>
                      <th className="py-2 px-4 text-left font-medium">Nama Akun Akuntansi</th>
                      <th className="py-2 px-4 text-right font-medium">Debit (Rp)</th>
                      <th className="py-2 px-4 text-right font-medium">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {j.detail.map((d, idx) => (
                      <tr key={idx} className={d.kredit > 0 ? 'bg-slate-50/40' : ''}>
                        <td className="py-2 px-4 text-slate-500">{d.kode_akun}</td>
                        <td className={`py-2 px-4 ${d.kredit > 0 ? 'pl-8 text-slate-700' : 'text-slate-900 font-semibold'}`}>
                          {d.nama_akun}
                        </td>
                        <td className="py-2 px-4 text-right text-blue-700">
                          {d.debit > 0 ? d.debit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-2 px-4 text-right text-slate-700">
                          {d.kredit > 0 ? d.kredit.toLocaleString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="py-2 px-4 text-right text-slate-600">Total Seimbang (Balanced):</td>
                      <td className="py-2 px-4 text-right text-blue-700">Rp {j.total_debit.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-4 text-right text-slate-900">Rp {j.total_kredit.toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Chart of Accounts (COA) */}
      {activeTab === 'coa' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bagan Akun Standar (Chart of Accounts)</h3>
              <p className="text-xs text-slate-500">
                Daftar akun buku besar untuk integrasi akuntansi sekolah.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Sinkron ke tab: AKUN_AKUNTANSI</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode Akun</th>
                  <th className="py-2.5 px-3">Nama Akun</th>
                  <th className="py-2.5 px-3">Klasifikasi</th>
                  <th className="py-2.5 px-3">Posisi Normal</th>
                  <th className="py-2.5 px-3 text-right">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {akunAkuntansi.map(acc => (
                  <tr key={acc.kode_akun} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-blue-700">{acc.kode_akun}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{acc.nama_akun}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {acc.tipe}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{acc.posisi_normal}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      Rp {acc.saldo_berjalan.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Riwayat Kuitansi */}
      {activeTab === 'riwayat' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Riwayat Kuitansi Pembayaran SPP</h3>
              <p className="text-xs text-slate-500">
                Cetak ulang atau simpan kuitansi resmi pembayaran siswa ({pembayaranSPP.length} transaksi tercatat).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSyncFinancial}
                disabled={isSyncingFinancial}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                title="Kirim seluruh riwayat kuitansi ke Tab PEMBAYARAN_SPP di Google Sheet"
              >
                {isSyncingFinancial ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>{isSyncingFinancial ? 'Menyinkronkan...' : 'Kirim Semua ke Google Sheet'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Kuitansi</th>
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3">Waktu Bayar</th>
                  <th className="py-2.5 px-3 text-center">Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pembayaranSPP.map(p => (
                  <tr key={p.pembayaran_id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.nomor_kuitansi}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.siswa_nama}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.kelas_nama}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.periode_bulan}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      Rp {p.nominal_bayar.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.metode_pembayaran}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{p.tanggal_pembayaran}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedPaymentForPrint(p)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                        title="Buka Cetak Kuitansi"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        payment={selectedPaymentForPrint}
        onClose={() => setSelectedPaymentForPrint(null)}
      />
    </div>
  );
};
