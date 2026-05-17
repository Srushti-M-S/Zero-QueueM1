import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[300px]",
        type === 'success' && "bg-white border-emerald-100 text-slate-900 shadow-emerald-500/10",
        type === 'error' && "bg-white border-rose-100 text-slate-900 shadow-rose-500/10",
        type === 'info' && "bg-white border-blue-100 text-slate-900 shadow-blue-500/10"
      )}
    >
      <div className={cn(
        "rounded-full p-1",
        type === 'success' && "bg-emerald-50 text-emerald-600",
        type === 'error' && "bg-rose-50 text-rose-600",
        type === 'info' && "bg-blue-50 text-blue-600"
      )}>
        {type === 'success' && <CheckCircle2 size={18} />}
        {type === 'error' && <AlertCircle size={18} />}
        {type === 'info' && <CheckCircle2 size={18} />}
      </div>
      
      <p className="flex-1 text-sm font-semibold tracking-tight">{message}</p>
      
      <button 
        onClick={() => onClose(id)}
        className="text-slate-300 hover:text-slate-500 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }: { toasts: any[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
