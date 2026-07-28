import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldAlert, X, ChevronDown, ChevronUp, Sparkles, Building2, HardHat, Settings, CheckCircle2 } from 'lucide-react';
import { UserRole, UserAccount } from '../types';

interface LoginModalProps {
  targetRole: UserRole;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onGoHome?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  targetRole,
  onClose,
  onLoginSuccess,
  onGoHome,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState<boolean>(true);

  // Quick preset accounts for instant testing
  const demoAccounts = [
    {
      role: 'admin',
      label: 'System Admin',
      username: 'admin',
      password: 'admin123',
      dept: 'Full System Control',
    },
    {
      role: 'officer',
      label: 'Officer Sarah Jenkins',
      username: 'officer.jenkins',
      password: 'officer123',
      dept: 'Electricity Department',
    },
    {
      role: 'officer',
      label: 'Officer Robert Chen',
      username: 'officer.chen',
      password: 'officer123',
      dept: 'Road Department',
    },
    {
      role: 'worker',
      label: 'Marcus Vance (Grid Tech)',
      username: 'marcus.vance',
      password: 'worker123',
      dept: 'Electricity Department',
    },
    {
      role: 'worker',
      label: 'David Miller (Asphalt Crew)',
      username: 'david.miller',
      password: 'worker123',
      dept: 'Road Department',
    },
    {
      role: 'worker',
      label: 'Elena Rostova (Hydro Squad)',
      username: 'elena.rostova',
      password: 'worker123',
      dept: 'Water & Sewerage',
    },
  ];

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          targetRole,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setErrorMsg('Unable to connect to authentication server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleHeader = () => {
    switch (targetRole) {
      case 'officer':
        return {
          title: 'Department Officer Login',
          subtitle: 'Verify citizen complaints, dispatch workers, and manage department roster',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Building2 className="w-6 h-6 text-amber-400" />,
        };
      case 'worker':
        return {
          title: 'Field Worker Login',
          subtitle: 'Access assigned maintenance tasks, upload repair evidence, and run AI audits',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
          icon: <HardHat className="w-6 h-6 text-emerald-400" />,
        };
      case 'admin':
        return {
          title: 'System Administrator Login',
          subtitle: 'Full platform management: Officer accounts, worker credentials & AI parameters',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Settings className="w-6 h-6 text-purple-400" />,
        };
      default:
        return {
          title: 'Account Authentication',
          subtitle: 'Enter your credentials to access secured operations portal',
          badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: <Lock className="w-6 h-6 text-indigo-400" />,
        };
    }
  };

  const headerInfo = getRoleHeader();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white space-y-3 relative border-b border-indigo-900/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-900/80 rounded-2xl border border-indigo-800/60 shadow-md">
              {headerInfo.icon}
            </div>
            <div>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${headerInfo.badgeClass}`}>
                {targetRole.toUpperCase()} PORTAL
              </span>
              <h2 className="text-xl font-black text-white mt-1">{headerInfo.title}</h2>
            </div>
          </div>
          <p className="text-xs text-indigo-200/90 font-medium leading-relaxed">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-rose-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. officer.jenkins or admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Collapsible Demo Quick Credentials Helper */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full flex items-center justify-between text-xs font-black text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 p-2.5 rounded-xl border border-indigo-200 transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Quick Demo Accounts (1-Click Auto-Fill)</span>
              </span>
              {showDemoCredentials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemoCredentials && (
              <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
                {demoAccounts
                  .filter((acc) => acc.role === targetRole)
                  .map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFill(acc.username, acc.password)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-left flex items-center justify-between transition-all text-xs group"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 flex items-center space-x-1.5">
                          <span>{acc.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">({acc.dept})</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Username: <strong className="text-slate-800">{acc.username}</strong> | Pass: <strong className="text-slate-800">{acc.password}</strong>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        Fill
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
