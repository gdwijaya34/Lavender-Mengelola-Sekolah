import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  SheetsImportService,
  SUPPORTED_IMPORT_TABLES,
  TableImportDefinition
} from '../../services/sheetsImportService';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  ExternalLink,
  Table,
  Check,
  X,
  FileText,
  Users,
  CreditCard,
  Building
} from 'lucide-react';

interface ImportSheetsPageProps {
  onNavigateSection?: (section: string) => void;
}

export const ImportSheetsPage: React.FC<ImportSheetsPageProps> = ({ onNavigateSection }) => {
  const { sheetsConfig, refreshAllData, addToast } = useSchool();

  // Tab source selection
  const [sourceType, setSourceType] = useState<'webhook' | 'url' | 'file'>('webhook');

  // Webhook source state
  const [selectedWebhookType, setSelectedWebhookType] = useState<'akademik' | 'keuangan' | 'all'>('all');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fetchedTables, setFetchedTables] = useState<Record<string, any[][]>>({});

  // URL source state
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [customTabName, setCustomTabName] = useState('SISWA');

  // File upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Table selection & Strategy
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>(['USERS', 'SISWA', 'GURU', 'TAGIHAN_SPP']);
  const [importStrategy, setImportStrategy] = useState<'replace' | 'merge' | 'append'>('merge');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Akademik' | 'Keuangan' | 'Pengguna'>('all');

  // Preview state
  const [previewTableId, setPreviewTableId] = useState<string | null>(null);

  // Import execution state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ step: string; percent: number }>({ step: '', percent: 0 });
  const [importResults, setImportResults] = useState<{
    success: boolean;
    timestamp: string;
    items: { tableName: string; added: number; updated: number; total: number }[];
  } | null>(null);

  // 1. Fetch from connected Webhooks (Akademik & Keuangan)
  const handleFetchFromWebhook = async () => {
    setIsFetchingData(true);
    setImportResults(null);
    try {
      const combinedTables: Record<string, any[][]> = {};
      let webhookSuccess = false;

      // 1. Try Webhook first (Fastest)
      try {
        if (selectedWebhookType === 'akademik' || selectedWebhookType === 'all') {
          const akademikTables = await SheetsImportService.fetchFromWebhook('akademik');
          if (akademikTables && Object.keys(akademikTables).length > 0) {
            Object.assign(combinedTables, akademikTables);
            webhookSuccess = true;
          }
        }

        if (selectedWebhookType === 'keuangan' || selectedWebhookType === 'all') {
          const keuanganTables = await SheetsImportService.fetchFromWebhook('keuangan');
          if (keuanganTables && Object.keys(keuanganTables).length > 0) {
            Object.assign(combinedTables, keuanganTables);
            webhookSuccess = true;
          }
        }
      } catch (webhookErr) {
        console.warn('Webhook fetch failed or not configured, using direct spreadsheet export...', webhookErr);
      }

      // 2. Fallback: Fetch directly from Google Sheets CSV Export API
      if (!webhookSuccess || Object.keys(combinedTables).length === 0) {
        const akademikTabs = ['USERS', 'SISWA', 'GURU', 'STAFF', 'KELAS', 'MATA_PELAJARAN', 'JADWAL_PELAJARAN', 'PRESENSI_SISWA', 'NILAI_SISWA', 'PRESTASI', 'BUKU_TAMU', 'PENGUMUMAN'];
        const keuanganTabs = ['TAGIHAN_SPP', 'PEMBAYARAN_SPP', 'PENGELUARAN_KAS', 'TRANSAKSI_KEUANGAN', 'AKUN_AKUNTANSI', 'JURNAL_UMUM'];

        if (selectedWebhookType === 'akademik' || selectedWebhookType === 'all') {
          for (const tab of akademikTabs) {
            try {
              const rows = await SheetsImportService.fetchFromPublicSheetCsv(sheetsConfig.spreadsheet_id_akademik, tab);
              if (rows && rows.length > 1) {
                combinedTables[tab] = rows;
              }
            } catch {
              // skip tab if not found or empty
            }
          }
        }

        if (selectedWebhookType === 'keuangan' || selectedWebhookType === 'all') {
          for (const tab of keuanganTabs) {
            try {
              const rows = await SheetsImportService.fetchFromPublicSheetCsv(sheetsConfig.spreadsheet_id_keuangan, tab);
              if (rows && rows.length > 1) {
                combinedTables[tab] = rows;
              }
            } catch {
              // skip tab if not found or empty
            }
          }
        }
      }

      const tableKeys = Object.keys(combinedTables);
      if (tableKeys.length === 0) {
        throw new Error('Tidak ada data tabel yang ditemukan di Google Sheets. Pastikan sheet berisi tab master atau webhook telah aktif.');
      }

      setFetchedTables(combinedTables);
      // Auto select all detected tables
      setSelectedTableIds(tableKeys);
      addToast(
        'success',
        'Data Berhasil Diambil',
        `Berhasil mengambil ${tableKeys.length} tabel dari Google Sheet (${tableKeys.join(', ')}). Silakan periksa data sebelum menerapkan import.`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Mengambil Data', err.message || 'Pastikan Webhook atau spreadsheet dapat diakses.');
    } finally {
      setIsFetchingData(false);
    }
  };

  // 2. Fetch from public Google Sheet URL
  const handleFetchFromUrl = async () => {
    if (!customSheetUrl.trim()) {
      addToast('warning', 'URL Kosong', 'Masukkan URL Google Sheet atau Spreadsheet ID terlebih dahulu.');
      return;
    }

    // Extract spreadsheet ID from URL or bare ID
    const match = customSheetUrl.match(/[-\w]{25,}/);
    const spreadsheetId = match ? match[0] : customSheetUrl.trim();

    setIsFetchingData(true);
    setImportResults(null);
    try {
      const rows = await SheetsImportService.fetchFromPublicSheetCsv(spreadsheetId, customTabName.trim());
      if (!rows || rows.length === 0) {
        throw new Error(`Tab "${customTabName}" kosong atau tidak memiliki baris data.`);
      }

      setFetchedTables({
        [customTabName.toUpperCase()]: rows
      });
      setSelectedTableIds([customTabName.toUpperCase()]);
      addToast('success', 'Tab Berhasil Diunduh', `Berhasil mengambil ${rows.length - 1} baris dari tab ${customTabName}.`);
    } catch (err: any) {
      addToast('error', 'Gagal Membaca Sheet', err.message || 'Pastikan spreadsheet bersifat publik (Anyone with the link).');
    } finally {
      setIsFetchingData(false);
    }
  };

  // 3. Handle File Upload (CSV or JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (typeof parsed === 'object') {
            setFetchedTables(parsed);
            setSelectedTableIds(Object.keys(parsed));
            addToast('success', 'File JSON Dimuat', `Berhasil membaca ${Object.keys(parsed).length} tabel dari file.`);
          }
        } else {
          // Default to CSV
          const rows = SheetsImportService.parseCsv(content);
          // Try to infer tab name from file name
          const inferredTab = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
          setFetchedTables({
            [inferredTab]: rows
          });
          setSelectedTableIds([inferredTab]);
          addToast('success', 'File CSV Dimuat', `Berhasil membaca ${rows.length - 1} baris untuk tabel ${inferredTab}.`);
        }
      } catch (err: any) {
        addToast('error', 'Gagal Membaca File', err.message || 'Format file tidak sesuai.');
      }
    };

    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = async () => {
    const tableKeysToImport = Object.keys(fetchedTables).filter(k => selectedTableIds.includes(k));

    if (tableKeysToImport.length === 0) {
      addToast('warning', 'Pilih Tabel', 'Pilih minimal satu tabel yang ingin diimport ke database.');
      return;
    }

    setIsImporting(true);
    setImportProgress({ step: 'Mempersiapkan data import...', percent: 5 });

    const resultsList: { tableName: string; added: number; updated: number; total: number }[] = [];

    try {
      for (let i = 0; i < tableKeysToImport.length; i++) {
        const tableName = tableKeysToImport[i];
        const rawRows = fetchedTables[tableName];

        setImportProgress({
          step: `Memproses tabel ${tableName} (${i + 1}/${tableKeysToImport.length})...`,
          percent: Math.round(((i + 1) / tableKeysToImport.length) * 90)
        });

        // Convert raw rows to typed domain objects
        const typedRecords = SheetsImportService.convertRawToTyped(tableName, rawRows);

        // Apply into local storage
        const res = SheetsImportService.applyImport(tableName, typedRecords, importStrategy);
        resultsList.push({
          tableName,
          added: res.added,
          updated: res.updated,
          total: res.total
        });

        // Small delay for smooth UI feedback
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      setImportProgress({ step: 'Menyinkronkan data aplikasi...', percent: 100 });
      refreshAllData();

      setImportResults({
        success: true,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        items: resultsList
      });

      addToast(
        'success',
        'Import Database Sukses!',
        `Berhasil mengimpor ${resultsList.length} tabel ke database sekolah.`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Import Database', err.message || 'Terjadi kesalahan saat memproses data.');
    } finally {
      setIsImporting(false);
      setImportProgress({ step: '', percent: 0 });
    }
  };

  const filteredDefinitions = SUPPORTED_IMPORT_TABLES.filter(t => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  const toggleSelectTable = (id: string) => {
    if (selectedTableIds.includes(id)) {
      setSelectedTableIds(selectedTableIds.filter(item => item !== id));
    } else {
      setSelectedTableIds([...selectedTableIds, id]);
    }
  };

  const selectAllCategory = (category: string) => {
    if (category === 'all') {
      setSelectedTableIds(SUPPORTED_IMPORT_TABLES.map(t => t.id));
    } else {
      const ids = SUPPORTED_IMPORT_TABLES.filter(t => t.category === category).map(t => t.id);
      setSelectedTableIds(Array.from(new Set([...selectedTableIds, ...ids])));
    }
  };

  const deselectAll = () => {
    setSelectedTableIds([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-900/60 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>IMPORT DATABASE GOOGLE SHEETS</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>31 TAB MASTER TERSEDIA</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Import & Sinkronisasi Database dari Google Sheet
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Tarik seluruh data dari Google Spreadsheet terhubung (Akademik 19 Tab & Keuangan 12 Tab), URL sheet publik, atau unggahan file CSV/JSON langsung ke dalam SIM Sekolah dengan opsi Timpa (Replace), Gabungkan (Merge), atau Tambah Saja.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateSection && (
              <button
                type="button"
                onClick={() => onNavigateSection('sheets')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Konfigurasi Webhook</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 1: Pilih Sumber Data */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pilih Sumber Data Google Sheet</h2>
              <span className="text-xs text-slate-500">Pilih metode pengambilan data spreadsheet yang Anda inginkan</span>
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setSourceType('webhook')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                sourceType === 'webhook' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Database Terhubung (Webhook)
            </button>
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                sourceType === 'url' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              URL Google Sheet Publik
            </button>
            <button
              type="button"
              onClick={() => setSourceType('file')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                sourceType === 'file' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Upload File (CSV / JSON)
            </button>
          </div>
        </div>

        {/* Source Option A: Webhook Terhubung */}
        {sourceType === 'webhook' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedWebhookType('akademik')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedWebhookType === 'akademik' || selectedWebhookType === 'all'
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Database Akademik (19 Tab)
                  </span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_akademik}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  USERS (termasuk password), SISWA, GURU, STAFF, KELAS, MAPEL, JADWAL, PRESENSI, NILAI, PRESTASI, BUKU TAMU.
                </p>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  ID: {sheetsConfig.spreadsheet_id_akademik}
                </div>
              </div>

              <div
                onClick={() => setSelectedWebhookType('keuangan')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedWebhookType === 'keuangan' || selectedWebhookType === 'all'
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Database Keuangan (12 Tab)
                  </span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheet_id_keuangan}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  TAGIHAN_SPP, PEMBAYARAN_SPP, KUITANSI, PENGELUARAN_KAS, TRANSAKSI, AKUN_AKUNTANSI (COA), JURNAL UMUM.
                </p>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  ID: {sheetsConfig.spreadsheet_id_keuangan}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWebhookType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedWebhookType === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Ambil Semua (Akademik + Keuangan)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWebhookType('akademik')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedWebhookType === 'akademik'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Hanya Akademik
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWebhookType('keuangan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedWebhookType === 'keuangan'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Hanya Keuangan
                </button>
              </div>

              <button
                type="button"
                onClick={handleFetchFromWebhook}
                disabled={isFetchingData}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isFetchingData ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isFetchingData ? 'Mengunduh Data...' : 'Tarik Data dari Google Sheet Sekarang'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Source Option B: URL Google Sheet */}
        {sourceType === 'url' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Google Sheet Publik atau Spreadsheet ID
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/13ohWc_DhrKXXogQnK2JWwxQfGYwo0KVV5gu20cfAt68/edit"
                  value={customSheetUrl}
                  onChange={e => setCustomSheetUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Tab Worksheet (Sheet Name)
                </label>
                <input
                  type="text"
                  placeholder="SISWA"
                  value={customTabName}
                  onChange={e => setCustomTabName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 uppercase focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFetchFromUrl}
                disabled={isFetchingData}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isFetchingData ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Ambil Tab Spreadsheet Ini</span>
              </button>
            </div>
          </div>
        )}

        {/* Source Option C: Upload File */}
        {sourceType === 'file' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700 mb-1">
                Pilih atau seret file CSV / JSON dari Google Sheet
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Mendukung file ekspor CSV per-tab atau file JSON gabungan dari Google Apps Script
              </p>
              <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors inline-block">
                Pilih File dari Komputer
                <input
                  type="file"
                  accept=".csv, .json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {uploadedFileName && (
                <div className="mt-3 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>File dimuat: {uploadedFileName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fetched Status Badge */}
        {Object.keys(fetchedTables).length > 0 && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Data Siap: Ditemukan <strong>{Object.keys(fetchedTables).length} tabel</strong> dari Google Sheet (
                {Object.keys(fetchedTables).map(t => `${t} [${fetchedTables[t].length - 1} baris]`).join(', ')}).
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">Status: Terverifikasi</span>
          </div>
        )}
      </div>

      {/* Step 2: Pilih Tabel & Strategi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pilih Tabel & Tentukan Strategi Import</h2>
              <span className="text-xs text-slate-500">Centang tabel yang ingin dimasukkan ke database SIM Sekolah</span>
            </div>
          </div>

          {/* Strategy Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Strategi:</span>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImportStrategy('merge')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  importStrategy === 'merge' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Perbarui data yang cocok berdasarkan ID/NIS/NIP, tambahkan data baru tanpa menghapus data lokal yang ada"
              >
                Gabungkan (Merge & Upsert)
              </button>
              <button
                type="button"
                onClick={() => setImportStrategy('replace')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  importStrategy === 'replace' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Hapus data lokal pada tabel terpilih dan gantikan sepenuhnya dengan data dari Google Sheet"
              >
                Timpa Penuh (Replace)
              </button>
              <button
                type="button"
                onClick={() => setImportStrategy('append')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  importStrategy === 'append' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Hanya masukkan baris baru yang belum ada di database lokal"
              >
                Tambah Saja (Append)
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Selection Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Kategori:</span>
            {(['all', 'Akademik', 'Keuangan', 'Pengguna'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  categoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua Tabel' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectAllCategory('all')}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Pilih Semua (31 Tab)
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => selectAllCategory('Akademik')}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Hanya Akademik
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => selectAllCategory('Keuangan')}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Hanya Keuangan
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              Batal Pilih
            </button>
          </div>
        </div>

        {/* Table Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDefinitions.map(def => {
            const isSelected = selectedTableIds.includes(def.id);
            const fetchedData = fetchedTables[def.id];
            const rowCount = fetchedData ? fetchedData.length - 1 : null;

            return (
              <div
                key={def.id}
                onClick={() => toggleSelectTable(def.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs text-slate-900">{def.id}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{def.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{def.spreadsheet}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {def.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-500">
                    Primary Key: <strong className="text-slate-700">{def.primaryKey}</strong>
                  </span>

                  {rowCount !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">{rowCount} baris ditemukan</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTableId(def.id);
                        }}
                        className="text-slate-500 hover:text-slate-800 p-0.5 rounded cursor-pointer"
                        title="Tinjau baris data"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Belum ditarik</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Eksekusi Import */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Eksekusi Import ke Database SIM</h2>
              <span className="text-xs text-slate-500">
                {selectedTableIds.length} tabel terpilih dengan metode <strong>{importStrategy.toUpperCase()}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={isImporting || selectedTableIds.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>
              {isImporting
                ? 'Sedang Memproses Import...'
                : `Terapkan Import (${selectedTableIds.length} Tabel)`}
            </span>
          </button>
        </div>

        {/* Progress bar during import */}
        {isImporting && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>{importProgress.step}</span>
              <span>{importProgress.percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${importProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Results summary card */}
        {importResults && (
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Import Database Berhasil Selesai pada {importResults.timestamp}!</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">
                Total {importResults.items.length} Tabel Diperbarui
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {importResults.items.map(item => (
                <div key={item.tableName} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="font-bold text-slate-800">{item.tableName}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    +{item.added} baru · {item.updated} update
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    Total: {item.total} data
                  </div>
                </div>
              ))}
            </div>

            {/* Quick jump navigation buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Lihat Hasil di Menu:</span>
              {onNavigateSection && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('siswa')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Data Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('keuangan')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Keuangan & SPP
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('guru-staf')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Data Guru
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('users')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    USERS & Password
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Preview Modal */}
      {previewTableId && fetchedTables[previewTableId] && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Pratinjau Data Tabel: {previewTableId} ({fetchedTables[previewTableId].length - 1} Baris)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTableId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    {fetchedTables[previewTableId][0]?.map((col, idx) => (
                      <th key={idx} className="p-2 border border-slate-200 whitespace-nowrap">
                        {String(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fetchedTables[previewTableId].slice(1, 11).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 border-b border-slate-100">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 border border-slate-100 whitespace-nowrap font-mono text-[11px] text-slate-700">
                          {String(cell ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {fetchedTables[previewTableId].length > 11 && (
                <div className="text-center text-[11px] text-slate-400 italic py-3">
                  Menampilkan 10 baris pertama dari total {fetchedTables[previewTableId].length - 1} baris...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewTableId(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
