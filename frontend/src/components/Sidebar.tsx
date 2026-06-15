'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Globe, Upload, AlertOctagon, Activity, Network, Brain } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/', icon: <Activity className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Simulator', href: '/simulator', icon: <Globe className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Tickets', href: '/tickets', icon: <Upload className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Blocklist', href: '/blocklist', icon: <AlertOctagon className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Graph Workspace', href: '/network-investigation', icon: <Network className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'ML Analysis', href: '/ml-analysis', icon: <Brain className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col h-full sticky top-0 font-sans select-none shadow-sm shadow-slate-100/30">
      <div className="p-4 border-b border-slate-200 flex items-center space-x-2.5">
        <div className="w-7 h-7 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-lg shrink-0">
          <ShieldAlert className="w-4 h-4 text-slate-700 fill-slate-100/50 animate-none" strokeWidth={1.5} />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-xs font-bold text-slate-900 tracking-tight leading-none uppercase">
            OmniShield
          </h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-2.5 mx-2 px-3 py-2 text-xs transition rounded-md font-sans ${
                isActive
                  ? 'bg-lime-primary/15 text-slate-800 font-semibold border border-lime-primary/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className={isActive ? 'text-slate-800' : 'text-slate-550'}>
                {link.icon}
              </span>
              <span className="tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
