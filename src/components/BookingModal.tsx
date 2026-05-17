import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Monitor, Calendar, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { type Terminal, type Lab } from '../types';
import { cn } from '../lib/utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminal: Terminal | null;
  lab: Lab | null;
  onSuccess?: () => void;
}

export default function BookingModal({ isOpen, onClose, terminal, lab, onSuccess }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [duration, setDuration] = useState(1);

  if (!terminal || !lab) return null;

  const handleBook = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/20"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="rounded-full bg-emerald-50 p-6 text-emerald-600 mb-6 shadow-inner"
                >
                  <CheckCircle2 size={64} />
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Allocation Secured</h3>
                <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                  Terminal <span className="font-bold text-slate-900">{terminal.id}</span> is now active for your session.
                </p>
                <div className="mt-8 pt-6 border-t border-slate-100 w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Initializing Cloud Environment...
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-slate-900 px-6 py-6 text-white relative">
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={onClose}
                      className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400 ring-1 ring-blue-400/30">
                      <Monitor size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Resource Allocation</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Terminal ID: {terminal.id}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-blue-600">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Infrastructure Compliance</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Infrastructure checks passed for <span className="font-bold text-slate-700">{lab.name}</span>. Standard acceptable use policies apply for {lab.location}.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Active Date</span>
                        </div>
                        <div className="text-sm font-bold text-slate-800">{format(new Date(), 'MMM dd, yyyy')}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <Clock size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Initialization</span>
                        </div>
                        <div className="text-sm font-bold text-slate-800">{format(new Date(), 'HH:mm')}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Select Session Duration</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 4].map((h) => (
                          <button
                            key={h}
                            onClick={() => setDuration(h)}
                            className={cn(
                              "rounded-xl py-3 text-sm font-bold transition-all border",
                              duration === h 
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" 
                                : "bg-white text-slate-900 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50"
                            )}
                          >
                            {h} Hour{h > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 shadow-inner">
                      <div className="text-amber-600 shrink-0">
                        <AlertCircle size={18} />
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        Please ensure binary snapshots are saved to cloud storage before the {duration}h timeout period expires.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button 
                      onClick={handleBook}
                      disabled={isSubmitting}
                      className={cn(
                        "w-full rounded-2xl py-4 text-sm font-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                        isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>ALLOCATING RESOURCE...</span>
                        </>
                      ) : (
                        <>
                          <Shield size={18} />
                          <span>INITIALIZE SESSION</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={onClose}
                      className="w-full rounded-2xl bg-white py-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-[0.2em]"
                    >
                      Abort Allocation
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
