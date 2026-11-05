import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Bell, Calendar, Tag, User, Search, Pin } from 'lucide-react';

export const BeritaPage: React.FC = () => {
  const { pengumuman } = useSchool();
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [search, setSearch] = useState('');

  const kategoriList = ['Semua', 'Akademik', 'Keuangan', 'Kegiatan', 'Umum'];

  const filtered = pengumuman.filter(p => {
    const matchKat = selectedKategori === 'Semua' || p.kategori === selectedKategori;
    const matchSearch = p.judul.toLowerCase().includes(search.toLowerCase()) || p.konten.toLowerCase().includes(search.toLowerCase());
    return matchKat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Warta & Agenda
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Berita & Pengumuman Sekolah
          </h1>
          <p className="text-sm text-slate-500">
            Pusat informasi resmi kalender akademik, jadwal asesmen, dan kegiatan kesiswaan.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {kategoriList.map(kat => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedKategori === kat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filtered.map(p => (
            <div
              key={p.pengumuman_id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                p.is_pinned ? 'border-blue-300 bg-blue-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {p.kategori}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    Sasaran: {p.target_audiens}
                  </span>
                  {p.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <Pin className="w-3 h-3 text-amber-600" />
                      Disematkan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{p.tanggal_terbit}</span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">{p.judul}</h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{p.konten}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Diterbitkan oleh: <strong className="text-slate-600 font-medium">{p.dibuat_oleh}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
