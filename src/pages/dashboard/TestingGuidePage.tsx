import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import {
  CheckCircle2,
  Circle,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  CreditCard
} from 'lucide-react';

export const TestingGuidePage: React.FC = () => {
  const { refreshAllData, addToast } = useSchool();
  const { switchRole } = useAuth();

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'tahap1-1': true,
    'tahap1-2': true,
    'tahap1-3': true,
    'tahap2-1': true,
    'tahap2-2': true,
    'tahap3-1': true,
    'tahap4-1': true,
    'tahap4-2': true,
    'tahap5-1': true,
    'tahap6-1': true
  });

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetData = () => {
    if (confirm('Kembalikan seluruh data ke setelan awal pabrik (demo data)?')) {
      StorageService.resetAllData();
      refreshAllData();
      addToast('info', 'Data Direset', 'Seluruh data sekolah telah dikembalikan ke kondisi awal demonstrasi.');
    }
  };

  const testPhases = [
    {
      phase: 'Tahap 1 — Fondasi & Arsitektur',
      items: [
        { id: 'tahap1-1', label: 'Landing page publik responsif (/profil, /program, /prestasi, /berita, /galeri, /kontak)' },
        { id: 'tahap1-2', label: 'Halaman login terpusat (/login) dengan verifikasi ketat kolom password di tabel USERS & proteksi RBAC' },
        { id: 'tahap1-3', label: 'Sidebar dinamis yang membatasi hak menu navigasi sesuai peran login pengguna' }
      ]
    },
    {
      phase: 'Tahap 2 — Database Google Sheets',
      items: [
        { id: 'tahap2-1', label: 'Pemeriksaan 19 worksheet Spreadsheet Akademik & 12 worksheet Spreadsheet Keuangan' },
        { id: 'tahap2-2', label: 'Simulasi handshake 2-Way Sync dengan deteksi latensi & Idempotency Key' },
        { id: 'tahap2-3', label: 'Fungsi unduh blueprint skema struktur CSV & JSON untuk import ke Google Drive' },
        { id: 'tahap2-4', label: 'Sinkronisasi otomatis (Auto-Sync) setiap 1 menit dengan live countdown ticker & background worker' }
      ]
    },
    {
      phase: 'Tahap 3 — Modul Akademik',
      items: [
        { id: 'tahap3-1', label: 'CRUD Buku Induk Siswa & Guru lengkap dengan NIS, NISN, dan rombel' },
        { id: 'tahap3-2', label: 'Jadwal pembelajaran mingguan dan pengaturan kurikulum mapel' },
        { id: 'tahap3-3', label: 'Input presensi harian (hadir, izin, sakit, alpa, keterlambatan)' },
        { id: 'tahap3-4', label: 'Sistem penilaian berbobot (Tugas 20%, Kuis 15%, Praktik 25%, Ujian 40%) & kunci nilai' }
      ]
    },
    {
      phase: 'Tahap 4 — Keuangan Otomatis & Jurnal',
      items: [
        { id: 'tahap4-1', label: 'Generator otomatis tagihan bulanan SPP per kelas (anti-duplikasi)' },
        { id: 'tahap4-2', label: 'Pencatatan kasir pembayaran SPP penuh maupun cicilan sebagian' },
        { id: 'tahap4-3', label: 'Otomatisasi Jurnal Umum Double-Entry yang selalu seimbang (Debit = Kredit)' },
        { id: 'tahap4-4', label: 'Penerbitan Kuitansi Resmi lengkap dengan kop surat, terbilang rupiah, & barcode' }
      ]
    },
    {
      phase: 'Tahap 5 — Buku Tamu & Portal Siswa/Ortu',
      items: [
        { id: 'tahap5-1', label: 'Buku Tamu Resepsionis (/buku-tamu) dengan verifikasi anti-spam & checkout time' },
        { id: 'tahap5-2', label: 'Portal Siswa: grafik nilai, riwayat presensi pribadi, & status tagihan SPP' },
        { id: 'tahap5-3', label: 'Portal Orang Tua: pemilih multi-anak binaan dan unduh kuitansi pelunasan' },
        { id: 'tahap5-4', label: 'CMS Identitas Sekolah: ubah nama, logo, visi, dan kontak langsung dari admin' }
      ]
    },
    {
      phase: 'Tahap 6 — Otorisasi & Keamanan Multi-Role',
      items: [
        { id: 'tahap6-1', label: 'Pengujian Super Admin (Akses seluruh modul & konfigurasi)' },
        { id: 'tahap6-2', label: 'Pengujian Admin Keuangan (Dibatasi dari nilai akademik & pengaturan sistem)' },
        { id: 'tahap6-3', label: 'Pengujian Admin Akademik (Dibatasi dari transaksi keuangan internal)' },
        { id: 'tahap6-4', label: 'Pengujian Staff Piket (Presensi & Buku Tamu harian)' },
        { id: 'tahap6-5', label: 'Pengujian Guru (Hanya kelas binaan & input nilai berbobot)' },
        { id: 'tahap6-6', label: 'Pengujian Siswa & Orang Tua (Hanya data anak yang terverifikasi)' }
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto text-slate-800">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-700">
            Panduan Verifikasi & Quality Assurance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Checklist Pengujian SIM Sekolah
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Gunakan panduan ini untuk menguji seluruh modul, alur transaksi akuntansi, dan hak akses 7 peran pengguna.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Data Demo</span>
        </button>
      </div>

      {/* Interactive Phase Checklists */}
      <div className="space-y-6">
        {testPhases.map((phase, pIdx) => (
          <div key={pIdx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                {pIdx + 1}
              </span>
              <span>{phase.phase}</span>
            </h3>

            <div className="space-y-2 pt-1">
              {phase.items.map(item => {
                const isChecked = checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs ${isChecked ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
