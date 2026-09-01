import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LoginView } from './components/auth/LoginView';
import { TaskManager } from './components/tasks/TaskManager';
import { ReportsView } from './components/reports/ReportsView';
import { MasterDataView } from './components/master/MasterDataView';
import { LeaveManager } from './components/leaves/LeaveManager';
import { DataBackupModal } from './components/layout/DataBackupModal';
import { ActiveTab } from './types';
import { LogOut, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isRestricted, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // If no user is authenticated, display login screen
  if (!currentUser) {
    return <LoginView />;
  }

  // If user account is restricted by administrator
  if (isRestricted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-xl border border-red-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Account Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your employee account (<span className="font-mono font-bold text-slate-800">{currentUser.id}</span> - {currentUser.name}) has been restricted by the Administrator. You cannot access tasks or reports at this time.
          </p>
          <div className="pt-2">
            <button
              onClick={logout}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      {/* High Density Navigation Sidebar & Mobile Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDataBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'master_data' && <MasterDataView />}
          {activeTab === 'leaves' && <LeaveManager />}
        </main>

        {/* High Density Footer */}
        <footer className="border-t border-slate-200 bg-white py-3 px-6 text-xs text-slate-500 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-[11px]">EMPLOYEE MGMT</span>
              <span className="text-[10px] text-slate-400 font-mono">v2.4 Enterprise Suite</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">High-Density Multi-Role System</span>
            </div>
            <p className="font-mono text-[10px] text-slate-400">
              Active: {currentUser.name} ({currentUser.id}) | {currentUser.role.toUpperCase()}
            </p>
          </div>
        </footer>
      </div>

      {/* Backup & Audit Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
