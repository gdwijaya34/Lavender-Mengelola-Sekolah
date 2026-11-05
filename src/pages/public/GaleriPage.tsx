import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Camera, Image as ImageIcon, MapPin, Sparkles } from 'lucide-react';

export const GaleriPage: React.FC = () => {
  const { config } = useSchool();
  const [filter, setFilter] = useState('Semua');

  const galleryItems = [
    { title: 'Laboratorium Sains & Riset Modern', category: 'Fasilitas', desc: 'Laboratorium fisika & kimia terpadu dengan perlengkapan analisis presisi tinggi.', tag: 'Lab Terpadu' },
    { title: 'Smart Classroom & AI Learning Hub', category: 'Akademik', desc: 'Ruang kelas interaktif dengan proyektor cerdas, workstation komputasi, dan internet fiber.', tag: 'Smart Class' },
    { title: 'Perpustakaan Digital & Ruang Baca', category: 'Fasilitas', desc: 'Koleksi 15.000+ literatur digital dan sudut baca nyaman berpendingin udara.', tag: 'E-Library' },
    { title: 'Kontingen Juara Olimpiade Sains Nasional', category: 'Prestasi', desc: 'Penganugerahan medali emas OSN Balikpapan oleh Kepala Balai Talenta Kemendikbud.', tag: 'OSN 2026' },
    { title: 'Upacara Peringatan Hari Sumpah Pemuda', category: 'Kesiswaan', desc: 'Pasukan Pengibar Bendera (Paskibra) dan orkestra siswa menampilkan busana adat nusantara.', tag: 'Nasionalisme' },
    { title: 'Gedung Olahraga & Lapangan Indoor', category: 'Fasilitas', desc: 'Arena olahraga serbaguna berstandar nasional untuk basket, futsal, dan bulutangkis.', tag: 'Sport Hall' },
    { title: 'Gelar Karya Proyek P5 Kurikulum Merdeka', category: 'Kesiswaan', desc: 'Pameran inovasi bioplastik dan produk ramah lingkungan karya siswa kelas X dan XI.', tag: 'Karya P5' },
    { title: 'Kompetisi Debat Bahasa Inggris Nasional', category: 'Prestasi', desc: 'Delegasi English Debate Club meraih Best Speaker dalam ajang NSDC 2026.', tag: 'Debat NSDC' }
  ];

  const categories = ['Semua', 'Fasilitas', 'Akademik', 'Prestasi', 'Kesiswaan'];

  const filtered = galleryItems.filter(item => filter === 'Semua' || item.category === filter);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Dokumentasi & Aktivitas
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Galeri Lingkungan & Prestasi Sekolah
          </h1>
          <p className="text-sm text-slate-500">
            Potret sarana modern, atmosfer pembelajaran aktif, serta momentum bersejarah siswa {config.nama_sekolah}.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === c
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="h-44 bg-gradient-to-tr from-slate-800 via-blue-900 to-indigo-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-center">
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                    {item.tag}
                  </span>
                </div>
                <ImageIcon className="w-10 h-10 text-blue-300/80 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-mono text-blue-200 tracking-wide uppercase">Dokumentasi Sekolah</span>
              </div>
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase">{item.category}</span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{item.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
