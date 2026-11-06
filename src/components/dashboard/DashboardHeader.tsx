import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { QuickRoleSwitcher } from './QuickRoleSwitcher';
import {
  FileSpreadsheet,
  RefreshCw,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';

interface DashboardHeaderProps {
  sectionTitle: string;
  onNavigateSection?: (section: string) => void;
  onNavigatePath?: (path: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  sectionTitle,
  onNavigateSection,
  onNavigatePath
}) => {
  const { currentRole, roleInfo } = useAuth();
  const {
    config,
    sheetsConfig,
    isAutoSyncRunning,
    autoSyncCountdown,
    executeAutoSync,
    pengumuman
  } = useSchool();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleManualSync = async () => {
    await executeAutoSync(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 leading-tight">{sectionTitle}</h2>
            {roleInfo && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                {roleInfo.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{config.nama_sekolah}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <Calendar className="w-3 h-3 text-slate-400" />
              T.A. {config.tahun_ajaran_aktif} ({config.semester_aktif})
            </span>
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for seamless demonstration & evaluation */}
        <QuickRoleSwitcher onNavigate={onNavigatePath} />

        {/* Direct Import Google Sheet Button */}
        <button
          onClick={() => {
            if (onNavigateSection) {
              onNavigateSection('import-sheets');
            } else {
              window.dispatchEvent(new CustomEvent('navigate-section', { detail: 'import-sheets' }));
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 shadow-xs transition-all cursor-pointer"
          title="Buka menu Import Database dari Google Sheet"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span className="font-semibold">Import Sheet</span>
        </button>

        {/* Live 1-Minute Auto-Sync Status & Action Button (Visible across all roles) */}
        <button
          onClick={handleManualSync}
          disabled={isAutoSyncRunning}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isAutoSyncRunning
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-xs'
          }`}
          title="Metode 2: Webhook Google Apps Script (Siklus otomatis tiap 1 menit)"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncRunning ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
          <span className="hidden sm:inline font-mono">
            {isAutoSyncRunning
              ? 'Sinkronisasi...'
              : sheetsConfig.auto_sync_enabled
              ? `Webhook 1m (${autoSyncCountdown}s)`
              : 'Sync Webhook'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              sheetsConfig.auto_sync_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
            }`}
          />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative"
            title="Warta & Notifikasi Sekolah"
          >
            <Bell className="w-4 h-4" />
            {pengumuman.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900">Pengumuman & Warta</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    {pengumuman.length} Baru
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pengumuman.slice(0, 4).map(p => (
                    <div key={p.pengumuman_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                        <span className="truncate">{p.judul}</span>
                        <span className="text-[9px] text-slate-400 shrink-0 ml-1">{p.tanggal_terbit}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{p.konten}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
