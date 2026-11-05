import React, { useState } from 'react';
import { useAuth, ROLE_DEFINITIONS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UserCheck, ChevronDown, Sparkles } from 'lucide-react';

interface QuickRoleSwitcherProps {
  onNavigate?: (path: string) => void;
}

export const QuickRoleSwitcher: React.FC<QuickRoleSwitcherProps> = ({ onNavigate }) => {
  const { currentRole, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: UserRole[] = [
    'admin_sekolah',
    'admin_keuangan',
    'admin_akademik',
    'staff_piket',
    'guru',
    'siswa',
    'orang_tua'
  ];

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(`/dashboard/${role}`);
    }
  };

  return (
    <div className="relative inline-block text-left no-print">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-700 transition-all"
        title="Ganti Peran Pengguna untuk Pengujian SIM"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Uji Role:</span>
        <span className="text-amber-300 font-bold">
          {currentRole ? ROLE_DEFINITIONS[currentRole].badge : 'Pilih Role'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Quick Role Switcher (Pengujian)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Beralih akun untuk menguji otorisasi & antarmuka 7 role sekolah.
              </p>
            </div>

            <div className="space-y-1">
              {roles.map(r => {
                const info = ROLE_DEFINITIONS[r];
                const isActive = currentRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{info.name}</div>
                      <div className="text-[10px] text-slate-500">{info.description}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ml-2 shrink-0 ${info.color}`}>
                      {info.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
