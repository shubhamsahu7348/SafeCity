import React from 'react';
import {
  ShieldAlert,
  MapPin,
  PlusCircle,
  Search,
  BarChart3,
  Flame,
  UserCheck,
  Building2,
  HardHat,
  Settings,
  Info,
  Radio,
  Layers,
  LogOut,
  Lock,
  Home,
} from 'lucide-react';
import { UserRole, UserAccount } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: UserAccount | null;
  onRequestLogin: (role: UserRole) => void;
  onLogout: () => void;
  onEditProfile?: () => void;
  emergencyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  currentUser,
  onRequestLogin,
  onLogout,
  onEditProfile,
  emergencyCount,
}) => {
  const handleRoleClick = (targetRole: UserRole) => {
    if (targetRole === 'citizen') {
      setUserRole('citizen');
      setActiveTab('landing');
      return;
    }

    // Check if user is already logged in as targetRole or admin
    if (currentUser && (currentUser.role === targetRole || currentUser.role === 'admin')) {
      setUserRole(targetRole);
      if (targetRole === 'officer') setActiveTab('department');
      if (targetRole === 'worker') setActiveTab('worker');
      if (targetRole === 'admin') setActiveTab('admin');
    } else {
      onRequestLogin(targetRole);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-indigo-900/50 text-white shadow-xl">
      {/* Top Banner Bar for Emergency Alerts & Role Switcher */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-4 py-2 text-xs border-b border-indigo-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm">
            <Radio className="w-3 h-3 mr-1.5 animate-pulse text-cyan-400" />
            LIVE CITY INTEL
          </span>

          {emergencyCount > 0 ? (
            <button
              onClick={() => {
                if (userRole === 'citizen') {
                  onRequestLogin('officer');
                } else {
                  setActiveTab('department');
                }
              }}
              className="flex items-center text-rose-300 font-bold hover:underline bg-rose-950/70 border border-rose-500/50 px-2.5 py-0.5 rounded-full shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 mr-1 text-rose-500 animate-bounce" />
              <span>{emergencyCount} Emergency Hazard{emergencyCount > 1 ? 's' : ''} Active</span>
            </button>
          ) : (
            <span className="text-slate-400 font-medium">
              All critical hazards cleared or under response
            </span>
          )}
        </div>

        {/* Account Status / Role Switcher */}
        <div className="flex items-center space-x-3">
          {currentUser && (
            <div className="flex items-center space-x-2 bg-indigo-950/90 border border-indigo-700/80 px-3 py-1 rounded-xl text-[11px] shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-extrabold text-white">{currentUser.name}</span>
              <span className="px-1.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded font-mono uppercase text-[9px] font-bold">
                {currentUser.role}
              </span>
              
              {onEditProfile && currentUser.role !== 'worker' && (
                <button
                  onClick={onEditProfile}
                  title="Edit Profile Credentials"
                  className="ml-1 px-2 py-0.5 bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 border border-indigo-600/60 rounded-lg flex items-center space-x-1 font-bold transition-all active:scale-95"
                >
                  <UserCheck className="w-3 h-3 text-cyan-400" />
                  <span>Edit Profile</span>
                </button>
              )}

              <button
                onClick={onLogout}
                title="Sign Out Account"
                className="px-2 py-0.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-lg flex items-center space-x-1 font-bold transition-all active:scale-95"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <div className="inline-flex p-0.5 bg-slate-900/90 rounded-xl border border-indigo-800/50 shadow-inner">
            <button
              onClick={() => handleRoleClick('citizen')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 font-bold text-[11px] ${
                userRole === 'citizen'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => handleRoleClick('officer')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 font-bold text-[11px] ${
                userRole === 'officer'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Officer</span>
              {(!currentUser || currentUser.role !== 'officer') && userRole !== 'officer' && (
                <Lock className="w-2.5 h-2.5 ml-0.5 text-amber-300" />
              )}
            </button>
            <button
              onClick={() => handleRoleClick('worker')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 font-bold text-[11px] ${
                userRole === 'worker'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardHat className="w-3 h-3" />
              <span>Field Worker</span>
              {(!currentUser || currentUser.role !== 'worker') && userRole !== 'worker' && (
                <Lock className="w-2.5 h-2.5 ml-0.5 text-emerald-300" />
              )}
            </button>
            <button
              onClick={() => handleRoleClick('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 font-bold text-[11px] ${
                userRole === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>Admin</span>
              {(!currentUser || currentUser.role !== 'admin') && userRole !== 'admin' && (
                <Lock className="w-2.5 h-2.5 ml-0.5 text-purple-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2 bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 rounded-xl shadow-md group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-200 bg-clip-text text-transparent">
                  SafeCity
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 rounded-full shadow-sm">
                  AI Platform
                </span>
              </div>
              <p className="text-[11px] text-indigo-300/80 font-medium hidden sm:block">
                Public Hazard Intelligence & Operations
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'landing'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'report'
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25 border border-indigo-500/30'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-cyan-300" />
              <span>Report Hazard</span>
            </button>

            <button
              onClick={() => setActiveTab('live-map')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'live-map'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Live Hazard Map</span>
            </button>

            <button
              onClick={() => setActiveTab('risk-heatmap')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'risk-heatmap'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>GIS Heatmap</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'track'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Track Complaint</span>
            </button>

            {(userRole === 'officer' || currentUser?.role === 'officer' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('department')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'department'
                    ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Dept Portal</span>
              </button>
            )}

            {(userRole === 'worker' || currentUser?.role === 'worker' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('worker')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'worker'
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <HardHat className="w-4 h-4 text-emerald-400" />
                <span>Worker Tasks</span>
              </button>
            )}

            {(userRole === 'admin' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 text-slate-400" />
              <span>About / Arch</span>
            </button>
          </nav>

          {/* Quick Primary Action Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('report')}
              className="lg:hidden px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 text-white flex items-center space-x-1 shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Secondary Mobile Tabs */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2.5 border-t border-slate-800/80 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center space-x-1 ${
              activeTab === 'landing' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('live-map')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'live-map' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('risk-heatmap')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'risk-heatmap' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            GIS Heatmap
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'track' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            Track ID
          </button>
          {(userRole === 'officer' || currentUser?.role === 'officer' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('department')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'department' ? 'bg-amber-600 text-white' : 'text-slate-300'
              }`}
            >
              Dept View
            </button>
          )}
          {(userRole === 'worker' || currentUser?.role === 'worker' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('worker')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'worker' ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}
            >
              Worker View
            </button>
          )}
          {(userRole === 'admin' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-300'
              }`}
            >
              Admin View
            </button>
          )}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
};
