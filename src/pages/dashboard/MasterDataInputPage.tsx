import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ROLE_DEFINITIONS } from '../../context/AuthContext';
import { User, Siswa, Guru, Staff, OrangTua, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { SheetsImportService } from '../../services/sheetsImportService';
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  HeartHandshake,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Upload,
  FileUp,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  X,
  ExternalLink,
  Lock,
  Sparkles,
  Check,
  ArrowRight,
  DownloadCloud
} from 'lucide-react';

export type MasterDataTab = 'users' | 'siswa' | 'orang_tua' | 'guru' | 'staff';

interface MasterDataInputPageProps {
  initialTab?: MasterDataTab;
}

export const MasterDataInputPage: React.FC<MasterDataInputPageProps> = ({ initialTab = 'users' }) => {
  const {
    users,
    siswa,
    guru,
    staff,
    orangTua,
    relasiOrtuSiswa,
    kelas,
    mapel,
    config,
    sheetsConfig,
    refreshAllData,
    saveUser,
    deleteUser,
    saveSiswa,
    deleteSiswa,
    saveGuru,
    deleteGuru,
    saveStaff,
    deleteStaff,
    saveOrangTua,
    deleteOrangTua,
    hubungkanOrtuSiswa,
    syncAkademikTable,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState<MasterDataTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingTable, setIsSyncingTable] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [kepegawaianFilter, setKepegawaianFilter] = useState<string>('all');
  const [hubunganFilter, setHubunganFilter] = useState<string>('all');
  const [divisiFilter, setDivisiFilter] = useState<string>('all');

  // Password visibility for Users tab
  const [showPasswords, setShowPasswords] = useState(false);

  // --- CSV IMPORT / EXPORT STATES ---
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvModalTab, setCsvModalTab] = useState<MasterDataTab>('siswa');
  const [csvInputMode, setCsvInputMode] = useState<'upload' | 'paste'>('upload');
  const [csvRawText, setCsvRawText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [csvParsedRows, setCsvParsedRows] = useState<string[][]>([]);
  const [csvImportMode, setCsvImportMode] = useState<'merge' | 'append' | 'replace'>('merge');
  const [csvAutoCreateUsers, setCsvAutoCreateUsers] = useState(true);
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  // --- MODAL STATES FOR SINGLE INPUT ---
  // 1. User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formUser, setFormUser] = useState<{
    user_id: string;
    username: string;
    email: string;
    password: string;
    nama_lengkap: string;
    role_id: UserRole;
    reference_id: string;
    status: 'aktif' | 'nonaktif';
  }>({
    user_id: '',
    username: '',
    email: '',
    password: '',
    nama_lengkap: '',
    role_id: 'guru',
    reference_id: '',
    status: 'aktif'
  });

  // 2. Siswa Modal
  const [showSiswaModal, setShowSiswaModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [formSiswa, setFormSiswa] = useState<Partial<Siswa>>({});
  const [autoCreateSiswaUser, setAutoCreateSiswaUser] = useState(true);

  // 3. Ortu Modal
  const [showOrtuModal, setShowOrtuModal] = useState(false);
  const [editingOrtu, setEditingOrtu] = useState<OrangTua | null>(null);
  const [formOrtu, setFormOrtu] = useState<Partial<OrangTua>>({});
  const [selectedAnakSiswaId, setSelectedAnakSiswaId] = useState<string>('');
  const [autoCreateOrtuUser, setAutoCreateOrtuUser] = useState(true);

  // 4. Guru Modal
  const [showGuruModal, setShowGuruModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [formGuru, setFormGuru] = useState<Partial<Guru>>({});
  const [autoCreateGuruUser, setAutoCreateGuruUser] = useState(true);

  // 5. Staff Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formStaff, setFormStaff] = useState<Partial<Staff>>({});
  const [autoCreateStaffUser, setAutoCreateStaffUser] = useState(true);

  // --- CSV TEMPLATE METADATA ---
  const CSV_TEMPLATES: Record<MasterDataTab, { fileName: string; label: string; tableName: string; headers: string[]; sampleRows: string[][] }> = {
    users: {
      fileName: 'Template_USERS.csv',
      label: 'Data Users (Akun Login)',
      tableName: 'USERS',
      headers: ['user_id', 'username', 'email', 'password', 'nama_lengkap', 'role_id', 'reference_id', 'status', 'created_at'],
      sampleRows: [
        ['USR-010', 'dewi_guru', 'dewi@sekolah.sch.id', 'guru123', 'Dewi Sartika S.Pd', 'guru', 'GUR-010', 'aktif', '2026-11-06'],
        ['USR-011', 'hendra_ortu', 'hendra@wali.sekolah.sch.id', 'ortu123', 'Hendra Gunawan', 'orang_tua', 'ORT-010', 'aktif', '2026-11-06']
      ]
    },
    siswa: {
      fileName: 'Template_SISWA.csv',
      label: 'Data Siswa (Buku Induk)',
      tableName: 'SISWA',
      headers: ['siswa_id', 'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kelas_id', 'tahun_ajaran', 'status', 'nama_ortu', 'kontak_ortu', 'alamat'],
      sampleRows: [
        ['SIS-010', '20261010', '0081234567', 'Muhammad Farhan', 'L', 'Jakarta', '2009-05-12', 'KLS-10-A', '2026/2027', 'aktif', 'Bambang Irawan', '08129876543', 'Jl. Melati No. 12'],
        ['SIS-011', '20261011', '0081234568', 'Siti Aisyah', 'P', 'Bandung', '2009-08-20', 'KLS-10-B', '2026/2027', 'aktif', 'Hendra Wijaya', '08129876544', 'Jl. Kenanga No. 4']
      ]
    },
    orang_tua: {
      fileName: 'Template_ORANG_TUA.csv',
      label: 'Data Orang Tua / Wali',
      tableName: 'ORANG_TUA',
      headers: ['ortu_id', 'nama_lengkap', 'hubungan', 'pekerjaan', 'kontak', 'email', 'alamat'],
      sampleRows: [
        ['ORT-010', 'Bambang Irawan', 'Ayah', 'Wiraswasta', '08129876543', 'bambang@gmail.com', 'Jl. Melati No. 12'],
        ['ORT-011', 'Ratna Dewi', 'Ibu', 'PNS', '08129876544', 'ratna@gmail.com', 'Jl. Kenanga No. 4']
      ]
    },
    guru: {
      fileName: 'Template_GURU.csv',
      label: 'Data Guru (Tenaga Pendidik)',
      tableName: 'GURU',
      headers: ['guru_id', 'nip', 'nama_lengkap', 'jenis_kelamin', 'mapel_utama', 'email', 'kontak', 'status_kepegawaian'],
      sampleRows: [
        ['GUR-010', '198501012010011005', 'Dra. Sri Wahyuni M.Pd', 'P', 'Matematika Wajib', 'sri.wahyuni@sekolah.sch.id', '08123456780', 'PNS'],
        ['GUR-011', '198802022015022006', 'Ahmad Fauzi S.Kom', 'L', 'Informatika', 'fauzi@sekolah.sch.id', '08123456781', 'GTT']
      ]
    },
    staff: {
      fileName: 'Template_STAFF.csv',
      label: 'Data Staff (Tenaga Kependidikan)',
      tableName: 'STAFF',
      headers: ['staff_id', 'nama_lengkap', 'jabatan', 'divisi', 'kontak', 'status'],
      sampleRows: [
        ['STF-010', 'Rahmat Hidayat', 'Kepala Tata Usaha', 'Tata Usaha', '08127766554', 'aktif'],
        ['STF-011', 'Siti Aminah', 'Staff Keuangan & Kasir', 'Keuangan', '08127766555', 'aktif']
      ]
    }
  };

  // --- CSV DOWNLOAD TEMPLATE ---
  const handleDownloadCsvTemplate = (tab: MasterDataTab) => {
    const tpl = CSV_TEMPLATES[tab];
    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const content = [
      tpl.headers.join(','),
      ...tpl.sampleRows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tpl.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('info', 'Template CSV Diunduh', `Format template ${tpl.fileName} berhasil diunduh.`);
  };

  // --- CSV EXPORT CURRENT DATA ---
  const handleExportCsv = (tab: MasterDataTab) => {
    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let headers: string[] = [];
    let rows: any[][] = [];
    const fileName = `DATABASE_${tab.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`;

    if (tab === 'users') {
      headers = ['user_id', 'username', 'email', 'password', 'nama_lengkap', 'role_id', 'reference_id', 'status', 'created_at'];
      rows = users.map(u => [u.user_id, u.username, u.email, u.password || 'password123', u.nama_lengkap, u.role_id, u.reference_id, u.status, u.created_at]);
    } else if (tab === 'siswa') {
      headers = ['siswa_id', 'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kelas_id', 'tahun_ajaran', 'status', 'nama_ortu', 'kontak_ortu', 'alamat'];
      rows = siswa.map(s => [s.siswa_id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin, s.tempat_lahir, s.tanggal_lahir, s.kelas_id, s.tahun_ajaran, s.status, s.nama_ortu, s.kontak_ortu, s.alamat]);
    } else if (tab === 'orang_tua') {
      headers = ['ortu_id', 'nama_lengkap', 'hubungan', 'pekerjaan', 'kontak', 'email', 'alamat'];
      rows = orangTua.map(o => [o.ortu_id, o.nama_lengkap, o.hubungan, o.pekerjaan, o.kontak, o.email, o.alamat]);
    } else if (tab === 'guru') {
      headers = ['guru_id', 'nip', 'nama_lengkap', 'jenis_kelamin', 'mapel_utama', 'email', 'kontak', 'status_kepegawaian'];
      rows = guru.map(g => [g.guru_id, g.nip, g.nama_lengkap, g.jenis_kelamin, g.mapel_utama, g.email, g.kontak, g.status_kepegawaian]);
    } else if (tab === 'staff') {
      headers = ['staff_id', 'nama_lengkap', 'jabatan', 'divisi', 'kontak', 'status'];
      rows = staff.map(st => [st.staff_id, st.nama_lengkap, st.jabatan, st.divisi, st.kontak, st.status]);
    }

    const content = [
      headers.join(','),
      ...rows.map(r => r.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Ekspor CSV Berhasil', `${rows.length} data ${tab} diekspor ke ${fileName}.`);
  };

  // --- OPEN CSV IMPORT MODAL ---
  const handleOpenCsvModal = (tab: MasterDataTab) => {
    setCsvModalTab(tab);
    setCsvInputMode('upload');
    setCsvRawText('');
    setCsvFileName('');
    setCsvParsedRows([]);
    setCsvImportMode('merge');
    setCsvAutoCreateUsers(tab !== 'users');
    setShowCsvModal(true);
  };

  // --- PARSE CSV TEXT ---
  const handleParseCsvString = (text: string) => {
    setCsvRawText(text);
    if (!text.trim()) {
      setCsvParsedRows([]);
      return;
    }
    try {
      const parsed = SheetsImportService.parseCsv(text);
      setCsvParsedRows(parsed);
    } catch (err: any) {
      addToast('error', 'Format CSV Tidak Valid', err?.message || 'Gagal memproses baris CSV.');
    }
  };

  const handleCsvFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const text = String(evt.target?.result || '');
      handleParseCsvString(text);
    };
    reader.onerror = () => {
      addToast('error', 'Gagal Membaca File', 'Tidak dapat membaca file CSV.');
    };
    reader.readAsText(file);
  };

  // --- EXECUTE IMPORT CSV ---
  const handleExecuteImportCsv = async () => {
    if (csvParsedRows.length < 2) {
      addToast('error', 'Data Kosong', 'File CSV harus memiliki baris header dan minimal 1 baris data.');
      return;
    }

    setIsImportingCsv(true);
    try {
      const targetTableMap: Record<MasterDataTab, 'USERS' | 'SISWA' | 'ORANG_TUA' | 'GURU' | 'STAFF'> = {
        users: 'USERS',
        siswa: 'SISWA',
        orang_tua: 'ORANG_TUA',
        guru: 'GURU',
        staff: 'STAFF'
      };
      const tableName = targetTableMap[csvModalTab];
      const typedRecords = SheetsImportService.convertRawToTyped(tableName, csvParsedRows);

      if (!typedRecords || typedRecords.length === 0) {
        throw new Error('Gagal mengonversi baris CSV. Pastikan nama header sesuai template.');
      }

      // Apply to storage with chosen mode
      const result = SheetsImportService.applyImport(tableName, typedRecords, csvImportMode);

      // Auto-create User login accounts if option checked
      if (csvAutoCreateUsers && csvModalTab !== 'users') {
        const currentUsers = StorageService.getUsers();
        let userCreatedCount = 0;

        if (csvModalTab === 'siswa') {
          (typedRecords as Siswa[]).forEach(s => {
            const cleanUser = s.nis || `siswa_${s.siswa_id.toLowerCase()}`;
            if (!currentUsers.some(u => u.username === cleanUser || u.reference_id === s.siswa_id)) {
              currentUsers.push({
                user_id: `USR-${cleanUser}`,
                username: cleanUser,
                email: `${cleanUser}@siswa.sekolah.sch.id`,
                password: 'siswa123',
                nama_lengkap: s.nama_lengkap,
                role_id: 'siswa',
                reference_id: s.siswa_id,
                status: 'aktif',
                created_at: new Date().toISOString()
              });
              userCreatedCount++;
            }
          });
        } else if (csvModalTab === 'guru') {
          (typedRecords as Guru[]).forEach(g => {
            const cleanUser = `guru_${g.nip.slice(-4) || g.guru_id.toLowerCase()}`;
            if (!currentUsers.some(u => u.username === cleanUser || u.reference_id === g.guru_id)) {
              currentUsers.push({
                user_id: `USR-${g.guru_id}`,
                username: cleanUser,
                email: g.email || `${cleanUser}@sekolah.sch.id`,
                password: 'guru123',
                nama_lengkap: g.nama_lengkap,
                role_id: 'guru',
                reference_id: g.guru_id,
                status: 'aktif',
                created_at: new Date().toISOString()
              });
              userCreatedCount++;
            }
          });
        } else if (csvModalTab === 'orang_tua') {
          (typedRecords as OrangTua[]).forEach(o => {
            const cleanUser = `ortu_${o.kontak.slice(-4) || o.ortu_id.toLowerCase()}`;
            if (!currentUsers.some(u => u.username === cleanUser || u.reference_id === o.ortu_id)) {
              currentUsers.push({
                user_id: `USR-${o.ortu_id}`,
                username: cleanUser,
                email: o.email || `${cleanUser}@wali.sekolah.sch.id`,
                password: 'ortu123',
                nama_lengkap: o.nama_lengkap,
                role_id: 'orang_tua',
                reference_id: o.ortu_id,
                status: 'aktif',
                created_at: new Date().toISOString()
              });
              userCreatedCount++;
            }
          });
        } else if (csvModalTab === 'staff') {
          (typedRecords as Staff[]).forEach(st => {
            const cleanUser = `staff_${st.staff_id.toLowerCase()}`;
            if (!currentUsers.some(u => u.username === cleanUser || u.reference_id === st.staff_id)) {
              currentUsers.push({
                user_id: `USR-${st.staff_id}`,
                username: cleanUser,
                email: `${cleanUser}@sekolah.sch.id`,
                password: 'staff123',
                nama_lengkap: st.nama_lengkap,
                role_id: 'staff_piket',
                reference_id: st.staff_id,
                status: 'aktif',
                created_at: new Date().toISOString()
              });
              userCreatedCount++;
            }
          });
        }

        if (userCreatedCount > 0) {
          StorageService.setAllUsers(currentUsers);
        }
      }

      // Refresh application context
      refreshAllData();

      // Trigger real-time background sync to Google Sheets
      syncAkademikTable(tableName).catch(console.warn);
      if (csvAutoCreateUsers && csvModalTab !== 'users') {
        syncAkademikTable('USERS').catch(console.warn);
      }

      addToast(
        'success',
        `Import CSV ${tableName} Sukses!`,
        `Berhasil memproses: ${result.added} data baru, ${result.updated} data diperbarui. Otomatis disinkronkan ke Google Sheets.`
      );
      setShowCsvModal(false);
    } catch (err: any) {
      addToast('error', 'Gagal Import CSV', err?.message || 'Terjadi kesalahan saat memproses data CSV.');
    } finally {
      setIsImportingCsv(false);
    }
  };

  // --- HANDLERS: USER ---
  const handleOpenAddUser = () => {
    setEditingUser(null);
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    setFormUser({
      user_id: newId,
      username: '',
      email: '',
      password: 'password123',
      nama_lengkap: '',
      role_id: 'guru',
      reference_id: '',
      status: 'aktif'
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setFormUser({
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      password: u.password || 'password123',
      nama_lengkap: u.nama_lengkap,
      role_id: u.role_id,
      reference_id: u.reference_id,
      status: u.status
    });
    setShowUserModal(true);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUser.username.trim() || !formUser.email.trim() || !formUser.password.trim()) {
      addToast('error', 'Form Belum Lengkap', 'Username, email, dan kata sandi wajib diisi.');
      return;
    }

    const payload: User = {
      ...formUser,
      username: formUser.username.trim().toLowerCase(),
      email: formUser.email.trim().toLowerCase(),
      password: formUser.password.trim(),
      created_at: editingUser?.created_at || new Date().toISOString(),
      last_login: editingUser?.last_login
    };

    saveUser(payload);
    setShowUserModal(false);

    StorageService.addAuditLog({
      user_id: payload.user_id,
      username: payload.username,
      role: payload.role_id,
      aksi: editingUser ? 'UPDATE_USER' : 'CREATE_USER',
      modul: 'Akademik',
      detail: `Akun "${payload.username}" (${payload.role_id}) berhasil ${editingUser ? 'diperbarui' : 'dibuat'}.`,
      status: 'sukses'
    });
  };

  // --- HANDLERS: SISWA ---
  const handleOpenAddSiswa = () => {
    setEditingSiswa(null);
    const newId = `SIS-${String(siswa.length + 1).padStart(3, '0')}`;
    const randNis = `2026${Math.floor(1000 + Math.random() * 9000)}`;
    const randNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;

    setFormSiswa({
      siswa_id: newId,
      nis: randNis,
      nisn: randNisn,
      nama_lengkap: '',
      jenis_kelamin: 'L',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '2009-01-15',
      kelas_id: kelas[0]?.kelas_id || 'KLS-10-A',
      tahun_ajaran: config.tahun_ajaran_aktif || '2026/2027',
      status: 'aktif',
      nama_ortu: '',
      kontak_ortu: '',
      alamat: ''
    });
    setAutoCreateSiswaUser(true);
    setShowSiswaModal(true);
  };

  const handleOpenEditSiswa = (s: Siswa) => {
    setEditingSiswa(s);
    setFormSiswa(s);
    setAutoCreateSiswaUser(false);
    setShowSiswaModal(true);
  };

  const handleSaveSiswaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiswa.nama_lengkap?.trim() || !formSiswa.nis?.trim()) {
      addToast('error', 'Validasi Gagal', 'Nama lengkap dan NIS wajib diisi.');
      return;
    }

    const sId = formSiswa.siswa_id || `SIS-${String(siswa.length + 1).padStart(3, '0')}`;
    const payload: Siswa = {
      siswa_id: sId,
      nis: formSiswa.nis!.trim(),
      nisn: formSiswa.nisn?.trim() || '',
      nama_lengkap: formSiswa.nama_lengkap!.trim(),
      jenis_kelamin: (formSiswa.jenis_kelamin as 'L' | 'P') || 'L',
      tempat_lahir: formSiswa.tempat_lahir || 'Jakarta',
      tanggal_lahir: formSiswa.tanggal_lahir || '2009-01-01',
      kelas_id: formSiswa.kelas_id || kelas[0]?.kelas_id || 'KLS-10-A',
      tahun_ajaran: formSiswa.tahun_ajaran || config.tahun_ajaran_aktif,
      status: (formSiswa.status as any) || 'aktif',
      nama_ortu: formSiswa.nama_ortu?.trim() || '',
      kontak_ortu: formSiswa.kontak_ortu?.trim() || '',
      alamat: formSiswa.alamat?.trim() || ''
    };

    saveSiswa(payload);

    if (autoCreateSiswaUser && !editingSiswa) {
      const cleanUsername = payload.nis || `siswa_${sId.toLowerCase()}`;
      const newUser: User = {
        user_id: `USR-${cleanUsername}`,
        username: cleanUsername,
        email: `${cleanUsername}@siswa.sekolah.sch.id`,
        password: 'siswa123',
        nama_lengkap: payload.nama_lengkap,
        role_id: 'siswa',
        reference_id: sId,
        status: 'aktif',
        created_at: new Date().toISOString()
      };
      saveUser(newUser);
      addToast('info', 'Akun Login Siswa Dibuat', `Username: ${cleanUsername} / Password: siswa123`);
    }

    setShowSiswaModal(false);
  };

  // --- HANDLERS: ORANG TUA ---
  const handleOpenAddOrtu = () => {
    setEditingOrtu(null);
    const newId = `ORT-${String(orangTua.length + 1).padStart(3, '0')}`;
    setFormOrtu({
      ortu_id: newId,
      nama_lengkap: '',
      hubungan: 'Ayah',
      pekerjaan: 'Wiraswasta',
      kontak: '08',
      email: '',
      alamat: ''
    });
    setSelectedAnakSiswaId('');
    setAutoCreateOrtuUser(true);
    setShowOrtuModal(true);
  };

  const handleOpenEditOrtu = (o: OrangTua) => {
    setEditingOrtu(o);
    setFormOrtu(o);
    const rel = relasiOrtuSiswa.find(r => r.ortu_id === o.ortu_id);
    setSelectedAnakSiswaId(rel ? rel.siswa_id : '');
    setAutoCreateOrtuUser(false);
    setShowOrtuModal(true);
  };

  const handleSaveOrtuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrtu.nama_lengkap?.trim() || !formOrtu.kontak?.trim()) {
      addToast('error', 'Validasi Gagal', 'Nama lengkap dan nomor kontak wajib diisi.');
      return;
    }

    const oId = formOrtu.ortu_id || `ORT-${String(orangTua.length + 1).padStart(3, '0')}`;
    const payload: OrangTua = {
      ortu_id: oId,
      nama_lengkap: formOrtu.nama_lengkap!.trim(),
      hubungan: (formOrtu.hubungan as 'Ayah' | 'Ibu' | 'Wali') || 'Ayah',
      pekerjaan: formOrtu.pekerjaan?.trim() || 'Wiraswasta',
      kontak: formOrtu.kontak!.trim(),
      email: formOrtu.email?.trim() || `${oId.toLowerCase()}@wali.sekolah.sch.id`,
      alamat: formOrtu.alamat?.trim() || ''
    };

    saveOrangTua(payload);

    if (selectedAnakSiswaId) {
      await hubungkanOrtuSiswa(oId, selectedAnakSiswaId, 'terverifikasi');
    }

    if (autoCreateOrtuUser && !editingOrtu) {
      const cleanUsername = `ortu_${payload.kontak.slice(-4) || oId.toLowerCase()}`;
      const newUser: User = {
        user_id: `USR-${oId}`,
        username: cleanUsername,
        email: payload.email || `${cleanUsername}@wali.sekolah.sch.id`,
        password: 'ortu123',
        nama_lengkap: payload.nama_lengkap,
        role_id: 'orang_tua',
        reference_id: oId,
        status: 'aktif',
        created_at: new Date().toISOString()
      };
      saveUser(newUser);
      addToast('info', 'Akun Login Ortu Dibuat', `Username: ${cleanUsername} / Password: ortu123`);
    }

    setShowOrtuModal(false);
  };

  // --- HANDLERS: GURU ---
  const handleOpenAddGuru = () => {
    setEditingGuru(null);
    const newId = `GUR-${String(guru.length + 1).padStart(3, '0')}`;
    const randNip = `1985${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setFormGuru({
      guru_id: newId,
      nip: randNip,
      nama_lengkap: '',
      jenis_kelamin: 'L',
      mapel_utama: mapel[0]?.nama_mapel || 'Matematika Wajib',
      status_kepegawaian: 'PNS',
      email: '',
      kontak: '08'
    });
    setAutoCreateGuruUser(true);
    setShowGuruModal(true);
  };

  const handleOpenEditGuru = (g: Guru) => {
    setEditingGuru(g);
    setFormGuru(g);
    setAutoCreateGuruUser(false);
    setShowGuruModal(true);
  };

  const handleSaveGuruSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuru.nama_lengkap?.trim() || !formGuru.nip?.trim()) {
      addToast('error', 'Validasi Gagal', 'Nama lengkap dan NIP wajib diisi.');
      return;
    }

    const gId = formGuru.guru_id || `GUR-${String(guru.length + 1).padStart(3, '0')}`;
    const payload: Guru = {
      guru_id: gId,
      nip: formGuru.nip!.trim(),
      nama_lengkap: formGuru.nama_lengkap!.trim(),
      jenis_kelamin: (formGuru.jenis_kelamin as 'L' | 'P') || 'L',
      mapel_utama: formGuru.mapel_utama || 'Umum',
      status_kepegawaian: (formGuru.status_kepegawaian as any) || 'PNS',
      email: formGuru.email?.trim() || `${gId.toLowerCase()}@sekolah.sch.id`,
      kontak: formGuru.kontak?.trim() || '08'
    };

    saveGuru(payload);

    if (autoCreateGuruUser && !editingGuru) {
      const cleanUsername = `guru_${payload.nip.slice(-4) || gId.toLowerCase()}`;
      const newUser: User = {
        user_id: `USR-${gId}`,
        username: cleanUsername,
        email: payload.email,
        password: 'guru123',
        nama_lengkap: payload.nama_lengkap,
        role_id: 'guru',
        reference_id: gId,
        status: 'aktif',
        created_at: new Date().toISOString()
      };
      saveUser(newUser);
      addToast('info', 'Akun Login Guru Dibuat', `Username: ${cleanUsername} / Password: guru123`);
    }

    setShowGuruModal(false);
  };

  // --- HANDLERS: STAFF ---
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    const newId = `STF-${String(staff.length + 1).padStart(3, '0')}`;
    setFormStaff({
      staff_id: newId,
      nama_lengkap: '',
      jabatan: 'Staff Tata Usaha',
      divisi: 'Tata Usaha',
      kontak: '08',
      status: 'aktif'
    });
    setAutoCreateStaffUser(true);
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (st: Staff) => {
    setEditingStaff(st);
    setFormStaff(st);
    setAutoCreateStaffUser(false);
    setShowStaffModal(true);
  };

  const handleSaveStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaff.nama_lengkap?.trim() || !formStaff.jabatan?.trim()) {
      addToast('error', 'Validasi Gagal', 'Nama lengkap dan jabatan wajib diisi.');
      return;
    }

    const stId = formStaff.staff_id || `STF-${String(staff.length + 1).padStart(3, '0')}`;
    const payload: Staff = {
      staff_id: stId,
      nama_lengkap: formStaff.nama_lengkap!.trim(),
      jabatan: formStaff.jabatan!.trim(),
      divisi: formStaff.divisi?.trim() || 'Tata Usaha',
      kontak: formStaff.kontak?.trim() || '08',
      status: (formStaff.status as any) || 'aktif'
    };

    saveStaff(payload);

    if (autoCreateStaffUser && !editingStaff) {
      const cleanUsername = `staff_${stId.toLowerCase()}`;
      const newUser: User = {
        user_id: `USR-${stId}`,
        username: cleanUsername,
        email: `${cleanUsername}@sekolah.sch.id`,
        password: 'staff123',
        nama_lengkap: payload.nama_lengkap,
        role_id: 'staff_piket',
        reference_id: stId,
        status: 'aktif',
        created_at: new Date().toISOString()
      };
      saveUser(newUser);
      addToast('info', 'Akun Login Staff Dibuat', `Username: ${cleanUsername} / Password: staff123`);
    }

    setShowStaffModal(false);
  };

  // --- SYNC ACTIONS ---
  const handleSyncCurrentTable = async () => {
    setIsSyncingTable(true);
    let targetSheet: 'USERS' | 'SISWA' | 'GURU' | 'STAFF' | 'ORANG_TUA' = 'USERS';
    if (activeTab === 'users') targetSheet = 'USERS';
    if (activeTab === 'siswa') targetSheet = 'SISWA';
    if (activeTab === 'orang_tua') targetSheet = 'ORANG_TUA';
    if (activeTab === 'guru') targetSheet = 'GURU';
    if (activeTab === 'staff') targetSheet = 'STAFF';

    const res = await syncAkademikTable(targetSheet);
    setIsSyncingTable(false);
    if (res.success) {
      addToast('success', `Sinkronisasi Tab ${targetSheet}`, res.message);
    } else {
      addToast('warning', 'Pemberitahuan Webhook', res.message);
    }
  };

  const handleSyncAllMasterTables = async () => {
    setIsSyncingAll(true);
    const tables: Array<'USERS' | 'SISWA' | 'GURU' | 'STAFF' | 'ORANG_TUA'> = ['USERS', 'SISWA', 'GURU', 'STAFF', 'ORANG_TUA'];
    let successCount = 0;
    for (const t of tables) {
      const res = await syncAkademikTable(t);
      if (res.success) successCount++;
    }
    setIsSyncingAll(false);
    addToast('success', 'Sinkronisasi 5 Master Selesai', `${successCount} dari ${tables.length} tabel berhasil disinkronkan ke Google Sheets.`);
  };

  // Filtered queries
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.reference_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role_id === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredSiswa = siswa.filter(s => {
    const matchSearch =
      s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery) ||
      s.nama_ortu.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = kelasFilter === 'all' || s.kelas_id === kelasFilter;
    return matchSearch && matchKelas;
  });

  const filteredOrtu = orangTua.filter(o => {
    const matchSearch =
      o.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.kontak.includes(searchQuery) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.pekerjaan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchHub = hubunganFilter === 'all' || o.hubungan === hubunganFilter;
    return matchSearch && matchHub;
  });

  const filteredGuru = guru.filter(g => {
    const matchSearch =
      g.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.includes(searchQuery) ||
      g.mapel_utama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKep = kepegawaianFilter === 'all' || g.status_kepegawaian === kepegawaianFilter;
    return matchSearch && matchKep;
  });

  const filteredStaff = staff.filter(st => {
    const matchSearch =
      st.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.kontak.includes(searchQuery) ||
      st.divisi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiv = divisiFilter === 'all' || st.divisi === divisiFilter;
    return matchSearch && matchDiv;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-700/60 flex items-center gap-1.5">
              <DatabaseIcon className="w-3.5 h-3.5" />
              Pusat Master Data Terpadu
            </span>
            <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50 flex items-center gap-1">
              <Upload className="w-3 h-3" /> Input CSV Siap
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Menu Input Data Master & Pengguna
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Input, perbarui, dan impor massal CSV untuk 5 data master pokok: Users, Siswa, Orang Tua, Guru, dan Staff. Terintegrasi penuh dengan sinkronisasi Webhook Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenCsvModal(activeTab)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ring-1 ring-blue-400/50"
            title="Import data CSV ke tab aktif saat ini"
          >
            <Upload className="w-4 h-4 text-blue-200" />
            <span>Import via CSV ({activeTab.toUpperCase()})</span>
          </button>

          <button
            onClick={handleSyncAllMasterTables}
            disabled={isSyncingAll}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            title="Sinkronkan seluruh 5 tabel master ke Google Sheets sekaligus"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan 5 Master ke Sheets'}</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">1. Data Users</div>
            <div className="text-lg font-bold text-slate-900">{users.length} <span className="text-[11px] font-normal text-slate-500">Akun</span></div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('siswa')}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
            activeTab === 'siswa'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">2. Data Siswa</div>
            <div className="text-lg font-bold text-slate-900">{siswa.length} <span className="text-[11px] font-normal text-slate-500">Siswa</span></div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('orang_tua')}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
            activeTab === 'orang_tua'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">3. Data Ortu/Wali</div>
            <div className="text-lg font-bold text-slate-900">{orangTua.length} <span className="text-[11px] font-normal text-slate-500">Wali</span></div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('guru')}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
            activeTab === 'guru'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">4. Data Guru</div>
            <div className="text-lg font-bold text-slate-900">{guru.length} <span className="text-[11px] font-normal text-slate-500">Guru</span></div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">5. Data Staff</div>
            <div className="text-lg font-bold text-slate-900">{staff.length} <span className="text-[11px] font-normal text-slate-500">Staf</span></div>
          </div>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'users', label: `Data Users (${users.length})`, icon: <UserCheck className="w-4 h-4" /> },
          { id: 'siswa', label: `Data Siswa (${siswa.length})`, icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'orang_tua', label: `Data Orang Tua (${orangTua.length})`, icon: <HeartHandshake className="w-4 h-4" /> },
          { id: 'guru', label: `Data Guru (${guru.length})`, icon: <BookOpen className="w-4 h-4" /> },
          { id: 'staff', label: `Data Staff (${staff.length})`, icon: <Briefcase className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as MasterDataTab);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DATA USERS */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Tabel Master Pengguna (USERS)</h3>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Tab Sheets: USERS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kredensial login akun resmi sistem. Bisa diinput manual atau diimpor massal via CSV.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadCsvTemplate('users')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download template CSV siap isi untuk Data Users"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template CSV</span>
              </button>

              <button
                onClick={() => handleExportCsv('users')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor seluruh data users ke file CSV"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => handleOpenCsvModal('users')}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Import data Users massal dari file atau teks CSV"
              >
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>Input via CSV</span>
              </button>

              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                <span>{showPasswords ? 'Sembunyikan Sandi' : 'Lihat Sandi'}</span>
              </button>

              <button
                onClick={handleSyncCurrentTable}
                disabled={isSyncingTable}
                className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTable ? 'animate-spin' : ''}`} />
                <span>Sync Sheets</span>
              </button>

              <button
                onClick={handleOpenAddUser}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ User Baru</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari username, nama, email, ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Role ({users.length})</option>
                {Object.entries(ROLE_DEFINITIONS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Kata Sandi</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Role Akses</th>
                  <th className="py-2.5 px-3">ID Referensi</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data user yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const role = ROLE_DEFINITIONS[u.role_id] || { name: u.role_id, color: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={u.user_id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-[11px]">{u.user_id}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 text-[11px]">{u.username}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {showPasswords ? (
                            <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              {u.password || 'password123'}
                            </span>
                          ) : (
                            <span className="text-slate-400">••••••••</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{u.nama_lengkap}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${role.color}`}>
                            {role.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{u.reference_id || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit Kredensial User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus akun login user "${u.username}"?`)) {
                                  deleteUser(u.user_id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Akun User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DATA SISWA */}
      {/* ========================================================= */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Buku Induk Peserta Didik (SISWA)</h3>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Tab Sheets: SISWA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Data induk siswa lengkap dengan NIS, NISN, Rombongan Belajar, dan Biodata Orang Tua.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadCsvTemplate('siswa')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download template CSV siap isi untuk Data Siswa"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template CSV</span>
              </button>

              <button
                onClick={() => handleExportCsv('siswa')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor seluruh data siswa ke file CSV"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => handleOpenCsvModal('siswa')}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Import data Siswa massal dari file atau teks CSV"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-700" />
                <span>Input via CSV</span>
              </button>

              <button
                onClick={handleSyncCurrentTable}
                disabled={isSyncingTable}
                className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTable ? 'animate-spin' : ''}`} />
                <span>Sync Sheets</span>
              </button>

              <button
                onClick={handleOpenAddSiswa}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Siswa Baru</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, NIS, NISN, orang tua..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Kelas:</span>
              <select
                value={kelasFilter}
                onChange={e => setKelasFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Kelas ({siswa.length})</option>
                {kelas.map(k => (
                  <option key={k.kelas_id} value={k.kelas_id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID / NIS / NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Nama Orang Tua</th>
                  <th className="py-2.5 px-3">Kontak Ortu</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map(s => {
                    const k = kelas.find(item => item.kelas_id === s.kelas_id);
                    return (
                      <tr key={s.siswa_id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <div className="font-bold text-indigo-700">{s.nis}</div>
                          <div className="text-[10px] text-slate-400">NISN: {s.nisn || '-'} • ID: {s.siswa_id}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{s.nama_lengkap}</div>
                          <div className="text-[10px] text-slate-500">{s.tempat_lahir}, {s.tanggal_lahir}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                            {s.jenis_kelamin}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{k?.nama_kelas || s.kelas_id}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{s.nama_ortu || '-'}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{s.kontak_ortu || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditSiswa(s)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data siswa "${s.nama_lengkap}"?`)) {
                                  deleteSiswa(s.siswa_id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DATA ORANG TUA */}
      {/* ========================================================= */}
      {activeTab === 'orang_tua' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Database Wali Murid (ORANG_TUA)</h3>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Tab Sheets: ORANG_TUA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Data kontak wali murid, status hubungan, dan relasi anak. Mendukung upload CSV massal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadCsvTemplate('orang_tua')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download template CSV siap isi untuk Data Orang Tua"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template CSV</span>
              </button>

              <button
                onClick={() => handleExportCsv('orang_tua')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor seluruh data orang tua ke file CSV"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-rose-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => handleOpenCsvModal('orang_tua')}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Import data Orang Tua massal dari file atau teks CSV"
              >
                <Upload className="w-3.5 h-3.5 text-rose-700" />
                <span>Input via CSV</span>
              </button>

              <button
                onClick={handleSyncCurrentTable}
                disabled={isSyncingTable}
                className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTable ? 'animate-spin' : ''}`} />
                <span>Sync Sheets</span>
              </button>

              <button
                onClick={handleOpenAddOrtu}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Ortu Baru</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama orang tua, telepon, pekerjaan, email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Hubungan:</span>
              <select
                value={hubunganFilter}
                onChange={e => setHubunganFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">Semua Hubungan ({orangTua.length})</option>
                <option value="Ayah">Ayah</option>
                <option value="Ibu">Ibu</option>
                <option value="Wali">Wali</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID Ortu</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Hubungan</th>
                  <th className="py-2.5 px-3">Pekerjaan</th>
                  <th className="py-2.5 px-3">Kontak WA</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Anak Terhubung</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrtu.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data orang tua ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredOrtu.map(o => {
                    const childrenRels = relasiOrtuSiswa.filter(r => r.ortu_id === o.ortu_id);
                    return (
                      <tr key={o.ortu_id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700 text-[11px]">{o.ortu_id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{o.nama_lengkap}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {o.hubungan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{o.pekerjaan}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 font-semibold">{o.kontak}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{o.email || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {childrenRels.length} Siswa
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditOrtu(o)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit Data Orang Tua"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data orang tua "${o.nama_lengkap}" dan relasi anaknya?`)) {
                                  deleteOrangTua(o.ortu_id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Orang Tua"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: DATA GURU */}
      {/* ========================================================= */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Database Tenaga Pendidik (GURU)</h3>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Tab Sheets: GURU
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Data resmi tenaga pengajar, NIP/NUPTK, status kepegawaian (PNS/GTT/Yayasan), dan mata pelajaran ampuan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadCsvTemplate('guru')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download template CSV siap isi untuk Data Guru"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template CSV</span>
              </button>

              <button
                onClick={() => handleExportCsv('guru')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor seluruh data guru ke file CSV"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => handleOpenCsvModal('guru')}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Import data Guru massal dari file atau teks CSV"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Input via CSV</span>
              </button>

              <button
                onClick={handleSyncCurrentTable}
                disabled={isSyncingTable}
                className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTable ? 'animate-spin' : ''}`} />
                <span>Sync Sheets</span>
              </button>

              <button
                onClick={handleOpenAddGuru}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Guru Baru</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama guru, NIP, mapel, email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Kepegawaian:</span>
              <select
                value={kepegawaianFilter}
                onChange={e => setKepegawaianFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Status ({guru.length})</option>
                <option value="PNS">PNS</option>
                <option value="GTT">GTT</option>
                <option value="Yayasan">Yayasan</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID / NIP</th>
                  <th className="py-2.5 px-3">Nama Lengkap & Gelar</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Mata Pelajaran Utama</th>
                  <th className="py-2.5 px-3">Kepegawaian</th>
                  <th className="py-2.5 px-3">Email Dinas</th>
                  <th className="py-2.5 px-3">Kontak WA</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuru.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data guru ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredGuru.map(g => (
                    <tr key={g.guru_id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="font-bold text-emerald-800">{g.nip}</div>
                        <div className="text-[10px] text-slate-400">ID: {g.guru_id}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{g.nama_lengkap}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {g.jenis_kelamin}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">{g.mapel_utama}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {g.status_kepegawaian}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{g.email}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{g.kontak}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditGuru(g)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data guru "${g.nama_lengkap}"?`)) {
                                deleteGuru(g.guru_id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DATA STAFF */}
      {/* ========================================================= */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Tenaga Kependidikan & Tata Usaha (STAFF)</h3>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Tab Sheets: STAFF
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Data staf operasional, tata usaha, perpustakaan, keamanan, resepsionis, dan sarpras sekolah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadCsvTemplate('staff')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download template CSV siap isi untuk Data Staff"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template CSV</span>
              </button>

              <button
                onClick={() => handleExportCsv('staff')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor seluruh data staff ke file CSV"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-amber-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => handleOpenCsvModal('staff')}
                className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Import data Staff massal dari file atau teks CSV"
              >
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                <span>Input via CSV</span>
              </button>

              <button
                onClick={handleSyncCurrentTable}
                disabled={isSyncingTable}
                className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTable ? 'animate-spin' : ''}`} />
                <span>Sync Sheets</span>
              </button>

              <button
                onClick={handleOpenAddStaff}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Staff Baru</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama staff, jabatan, divisi, telepon..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Divisi:</span>
              <select
                value={divisiFilter}
                onChange={e => setDivisiFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Semua Divisi ({staff.length})</option>
                {Array.from(new Set(staff.map(s => s.divisi))).map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Staff ID</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Jabatan</th>
                  <th className="py-2.5 px-3">Divisi Unit</th>
                  <th className="py-2.5 px-3">Kontak WA</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data staff ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(st => (
                    <tr key={st.staff_id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-800 text-[11px]">{st.staff_id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{st.nama_lengkap}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{st.jabatan}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {st.divisi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{st.kontak}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditStaff(st)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Edit Data Staff"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data staf "${st.nama_lengkap}"?`)) {
                                deleteStaff(st.staff_id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Hapus Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CSV IMPORT MODAL (UNIVERSAL FOR 5 MASTER TABLES) */}
      {/* ========================================================= */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Import Data via CSV ({CSV_TEMPLATES[csvModalTab].label})
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Tabel Sasaran: <span className="font-mono font-bold text-amber-300">{CSV_TEMPLATES[csvModalTab].tableName}</span> di Spreadsheet Akademik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Target Tab Switcher inside Modal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-700">Pilih Data yang Diimpor:</div>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {(['users', 'siswa', 'orang_tua', 'guru', 'staff'] as MasterDataTab[]).map(tabKey => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => {
                        setCsvModalTab(tabKey);
                        setCsvParsedRows([]);
                        setCsvRawText('');
                        setCsvFileName('');
                        setCsvAutoCreateUsers(tabKey !== 'users');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        csvModalTab === tabKey
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {tabKey.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Helper Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
                <div className="text-xs text-blue-900">
                  <span className="font-bold">Gunakan Format Template Resmi</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Kolom yang diharapkan: <code className="font-mono text-[10px] bg-blue-100 px-1 py-0.5 rounded">{CSV_TEMPLATES[csvModalTab].headers.slice(0, 5).join(', ')}...</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadCsvTemplate(csvModalTab)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Unduh Template</span>
                </button>
              </div>

              {/* Upload Method Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setCsvInputMode('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    csvInputMode === 'upload'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload File CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCsvInputMode('paste')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    csvInputMode === 'paste'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tempel (Paste) Teks CSV</span>
                </button>
              </div>

              {/* Input Area */}
              {csvInputMode === 'upload' ? (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30">
                    <input
                      type="file"
                      accept=".csv, text/csv, .txt"
                      onChange={handleCsvFileInput}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {csvFileName ? `File Terpilih: ${csvFileName}` : 'Klik untuk memilih file CSV atau Tarik (Drag & Drop) ke sini'}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mendukung format file <code className="font-mono text-slate-600">.csv</code> atau <code className="font-mono text-slate-600">.txt</code> (UTF-8)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Tempelkan Baris CSV dari Excel / Google Sheets:
                  </label>
                  <textarea
                    rows={6}
                    value={csvRawText}
                    onChange={e => handleParseCsvString(e.target.value)}
                    placeholder={`Tempel baris CSV di sini...\nContoh:\n${CSV_TEMPLATES[csvModalTab].headers.join(',')}\n${CSV_TEMPLATES[csvModalTab].sampleRows[0].join(',')}`}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-mono resize-none focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              )}

              {/* Parsed Preview Table */}
              {csvParsedRows.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Data Terdeteksi: <span className="text-blue-700">{csvParsedRows.length - 1} baris</span> ({csvParsedRows[0]?.length || 0} kolom)
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Pratinjau 4 Baris Pertama</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">#</th>
                          {csvParsedRows[0]?.map((colHeader, idx) => (
                            <th key={idx} className="py-2 px-2.5 whitespace-nowrap font-mono">
                              {colHeader}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {csvParsedRows.slice(1, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 font-bold text-slate-400 font-mono">{rIdx + 1}</td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-1.5 px-2.5 whitespace-nowrap text-slate-700">
                                {cell || <span className="text-slate-300 italic">-</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Mode Selection */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Strategi Import:</div>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      csvImportMode === 'merge'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="csvMode"
                        value="merge"
                        checked={csvImportMode === 'merge'}
                        onChange={() => setCsvImportMode('merge')}
                        className="text-blue-600"
                      />
                      <span>Gabung (Merge)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal mt-1">
                      Tambah baru & perbarui data lama (Rekomendasi).
                    </span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      csvImportMode === 'append'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="csvMode"
                        value="append"
                        checked={csvImportMode === 'append'}
                        onChange={() => setCsvImportMode('append')}
                        className="text-blue-600"
                      />
                      <span>Tambah Saja</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal mt-1">
                      Hanya menambahkan baris baru tanpa menimpa data lama.
                    </span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      csvImportMode === 'replace'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="csvMode"
                        value="replace"
                        checked={csvImportMode === 'replace'}
                        onChange={() => setCsvImportMode('replace')}
                        className="text-rose-600"
                      />
                      <span>Timpa Total</span>
                    </div>
                    <span className="text-[10px] text-rose-700 font-normal mt-1">
                      Ganti seluruh data tabel ini dengan isi file CSV.
                    </span>
                  </label>
                </div>
              </div>

              {/* Option to Auto Create User Accounts */}
              {csvModalTab !== 'users' && (
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="csvAutoCreateUsers"
                    checked={csvAutoCreateUsers}
                    onChange={e => setCsvAutoCreateUsers(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="csvAutoCreateUsers" className="text-xs text-indigo-950 cursor-pointer">
                    <span className="font-bold">Otomatis buatkan Akun User Login resmi di tab USERS</span>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Sistem akan sekaligus mendaftarkan kredensial login akun untuk setiap {CSV_TEMPLATES[csvModalTab].label} yang berhasil diimpor.
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                {csvParsedRows.length > 1 ? (
                  <span className="font-semibold text-slate-700">
                    Siap mengimpor {csvParsedRows.length - 1} data ke {CSV_TEMPLATES[csvModalTab].tableName}.
                  </span>
                ) : (
                  <span>Silakan upload atau tempel baris CSV terlebih dahulu.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={csvParsedRows.length < 2 || isImportingCsv}
                  onClick={handleExecuteImportCsv}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImportingCsv ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses Import...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Impor Sekarang ({Math.max(0, csvParsedRows.length - 1)} Data)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: FORM INPUT DATA USER */}
      {/* ========================================================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {editingUser ? 'Edit Data User & Kredensial' : 'Input Data User Baru'}
                </h3>
              </div>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User ID</label>
                  <input
                    type="text"
                    required
                    value={formUser.user_id}
                    onChange={e => setFormUser({ ...formUser, user_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={formUser.status}
                    onChange={e => setFormUser({ ...formUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="aktif">Aktif (Bisa Login)</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  value={formUser.nama_lengkap}
                  onChange={e => setFormUser({ ...formUser, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: budi_guru"
                    value={formUser.username}
                    onChange={e => setFormUser({ ...formUser, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Password login"
                      value={formUser.password}
                      onChange={e => setFormUser({ ...formUser, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-blue-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  required
                  placeholder="email@sekolah.sch.id"
                  value={formUser.email}
                  onChange={e => setFormUser({ ...formUser, email: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Hak Akses</label>
                  <select
                    value={formUser.role_id}
                    onChange={e => setFormUser({ ...formUser, role_id: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    {Object.entries(ROLE_DEFINITIONS).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID Referensi</label>
                  <input
                    type="text"
                    placeholder="Contoh: GUR-001 / SIS-001"
                    value={formUser.reference_id}
                    onChange={e => setFormUser({ ...formUser, reference_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Data User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FORM INPUT DATA SISWA */}
      {/* ========================================================= */}
      {showSiswaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-base">
                  {editingSiswa ? 'Edit Biodata Siswa' : 'Input Data Siswa Baru'}
                </h3>
              </div>
              <button onClick={() => setShowSiswaModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSiswaSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID Siswa</label>
                  <input
                    type="text"
                    value={formSiswa.siswa_id || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, siswa_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIS (Wajib)</label>
                  <input
                    type="text"
                    required
                    value={formSiswa.nis || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    value={formSiswa.nisn || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, nisn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  value={formSiswa.nama_lengkap || ''}
                  onChange={e => setFormSiswa({ ...formSiswa, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formSiswa.jenis_kelamin || 'L'}
                    onChange={e => setFormSiswa({ ...formSiswa, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formSiswa.tempat_lahir || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, tempat_lahir: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formSiswa.tanggal_lahir || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
                  <select
                    value={formSiswa.kelas_id || kelas[0]?.kelas_id}
                    onChange={e => setFormSiswa({ ...formSiswa, kelas_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    {kelas.map(k => (
                      <option key={k.kelas_id} value={k.kelas_id}>
                        {k.nama_kelas} ({k.jurusan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formSiswa.status || 'aktif'}
                    onChange={e => setFormSiswa({ ...formSiswa, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus</option>
                    <option value="mutasi">Mutasi</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hendra Wijaya"
                    value={formSiswa.nama_ortu || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, nama_ortu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kontak WA Orang Tua</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formSiswa.kontak_ortu || ''}
                    onChange={e => setFormSiswa({ ...formSiswa, kontak_ortu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili Siswa</label>
                <textarea
                  rows={2}
                  placeholder="Alamat lengkap tempat tinggal..."
                  value={formSiswa.alamat || ''}
                  onChange={e => setFormSiswa({ ...formSiswa, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              {!editingSiswa && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoCreateSiswaUser"
                    checked={autoCreateSiswaUser}
                    onChange={e => setAutoCreateSiswaUser(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="autoCreateSiswaUser" className="text-xs text-indigo-900 cursor-pointer">
                    <span className="font-bold">Buatkan sekaligus Akun User Login Siswa</span>
                    <p className="text-[11px] text-indigo-700">
                      Otomatis membuat akun di tabel USERS dengan username NIS dan password default: <code className="font-mono font-bold">siswa123</code>.
                    </p>
                  </label>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSiswaModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: FORM INPUT DATA ORANG TUA */}
      {/* ========================================================= */}
      {showOrtuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">
                  {editingOrtu ? 'Edit Data Wali Murid' : 'Input Data Orang Tua / Wali Baru'}
                </h3>
              </div>
              <button onClick={() => setShowOrtuModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrtuSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID Orang Tua</label>
                  <input
                    type="text"
                    value={formOrtu.ortu_id || ''}
                    onChange={e => setFormOrtu({ ...formOrtu, ortu_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hubungan Keluarga</label>
                  <select
                    value={formOrtu.hubungan || 'Ayah'}
                    onChange={e => setFormOrtu({ ...formOrtu, hubungan: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    <option value="Ayah">Ayah Kandung</option>
                    <option value="Ibu">Ibu Kandung</option>
                    <option value="Wali">Wali Murid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Orang Tua</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Drs. Bambang Irawan"
                  value={formOrtu.nama_lengkap || ''}
                  onChange={e => setFormOrtu({ ...formOrtu, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Kontak / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxxx"
                    value={formOrtu.kontak || ''}
                    onChange={e => setFormOrtu({ ...formOrtu, kontak: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: PNS / Wiraswasta"
                    value={formOrtu.pekerjaan || ''}
                    onChange={e => setFormOrtu({ ...formOrtu, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="orangtua@gmail.com"
                  value={formOrtu.email || ''}
                  onChange={e => setFormOrtu({ ...formOrtu, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hubungkan dengan Siswa (Anak)
                </label>
                <select
                  value={selectedAnakSiswaId}
                  onChange={e => setSelectedAnakSiswaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Pilih Siswa (Opsional / Dapat Disambung Nanti) --</option>
                  {siswa.map(s => (
                    <option key={s.siswa_id} value={s.siswa_id}>
                      {s.nama_lengkap} (NIS: {s.nis} • Kelas: {s.kelas_id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Otomatis membuat relasi terverifikasi di tab RELASI_ORANG_TUA_SISWA.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili</label>
                <textarea
                  rows={2}
                  placeholder="Alamat tempat tinggal orang tua..."
                  value={formOrtu.alamat || ''}
                  onChange={e => setFormOrtu({ ...formOrtu, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              {!editingOrtu && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoCreateOrtuUser"
                    checked={autoCreateOrtuUser}
                    onChange={e => setAutoCreateOrtuUser(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="autoCreateOrtuUser" className="text-xs text-rose-900 cursor-pointer">
                    <span className="font-bold">Buatkan sekaligus Akun User Login Orang Tua</span>
                    <p className="text-[11px] text-rose-700">
                      Otomatis membuat akun di tabel USERS dengan role orang_tua dan password default: <code className="font-mono font-bold">ortu123</code>.
                    </p>
                  </label>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrtuModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Data Orang Tua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: FORM INPUT DATA GURU */}
      {/* ========================================================= */}
      {showGuruModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingGuru ? 'Edit Data Tenaga Pendidik' : 'Input Data Guru Baru'}
                </h3>
              </div>
              <button onClick={() => setShowGuruModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuruSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID Guru</label>
                  <input
                    type="text"
                    value={formGuru.guru_id || ''}
                    onChange={e => setFormGuru({ ...formGuru, guru_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP / NUPTK (Wajib)</label>
                  <input
                    type="text"
                    required
                    value={formGuru.nip || ''}
                    onChange={e => setFormGuru({ ...formGuru, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
                  value={formGuru.nama_lengkap || ''}
                  onChange={e => setFormGuru({ ...formGuru, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">L / P</label>
                  <select
                    value={formGuru.jenis_kelamin || 'L'}
                    onChange={e => setFormGuru({ ...formGuru, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formGuru.status_kepegawaian || 'PNS'}
                    onChange={e => setFormGuru({ ...formGuru, status_kepegawaian: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                    <option value="GTT">Guru Tidak Tetap (GTT)</option>
                    <option value="Yayasan">Guru Tetap Yayasan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran Utama</label>
                <input
                  type="text"
                  placeholder="Contoh: Matematika Wajib / Biologi"
                  value={formGuru.mapel_utama || ''}
                  onChange={e => setFormGuru({ ...formGuru, mapel_utama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Dinas</label>
                  <input
                    type="email"
                    placeholder="guru@sekolah.sch.id"
                    value={formGuru.email || ''}
                    onChange={e => setFormGuru({ ...formGuru, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kontak WA</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={formGuru.kontak || ''}
                    onChange={e => setFormGuru({ ...formGuru, kontak: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {!editingGuru && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoCreateGuruUser"
                    checked={autoCreateGuruUser}
                    onChange={e => setAutoCreateGuruUser(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="autoCreateGuruUser" className="text-xs text-emerald-900 cursor-pointer">
                    <span className="font-bold">Buatkan sekaligus Akun User Login Guru</span>
                    <p className="text-[11px] text-emerald-700">
                      Otomatis membuat akun di tabel USERS dengan role guru dan password default: <code className="font-mono font-bold">guru123</code>.
                    </p>
                  </label>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGuruModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: FORM INPUT DATA STAFF */}
      {/* ========================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {editingStaff ? 'Edit Data Tenaga Kependidikan' : 'Input Data Staff Baru'}
                </h3>
              </div>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID Staff</label>
                  <input
                    type="text"
                    value={formStaff.staff_id || ''}
                    onChange={e => setFormStaff({ ...formStaff, staff_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formStaff.status || 'aktif'}
                    onChange={e => setFormStaff({ ...formStaff, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Staff</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahmat Hidayat"
                  value={formStaff.nama_lengkap || ''}
                  onChange={e => setFormStaff({ ...formStaff, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Fungsional</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kepala Tata Usaha / Resepsionis"
                    value={formStaff.jabatan || ''}
                    onChange={e => setFormStaff({ ...formStaff, jabatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Divisi / Bagian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tata Usaha / Keuangan / Piket"
                    value={formStaff.divisi || ''}
                    onChange={e => setFormStaff({ ...formStaff, divisi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kontak WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={formStaff.kontak || ''}
                  onChange={e => setFormStaff({ ...formStaff, kontak: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              {!editingStaff && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoCreateStaffUser"
                    checked={autoCreateStaffUser}
                    onChange={e => setAutoCreateStaffUser(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="autoCreateStaffUser" className="text-xs text-amber-900 cursor-pointer">
                    <span className="font-bold">Buatkan sekaligus Akun User Login Staff</span>
                    <p className="text-[11px] text-amber-700">
                      Otomatis membuat akun di tabel USERS dengan role staff_piket dan password default: <code className="font-mono font-bold">staff123</code>.
                    </p>
                  </label>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Data Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}
