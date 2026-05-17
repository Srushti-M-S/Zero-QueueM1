import React from 'react';
import { type Terminal } from '../types';
import { cn } from '../lib/utils';
import { Monitor, Lock, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TerminalGridProps {
  terminals: Terminal[];
  onTerminalClick?: (terminal: Terminal) => void;
}

export default function TerminalGrid({ terminals, onTerminalClick }: TerminalGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {terminals.map((terminal) => (
        <TerminalUnit 
          key={terminal.id} 
          terminal={terminal} 
          onClick={() => onTerminalClick?.(terminal)} 
          clickable={!!onTerminalClick}
        />
      ))}
    </div>
  );
}

interface TerminalUnitProps {
  terminal: Terminal;
  onClick: () => void;
  clickable?: boolean;
}

function TerminalUnit({ terminal, onClick, clickable }: TerminalUnitProps) {
  const isAvailable = terminal.status === 'available';
  const isOccupied = terminal.status === 'occupied';
  const isBooked = terminal.status === 'booked';
  const isMaintenance = terminal.status === 'maintenance';

  return (
    <motion.div
      layout
      initial={false}
      animate={{ 
        scale: [1, 1.05, 1],
        backgroundColor: isBooked ? ['#fff', '#fef3c7', '#fffbeb'] : '#fff'
      }}
      transition={{ duration: 0.5 }}
      whileHover={isAvailable ? { scale: 1.02, y: -2 } : {}}
      whileTap={isAvailable || clickable ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-2xl border p-2 transition-all duration-300",
        isAvailable 
          ? "bg-white border-slate-200 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-blue-500/10" 
          : (isOccupied || isBooked) && clickable
          ? "bg-blue-50 border-blue-200 cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-500/20"
          : isOccupied 
          ? "bg-blue-50 border-blue-200 cursor-default opacity-80" 
          : isBooked 
          ? "bg-amber-50 border-amber-200 cursor-default" 
          : "bg-slate-100 border-slate-200 cursor-not-allowed grayscale"
      )}
    >
      <div className={cn(
        "mb-2 rounded-full p-2.5 transition-colors",
        isAvailable ? "bg-slate-50 text-slate-400 group-hover:text-blue-500" :
        isOccupied ? "bg-blue-100 text-blue-600 shadow-inner" :
        isBooked ? "bg-amber-100 text-amber-600" :
        "bg-slate-200 text-slate-400"
      )}>
        {isAvailable && <Monitor size={16} />}
        {isOccupied && (
          <div className="flex flex-col items-center">
            <User size={16} />
            {terminal.currentUserInitials && (
              <span className="text-[8px] font-black mt-0.5">{terminal.currentUserInitials}</span>
            )}
          </div>
        )}
        {isBooked && (
          <div className="flex flex-col items-center">
            <Lock size={16} />
            {terminal.remainingMinutes && (
              <span className="text-[7px] font-black mt-0.5">{terminal.remainingMinutes}m</span>
            )}
          </div>
        )}
        {isMaintenance && <AlertCircle size={16} />}
      </div>

      <span className={cn(
        "text-[9px] font-black uppercase tracking-[0.1em] mb-1 font-mono",
        isAvailable ? "text-slate-400" : "text-slate-600"
      )}>
        {terminal.id}
      </span>

      <div className={cn(
        "px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border transition-all",
        isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-100 opacity-0 group-hover:opacity-100" :
        isOccupied ? "bg-blue-600 text-white border-blue-600 shadow-sm" :
        isBooked ? "bg-amber-100 text-amber-700 border-amber-200" :
        "bg-slate-300 text-slate-600 border-slate-300"
      )}>
        {terminal.status}
      </div>

      {isOccupied && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white">
          <CheckCircle2 size={10} />
        </div>
      )}
    </motion.div>
  );
}

