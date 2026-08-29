import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { RoutinesPage } from './pages/user/RoutinesPage';
import { ProgressPage } from './pages/user/ProgressPage';
import { NutritionPage } from './pages/user/NutritionPage';
import { GoalsPage } from './pages/user/GoalsPage';
import { RemindersPage } from './pages/user/RemindersPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';

const MainApp: React.FC = () => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>(isAdmin ? 'admin-dashboard' : 'dashboard');
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string | null>(null);

  // Sync default tab when role changes
  React.useEffect(() => {
    if (isAdmin && currentTab === 'dashboard') {
      setCurrentTab('admin-dashboard');
    } else if (!isAdmin && currentTab === 'admin-dashboard') {
      setCurrentTab('dashboard');
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.webp"
            alt="MoonFit"
            className="animate-pulse-glow"
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '22px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 0 35px rgba(6, 182, 212, 0.45)',
            }}
          />
          <div className="font-heading" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
            MOON<span style={{ color: 'var(--color-primary)' }}>FIT</span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando aplicación...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show Login / Register
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Authenticated user with onboarding pending
  if (user && !user.onboarding_completed && user.role === 'USER') {
    return <OnboardingPage />;
  }

  // Admin User Detail view handler
  const handleViewUserDetail = (userId: string) => {
    setSelectedAdminUserId(userId);
    setCurrentTab('admin-user-detail');
  };

  const handleAdminDetailBack = () => {
    setSelectedAdminUserId(null);
    setCurrentTab('admin-users');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Tab Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Page Content */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {/* User Tabs */}
        {currentTab === 'dashboard' && <UserDashboard onNavigate={setCurrentTab} />}
        {currentTab === 'routines' && <RoutinesPage />}
        {currentTab === 'progress' && <ProgressPage />}
        {currentTab === 'nutrition' && <NutritionPage />}
        {currentTab === 'goals' && <GoalsPage />}
        {currentTab === 'reminders' && <RemindersPage />}
        {currentTab === 'profile' && <ProfilePage />}

        {/* Admin Tabs */}
        {currentTab === 'admin-dashboard' && (
          <AdminDashboardPage
            onNavigate={(tab, userId) => {
              if (userId) {
                handleViewUserDetail(userId);
              } else {
                setCurrentTab(tab);
              }
            }}
          />
        )}
        {currentTab === 'admin-users' && (
          <AdminUsersPage onViewUserDetail={handleViewUserDetail} />
        )}
        {currentTab === 'admin-user-detail' && selectedAdminUserId && (
          <AdminUserDetailPage
            userId={selectedAdminUserId}
            onBack={handleAdminDetailBack}
          />
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
