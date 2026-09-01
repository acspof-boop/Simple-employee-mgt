import React, { useState } from 'react';
import { 
  CheckSquare, 
  BarChart3, 
  Database, 
  CalendarDays, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Download, 
  Lock, 
  Sparkles,
  Users,
  Menu,
  X,
  ChevronRight,
  Shield,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDataBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDataBackupModal,
}) => {
  const { currentUser, isAdmin, logout, switchUser, usersList } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'tasks': return 'Task Management';
      case 'reports': return 'Reports & Efficiency Analytics';
      case 'master_data': return 'Master Data & Permissions';
      case 'leaves': return 'Leave Management & Email Share';
      default: return 'Dashboard';
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">ADMIN (ALL ACCESS)</span>;
      case 'manager':
        return <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">MANAGER</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">EMPLOYEE (RESTRICTED)</span>;
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0f172a] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            EM
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">EMPLOYEE <span className="text-blue-400">MGMT</span></span>
            <span className="text-[9px] block text-slate-400 font-mono">v2.4 Enterprise</span>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* High Density Desktop Sidebar / Responsive Drawer */}
      <aside 
        className={`${
          mobileNavOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'
        } md:flex w-64 bg-[#0f172a] text-slate-300 flex-col shrink-0 md:sticky md:top-0 md:h-screen border-r border-slate-800 z-30 select-none`}
      >
        {/* Brand Banner */}
        <div className="p-5 border-b border-slate-800/90 bg-[#0b1120]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold tracking-tight text-lg flex items-center gap-1.5">
                EMPLOYEE <span className="text-blue-400">MGMT</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5 font-medium">
                Enterprise Suite v2.4
              </p>
            </div>
            <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-mono font-bold">
              PRO
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-5 text-xs">
          
          {/* Core Modules Section */}
          <div>
            <div className="px-5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Core Modules
            </div>
            <div className="mt-1 space-y-0.5">
              <button
                id="nav-task-management"
                onClick={() => {
                  setActiveTab('tasks');
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center px-5 py-2.5 transition-all text-left ${
                  activeTab === 'tasks'
                    ? 'text-white bg-blue-600/15 border-r-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CheckSquare className={`w-4 h-4 mr-3 ${activeTab === 'tasks' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Task Management</span>
              </button>

              <button
                id="nav-reports"
                onClick={() => {
                  setActiveTab('reports');
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center px-5 py-2.5 transition-all text-left ${
                  activeTab === 'reports'
                    ? 'text-white bg-blue-600/15 border-r-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className={`w-4 h-4 mr-3 ${activeTab === 'reports' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Reports & Analytics</span>
              </button>

              <button
                id="nav-leaves"
                onClick={() => {
                  setActiveTab('leaves');
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center px-5 py-2.5 transition-all text-left ${
                  activeTab === 'leaves'
                    ? 'text-white bg-blue-600/15 border-r-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CalendarDays className={`w-4 h-4 mr-3 ${activeTab === 'leaves' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>Leave & Email Share</span>
              </button>
            </div>
          </div>

          {/* Administration Section */}
          <div>
            <div className="px-5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Administration
            </div>
            <div className="mt-1 space-y-0.5">
              <button
                id="nav-master-data"
                onClick={() => {
                  if (isAdmin) {
                    setActiveTab('master_data');
                    setMobileNavOpen(false);
                  }
                }}
                disabled={!isAdmin}
                title={isAdmin ? 'Master Data Management' : 'Admin access required'}
                className={`w-full flex items-center justify-between px-5 py-2.5 transition-all text-left ${
                  !isAdmin
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : activeTab === 'master_data'
                    ? 'text-white bg-blue-600/15 border-r-4 border-blue-500 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center">
                  <Database className={`w-4 h-4 mr-3 ${activeTab === 'master_data' ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>Master Data</span>
                </div>
                {!isAdmin && <Lock className="w-3 h-3 text-slate-600" />}
              </button>

              <button
                onClick={() => {
                  onOpenDataBackupModal();
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-left"
              >
                <Download className="w-4 h-4 mr-3 text-slate-400" />
                <span>Backup & Audit Logs</span>
              </button>
            </div>
          </div>

          {/* Quick Info & Security Matrix */}
          <div className="px-4 pt-2">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/60 text-[11px] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Data Isolation Policy</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {isAdmin 
                  ? 'Admin access: Full visibility across all employee records.' 
                  : 'Employee access: Restricted exclusively to self-assigned tasks and leave logs.'}
              </p>
            </div>
          </div>

        </nav>

        {/* Sidebar Footer User Badge */}
        <div className="p-3.5 mt-auto border-t border-slate-800 bg-[#0b1120] relative">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 cursor-pointer group flex-1 min-w-0 pr-2"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {currentUser?.id} • {isAdmin ? 'Admin View' : 'Employee'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="User menu & Quick Switch"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>

          {/* Quick Switch Dropdown Popover */}
          {showUserMenu && (
            <div 
              className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-300 space-y-2.5"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="border-b border-slate-800 pb-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Session</p>
                <p className="font-bold text-white text-sm">{currentUser?.name}</p>
                <div className="mt-1">{getRoleBadge(currentUser?.role)}</div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  1-Click Role Switcher
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {usersList.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between transition-colors ${
                        u.id === currentUser?.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate">{u.name} <span className="opacity-60 text-[10px]">({u.id})</span></span>
                      <span className="text-[9px] uppercase font-mono px-1 rounded bg-black/30">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between">
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 text-red-400 hover:text-red-300 text-xs font-semibold py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={onOpenDataBackupModal}
                  className="text-blue-400 hover:text-blue-300 text-xs font-semibold py-1"
                >
                  Backup DB
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Top Header Bar for Desktop View */}
      <div className="hidden md:flex h-14 bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="text-slate-400">Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{getTabLabel(activeTab)}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Current Data View</div>
            <div className="text-xs text-blue-600 font-bold">
              {isAdmin 
                ? 'All Employees (Global System View)' 
                : `Private View (${currentUser?.name} - ${currentUser?.id})`}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDataBackupModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-colors border border-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Snapshot Backup</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
