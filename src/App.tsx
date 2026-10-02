import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { Footer } from './components/Footer.tsx';
import { LoginModal } from './components/auth/LoginModal.tsx';
import { RegisterModal } from './components/auth/RegisterModal.tsx';

// User Views
import { UserDashboard } from './pages/UserDashboard.tsx';
import { TasksPage } from './pages/TasksPage.tsx';
import { MyClaimsPage } from './pages/MyClaimsPage.tsx';
import { MockMapPage } from './pages/MockMapPage.tsx';
import { WalletPage } from './pages/WalletPage.tsx';
import { WithdrawalsPage } from './pages/WithdrawalsPage.tsx';
import { SupportPage } from './pages/SupportPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';

// Admin Views
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminUsers } from './pages/admin/AdminUsers.tsx';
import { AdminTasks } from './pages/admin/AdminTasks.tsx';
import { AdminCommentPool } from './pages/admin/AdminCommentPool.tsx';
import { AdminSubmissions } from './pages/admin/AdminSubmissions.tsx';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals.tsx';
import { AdminTransactions } from './pages/admin/AdminTransactions.tsx';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs.tsx';

import { api } from './services/api.ts';
import { BRAND_CONFIG } from '../shared/types.ts';
import { MessageSquare } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, user, admin } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeMockMapTaskId, setActiveMockMapTaskId] = useState<string | null>(null);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Sync default view when role changes
  useEffect(() => {
    if (role === 'admin' && !currentView.startsWith('admin-')) {
      setCurrentView('admin-dashboard');
    } else if (role === 'user' && currentView.startsWith('admin-')) {
      setCurrentView('dashboard');
    }
  }, [role]);

  // Load wallet balance if user
  useEffect(() => {
    if (role === 'user' && user) {
      api.getMyWallet()
        .then(res => setWalletBalance(res.wallet?.current_balance || 0))
        .catch(() => {});
    }
  }, [role, user, currentView]);

  const handleOpenMockMap = (taskId: string) => {
    setActiveMockMapTaskId(taskId);
    setCurrentView('mock-map');
  };

  const handleOpenClaim = (claimId: string) => {
    setActiveClaimId(claimId);
    setCurrentView('my-claims');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950 font-sans">
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        walletBalance={walletBalance}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {/* USER VIEWS */}
          {currentView === 'dashboard' && (
            <UserDashboard
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'tasks' && (
            <TasksPage
              setCurrentView={setCurrentView}
              onOpenMockMap={handleOpenMockMap}
              onOpenClaim={handleOpenClaim}
            />
          )}

          {currentView === 'my-claims' && (
            <MyClaimsPage
              onOpenMockMap={handleOpenMockMap}
              selectedClaimId={activeClaimId}
            />
          )}

          {currentView === 'mock-map' && activeMockMapTaskId && (
            <MockMapPage
              taskId={activeMockMapTaskId}
              onBack={() => setCurrentView('tasks')}
            />
          )}

          {currentView === 'wallet' && (
            <WalletPage
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'withdrawals' && (
            <WithdrawalsPage onNavigateToAdmin={() => setCurrentView('admin-withdrawals')} />
          )}

          {currentView === 'notifications' && (
            <NotificationsPage />
          )}

          {currentView === 'profile' && (
            <ProfilePage />
          )}

          {currentView === 'support' && (
            <SupportPage />
          )}

          {/* ADMIN VIEWS */}
          {currentView === 'admin-dashboard' && (
            <AdminDashboard
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'admin-users' && (
            <AdminUsers />
          )}

          {currentView === 'admin-tasks' && (
            <AdminTasks
              onOpenMockMap={handleOpenMockMap}
            />
          )}

          {currentView === 'admin-comment-pool' && (
            <AdminCommentPool />
          )}

          {currentView === 'admin-submissions' && (
            <AdminSubmissions />
          )}

          {currentView === 'admin-withdrawals' && (
            <AdminWithdrawals />
          )}

          {currentView === 'admin-transactions' && (
            <AdminTransactions />
          )}

          {currentView === 'admin-audit-logs' && (
            <AdminAuditLogs />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href={BRAND_CONFIG.whatsappDirectLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 md:bottom-6 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all group border border-emerald-400/40"
        title={`Message ${BRAND_CONFIG.supportWhatsApp} on WhatsApp`}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 fill-current" />
        </div>
        <span className="font-mono text-xs font-bold">{BRAND_CONFIG.supportWhatsApp}</span>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-700/80 text-[10px] font-bold uppercase tracking-wider">
          Message WhatsApp
        </span>
      </a>

      {/* Global Footer */}
      <Footer />

      {/* Modals */}
      <LoginModal />
      <RegisterModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
