import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PengaturanSekolah } from '../../types';
import {
  Building,
  Save,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';

export const BrandingSettingsPage: React.FC = () => {
  const { config, updateConfig } = useSchool();
  const [formData, setFormData] = useState<PengaturanSekolah>({ ...config });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto text-slate-800">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-900/80 px-2.5 py-1 rounded-md border border-blue-800">
            School Identity & CMS Landing Page
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Pengaturan Identitas & Branding Sekolah
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Ubah nama sekolah, logo, visi, misi, kepala sekolah, kontak, dan bobot penilaian tanpa mengedit source code.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Utama */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-sm">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Identitas Pokok Sekolah</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                required
                value={formData.nama_sekolah}
                onChange={e => setFormData({ ...formData, nama_sekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Pokok Sekolah Nasional (NPSN)</label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={e => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status & Nilai Akreditasi</label>
              <input
                type="text"
                value={formData.akreditasi}
                onChange={e => setFormData({ ...formData, akreditasi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motto / Semboyan Sekolah</label>
              <input
                type="text"
                value={formData.motto}
                onChange={e => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={formData.kepala_sekolah}
                onChange={e => setFormData({ ...formData, kepala_sekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.nip_kepsek}
                onChange={e => setFormData({ ...formData, nip_kepsek: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Visi & Misi Sekolah</h3>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Visi</label>
            <textarea
              rows={2}
              value={formData.visi}
              onChange={e => setFormData({ ...formData, visi: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* Kontak & Lokasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Sekretariat & Kontak</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Kampus</label>
              <input
                type="text"
                value={formData.alamat}
                onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={formData.kota_kab}
                onChange={e => setFormData({ ...formData, kota_kab: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telepon</label>
              <input
                type="text"
                value={formData.telepon}
                onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Layanan</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Konfigurasi Akademik & Bobot */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Tahun Ajaran & Bobot Penilaian Rapor</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">T.A. Aktif</label>
              <input
                type="text"
                value={formData.tahun_ajaran_aktif}
                onChange={e => setFormData({ ...formData, tahun_ajaran_aktif: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Aktif</label>
              <select
                value={formData.semester_aktif}
                onChange={e => setFormData({ ...formData, semester_aktif: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bobot Tugas (%)</label>
              <input
                type="number"
                value={formData.bobot_tugas}
                onChange={e => setFormData({ ...formData, bobot_tugas: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bobot Ujian (%)</label>
              <input
                type="number"
                value={formData.bobot_ujian}
                onChange={e => setFormData({ ...formData, bobot_ujian: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Identitas Sekolah</span>
          </button>
        </div>
      </form>
    </div>
  );
};
