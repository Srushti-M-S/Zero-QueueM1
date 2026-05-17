import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { getFirebase } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, onSnapshot, orderBy, limit, where, getDocs } from 'firebase/firestore';
import Header from './Header';
import Sidebar, { type SidebarView } from './Sidebar';
import LabCard from './LabCard';
import TerminalGrid from './TerminalGrid';
import BookingModal from './BookingModal';
import ReservationHistory from './ReservationHistory';
import ProjectInfo from './ProjectInfo';
import MyActivity from './MyActivity';
import { ToastContainer, type ToastType } from './Toast';
import { MOCK_LABS, MOCK_TERMINALS } from '../lib/mockData';
import { type Lab, type Terminal, type TerminalStatus } from '../types';
import { useAuth } from '../services/authService';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ArrowLeft, Info, Activity, TrendingUp, Users, Clock, ShieldCheck } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<SidebarView>('overview');
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [terminalToRelease, setTerminalToRelease] = useState<Terminal | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [labs, setLabs] = useState<Lab[]>(MOCK_LABS);
  const [terminals, setTerminals] = useState<Terminal[]>(MOCK_TERMINALS);

  // Derived Labs with actual occupancy from terminals
  const labsWithOccupancy = labs.map(lab => ({
    ...lab,
    currentOccupancy: terminals.filter(t => t.labId === lab.id && t.status !== 'available').length
  }));

  // Derived Stats
  const totalTerminals = terminals.length;
  const occupiedTerminalsCount = terminals.filter(t => t.status === 'occupied' || t.status === 'booked').length;
  const avgUtilization = ((occupiedTerminalsCount / totalTerminals) * 100).toFixed(1);

  // Quick Stats config
  const quickStats = [
    { label: 'Avg. Utilization', value: `${avgUtilization}%`, trend: '+12%', icon: <TrendingUp />, color: 'emerald' },
    { label: 'Active Terminals', value: occupiedTerminalsCount.toLocaleString(), trend: 'Live', icon: <Users />, color: 'slate' },
    { label: 'Avg. Stay Duration', value: '42m', trend: '-1.5%', icon: <Clock />, color: 'rose' },
    { label: 'Security Health', value: '99.9%', trend: 'Verified', icon: <ShieldCheck />, color: 'emerald' },
  ];

  // Ref for manually booked terminals to prevent simulation overwriting them
  const [manualBookings, setManualBookings] = useState<Set<string>>(new Set());

  // Welcome Toast for Lead Developer
  useEffect(() => {
    if (user?.username === 'Srushti_S') {
      const timer = setTimeout(() => {
        addToast('Welcome Lead Developer Srushti. Hackathon Mode is ACTIVE.', 'info');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Mock real-time logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly change a terminal status
      setTerminals(prev => {
        let changedLabId: string | null = null;
        
        const next = prev.map(t => {
          // DO NOT simulate status changes for terminals that are currently in 'booked' state or manually locked
          if (manualBookings.has(t.id) || t.status === 'booked') return t;

          if (Math.random() > 0.95 && t.status !== 'maintenance') {
            const statuses: TerminalStatus[] = ['available', 'occupied'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            // If it becomes available, mark for checking notifications
            if (newStatus === 'available' && t.status !== 'available') {
              changedLabId = t.labId;
            }

            return { 
              ...t, 
              status: newStatus,
              currentUserInitials: newStatus === 'occupied' ? 'JS' : undefined,
              remainingMinutes: undefined
            };
          }
          return t;
        });

        // If a seat became available naturally, notify someone
        if (changedLabId && db) {
          const checkNotif = async () => {
             const notifQ = query(
              collection(db, 'notification_requests'),
              where('labId', '==', changedLabId),
              where('status', '==', 'pending'),
              limit(1)
            );
            const snapshot = await getDocs(notifQ);
            snapshot.forEach(async (d) => {
              await setDoc(d.ref, { status: 'notified', updatedAt: serverTimestamp() }, { merge: true });
            });
          };
          checkNotif().catch(console.error);
        }

        return next;
      });
    }, 10000); // Slower simulation for better UX
    return () => clearInterval(interval);
  }, [manualBookings]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleTerminalClick = (terminal: Terminal) => {
    // If admin, they can release any seat
    if (user?.role === 'admin' && (terminal.status === 'occupied' || terminal.status === 'booked')) {
      setTerminalToRelease(terminal);
      setIsReleaseModalOpen(true);
      return;
    }

    if (terminal.status === 'available') {
      setSelectedTerminal(terminal);
      setIsBookingModalOpen(true);
    }
  };

  const { auth, db } = getFirebase();

  // Notification logic: Listen to user's notifications
  useEffect(() => {
    if (!db || !user?.uid) return;

    const q = query(
      collection(db, 'notification_requests'),
      where('userId', '==', user.uid),
      where('status', '==', 'notified'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          addToast(`SEAT AVAILABLE: A slot has opened up in ${data.labName}!`, 'success');
          // Optionally mark as expired or seen
          setDoc(change.doc.ref, { status: 'expired' }, { merge: true });
        }
      });
    });

    return () => unsubscribe();
  }, [db, user]);

  const handleNotifyMe = async (lab: Lab) => {
    if (!db || !user?.uid) return;

    try {
      const requestId = `notif_${user.uid}_${lab.id}`;
      await setDoc(doc(db, 'notification_requests', requestId), {
        userId: user.uid,
        username: user.username,
        labId: lab.id,
        labName: lab.name,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      addToast(`We'll notify you as soon as a seat opens in ${lab.name}.`, 'info');
    } catch (err) {
      console.error('Error setting notification:', err);
      addToast('Failed to set notification. Try again.', 'error');
    }
  };

  // Forceful release also updates Firestore and checks for notifications
  const forceReleaseTerminal = async (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId);
    const labId = terminal?.labId;

    setTerminals(prev => prev.map(t => 
      t.id === terminalId ? { ...t, status: 'available', currentUserInitials: undefined, remainingMinutes: undefined } : t
    ));
    setManualBookings(prev => {
      const next = new Set(prev);
      next.delete(terminalId);
      return next;
    });

    if (db) {
      try {
        // Track the release in logs
        const logRef = doc(db, 'access_logs', `release_${terminalId}_${Date.now()}`);
        await setDoc(logRef, {
          userId: user?.uid || 'guest',
          username: user?.username || 'Admin',
          timestamp: serverTimestamp(),
          action: 'force_release',
          details: `Terminal ${terminalId} released by admin`
        });

        // Cancel active bookings for this terminal in database
        const q = query(collection(db, 'bookings'), where('terminalId', '==', terminalId), where('status', '==', 'active'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.forEach(async (d) => {
            await setDoc(d.ref, { status: 'cancelled', updatedAt: serverTimestamp() }, { merge: true });
          });
          unsubscribe(); // Run once
        });

        // PROACTIVE NOTIFICATION: Notify pending users for this lab
        if (labId) {
          const notifQ = query(
            collection(db, 'notification_requests'),
            where('labId', '==', labId),
            where('status', '==', 'pending'),
            limit(1)
          );
          const unsubNotif = onSnapshot(notifQ, (snapshot) => {
            snapshot.forEach(async (d) => {
              await setDoc(d.ref, { status: 'notified', updatedAt: serverTimestamp() }, { merge: true });
            });
            unsubNotif();
          });
        }
        
        addToast(`Terminal ${terminalId} released and cloud synchronized.`, 'info');
      } catch (err) {
        console.error('Error logging release:', err);
        addToast(`Released locally, but cloud sync failed.`, 'error');
      }
    } else {
      addToast(`Terminal ${terminalId} has been forcefully released locally.`, 'info');
    }
  };

  const handleBookingSuccess = async () => {
    if (selectedTerminal && selectedLab) {
      const terminalId = selectedTerminal.id;
      const initials = user?.username?.substring(0, 2).toUpperCase() || 'ST';
      
      // Update Terminals state immediately
      setTerminals(prev => prev.map(t => 
        t.id === terminalId 
          ? { ...t, status: 'booked', remainingMinutes: 60, currentUserInitials: initials } 
          : t
      ));
      
      setManualBookings(prev => new Set(prev).add(terminalId));

      // Save to Firebase
      if (db && user?.uid) {
        try {
          const bookingId = `${terminalId}_${Date.now()}`;
          const bookingRef = doc(db, 'bookings', bookingId);
          await setDoc(bookingRef, {
            terminalId,
            labId: selectedLab.id,
            userId: user.uid,
            username: user.username,
            startTime: serverTimestamp(),
            duration: 60,
            status: 'active'
          });

          const logRef = doc(db, 'access_logs', `book_${bookingId}`);
          await setDoc(logRef, {
            userId: user.uid,
            username: user.username,
            timestamp: serverTimestamp(),
            action: 'book_seat',
            details: `Booked ${terminalId} in ${selectedLab.name}`
          });
          
          addToast(`Booking synchronized with Cloud Database.`, 'success');
        } catch (err) {
          console.error('Firebase booking error:', err);
          addToast(`Terminal allocated locally. Cloud sync failed.`, 'error');
        }
      } else {
        addToast(`Terminal ${terminalId} successfully allocated in ${selectedLab.name}.`, 'success');
      }
    }
    setIsBookingModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {currentView === 'activity' ? (
              <MyActivity key="activity" />
            ) : currentView === 'info' ? (
              <ProjectInfo key="info" />
            ) : currentView === 'history' ? (
              <ReservationHistory key="history" terminals={terminals} labs={labs} />
            ) : !selectedLab ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex flex-col gap-8 max-w-7xl mx-auto"
              >
                {/* Header Row */}
                <section className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      Campus <span className="text-blue-600">Intelligence</span>
                    </h1>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Real-time Resource Management</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
                      <Filter size={16} /> Filters
                    </button>
                    {user?.role === 'admin' && (
                      <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
                        Export Report
                      </button>
                    )}
                  </div>
                </section>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {quickStats.map((stat, i) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 p-4 text-slate-100 group-hover:text-slate-200 transition-colors">
                        {React.cloneElement(stat.icon as React.ReactElement, { size: 48 })}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                      <div className="flex items-end gap-2 mt-2 relative z-10">
                        <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                        <span className={cn(
                          "text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded-md",
                          stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : stat.color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {stat.trend}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Main Body Split */}
                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                  {/* Table area style (Labs Grid) */}
                  <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 tracking-tight">Active Laboratories</h3>
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-600/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE
                        </div>
                      </div>
                      <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">View All Labs</button>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {labsWithOccupancy.map((lab, i) => (
                          <motion.div
                            key={lab.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                          >
                            <LabCard lab={lab} onClick={() => setSelectedLab(lab)} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Activity Panel */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 overflow-hidden relative">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 font-mono">Institutional Health</h3>
                      <div className="space-y-6">
                        {[
                          { label: 'Seat Utilization', value: 88, color: 'bg-blue-500' },
                          { label: 'System Uptime', value: 99.9, color: 'bg-emerald-500' },
                          { label: 'Faculty Availability', value: 92, color: 'bg-emerald-500' },
                          { label: 'Incident Resolution', value: 74, color: 'bg-amber-500' },
                        ].map((metric) => (
                          <div key={metric.label}>
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-2">
                              <span className="text-slate-300">{metric.label}</span>
                              <span className="text-white">{metric.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                className={cn("h-full rounded-full transition-all duration-1000", metric.color)} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-800">
                        <p className="text-[10px] text-slate-500 italic font-medium tracking-tight">Last Sync: 14:00 Today • Ver 2.4.0</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em] mb-4">System Alerts</h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                          <div className="flex-shrink-0 w-2 h-2 bg-rose-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="text-[11px] font-bold text-rose-900 uppercase tracking-tight">Server Maintenance</p>
                            <p className="text-[10px] text-rose-700 font-medium">Scheduled for Tonight at 11:30 PM</p>
                          </div>
                        </div>
                        <div className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Cache Flushed</p>
                            <p className="text-[10px] text-slate-500 font-medium">Lab snapshots updated successfully</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8 max-w-7xl mx-auto"
              >
                <nav className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedLab(null)}
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 transition-all active:scale-90"
                  >
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{selectedLab.name}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">{selectedLab.location}</p>
                  </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm technical-grid overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-tighter">Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-tighter">Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-10">
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Infrastructure Layout</h2>
                        <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-[0.2em] mt-1">Terminal Grid Mapping</p>
                      </div>
                      
                      {terminals.filter(t => t.labId === selectedLab.id).every(t => t.status !== 'available') && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                              <Info size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-amber-900">Lab is currently at full capacity.</p>
                              <p className="text-xs text-amber-700 font-medium tracking-tight">Don't wait around—we can alert you instantly.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleNotifyMe(selectedLab)}
                            className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95"
                          >
                            NOTIFY ME WHEN FREE
                          </button>
                        </motion.div>
                      )}

                      <TerminalGrid 
                        terminals={terminals.filter(t => t.labId === selectedLab.id)} 
                        onTerminalClick={handleTerminalClick}
                      />
                    </div>
                  </div>

                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">
                          <Info size={14} className="text-blue-500" /> Hardware Profile
                        </h3>
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => {
                              const cpu = window.prompt("Enter new CPU:", "Intel Core i9-14900K • 24-Core");
                              const ram = window.prompt("Enter new Memory:", "64GB DDR5 6000MHz Low-Latency");
                              if (cpu && ram) {
                                // In a real app we'd update DB. Here we update local state.
                                addToast("Hardware profile updated locally.", "info");
                              }
                            }}
                            className="text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-1">Processors</div>
                          <div className="text-sm font-bold text-slate-800 tracking-tight">Intel Core i9-14900K • 24-Core</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-1">Memory</div>
                          <div className="text-sm font-bold text-slate-800 tracking-tight">64GB DDR5 6000MHz Low-Latency</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-1">Graphics</div>
                          <div className="text-sm font-bold text-slate-800 tracking-tight">RTX 4090 Workstation Edition</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-900 bg-slate-900 p-6 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                          <Activity size={14} className="text-blue-400" /> Software Stack
                        </h3>
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => {
                              const newSuite = window.prompt("Enter new software to add:");
                              if (newSuite && selectedLab) {
                                setLabs(prev => prev.map(l => 
                                  l.id === selectedLab.id 
                                    ? { ...l, software: [...l.software, newSuite] }
                                    : l
                                ));
                                setSelectedLab({ ...selectedLab, software: [...selectedLab.software, newSuite] });
                                addToast(`${newSuite} added to stack.`, "success");
                              }
                            }}
                            className="text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:underline"
                          >
                            Add
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedLab.software.map(s => (
                          <span key={s} className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-[10px] font-bold text-slate-200 border border-slate-700/50 uppercase tracking-tighter transition-all hover:bg-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <BookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)}
            terminal={selectedTerminal}
            lab={selectedLab}
            onSuccess={handleBookingSuccess}
          />

          <AnimatePresence>
            {isReleaseModalOpen && terminalToRelease && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-900/40 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6 mx-auto">
                      <ShieldCheck size={32} />
                    </div>
                    
                    <h3 className="text-2xl font-black text-center text-slate-900 mb-2">FORCE RELEASE?</h3>
                    <p className="text-slate-500 text-center font-medium mb-8">
                      You are about to terminate the session for <span className="text-slate-900 font-bold">{terminalToRelease.id}</span>. This action will make the seat available immediately.
                    </p>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          forceReleaseTerminal(terminalToRelease.id);
                          setIsReleaseModalOpen(false);
                        }}
                        className="w-full bg-rose-600 text-white rounded-2xl py-4 font-black hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-600/20"
                      >
                        YES, RELEASE TERMINAL
                      </button>
                      <button
                        onClick={() => setIsReleaseModalOpen(false)}
                        className="w-full bg-slate-100 text-slate-600 rounded-2xl py-4 font-black hover:bg-slate-200 transition-all"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Authorization Required</span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </main>
      </div>
    </div>
  );
}
