import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  Laptop
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { config, siswa, guru, kelas, prestasi, pengumuman } = useSchool();

  const publicPrestasi = prestasi.filter(p => p.tampilkan_di_web).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sistem Informasi Terpadu & Terakreditasi {config.akreditasi}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Selamat Datang di <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                {config.nama_sekolah}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {config.motto}. Institusi pendidikan modern yang memadukan keunggulan akademik sains, teknologi digital terapan, dan integritas akhlak mulia.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('/login')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <span>Masuk Portal SIM Sekolah</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/buku-tamu')}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buku Tamu Resepsionis</span>
              </button>

              <button
                onClick={() => onNavigate('/profil')}
                className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
              >
                Profil Sekolah
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-extrabold text-blue-400">{siswa.length * 36}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Siswa Aktif</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-extrabold text-emerald-400">{guru.length * 8}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Guru & Pendidik</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-extrabold text-amber-400">{kelas.length}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Rombongan Belajar</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-extrabold text-purple-400">98.4%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Lulusan di PTN/Kampus Top</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sambutan Kepala Sekolah */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 text-center lg:text-left">
              <div className="relative inline-block">
                <div className="w-56 h-64 sm:w-64 sm:h-72 rounded-2xl bg-gradient-to-tr from-blue-800 to-indigo-700 p-1 shadow-xl mx-auto">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
                    <GraduationCap className="w-16 h-16 text-blue-400 mb-3" />
                    <span className="font-bold text-base">{config.kepala_sekolah}</span>
                    <span className="text-xs text-blue-300 mt-1">Kepala Sekolah</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">NIP: {config.nip_kepsek}</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                Sambutan Pimpinan Sekolah
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Membentuk Generasi Tangguh, Saintifik, dan Berkarakter Islami
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                "Pendidikan bukan sekadar transfer wawasan tekstual, melainkan penyalaan lentera nalar kritis dan penanaman budi pekerti luhur. Di {config.nama_sekolah}, seluruh proses belajar mengajar didukung ekosistem digital transparan, kurikulum riset terapan, serta bimbingan holistik agar setiap anak siap menembus masa depan."
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kurikulum Merdeka Riset Terpadu</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Laboratorium Terakreditasi Internasional</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Monitoring Keuangan & Presensi Terpadu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Unggulan Section */}
      <section className="py-16 bg-slate-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Keunggulan Akademik</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Program Pendidikan Pilihan</h2>
            <p className="text-xs text-slate-500 mt-2">Didesain khusus untuk mengasah potensi optimal peserta didik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Kelas Sains & AI Literacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Fokus riset terapan bidang komputasi, sains data, mekanika, dan astronomi didukung laboratorium cerdas.
              </p>
              <button
                onClick={() => onNavigate('/program')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Pelajari Kurikulum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Kelas Bilingual & Global Debating</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Penguasaan Bahasa Inggris akademik berstandar TOEFL/IELTS dan persiapan kompetisi debat nasional NSDC.
              </p>
              <button
                onClick={() => onNavigate('/program')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Pelajari Kurikulum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Program Pembinaan OSN & Olimpiade</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pendampingan intensif oleh pakar olimpiade universitas untuk mencetak juara nasional dan internasional.
              </p>
              <button
                onClick={() => onNavigate('/program')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <span>Pelajari Kurikulum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prestasi Terverifikasi */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Kebanggaan Sekolah</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Prestasi Siswa Terbaru</h2>
              <p className="text-xs text-slate-500 mt-1">Capaian membanggakan tingkat nasional dan provinsi.</p>
            </div>
            <button
              onClick={() => onNavigate('/prestasi')}
              className="mt-4 sm:mt-0 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Lihat Semua Prestasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicPrestasi.map(p => (
              <div key={p.prestasi_id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Tingkat {p.tingkat}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{p.tanggal}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{p.nama_kompetisi}</h3>
                  <div className="text-xs font-bold text-blue-600 mb-2">{p.peringkat}</div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{p.deskripsi}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{p.siswa_nama}</span>
                  <span className="text-slate-500 text-[11px]">{p.kelas_nama}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warta & Pengumuman Sekolah */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Informasi Publik</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Warta & Agenda Kegiatan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pengumuman.slice(0, 3).map(item => (
              <div key={item.pengumuman_id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                      {item.kategori}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.tanggal_terbit}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{item.judul}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.konten}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Oleh: {item.dibuat_oleh}</span>
                  <button onClick={() => onNavigate('/berita')} className="text-blue-600 font-semibold hover:underline">
                    Baca Detail →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Receptionist Guest Book CTA Banner */}
      <section className="py-14 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Kunjungan Tamu Sekolah</span>
              <h2 className="text-2xl sm:text-3xl font-black">Buku Tamu Resepsionis Digital</h2>
              <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
                Bagi tamu instansi, dinas pendidikan, atau orang tua yang berkunjung ke {config.nama_sekolah}, silakan lakukan registrasi kedatangan melalui terminal buku tamu digital.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/buku-tamu')}
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Buka Formulir Buku Tamu</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
