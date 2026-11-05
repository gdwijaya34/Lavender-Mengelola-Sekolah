import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BookOpen,
  Award,
  Laptop,
  Globe,
  Compass,
  CheckCircle2,
  Atom,
  Languages,
  Code2,
  HeartHandshake
} from 'lucide-react';

export const ProgramPage: React.FC = () => {
  const { config } = useSchool();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Kurikulum & Pembinaan Karakter
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Program Pendidikan Terpadu
          </h1>
          <p className="text-sm text-slate-500">
            Kombinasi Kurikulum Merdeka Kemendikbudristek, penguatan riset berbasis proyek (P5), serta sertifikasi keahlian abad 21.
          </p>
        </div>

        {/* 4 Pilar Program Unggulan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Atom className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Program Riset Sains Terapan (STEM)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Membekali peserta didik dengan metode penelitian ilmiah, analisis statistik, praktikum instrumentasi, dan penulisan karya ilmiah remaja (KIR) untuk kompetisi nasional.
            </p>
            <div className="pt-2 text-xs text-blue-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dibina langsung dosen mitra ITB & UI</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Program Informatika & AI Literacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pembelajaran computational thinking, pemrograman web, sains data, dan dasar kecerdasan artifisial etis sebagai persiapan karir teknologi masa depan.
            </p>
            <div className="pt-2 text-xs text-indigo-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sertifikasi Python & Web Development</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Bilingual Cambridge & Debat Global</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pengembangan kecakapan komunikasi global berbahasa Inggris melalui simulasi sidang PBB (Model UN) dan kompetisi debat parlemen tingkat Asia.
            </p>
            <div className="pt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Persiapan Tes TOEFL ITP / IELTS</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tahfidz Al-Qur'an & Budi Pekerti</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Program bimbingan tahsin, hafalan Al-Qur'an bersanad, serta penanaman adab dan integritas moral dalam keseharian siswa di sekolah dan rumah.
            </p>
            <div className="pt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Target minimal 3 Juz mutqin & sanad tahsin</span>
            </div>
          </div>
        </div>

        {/* Ekstrakurikuler */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Ekstrakurikuler Pengembangan Bakat & Minat</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">Klub OSN Sains</span>
              <span className="text-slate-500">Fisika, Matematika, Kimia, Biologi, Astronomi</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">Robotika & IoT</span>
              <span className="text-slate-500">Line follower, drone racing, mikrokontroler</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">English Debate Club</span>
              <span className="text-slate-500">Debat parlemen Asia & British Parliamentary</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">PMR & KSR Wira</span>
              <span className="text-slate-500">Pertolongan pertama, evakuasi bencana, donor darah</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">Paskibra Sekolah</span>
              <span className="text-slate-500">Pendidikan kepemimpinan & baris-berbaris</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">Basket & Futsal</span>
              <span className="text-slate-500">Kompetisi liga antar-SMA se-Jabodetabek</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">Seni Tari & Musik</span>
              <span className="text-slate-500">Gamelan, ansambel, orkestra, dan tari kreasi</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-sm mb-0.5">Jurnalistik & Media</span>
              <span className="text-slate-500">Podcast sekolah, fotografi, dan buletin digital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
