import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { School, BookOpen, LogIn, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { config } = useSchool();
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Program', path: '/program' },
    { name: 'Prestasi', path: '/prestasi' },
    { name: 'Berita', path: '/berita' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Kontak', path: '/kontak' },
    { name: 'Buku Tamu', path: '/buku-tamu', isHighlight: true }
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & School Identity */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => handleNav('/')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                  {config.nama_sekolah}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Akreditasi {config.akreditasi.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{config.motto}</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = currentPath === link.path;
              if (link.isHighlight) {
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    className={`ml-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    Buku Tamu Resepsionis
                  </button>
                );
              }
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Action Button: Login or Open Dashboard */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={() => handleNav(`/dashboard/${currentUser.role_id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:gap-2.5"
              >
                <span>Buka Dashboard ({currentUser.username})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all hover:gap-2.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk SIM Sekolah</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNav('/buku-tamu')}
              className="p-2 text-amber-700 bg-amber-50 rounded-lg border border-amber-200"
              title="Buku Tamu"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentPath === link.path
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <button
                onClick={() => handleNav(`/dashboard/${currentUser.role_id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm"
              >
                Buka Dashboard ({currentUser.username})
              </button>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm"
              >
                <LogIn className="w-4 h-4" />
                Masuk SIM Sekolah
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
