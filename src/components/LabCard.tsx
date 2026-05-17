import React from 'react';
import { Monitor, Cpu, Clock, MapPin, ChevronRight, Activity, Users, AlertCircle } from 'lucide-react';
import { type Lab } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LabCardProps {
  lab: Lab;
  onClick?: () => void;
}

export default function LabCard({ lab, onClick }: LabCardProps) {
  const occupancyPercentage = (lab.currentOccupancy || 0) / lab.capacity;
  const isHighOccupancy = occupancyPercentage > 0.8;
  const isFull = occupancyPercentage >= 1;
  const utilization = Math.round(occupancyPercentage * 100);
  const healthStatus = isFull ? 'critical' : isHighOccupancy ? 'warning' : 'healthy';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "group bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden",
        isFull ? "border-rose-200 bg-rose-50/20" : isHighOccupancy ? "border-amber-200 bg-amber-50/10" : "border-slate-200 hover:border-blue-500/30 hover:bg-slate-50/50"
      )}
    >
      <div className="absolute top-0 right-0 h-1.5 w-full bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${utilization}%` }}
          className={cn(
            "h-full transition-all duration-1000",
            isFull ? "bg-rose-500" : isHighOccupancy ? "bg-amber-500" : "bg-blue-500"
          )}
        />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-lg font-bold tracking-tight transition-colors uppercase",
              isFull ? "text-rose-900" : isHighOccupancy ? "text-amber-900" : "text-slate-900 group-hover:text-blue-600"
            )}>{lab.name}</h3>
            {isFull && <AlertCircle size={16} className="text-rose-500" />}
          </div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <MapPin size={12} className="text-slate-300" /> {lab.location}
          </p>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden shadow-sm">
              <Users size={12} />
            </div>
          ))}
          <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+{lab.currentOccupancy && lab.currentOccupancy > 3 ? lab.currentOccupancy - 3 : 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={cn(
          "rounded-xl p-3 border",
          isFull ? "bg-rose-50 border-rose-100" : isHighOccupancy ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100/50"
        )}>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Utilization</div>
          <div className={cn(
            "text-base font-black",
            isFull ? "text-rose-600" : isHighOccupancy ? "text-amber-600" : "text-slate-800"
          )}>{utilization}%</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Capacity</div>
          <div className="text-base font-black text-slate-800">{lab.currentOccupancy}/{lab.capacity}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Activity size={14} className={cn(isFull ? "text-rose-500" : isHighOccupancy ? "text-amber-500" : "text-emerald-500")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{isFull ? 'Critical' : isHighOccupancy ? 'High Load' : 'Healthy'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Monitor size={14} className="text-slate-300" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">RTX Platform</span>
          </div>
        </div>
        <div className={cn(
          "transition-transform group-hover:translate-x-1 duration-300",
          isFull ? "text-rose-600" : "text-blue-600"
        )}>
          <ChevronRight size={20} />
        </div>
      </div>
    </motion.div>
  );
}
