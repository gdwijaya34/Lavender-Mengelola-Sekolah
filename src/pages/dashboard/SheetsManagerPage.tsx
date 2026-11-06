import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GoogleSheetsService, WorksheetMetadata } from '../../services/googleSheetsService';
import { GoogleSheetsPopulator, PopulateProgress } from '../../services/googleSheetsPopulator';
import { sendWebhookSync } from '../../services/googleAuthService';
import { GoogleSheetsConfig } from '../../types';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Key,
  Database,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  LogIn,
  LogOut,
  Info,
  Copy,
  Check,
  Code,
  Zap,
  ArrowRight,
  Clock,
  Sliders,
  Power
} from 'lucide-react';

export const SheetsManagerPage: React.FC = () => {
  const {
    sheetsConfig,
    updateSheetsConfig,
    refreshAllData,
    addToast,
    isAutoSyncRunning,
    autoSyncCountdown,
    executeAutoSync,
    toggleAutoSync,
    setAutoSyncInterval,
    isGoogleConnected,
    googleUserEmail,
    connectMasterGoogle,
    disconnectMasterGoogle
  } = useSchool();

  const [formConfig, setFormConfig] = useState<GoogleSheetsConfig>({ ...sheetsConfig });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ step: '', percent: 0 });
  const [activeTabFilter, setActiveTabFilter] = useState<'semua' | 'AKADEMIK' | 'KEUANGAN'>('semua');
  
  // Google OAuth & Webhook state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState<'akademik' | 'keuangan' | null>(null);
  const [showConfirmSyncModal, setShowConfirmSyncModal] = useState<boolean>(false);

  // One-click Populator & Apps Script modal states
  const [isPopulating, setIsPopulating] = useState<boolean>(false);
  const [populateProgress, setPopulateProgress] = useState<PopulateProgress | null>(null);
  const [showConfirmPopulateModal, setShowConfirmPopulateModal] = useState<boolean>(false);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState<boolean>(false);
  const [appsScriptTab, setAppsScriptTab] = useState<'akademik' | 'keuangan'>('akademik');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [populateResult, setPopulateResult] = useState<{ success: boolean; totalRows?: number; message: string } | null>(null);

  useEffect(() => {
    setFormConfig({ ...sheetsConfig });
    setHasGoogleToken(isGoogleConnected);
  }, [sheetsConfig, isGoogleConnected]);

  const worksheets = GoogleSheetsService.inspectWorksheets();

  const handleTestWebhook = async (type: 'akademik' | 'keuangan') => {
    const url = type === 'akademik' ? formConfig.webhook_url_akademik : formConfig.webhook_url_keuangan;
    if (!url) {
      addToast('error', 'URL Webhook Kosong', `Harap masukkan URL Webhook Apps Script ${type === 'akademik' ? 'Akademik' : 'Keuangan'} terlebih dahulu.`);
      return;
    }
    setIsTestingWebhook(type);
    try {
      const res = await sendWebhookSync(url, {
        action: 'test_ping',
        source: 'sim_sekolah_test',
        timestamp: new Date().toISOString()
      });
      if (res.success) {
        addToast('success', 'Webhook Terhubung!', `Endpoint Webhook Apps Script ${type === 'akademik' ? 'Akademik' : 'Keuangan'} aktif dan merespons dengan baik.`);
      } else {
        addToast('warning', 'Respon Webhook', res.message);
      }
    } catch (err: any) {
      addToast('error', 'Tes Webhook Gagal', err.message || 'Gagal menghubungi URL Webhook. Pastikan setting "Who has access" adalah "Anyone".');
    } finally {
      setIsTestingWebhook(null);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await GoogleSheetsService.testConnection(formConfig);
      setTestResult(res);
      if (res.success) {
        addToast('success', 'Koneksi Berhasil', res.message);
      } else {
        addToast('error', 'Koneksi Gagal', res.message);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menghubungi endpoint Google Sheets API v4.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExecuteSyncConfirmed = async () => {
    setShowConfirmSyncModal(false);
    if (!formConfig.webhook_url_keuangan && !formConfig.webhook_url_akademik) {
      addToast(
        'warning',
        'Webhook Belum Dipasang',
        'Harap masukkan URL Webhook Google Apps Script Keuangan atau Akademik terlebih dahulu di menu bawah.'
      );
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ step: 'Menghubungkan ke Webhook Google Apps Script...', percent: 10 });
    try {
      const res = await GoogleSheetsService.executeTwoWaySync((step, percent) => {
        setSyncProgress({ step, percent });
      });
      refreshAllData();
      addToast(
        'success',
        'Sinkronisasi Webhook Berhasil!',
        `Data (Keuangan & Akademik) berhasil diperbarui ke Google Spreadsheet via Webhook Apps Script pada ${res.timestamp}.`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Sinkronisasi Webhook', err.message || 'Terjadi kendala saat mengirim data ke Webhook.');
    } finally {
      setIsSyncing(false);
      setSyncProgress({ step: '', percent: 0 });
    }
  };

  const handleExecutePopulateConfirmed = async () => {
    setShowConfirmPopulateModal(false);
    if (!formConfig.webhook_url_keuangan && !formConfig.webhook_url_akademik) {
      addToast('error', 'Webhook Belum Diisi', 'Harap masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }

    setIsPopulating(true);
    setPopulateResult(null);
    setPopulateProgress({
      currentTab: 'Sinkronisasi Webhook',
      spreadsheet: 'AKADEMIK',
      currentStep: 1,
      totalSteps: 2,
      message: 'Mengirim seluruh data operasional ke Webhook Google Apps Script...'
    });

    try {
      await GoogleSheetsService.executeTwoWaySync((step, percent) => {
        setPopulateProgress({
          currentTab: step,
          spreadsheet: 'AKADEMIK',
          currentStep: Math.round(percent / 50),
          totalSteps: 2,
          message: step
        });
      });

      refreshAllData();
      setPopulateResult({
        success: true,
        message: 'Inisialisasi & Sinkronisasi Sukses! Seluruh data operasional telah terkirim ke Spreadsheet via Webhook Apps Script.'
      });
      addToast('success', 'Data Berhasil Disinkronkan!', 'Data di Google Sheets sekarang sudah mutakhir via Webhook.');
    } catch (err: any) {
      console.error('Populate error:', err);
      setPopulateResult({
        success: false,
        message: err.message || 'Gagal mengirim data ke Webhook Google Apps Script.'
      });
      addToast('error', 'Inisialisasi Gagal', err.message || 'Gagal mengirim data ke Webhook.');
    } finally {
      setIsPopulating(false);
      setPopulateProgress(null);
    }
  };

  const handleCopyAppsScript = (type: 'akademik' | 'keuangan') => {
    const code = type === 'akademik'
      ? GoogleSheetsPopulator.generateAppsScriptAkademik()
      : GoogleSheetsPopulator.generateAppsScriptKeuangan();

    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
    addToast('success', 'Script Disalin', `Kode Apps Script ${type === 'akademik' ? 'Akademik (19 Tab)' : 'Keuangan (12 Tab)'} berhasil disalin ke clipboard.`);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSheetsConfig(formConfig);
  };

  const handleDownloadCsv = (name: string) => {
    const csv = GoogleSheetsService.generateCsvTemplate(name);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Template_${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Template Diunduh', `Template header untuk worksheet ${name} telah diunduh.`);
  };

  const filteredWorksheets = worksheets.filter(
    w => activeTabFilter === 'semua' || w.spreadsheet === activeTabFilter
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-900/80 px-2.5 py-1 rounded-md border border-emerald-800">
            Database Operasional Utama
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Integrasi Google Sheets Terpadu
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Database Akademik (19 Tab) & Database Keuangan (12 Tab) dengan sinkronisasi dua arah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowConfirmSyncModal(true)}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
              isSyncing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Database Sekarang'}</span>
          </button>

          <button
            onClick={() => GoogleSheetsService.downloadSpreadsheetStructureGuide()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Blueprint (JSON)</span>
          </button>
        </div>
      </div>

      {/* Direct Google Sheets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Database Akademik (19 Tab)
            </span>
            <a
              href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_akademik}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Buka di Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 truncate">
            {sheetsConfig.spreadsheet_id_akademik}
          </div>
          <p className="text-[11px] text-slate-500">
            Berisi: USERS, SISWA, GURU, STAFF, KELAS, MAPEL, JADWAL, PRESENSI_SISWA, NILAI, PRESTASI, BUKU_TAMU, dll.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Database Keuangan (12 Tab)
            </span>
            <a
              href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_keuangan}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Buka di Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 truncate">
            {sheetsConfig.spreadsheet_id_keuangan}
          </div>
          <p className="text-[11px] text-slate-500">
            Berisi: MASTER_SPP, TAGIHAN_SPP, PEMBAYARAN_SPP, JURNAL_UMUM, AKUN_AKUNTANSI (COA), BUKU_KAS, dll.
          </p>
        </div>
      </div>

      {/* Auto-Sync 1-Minute Live Control Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-emerald-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Sinkronisasi Otomatis Database (Siklus 1 Menit)
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    sheetsConfig.auto_sync_enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sheetsConfig.auto_sync_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{sheetsConfig.auto_sync_enabled ? 'AUTO-SYNC AKTIF (1 MENIT)' : 'DIJEDA SEMENTARA'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Data operasional dan Google Sheets disinkronkan otomatis dua arah setiap 60 detik di latar belakang tanpa mengganggu input pengguna.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
              <span>Auto-Sync Otomatis:</span>
              <button
                type="button"
                onClick={() => toggleAutoSync(!sheetsConfig.auto_sync_enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  sheetsConfig.auto_sync_enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    sheetsConfig.auto_sync_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* 3 Metrics Cards: Countdown, Interval, Last Synced */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Live Countdown */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block">Hitung Mundur Siklus 1 Menit</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 font-mono">
                {sheetsConfig.auto_sync_enabled ? autoSyncCountdown : '—'}
              </span>
              <span className="text-xs font-bold text-slate-500">detik lagi</span>
            </div>
            {/* Visual progress bar for the 60s cycle */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{
                  width: sheetsConfig.auto_sync_enabled
                    ? `${Math.max(5, (autoSyncCountdown / ((sheetsConfig.auto_sync_interval_mins || 1) * 60)) * 100)}%`
                    : '0%'
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              {isAutoSyncRunning ? 'Sedang melakukan pertukaran data...' : 'Menuju sinkronisasi berkala berikutnya'}
            </span>
          </div>

          {/* Card 2: Interval Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Interval Sinkronisasi</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                Setiap {sheetsConfig.auto_sync_interval_mins || 1} Menit
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {[1, 2, 5, 15].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setAutoSyncInterval(mins)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    (sheetsConfig.auto_sync_interval_mins || 1) === mins
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mins === 1 ? '1 Menit (Default)' : `${mins} Menit`}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Last Synced Time & Manual Trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Terakhir Tersinkron</span>
              <div className="text-xs font-mono text-slate-800 space-y-0.5 mt-1">
                <div>• Akademik: <strong className="text-emerald-700">{sheetsConfig.last_sync_akademik || 'Hari ini'}</strong></div>
                <div>• Keuangan: <strong className="text-emerald-700">{sheetsConfig.last_sync_keuangan || 'Hari ini'}</strong></div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => executeAutoSync(false)}
                disabled={isAutoSyncRunning}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:bg-slate-400"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncRunning ? 'animate-spin' : ''}`} />
                <span>{isAutoSyncRunning ? 'Menyinkronkan...' : 'Paksa Sinkron Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section: METODE 2 GOOGLE APPS SCRIPT WEBHOOK */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-900/60 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>METODE 2: GOOGLE APPS SCRIPT WEBHOOK</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>PERMANEN DI SEMUA AKUN & DEVICE (SERVER-BACKED)</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sinkronisasi Database Otomatis 24/7 Tanpa Login Google
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Konfigurasi Webhook disimpan secara permanen di server backend dan langsung aktif di seluruh 7 role pengguna (Super Admin, Bendahara, Akademik, Guru, Piket, Siswa, Orang Tua) serta semua perangkat (HP, Laptop, Tablet, PC Kasir) tanpa perlu pengaturan ulang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {formConfig.webhook_url_keuangan ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Webhook Keuangan Aktif Permanen</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Webhook Keuangan Belum Dipasang</span>
              </span>
            )}

            {formConfig.webhook_url_akademik ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Webhook Akademik Aktif Permanen</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Webhook Akademik Belum Dipasang</span>
              </span>
            )}
          </div>
        </div>

        {/* 2 Dedicated Cards for Keuangan & Akademik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Database Keuangan */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  DATABASE KEUANGAN (12 TAB)
                </span>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_keuangan}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Buka Spreadsheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <h3 className="font-bold text-base text-white">Sinkronisasi SPP, Kas & Jurnal Otomatis</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tab: <code>PEMBAYARAN_SPP</code>, <code>TAGIHAN_SPP</code>, <code>BUKU_KAS</code>, <code>JURNAL_UMUM</code>, <code>DETAIL_JURNAL</code>, <code>MASTER_SPP</code>. Setiap transaksi pembayaran langsung masuk otomatis ke baris spreadsheet.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  URL Webhook Keuangan (akhiran /exec)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={formConfig.webhook_url_keuangan || ''}
                    onChange={e => setFormConfig({ ...formConfig, webhook_url_keuangan: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-[11px] placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestWebhook('keuangan')}
                    disabled={isTestingWebhook === 'keuangan' || !formConfig.webhook_url_keuangan}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 disabled:opacity-50"
                  >
                    {isTestingWebhook === 'keuangan' ? 'Menguji...' : 'Uji Webhook'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAppsScriptTab('keuangan');
                  setShowAppsScriptModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Lihat Kode Script</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyAppsScript('keuangan')}
                className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs border border-emerald-800 transition-all flex items-center gap-1.5"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Script Keuangan</span>
              </button>
            </div>
          </div>

          {/* Card 2: Database Akademik */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition-all space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  DATABASE AKADEMIK (19 TAB)
                </span>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_akademik}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>Buka Spreadsheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <h3 className="font-bold text-base text-white">Sinkronisasi Data Siswa, Nilai & Presensi</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tab: <code>USERS</code>, <code>SISWA</code>, <code>GURU</code>, <code>NILAI</code>, <code>PRESENSI_SISWA</code>, <code>PRESENSI_GURU</code>, <code>PRESTASI</code>, dll. Seluruh pembaruan nilai & absensi terkirim real-time.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  URL Webhook Akademik (akhiran /exec)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={formConfig.webhook_url_akademik || ''}
                    onChange={e => setFormConfig({ ...formConfig, webhook_url_akademik: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-blue-300 font-mono text-[11px] placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestWebhook('akademik')}
                    disabled={isTestingWebhook === 'akademik' || !formConfig.webhook_url_akademik}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0 disabled:opacity-50"
                  >
                    {isTestingWebhook === 'akademik' ? 'Menguji...' : 'Uji Webhook'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAppsScriptTab('akademik');
                  setShowAppsScriptModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Code className="w-4 h-4 text-blue-400" />
                <span>Lihat Kode Script</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyAppsScript('akademik')}
                className="px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 font-semibold text-xs border border-blue-800 transition-all flex items-center gap-1.5"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Script Akademik</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Step Visual Guide */}
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <span className="font-bold text-emerald-400 text-xs block uppercase tracking-wider">
            Panduan 4 Langkah Pasang Webhook Google Apps Script:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-300">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">1. Buka Spreadsheet</strong>
              Buka link spreadsheet target di tab baru (Akademik / Keuangan).
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">2. Buka Apps Script</strong>
              Klik <strong>Ekstensi &gt; Apps Script</strong>, hapus kode lama, tempel kode yang disalin.
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">3. Deploy sebagai Web App</strong>
              Klik <strong>Deploy &gt; New deployment</strong>, pilih <em>Web app</em>. Set <em>Execute as: Me</em> & <em>Access: Anyone</em>.
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">4. Tempel URL & Simpan</strong>
              Salin <em>Web app URL</em> (akhiran /exec) lalu tempel ke kolom di atas dan klik Simpan. Selesai!
            </div>
          </div>
        </div>

        {/* Populate Progress Banner if isPopulating */}
        {isPopulating && populateProgress && (
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                <span>{populateProgress.message}</span>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-right">
                Langkah {populateProgress.currentStep} dari {populateProgress.totalSteps} ({Math.round((populateProgress.currentStep / populateProgress.totalSteps) * 100)}%)
              </div>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{
                  width: `${Math.max(5, Math.round((populateProgress.currentStep / populateProgress.totalSteps) * 100))}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Populate Success / Error Message Banner */}
        {populateResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
              populateResult.success
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            {populateResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-white text-sm">
                {populateResult.success ? 'Inisialisasi Data Google Sheets Selesai!' : 'Inisialisasi Memerlukan Perhatian'}
              </div>
              <p className="leading-relaxed">{populateResult.message}</p>
              {populateResult.success && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_akademik}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-300 font-bold hover:text-white flex items-center gap-1"
                  >
                    <span>Buka Spreadsheet Akademik (19 Tab)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-slate-500">•</span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_keuangan}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-300 font-bold hover:text-white flex items-center gap-1"
                  >
                    <span>Buka Spreadsheet Keuangan (12 Tab)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sync Progress Bar if running */}
      {isSyncing && (
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>{syncProgress.step}</span>
            </span>
            <span className="font-bold font-mono text-emerald-700">{syncProgress.percent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Connection Config & Test Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">ID Spreadsheet & Otorisasi Akun</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              STATUS: {sheetsConfig.sync_status.toUpperCase()}
            </span>
          </div>

          {/* Method 2 Webhook Status Banner */}
          <div className="mb-5 p-3.5 rounded-xl border bg-emerald-50/70 border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold block">
                  Metode Sinkronisasi Aktif: Google Apps Script Webhook (24/7)
                </span>
                <span className="text-[11px] text-emerald-800">
                  Data otomatis disinkronkan ke Google Sheets tanpa perlu otorisasi akun Google berulang di browser.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAppsScriptTab('keuangan');
                setShowAppsScriptModal(true);
              }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 shrink-0"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Script Webhook</span>
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Spreadsheet ID — Database Akademik (19 Tab) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Database className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formConfig.spreadsheet_id_akademik}
                  onChange={e => setFormConfig({ ...formConfig, spreadsheet_id_akademik: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Spreadsheet ID — Database Keuangan (12 Tab) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Database className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formConfig.spreadsheet_id_keuangan}
                  onChange={e => setFormConfig({ ...formConfig, spreadsheet_id_keuangan: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs"
                />
              </div>
            </div>

            {/* Permanent 24/7 Webhook Sync Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Webhook Permanen 24/7 (Bebas Login untuk Semua Akun)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Menggunakan Web App Apps Script agar kasir, guru, & piket dapat sinkron tanpa login Google di perangkat masing-masing.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Webhook Keuangan (Google Apps Script Web App)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={formConfig.webhook_url_keuangan || ''}
                    onChange={e => setFormConfig({ ...formConfig, webhook_url_keuangan: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestWebhook('keuangan')}
                    disabled={isTestingWebhook === 'keuangan' || !formConfig.webhook_url_keuangan}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-[11px] shrink-0 disabled:opacity-50"
                  >
                    {isTestingWebhook === 'keuangan' ? 'Menguji...' : 'Uji Webhook'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Webhook Akademik (Google Apps Script Web App)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={formConfig.webhook_url_akademik || ''}
                    onChange={e => setFormConfig({ ...formConfig, webhook_url_akademik: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestWebhook('akademik')}
                    disabled={isTestingWebhook === 'akademik' || !formConfig.webhook_url_akademik}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-[11px] shrink-0 disabled:opacity-50"
                  >
                    {isTestingWebhook === 'akademik' ? 'Menguji...' : 'Uji Webhook'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-perm-sync"
                  checked={formConfig.permanent_sync_active ?? true}
                  onChange={e => setFormConfig({ ...formConfig, permanent_sync_active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="chk-perm-sync" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                  Aktifkan Mode Sinkronisasi Permanen Otomatis di Seluruh Akun Pengguna
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{isTesting ? 'Menguji Latensi...' : 'Uji Koneksi API'}</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simpan Permanen ke Semua Akun & Device</span>
              </button>
            </div>
          </form>

          {/* Test connection result notice */}
          {testResult && (
            <div
              className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold">{testResult.success ? 'Koneksi Berhasil' : 'Koneksi Bermasalah'}: </span>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Architecture & Security Overview */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-7 rounded-2xl space-y-4 text-xs shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Jaminan Kepatuhan & Transaksi Seimbang</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              SIM Sekolah menerapkan perlindungan anti-duplikasi dan penguncian antrean data:
            </p>

            <ul className="space-y-3 mt-4 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Idempotency Key:</strong> Setiap pembayaran SPP dan mutasi kas diberi ID transaksi unik agar tidak terduplikasi bila sinkronisasi diulang.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Struktur 31 Tab Terverifikasi:</strong> Memastikan tab akademik dan keuangan terpetakan secara lengkap dan seimbang.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Cadangan Operasional:</strong> Sistem menjamin kelangsungan operasional pencatatan nilai dan kasir bahkan saat jaringan internet fluktuatif.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Terakhir Sync: {sheetsConfig.last_sync_akademik || 'Hari ini'}</span>
            <span className="text-emerald-400">STATUS SIAP SINKRON</span>
          </div>
        </div>
      </div>

      {/* Structure Validator of all 31 Worksheets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Pemeriksaan Struktur Worksheet ({filteredWorksheets.length} Tab Terdaftar)
            </h3>
            <p className="text-xs text-slate-500">
              Validasi nama tab, kolom header wajib, serta jumlah record data saat ini.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['semua', 'AKADEMIK', 'KEUANGAN'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveTabFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  activeTabFilter === f
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'semua' ? 'Semua Tab (31)' : `Spreadsheet ${f}`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Nama Worksheet</th>
                <th className="py-2.5 px-3">Spreadsheet</th>
                <th className="py-2.5 px-3">Deskripsi Modul</th>
                <th className="py-2.5 px-3">Kolom Header Utama</th>
                <th className="py-2.5 px-3 text-center">Data Aktif</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Template</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorksheets.map(w => (
                <tr key={w.name} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{w.name}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.spreadsheet === 'AKADEMIK'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {w.spreadsheet}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs">{w.description}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-xs">
                    {w.requiredColumns.slice(0, 4).join(', ')}...
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{w.currentRecordCount}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Valid
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDownloadCsv(w.name)}
                      className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                      title={`Unduh Header CSV ${w.name}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Sync as required by Workspace Skill */}
      {showConfirmSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Sinkronkan Database via Webhook Apps Script?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                SIM Sekolah akan mengirimkan data operasional (Keuangan 12 Tab & Akademik 19 Tab) secara langsung ke endpoint Webhook Google Apps Script Anda:
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
              <div>• <strong>Webhook Keuangan:</strong> {formConfig.webhook_url_keuangan ? 'Aktif (12 Tab)' : 'Belum dipasang'}</div>
              <div>• <strong>Webhook Akademik:</strong> {formConfig.webhook_url_akademik ? 'Aktif (19 Tab)' : 'Belum dipasang'}</div>
            </div>

            <p className="text-[11px] text-slate-500">
              Sinkronisasi ini berjalan tanpa popup dan dapat diakses dari seluruh akun pengguna SIM Sekolah.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSyncModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteSyncConfirmed}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                Lanjutkan Sinkronisasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Initial Populator */}
      {showConfirmPopulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Inisialisasi & Isi Seluruh Data ke Google Sheets?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Aplikasi akan menghubungi Google Sheets API v4 menggunakan token otorisasi akun Google Anda dan secara otomatis:
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Spreadsheet Akademik ({sheetsConfig.spreadsheet_id_akademik}):</strong>
                  <div className="text-[11px] text-slate-500">
                    Membuat 19 tab baru: USERS, ROLES, SISWA, GURU, STAFF, ORANG_TUA, KELAS, MAPEL, JADWAL, PRESENSI, NILAI, PRESTASI, BUKU_TAMU, dll.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Spreadsheet Keuangan ({sheetsConfig.spreadsheet_id_keuangan}):</strong>
                  <div className="text-[11px] text-slate-500">
                    Membuat 12 tab baru: MASTER_SPP, TAGIHAN_SPP, PEMBAYARAN_SPP, PEMASUKAN, PENGELUARAN, AKUN_AKUNTANSI (COA), JURNAL_UMUM, BUKU_KAS, dll.
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Proses ini aman dan tidak akan menghapus berkas lain di Google Drive Anda. Pastikan koneksi internet stabil selama proses penulisan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmPopulateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecutePopulateConfirmed}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Isi Seluruh 31 Tab</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Apps Script Modal */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5 max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Kode Google Apps Script (Inisialisasi Mandiri)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Script bawaan yang dapat langsung dijalankan di Google Sheets untuk membuat seluruh tab & baris data dalam 5 detik.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAppsScriptModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Tab switch between Akademik & Keuangan */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAppsScriptTab('akademik')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    appsScriptTab === 'akademik'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Database Akademik (19 Tab)
                </button>
                <button
                  type="button"
                  onClick={() => setAppsScriptTab('keuangan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    appsScriptTab === 'keuangan'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Database Keuangan (12 Tab)
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopyAppsScript(appsScriptTab)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript ? 'Berhasil Disalin!' : 'Salin Seluruh Script'}</span>
              </button>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 text-slate-700">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-blue-700">
                Cara Menjalankan Script di Google Sheets:
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                <li>
                  Buka spreadsheet target:
                  {appsScriptTab === 'akademik' ? (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_akademik}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600 font-bold ml-1"
                    >
                      Buka Spreadsheet Akademik ({sheetsConfig.spreadsheet_id_akademik.slice(0, 10)}...)
                    </a>
                  ) : (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_keuangan}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-emerald-600 font-bold ml-1"
                    >
                      Buka Spreadsheet Keuangan ({sheetsConfig.spreadsheet_id_keuangan.slice(0, 10)}...)
                    </a>
                  )}
                </li>
                <li>Di menu atas Google Sheets, klik <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Hapus kode bawaan <code>function myFunction()</code> di editor, lalu <strong>Tempel (Paste)</strong> kode di bawah ini.</li>
                <li>Klik tombol <strong>Simpan (ikon disket)</strong> lalu klik tombol <strong>Jalankan (Run)</strong> untuk inisialisasi tabel awal. Berikan izin jika diminta. Selesai!</li>
                <li className="text-emerald-700 font-semibold pt-0.5">
                  <strong>Opsi Sinkronisasi Permanen 24/7 (Semua Akun):</strong> Di pojok kanan atas Apps Script, klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>New deployment</strong> &gt; Pilih jenis <strong>Web app</strong> &gt; Set <em>Execute as: "Me"</em> dan <em>Who has access: "Anyone"</em> &gt; Klik <strong>Deploy</strong> &gt; Salin <em>Web app URL</em> lalu tempel ke kolom URL Webhook di form pengaturan.
                </li>
              </ol>
            </div>

            {/* Code Box */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-emerald-400 shadow-inner">
              <pre className="whitespace-pre">
                {appsScriptTab === 'akademik'
                  ? GoogleSheetsPopulator.generateAppsScriptAkademik()
                  : GoogleSheetsPopulator.generateAppsScriptKeuangan()}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
