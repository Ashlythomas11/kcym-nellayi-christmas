import React, { useState } from 'react';
import { Shield, Lock, UserRound, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { AdminUser } from '../../types';
import { getSupabaseClient, isSupabaseConfigured } from '../../services/supabaseClient';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Add your project URL and anon key to .env.local, then restart the dev server.');
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setError('Unable to initialize administrator sign-in. Please try again later.');
        return;
      }

      const { data, error: authError } = await supabase.functions.invoke<{
        access_token: string;
        refresh_token: string;
      }>('admin-username-login', {
        body: { username: username.trim().toLowerCase(), password },
      });

      if (authError || !data?.access_token || !data.refresh_token) {
        setError('Invalid username or password. Please try again.');
        return;
      }

      const { data: authData, error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError || !authData.user) {
        console.error('Failed to establish administrator session:', sessionError);
        setError('Unable to complete sign-in. Please try again.');
        return;
      }

      const role = authData.user.app_metadata?.role;
      if (role !== 'superadmin' && role !== 'organizer') {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Failed to sign out unauthorized account:', signOutError);
        setError('This account is not authorized to access the administrator portal.');
        return;
      }

      const fullName = authData.user.user_metadata?.full_name;
      const user: AdminUser = {
        email: authData.user.email ?? username.trim(),
        role,
        name: typeof fullName === 'string' ? fullName : authData.user.email ?? username.trim(),
      };
      onLoginSuccess(user);
    } catch (loginError) {
      console.error('Administrator sign-in failed:', loginError);
      setError('Unable to sign in right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-christmas-darkGreen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-christmas-ivory rounded-3xl p-8 shadow-2xl border-2 border-christmas-gold space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-christmas-emerald mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-christmas-emerald text-christmas-lightGold flex items-center justify-center border-2 border-christmas-gold shadow-gold-glow">
            <Shield className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl font-black text-christmas-emerald">
            Administrator Portal
          </h2>
          <p className="text-xs text-gray-600">
            KCYM St. Mary's Church, Nellayi • Prize Results Management
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-christmas-gold"
              />
              <UserRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Secure Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-christmas-gold"
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In Securely'}
          </button>
        </form>

        {/* Security Notice */}
        <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Restricted church administrator area. All actions are logged.</span>
        </div>

      </div>
    </div>
  );
};
