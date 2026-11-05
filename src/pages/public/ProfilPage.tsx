import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Target,
  Compass,
  Building2,
  BookOpen
} from 'lucide-react';

export const ProfilPage: React.FC = () => {
  const { config, guru, siswa, kelas } = useSchool();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Identitas & Integritas Institusi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Profil {config.nama_sekolah}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Membangun peradaban generasi unggul berlandaskan kurikulum sains terpadu, literasi digital, dan nilai budi pekerti luhur.
          </p>
        </div>

        {/* Accreditation Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Status Akreditasi Badan Akreditasi Nasional (BAN-S/M)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Akreditasi {config.akreditasi}</h2>
            <p className="text-xs text-blue-200 font-mono">NPSN: {config.npsn} • SK Akreditasi No. 1294/BAN-SM/SK/2024</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/10">
              <span className="block text-2xl font-black text-amber-400">98.5</span>
              <span className="text-[10px] text-blue-200 uppercase font-semibold">Skor Penilaian</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/10">
              <span className="block text-2xl font-black text-emerald-400">UNGGUL</span>
              <span className="text-[10px] text-blue-200 uppercase font-semibold">Predikat</span>
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visi Institusi</h3>
            <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
              "{config.visi}"
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Misi Institusi</h3>
            <ul className="space-y-3">
              {config.misi.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pimpinan & Tata Kelola */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Pimpinan & Manajemen Sekolah</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                SN
              </div>
              <h4 className="font-bold text-sm text-slate-900">{config.kepala_sekolah}</h4>
              <p className="text-xs text-blue-600 font-medium">Kepala Sekolah</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">NIP: {config.nip_kepsek}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                RH
              </div>
              <h4 className="font-bold text-sm text-slate-900">Rahmat Hidayat, M.Pd</h4>
              <p className="text-xs text-indigo-600 font-medium">Wakasek Kurikulum & Akademik</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Koordinator SIM Akademik</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                DL
              </div>
              <h4 className="font-bold text-sm text-slate-900">Dewi Lestari, S.E., Ak.</h4>
              <p className="text-xs text-emerald-600 font-medium">Kepala Bagian Keuangan</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Otoritas SPP & Akuntansi</p>
            </div>
          </div>
        </div>

        {/* Fasilitas Sekolah */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>Fasilitas & Sarana Prasarana Standar Internasional</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm mb-1">Lab Sains Terpadu</span>
              <span className="text-slate-500">Peralatan analisis spektrofotometri, mikroskop elektron, & reagen riset.</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm mb-1">Lab AI & Robotika</span>
              <span className="text-slate-500">Workstation komputasi tinggi, printer 3D, sensor IoT, & robotik kit.</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm mb-1">Perpustakaan Digital</span>
              <span className="text-slate-500">Akses 15.000+ e-book, jurnal sains terindeks, dan ruang diskusi privat.</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm mb-1">Gedung Olahraga & Seni</span>
              <span className="text-slate-500">Lapangan indoor serbaguna, arena panahan, studio musik dan teater.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
