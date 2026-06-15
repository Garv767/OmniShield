'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Globe, Upload, AlertOctagon, Activity, Network, Brain, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { name: 'Dashboard', href: '/', icon: <Activity className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Simulator', href: '/simulator', icon: <Globe className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Tickets', href: '/tickets', icon: <Upload className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Blocklist', href: '/blocklist', icon: <AlertOctagon className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'Graph Workspace', href: '/network-investigation', icon: <Network className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
    { name: 'ML Analysis', href: '/ml-analysis', icon: <Brain className="w-4 h-4" strokeWidth={1.5} stroke="currentColor" /> },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 dark:backdrop-blur-md flex flex-col h-full sticky top-0 font-sans select-none shadow-sm shadow-slate-100/30 transition-colors duration-200">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2.5">
        <div className="w-7 h-7 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-lg shrink-0">
          <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-350 fill-slate-100/50 dark:fill-slate-850/50 animate-none" strokeWidth={1.5} />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none uppercase">
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
                  ? 'bg-lime-primary/15 dark:bg-lime-primary/10 text-slate-800 dark:text-lime-primary font-semibold border border-lime-primary/20 dark:border-lime-primary/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <span className={isActive ? 'text-slate-800 dark:text-lime-primary' : 'text-slate-550 dark:text-slate-500'}>
                {link.icon}
              </span>
              <span className="tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sleek Theme Switcher at bottom */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-lime-primary" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          )}
          <span>Dark Mode</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none bg-slate-200 dark:bg-slate-800"
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 ${
              theme === 'dark' ? 'translate-x-4.5 bg-lime-primary' : 'translate-x-1 bg-white'
            }`}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
