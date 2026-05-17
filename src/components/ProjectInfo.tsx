import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Zap, Globe, Cpu, Users, Code, Award } from 'lucide-react';

export default function ProjectInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[2rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-4 right-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Award size={16} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Hackathon Submission</span>
            </div>
        </div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">The Mission</span>
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-6">ZeroQueue: Intelligent Lab Management</h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            A dynamic resource allocation engine designed to eliminate laboratory queues. By digitizing physical seats into a live cloud-synced grid, we maximize hardware utilization at <span className="text-white font-bold">KLS GIT</span>.
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="Cloud-Native Sync"
            desc="Built on a serverless architecture using Firestore for millisecond latency on seat status broadcasts."
        />
        <FeatureCard 
            icon={<Shield className="text-emerald-500" />}
            title="Zero-Trust Auth"
            desc="Strategic identity management distinguishing between Student and Admin privileges."
        />
        <FeatureCard 
            icon={<Users className="text-blue-500" />}
            title="Hardware Governance"
            desc="Administrative tools to dynamically update software stacks and hardware profiles across labs."
        />
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Code size={18} className="text-slate-400" /> Technology Stack
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TechBadge label="React 18" icon={<Globe />} />
            <TechBadge label="TypeScript" icon={<Terminal />} />
            <TechBadge label="Firestore" icon={<Zap />} />
            <TechBadge label="Motion" icon={<Cpu />} />
            <TechBadge label="Tailwind CSS" icon={<Globe />} />
            <TechBadge label="Lucide Icons" icon={<Zap />} />
            <TechBadge label="Date-Fns" icon={<Globe />} />
            <TechBadge label="Vite" icon={<Zap />} />
        </div>
      </div>

      {/* About The Team */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] px-4 flex items-center gap-3">
            <Users size={18} className="text-slate-400" /> Development Team
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MemberCard 
                initials="SS"
                name="Srushti S."
                role="Lead Developer"
                institution="KLS GIT 2026"
                tags={['React', 'Firebase', 'TypeScript']}
                color="bg-blue-600"
            />
            <MemberCard 
                initials="SV"
                name="Sadhvi V N"
                role="System Architect"
                institution="KLS GIT 2026"
                tags={['Frontend', 'Firestore', 'Tailwind']}
                color="bg-indigo-600"
            />
            <MemberCard 
                initials="SB"
                name="Sahana B H"
                role="Product Designer"
                institution="KLS GIT 2026"
                tags={['Figma', 'UX Research', 'Motion']}
                color="bg-rose-600"
            />
        </div>
      </div>
    </motion.div>
  );
}

function MemberCard({ initials, name, role, institution, tags, color }: { initials: string; name: string; role: string; institution: string; tags: string[]; color: string }) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-lg font-black text-white shadow-xl mb-4`}>
                {initials}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{name}</h3>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-2">{role}</p>
            <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase tracking-tight">{institution}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string, desc: string }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-4">{icon}</div>
            <h4 className="text-slate-900 font-black tracking-tight mb-2 uppercase text-xs">{title}</h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function TechBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="text-slate-400">{icon}</div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</span>
        </div>
    );
}
