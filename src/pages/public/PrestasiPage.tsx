import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Award, Search, CheckCircle, Calendar, Sparkles, Trophy } from 'lucide-react';

export const PrestasiPage: React.FC = () => {
  const { prestasi, config } = useSchool();
  const [filterTingkat, setFilterTingkat] = useState<string>('semua');
  const [search, setSearch] = useState('');

  const publicList = prestasi.filter(p => p.tampilkan_di_web);

  const filtered = publicList.filter(p => {
    const matchTingkat = filterTingkat === 'semua' || p.tingkat.toLowerCase() === filterTingkat.toLowerCase();
    const matchSearch =
      p.nama_kompetisi.toLowerCase().includes(search.toLowerCase()) ||
      p.siswa_nama.toLowerCase().includes(search.toLowerCase()) ||
      p.bidang.toLowerCase().includes(search.toLowerCase());
    return matchTingkat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Jejak Prestasi Siswa
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Galeri Penghargaan & Prestasi
          </h1>
          <p className="text-sm text-slate-500">
            Bukti nyata dedikasi, kerja keras, dan kecemerlangan talenta peserta didik {config.nama_sekolah}.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {['semua', 'nasional', 'provinsi', 'kota/kab'].map(t => (
              <button
                key={t}
                onClick={() => setFilterTingkat(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filterTingkat === t
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'semua' ? 'Semua Tingkat' : t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kompetisi / nama siswa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Prestasi Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Tidak ada data prestasi yang cocok dengan pencarian.</p>
            </div>
          ) : (
            filtered.map(p => (
              <div
                key={p.prestasi_id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Tingkat {p.tingkat}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{p.tanggal}</span>
                  </div>

                  <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{p.peringkat}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">{p.nama_kompetisi}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mb-3">
                    Penyelenggara: {p.penyelenggara} • Bidang: {p.bidang}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{p.deskripsi}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.siswa_nama}</span>
                    <span className="text-[11px] text-slate-400">{p.kelas_nama}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Terverifikasi
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
