import React from 'react';
import { Bell, Search, ChevronDown, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Active Institution</span>
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-slate-200 transition-colors">
              <span className="text-sm font-bold text-slate-800">KLS Gogte Institute of Technology, Belagavi</span>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </div>
        
        <div className="h-4 w-px bg-slate-200 mx-2" />
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-64 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Real-Time Lab Monitoring
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ZeroQueue Project v1.0.4</span>
        </div>

        <div className="relative flex items-center justify-center h-10 w-10 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all">
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
}
