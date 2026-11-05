import React, { useState } from 'react';
import { PembayaranSPP } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { Printer, X, CheckCircle, ShieldCheck, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface PrintReceiptModalProps {
  payment: PembayaranSPP | null;
  onClose: () => void;
}

// Convert number to Indonesian words (terbilang rupiah)
function terbilangRupiah(n: number): string {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  let temp = '';
  if (n < 12) {
    temp = ' ' + bilangan[Math.floor(n)];
  } else if (n < 20) {
    temp = terbilangRupiah(n - 10) + ' Belas';
  } else if (n < 100) {
    temp = terbilangRupiah(Math.floor(n / 10)) + ' Puluh' + terbilangRupiah(n % 10);
  } else if (n < 200) {
    temp = ' Seratus' + terbilangRupiah(n - 100);
  } else if (n < 1000) {
    temp = terbilangRupiah(Math.floor(n / 100)) + ' Ratus' + terbilangRupiah(n % 100);
  } else if (n < 2000) {
    temp = ' Seribu' + terbilangRupiah(n - 1000);
  } else if (n < 1000000) {
    temp = terbilangRupiah(Math.floor(n / 1000)) + ' Ribu' + terbilangRupiah(n % 1000);
  } else if (n < 1000000000) {
    temp = terbilangRupiah(Math.floor(n / 1000000)) + ' Juta' + terbilangRupiah(n % 1000000);
  }
  return temp.trim();
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ payment, onClose }) => {
  const { config, addToast } = useSchool();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSyncToGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      await GoogleSheetsService.syncKeuanganTables(null);
      setIsSynced(true);
      addToast(
        'success',
        'Kuitansi Tersinkron via Webhook',
        `Kuitansi ${payment.nomor_kuitansi} (${payment.siswa_nama}) berhasil dikirim ke Tab PEMBAYARAN_SPP di Google Sheet!`
      );
    } catch (err: any) {
      addToast('error', 'Gagal Sinkronisasi Webhook', err.message || 'Gagal mengirim data ke Webhook Google Apps Script.');
    } finally {
      setIsSyncing(false);
    }
  };

  const terbilang = terbilangRupiah(payment.nominal_bayar) + ' Rupiah';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Toolbar (hidden during print) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Printer className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-slate-800">Pratinjau Kuitansi Pembayaran SPP</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                isSynced
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Kirim data kuitansi ke Google Sheet Keuangan"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>{isSynced ? 'Tersinkron di Google Sheet' : isSyncing ? 'Mengirim...' : 'Kirim ke Google Sheet'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 font-sans print-card">
          {/* Kop Surat Sekolah */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">
                {config.nama_sekolah}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {config.alamat}, {config.kota_kab} | Telp: {config.telepon}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                NPSN: {config.npsn} • Akreditasi: {config.akreditasi}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded">
                KUITANSI RESMI
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1.5">No: {payment.nomor_kuitansi}</p>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3 text-xs mb-6">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Telah Diterima Dari</span>
              <span className="col-span-2 font-bold text-slate-900 text-sm">{payment.siswa_nama}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Kelas / Rombel</span>
              <span className="col-span-2 font-semibold text-slate-800">{payment.kelas_nama}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Uang Sejumlah</span>
              <span className="col-span-2 font-bold text-blue-700 text-base">
                Rp {payment.nominal_bayar.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Terbilang</span>
              <span className="col-span-2 italic text-slate-700 bg-white p-2 rounded border border-slate-200">
                "{terbilang}"
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Untuk Pembayaran</span>
              <span className="col-span-2 font-semibold text-slate-800">
                Iuran SPP Sekolah Periode {payment.periode_bulan}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Metode & Ref</span>
              <span className="col-span-2 font-mono text-slate-600">
                {payment.metode_pembayaran} • Ref: {payment.nomor_referensi}
              </span>
            </div>
            {payment.catatan && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Catatan</span>
                <span className="col-span-2 text-slate-600">{payment.catatan}</span>
              </div>
            )}
          </div>

          {/* Footer Signatures & QR stamp */}
          <div className="grid grid-cols-2 gap-8 items-end pt-4 border-t border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Status: SAH & TERVERIFIKASI</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>ID Jurnal: {payment.jurnal_id || 'JRN-AUTO-LOCKED'}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Dokumen ini merupakan bukti pembayaran elektronik yang sah dan terenkripsi dalam sistem informasi sekolah.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-600">
                {config.kota_kab}, {payment.tanggal_pembayaran.split(' ')[0]}
              </p>
              <p className="text-xs text-slate-500">Petugas / Bendahara Keuangan</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-mono text-[10px] text-slate-400 tracking-widest border border-dashed border-slate-300 px-4 py-1.5 rounded">
                  [ TANDA TANGAN & STEMPEL ELEKTRONIK ]
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 underline">{payment.kasir_nama}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
