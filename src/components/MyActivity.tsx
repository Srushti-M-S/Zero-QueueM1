import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, MapPin, CheckCircle2, QrCode, TrendingUp, History, User } from 'lucide-react';
import { useAuth } from '../services/authService';
import { getFirebase } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function MyActivity() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const { db } = getFirebase();

  useEffect(() => {
    if (!db || !user?.uid) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userSessions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          lab: 'Lab Terminal', // We could lookup lab name if we had static list or labId
          terminal: data.terminalId,
          date: data.startTime ? format(data.startTime.toDate(), 'MMM dd, HH:mm') : 'Recently',
          duration: `${data.duration}m`,
          status: data.status
        };
      });
      setSessions(userSessions);
    });

    return () => unsubscribe();
  }, [db, user]);

  const displaySessions = sessions.length > 0 ? sessions : [
    { lab: 'CS Advanced Lab', terminal: 'L1-T12', date: 'Today, 10:45 AM', duration: '2h 15m', status: 'Completed' },
    { lab: 'Graphics & Design Lab', terminal: 'L2-T04', date: 'Yesterday', duration: '1h 30m', status: 'Completed' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Card */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-500/20 mb-6">
                {user?.username?.substring(0, 2).toUpperCase() || 'SH'}
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.username || 'Sahana H.'}</h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Computer Science Dept.</p>
              
              <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Student Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
              <QrCode size={14} /> Quick Entry Pass
            </h3>
            <div className="aspect-square bg-white rounded-2xl p-4 flex items-center justify-center">
              <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZeroQueue-STUDENT-HASH-9921')] bg-contain bg-no-repeat bg-center opacity-90" />
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Scan at Lab Terminal for Instant Unlock</p>
          </div>
        </div>

        {/* Analytics & History */}
        <div className="lg:w-2/3 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <StatSmall label="Active Reservations" value="2" icon={<Calendar />} color="blue" />
            <StatSmall label="Total Lab Hours" value="12h 45m" icon={<Clock />} color="amber" />
            <StatSmall label="Avg. Productivity" value="92%" icon={<TrendingUp />} color="emerald" />
            <StatSmall label="Security Rank" value="#12" icon={<User />} color="indigo" />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <History size={18} className="text-slate-400" /> Recent Sessions
              </h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Download Log</button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {displaySessions.map((session, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">{session.lab}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Terminal: {session.terminal}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{session.date}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">Duration: {session.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatSmall({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'amber' | 'emerald' | 'indigo' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} flex items-center gap-4 shadow-sm`}>
      <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-xl font-black tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}
