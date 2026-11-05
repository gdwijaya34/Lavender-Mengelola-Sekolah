import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, ROLE_DEFINITIONS } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/dashboard/Sidebar';
import { DashboardHeader } from './components/dashboard/DashboardHeader';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ProfilPage } from './pages/public/ProfilPage';
import { ProgramPage } from './pages/public/ProgramPage';
import { PrestasiPage } from './pages/public/PrestasiPage';
import { BeritaPage } from './pages/public/BeritaPage';
import { GaleriPage } from './pages/public/GaleriPage';
import { KontakPage } from './pages/public/KontakPage';
import { BukuTamuPage } from './pages/public/BukuTamuPage';
import { LoginPage } from './pages/auth/LoginPage';

// Dashboard Pages
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { KeuanganDashboard } from './pages/dashboard/KeuanganDashboard';
import { AkademikDashboard } from './pages/dashboard/AkademikDashboard';
import { PiketDashboard } from './pages/dashboard/PiketDashboard';
import { GuruDashboard } from './pages/dashboard/GuruDashboard';
import { SiswaDashboard } from './pages/dashboard/SiswaDashboard';
import { OrangTuaDashboard } from './pages/dashboard/OrangTuaDashboard';
import { SheetsManagerPage } from './pages/dashboard/SheetsManagerPage';
import { BrandingSettingsPage } from './pages/dashboard/BrandingSettingsPage';
import { AuditLogPage } from './pages/dashboard/AuditLogPage';
import { TestingGuidePage } from './pages/dashboard/TestingGuidePage';
import { UsersManagementPage } from './pages/dashboard/UsersManagementPage';

import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, currentRole, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [currentSection, setCurrentSection] = useState<string>('overview');

  // Sync route on popstate (browser back/forward) or hash if needed
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '/';
      if (path.startsWith('/dashboard') && !isAuthenticated) {
        setCurrentPath('/login');
      } else {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    const handleSectionChange = (e: any) => {
      if (e.detail) {
        setCurrentSection(e.detail);
      }
    };
    window.addEventListener('navigate-section', handleSectionChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate-section', handleSectionChange);
    };
  }, [isAuthenticated]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setCurrentSection('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentPath(`/dashboard/${role}`);
    setCurrentSection('overview');
  };

  // Determine if on private dashboard
  const isDashboard = currentPath.startsWith('/dashboard');

  // If visiting dashboard but not authenticated, show login
  if (isDashboard && !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={() => handleNavigate('/')}
      />
    );
  }

  // Render Public Website Routes
  if (!isDashboard) {
    let PageComponent = <LandingPage onNavigate={handleNavigate} />;

    switch (currentPath) {
      case '/':
        PageComponent = <LandingPage onNavigate={handleNavigate} />;
        break;
      case '/profil':
        PageComponent = <ProfilPage />;
        break;
      case '/program':
        PageComponent = <ProgramPage />;
        break;
      case '/prestasi':
        PageComponent = <PrestasiPage />;
        break;
      case '/berita':
        PageComponent = <BeritaPage />;
        break;
      case '/galeri':
        PageComponent = <GaleriPage />;
        break;
      case '/kontak':
        PageComponent = <KontakPage />;
        break;
      case '/buku-tamu':
        return (
          <>
            <ToastContainer />
            <BukuTamuPage onNavigateHome={() => handleNavigate('/')} />
          </>
        );
      case '/login':
        return (
          <>
            <ToastContainer />
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => handleNavigate('/')}
            />
          </>
        );
      default:
        PageComponent = <LandingPage onNavigate={handleNavigate} />;
    }

    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <ToastContainer />
        <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
        <main className="flex-1">{PageComponent}</main>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Render Dashboard Views per Role
  let dashboardTitle = 'Dashboard Sistem Informasi Sekolah';
  let DashboardViewComponent = <AdminDashboard onNavigateSection={sec => setCurrentSection(sec)} />;

  if (currentRole === 'admin_sekolah') {
    dashboardTitle = 'Dashboard Super Admin';
    switch (currentSection) {
      case 'overview':
        DashboardViewComponent = <AdminDashboard onNavigateSection={sec => setCurrentSection(sec)} />;
        break;
      case 'siswa':
        DashboardViewComponent = <AkademikDashboard initialTab="siswa" />;
        break;
      case 'guru-staf':
        DashboardViewComponent = <AkademikDashboard initialTab="guru" />;
        break;
      case 'akademik':
        DashboardViewComponent = <AkademikDashboard initialTab="kelas" />;
        break;
      case 'keuangan':
        DashboardViewComponent = <KeuanganDashboard initialTab="overview" />;
        break;
      case 'presensi':
        DashboardViewComponent = <PiketDashboard />;
        break;
      case 'nilai':
        DashboardViewComponent = <AkademikDashboard initialTab="nilai" />;
        break;
      case 'prestasi':
        DashboardViewComponent = <PrestasiPage />;
        break;
      case 'buku-tamu':
        DashboardViewComponent = <BukuTamuPage onNavigateHome={() => setCurrentSection('overview')} />;
        break;
      case 'sheets':
        DashboardViewComponent = <SheetsManagerPage />;
        break;
      case 'branding':
        DashboardViewComponent = <BrandingSettingsPage />;
        break;
      case 'users':
        DashboardViewComponent = <UsersManagementPage />;
        break;
      case 'audit-log':
        DashboardViewComponent = <AuditLogPage />;
        break;
      case 'testing':
        DashboardViewComponent = <TestingGuidePage />;
        break;
      default:
        DashboardViewComponent = <AdminDashboard onNavigateSection={sec => setCurrentSection(sec)} />;
    }
  } else if (currentRole === 'admin_keuangan') {
    dashboardTitle = 'Dashboard Admin Keuangan';
    DashboardViewComponent = <KeuanganDashboard initialTab={currentSection === 'overview' ? 'overview' : currentSection} />;
  } else if (currentRole === 'admin_akademik') {
    dashboardTitle = 'Dashboard Admin Akademik';
    DashboardViewComponent = <AkademikDashboard initialTab={currentSection === 'overview' ? 'siswa' : currentSection} />;
  } else if (currentRole === 'staff_piket') {
    dashboardTitle = 'Dashboard Staff Piket & Resepsionis';
    DashboardViewComponent = <PiketDashboard />;
  } else if (currentRole === 'guru') {
    dashboardTitle = 'Dashboard Guru Mata Pelajaran';
    DashboardViewComponent = <GuruDashboard />;
  } else if (currentRole === 'siswa') {
    dashboardTitle = 'Portal Siswa';
    DashboardViewComponent = <SiswaDashboard />;
  } else if (currentRole === 'orang_tua') {
    dashboardTitle = 'Portal Orang Tua / Wali Murid';
    DashboardViewComponent = <OrangTuaDashboard />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <ToastContainer />
      {/* Sidebar with strict RBAC */}
      <Sidebar
        currentSection={currentSection}
        onNavigateSection={sec => setCurrentSection(sec)}
        onNavigateHome={() => handleNavigate('/')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <DashboardHeader
          sectionTitle={dashboardTitle}
          onNavigateSection={sec => setCurrentSection(sec)}
          onNavigatePath={path => handleNavigate(path)}
        />
        <main className="flex-1 overflow-y-auto pb-16">{DashboardViewComponent}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <MainAppContent />
      </SchoolProvider>
    </AuthProvider>
  );
}
