import React from 'react';
import { LayoutDashboard, Users, GraduationCap, CreditCard, Settings, ChevronRight, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../services/authService';

export type SidebarView = 'overview' | 'history' | 'labs' | 'settings' | 'info' | 'activity';

interface SidebarProps {
  currentView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
      "group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
        : "text-slate-400 hover:text-white hover:bg-slate-800"
    )}>
      <div className={cn("transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span className="font-semibold text-sm tracking-tight">{label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center p-1.5 shadow-lg shadow-blue-500/30">
          <div className="w-full h-full bg-white rounded-[2px]" />
        </div>
        <span className="text-white font-black text-xl tracking-tighter">
          Zero<span className="text-blue-400">Queue</span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Management</div>
        <SidebarItem 
          icon={<LayoutDashboard />} 
          label="Overview" 
          isActive={currentView === 'overview'} 
          onClick={() => onViewChange('overview')}
        />

        {user?.role === 'admin' && (
          <>
            <div className="mt-8 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Admin Section</div>
            <SidebarItem 
              icon={<Users />} 
              label="Institutions" 
            />
            <SidebarItem 
              icon={<GraduationCap />} 
              label="Lab Resources" 
              isActive={currentView === 'history'}
              onClick={() => onViewChange('history')}
            />
            <SidebarItem 
              icon={<CreditCard />} 
              label="Access Logs" 
            />
          </>
        )}
        
        <div className="mt-8 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
          Personal
        </div>
        <SidebarItem 
          icon={<UserCircle className="text-blue-400" />} 
          label="My Activity" 
          isActive={currentView === 'activity'}
          onClick={() => onViewChange('activity')}
        />

        <div className="mt-8 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">System</div>
        <SidebarItem 
          icon={<ShieldCheck className="text-emerald-400" />} 
          label="Project Insights" 
          isActive={currentView === 'info'}
          onClick={() => onViewChange('info')}
        />
        <div className="my-6 h-px bg-slate-800 mx-2 opacity-50" />
        <SidebarItem 
          icon={<Settings />} 
          label="System Config" 
        />
      </nav>

      <div className="p-6 space-y-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border shadow-lg",
            user?.role === 'admin' ? "bg-blue-600 border-blue-400 shadow-blue-600/20" : "bg-emerald-600 border-emerald-400 shadow-emerald-600/20"
          )}>
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-none truncate">{user?.username || 'Srushti S.'}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">
              {user?.role === 'admin' ? 'Lead Developer' : 'GIT Student'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
        >
          <LogOut size={14} />
          <span>Secure Logout</span>
        </button>
      </div>
    </aside>
  );
}
