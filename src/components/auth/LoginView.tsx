import React, { useState } from 'react';
import { 
  Users, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  Info,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export const LoginView: React.FC = () => {
  const { login, usersList, switchUser } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = login(userId, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  const handleQuickLogin = (selectedUserId: string, selectedPassword: string) => {
    setError(null);
    setUserId(selectedUserId);
    setPassword(selectedPassword);
    const result = login(selectedUserId, selectedPassword);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg">
            EM
          </div>
        </div>
        <h2 className="mt-3 text-center text-xl sm:text-2xl font-bold tracking-tight text-white">
          EMPLOYEE <span className="text-blue-400">MANAGEMENT</span>
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 uppercase tracking-widest font-mono">
          Enterprise Suite v2.4 • High Density Access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 py-7 px-5 shadow-2xl rounded-xl sm:px-8 border border-slate-800 backdrop-blur-md">
          
          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-lg flex items-start space-x-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Error</p>
                <p className="text-[11px] mt-0.5 text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-3.5 text-xs" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="userId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                User ID (Changeable by Admin)
              </label>
              <div className="relative rounded">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. ADMIN01 or EMP101"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-9 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-1.5 py-2.5 px-4 rounded text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
              >
                <span>{isLoading ? 'Signing In...' : 'SIGN IN WITH USER ID'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick 1-Click Role Login Selector */}
          <div className="mt-5 border-t border-slate-800 pt-4 text-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                1-Click Multi-Level Demo Sign-In
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {usersList.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id, u.password)}
                  className="w-full text-left p-2 rounded border border-slate-800 hover:border-slate-700 bg-slate-800/60 hover:bg-slate-800 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-slate-200 group-hover:text-white truncate">
                        {u.name}
                      </span>
                      <span className="font-mono text-[9px] text-blue-400 bg-blue-950 px-1 py-0.5 rounded border border-blue-900">
                        {u.id}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{u.designation}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    u.role === 'admin' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {u.role === 'admin' ? 'Admin' : 'Employee'}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 p-2.5 bg-slate-800/80 border border-slate-700 rounded text-[10px] text-slate-400 flex items-start space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <p>
                <strong>Role Restrictions Policy:</strong> Regular employees can access <em>only their own assigned tasks and stats</em>. Admins have complete visibility, master data creation, and user management privileges.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
