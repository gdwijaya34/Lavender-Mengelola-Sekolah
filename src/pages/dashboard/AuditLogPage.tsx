import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Filter
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, addToast } = useSchool();
  const [search, setSearch] = useState('');
  const [filterModul, setFilterModul] = useState('Semua');

  const modulList = ['Semua', 'Akademik', 'Keuangan', 'Presensi', 'Nilai', 'Buku Tamu', 'Sistem', 'Sheets'];

  const filteredLogs = auditLogs.filter(log => {
    const matchModul = filterModul === 'Semua' || log.modul === filterModul;
    const matchSearch =
      log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.aksi.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase());
    return matchModul && matchSearch;
  });

  const handleExportLogs = () => {
    const header = 'Timestamp,Log_ID,User_ID,Username,Role,Aksi,Modul,Status,Detail\n';
    const rows = auditLogs
      .map(
        l =>
          `"${l.timestamp}",${l.log_id},${l.user_id},"${l.username}","${l.role}","${l.aksi}","${l.modul}","${l.status}","${l.detail.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Log_SIM_Sekolah_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Ekspor Berhasil', 'Log audit keamanan telah diunduh sebagai file CSV.');
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider bg-slate-700/80 px-2.5 py-1 rounded-md border border-slate-600">
            Jejak Audit & Kepatuhan Keamanan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Audit Log Aktivitas Sistem
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Merekam seluruh mutasi data, login, input pembayaran, presensi, dan sinkronisasi Google Sheets.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs border border-slate-600 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Ekspor Log (CSV)</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {modulList.map(m => (
              <button
                key={m}
                onClick={() => setFilterModul(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterModul === m
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari user, aksi, kata kunci..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Waktu (WIB)</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Aksi Sistem</th>
                <th className="py-2.5 px-3">Modul</th>
                <th className="py-2.5 px-3">Detail Aktivitas</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.log_id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-800 block text-xs">{log.username}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.role}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {log.aksi}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {log.modul}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-md">{log.detail}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      SUKSES
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
