import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Globe,
  CheckCircle2
} from 'lucide-react';

export const KontakPage: React.FC = () => {
  const { config, addToast } = useSchool();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [subjek, setSubjek] = useState('');
  const [pesan, setPesan] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    addToast('success', 'Pesan Terkirim', 'Pesan Anda telah berhasil disampaikan ke Sekretariat Sekolah.');
    setNama('');
    setEmail('');
    setSubjek('');
    setPesan('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Layanan Komunikasi & Sekretariat
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hubungi {config.nama_sekolah}
          </h1>
          <p className="text-sm text-slate-500">
            Kami siap melayani pertanyaan seputar PPDB, kemitraan riset universitas, serta konsultasi akademik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left info */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
            <div>
              <h3 className="text-xl font-bold">Sekretariat Utama</h3>
              <p className="text-xs text-slate-400 mt-1">
                Layanan tatap muka dan konsultasi administrasi sekolah.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Alamat Kampus:</span>
                  <span className="font-semibold text-slate-200">
                    {config.alamat}, {config.kelurahan}, {config.kecamatan}, {config.kota_kab}, {config.provinsi} {config.kodepos}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Telepon Kantor / Fax:</span>
                  <span className="font-semibold text-slate-200">{config.telepon}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">WhatsApp Layanan Siswa:</span>
                  <span className="font-semibold text-slate-200">{config.whatsapp}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Email Resmi:</span>
                  <span className="font-semibold text-slate-200">{config.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Jam Operasional Layanan:</span>
                  <span className="font-semibold text-slate-200">Senin - Jumat: 07.00 - 15.30 WIB</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              <p>Untuk kunjungan langsung instansi / tamu dinas, mohon mengisi Buku Tamu di meja resepsionis.</p>
            </div>
          </div>

          {/* Right message form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Kirim Pesan atau Pertanyaan</h3>
            <p className="text-xs text-slate-500 mb-6">Petugas humas akan merespons pesan Anda dalam 1x24 jam kerja.</p>

            {sent && (
              <div className="p-4 mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Terima kasih! Pesan Anda telah diterima oleh sekretariat sekolah.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email / Kontak</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@domain.com / No HP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subjek Pertanyaan</label>
                <select
                  value={subjek}
                  onChange={e => setSubjek(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Informasi Pendaftaran Siswa Baru (PPDB)">Informasi PPDB / Beasiswa</option>
                  <option value="Konfirmasi Pembayaran SPP">Konfirmasi Pembayaran SPP</option>
                  <option value="Kunjungan Lembaga / Studi Banding">Kunjungan Lembaga / Studi Banding</option>
                  <option value="Kemitraan Perguruan Tinggi & Riset">Kemitraan Perguruan Tinggi & Riset</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pesan</label>
                <textarea
                  required
                  rows={4}
                  value={pesan}
                  onChange={e => setPesan(e.target.value)}
                  placeholder="Tuliskan pertanyaan atau kebutuhan informasi Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesan Sekarang</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
