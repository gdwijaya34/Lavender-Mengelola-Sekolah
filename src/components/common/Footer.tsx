import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { School, MapPin, Phone, Mail, Globe, Award, Shield, CheckCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { config } = useSchool();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-snug">{config.nama_sekolah}</h3>
                <p className="text-xs text-blue-400 font-mono">NPSN: {config.npsn}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{config.visi}</p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" />
                Terakreditasi {config.akreditasi}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
                  Beranda Sekolah
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/profil')} className="hover:text-white transition-colors">
                  Profil & Visi Misi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/program')} className="hover:text-white transition-colors">
                  Program & Kurikulum Merdeka
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/prestasi')} className="hover:text-white transition-colors">
                  Prestasi & Capaian Siswa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/berita')} className="hover:text-white transition-colors">
                  Warta & Agenda Kegiatan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/buku-tamu')} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Buku Tamu Resepsionis
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal SIM Multi-Role */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Akses Sistem SIM</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  Admin Sekolah & Manajemen
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Bagian Keuangan & SPP
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">
                  Portal Guru & Penilaian
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">
                  Portal Siswa & Prestasi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">
                  Portal Wali Murid / Orang Tua
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">
                  Staff Piket & Presensi Harian
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Address */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Sekretariat</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {config.alamat}, {config.kelurahan}, {config.kecamatan}, {config.kota_kab}, {config.provinsi} {config.kodepos}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{config.telepon} / WA: {config.whatsapp}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{config.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{config.website}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {config.nama_sekolah}. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Terintegrasi Google Sheets Database Engine v2.4</span>
            <button onClick={() => onNavigate('/login')} className="text-blue-400 hover:text-blue-300">
              Login Petugas
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
