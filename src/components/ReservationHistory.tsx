import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ArrowUpDown, Clock, Monitor, User, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, subDays } from 'date-fns';
import { type Terminal, type Lab } from '../types';
import { getFirebase } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface ReservationHistoryProps {
  terminals: Terminal[];
  labs: Lab[];
  key?: string | number;
}

export default function ReservationHistory({ terminals, labs }: ReservationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const { db } = getFirebase();

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'bookings'),
      orderBy('startTime', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        const lab = labs.find(l => l.id === data.labId);
        return {
          id: doc.id, // Use full document ID for uniqueness
          displayId: doc.id.substring(0, 8).toUpperCase(), 
          terminalId: data.terminalId,
          lab: lab?.name || 'Lab Resource',
          user: data.username || 'Student',
          date: data.startTime?.toDate() || new Date(),
          duration: `${data.duration || 60}m`,
          status: data.status as 'active' | 'completed' | 'cancelled'
        };
      });
      setDbHistory(history);
    }, (error) => {
      console.warn("History live sync paused:", error.message);
    });

    return () => unsubscribe();
  }, [db, labs]);

  // Combine mock completed history with current active terminals and DB history
  const activeSessions = terminals
    .filter(t => t.status === 'occupied' || t.status === 'booked')
    .filter(t => !dbHistory.some(h => h.terminalId === t.id && h.status === 'active')) // Avoid duplicates
    .map(t => {
      const lab = labs.find(l => l.id === t.labId);
      return {
        id: `ACT-${t.id}`,
        displayId: `ACT-${t.id.split('-').pop()}`,
        terminalId: t.id,
        lab: lab?.name || 'Unknown Lab',
        user: t.currentUserInitials ? `${t.currentUserInitials} (Student)` : 'Anonymous',
        date: new Date(),
        duration: t.remainingMinutes ? `${t.remainingMinutes}m left` : 'Active',
        status: 'active' as const
      };
    });

  const mockCompleted = [
    { id: 'HB-001', displayId: 'HB-001', terminalId: 'L1-T15', lab: labs[0]?.name || 'CS Advanced Lab', user: 'Marcus R.', date: subDays(new Date(), 0.1), duration: '2h', status: 'completed' as const },
    { id: 'HB-002', displayId: 'HB-002', terminalId: 'L2-T08', lab: labs[1]?.name || 'Graphics Lab', user: 'Eleanor V.', date: subDays(new Date(), 1), duration: '1h', status: 'completed' as const },
  ];

  const allHistory = [...dbHistory, ...activeSessions, ...mockCompleted].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const filteredHistory = allHistory.filter(item => 
    item.terminalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="text-blue-600" />
            Reservation History
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Trail & Session Logs</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-50">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">ID <ArrowUpDown size={10} className="inline ml-1" /></th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Scheduled</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="text-xs group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-400 font-bold">{item.displayId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Monitor size={14} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase tracking-tight">{item.terminalId}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{item.lab}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                         {item.user[0]}
                       </div>
                       <span className="font-bold text-slate-700">{item.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Calendar size={12} className="text-slate-300" />
                      {format(item.date, 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      item.status === 'completed' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                      item.status === 'active' && "bg-blue-50 text-blue-600 border-blue-100",
                      item.status === 'cancelled' && "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold font-mono">
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredHistory.length} records</p>
          <div className="flex gap-2">
             <button className="px-3 py-1 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-slate-600">Prev</button>
             <button className="px-3 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-blue-500">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
