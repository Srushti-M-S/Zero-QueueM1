import React, { useState } from 'react';
import { useAuth } from '../services/authService';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Student check
      if (username.toLowerCase().endsWith('@git.edu')) {
        if (password.length >= 8) {
          await login(username.split('@')[0], 'student');
          return;
        }
        setError('Password must be at least 8 characters.');
      } else if (username === 'Srushti_S' && password === 'admin@ZQ') {
        await login(username, 'admin');
        return;
      } else {
        setError('Invalid credentials or unauthorized domain. Use @git.edu for Student access.');
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-blue-600/20">
                <div className="w-full h-full bg-white rounded-[2px]" />
              </div>
              <span className="text-slate-900 font-black text-2xl tracking-tighter">
                Zero<span className="text-blue-600">Queue</span>
              </span>
            </div>
            {/* <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[8px] font-black text-amber-600 uppercase tracking-widest">
              .
            </div> */}
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Access</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">KLS GIT Institutional Credentials Required.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Institutional ID / Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                placeholder="e.g. sahana@git.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'VERIFYING...' : 'SIGN IN TO DASHBOARD'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional SSO</span>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">Support</button>
        </div>
      </motion.div>
    </div>
  );
}
