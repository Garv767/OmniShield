'use client';

import React, { useState, useEffect } from 'react';
import { AlertOctagon, Plus } from 'lucide-react';

interface BlocklistEntry {
  id: number;
  value: string;
  type: string;
  reason: string;
}

export default function BlocklistPage() {
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [newBlockValue, setNewBlockValue] = useState('');
  const [newBlockType, setNewBlockType] = useState('ip');
  const [newBlockReason, setNewBlockReason] = useState('Identified anomaly pattern');
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  const fetchBlocklist = async () => {
    try {
      const res = await fetch('/api/blocklist');
      if (res.ok) {
        const data = await res.json();
        setBlocklist(data);
      }
    } catch (err) {
      console.error('Error fetching blocklist', err);
    }
  };

  useEffect(() => {
    fetchBlocklist();
    const interval = setInterval(() => {
      fetchBlocklist();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddBlocklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockValue.trim()) return;
    setBlockSubmitting(true);
    setBlockMessage('');
    try {
      const res = await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: newBlockValue,
          type: newBlockType,
          reason: newBlockReason
        })
      });
      if (res.ok) {
        setBlockMessage(`Blocked ${newBlockType} successfully.`);
        setNewBlockValue('');
        fetchBlocklist();
      } else {
        setBlockMessage('Failed to save block.');
      }
    } catch (err) {
      console.error(err);
      setBlockMessage('API connection error.');
    } finally {
      setBlockSubmitting(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 font-sans bg-slate-50 text-slate-900 overflow-y-auto">
      <h1 className="text-sm font-bold text-slate-900">Security Blocklist Registry</h1>

      <div className="bg-white p-6 border border-slate-200 rounded-xl flex-1 flex flex-col min-h-0 shadow-sm">
        <div className="mb-6 space-y-1.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
            <span>Active Restrictions</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Manage restricted IP addresses and device fingerprints to proactively drop automated connections.
          </p>
        </div>

        <form onSubmit={handleAddBlocklist} className="flex space-x-3 mb-6 font-sans">
          <select
            value={newBlockType}
            onChange={(e) => setNewBlockType(e.target.value)}
            className="bg-white text-xs text-slate-800 px-3 py-2 border border-slate-200 focus:border-lime-primary focus:outline-none rounded-lg cursor-pointer"
          >
            <option value="ip" className="bg-white">IP Address</option>
            <option value="fingerprint" className="bg-white">Fingerprint</option>
          </select>
          <input
            type="text"
            placeholder="Enter IP or fingerprint token..."
            value={newBlockValue}
            onChange={(e) => setNewBlockValue(e.target.value)}
            className="flex-1 bg-white border border-slate-200 focus:border-lime-primary text-xs font-mono text-slate-900 px-4 py-2 focus:outline-none rounded-lg"
          />
          <button
            type="submit"
            disabled={blockSubmitting}
            className="bg-lime-primary hover:bg-lime-primary/90 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-900" strokeWidth={1.5} />
            <span>Add Restriction</span>
          </button>
        </form>

        {blockMessage && (
          <div className="mb-4 p-3 bg-lime-primary/10 border border-lime-primary/20 text-lime-primary text-xs rounded-lg">
            {blockMessage}
          </div>
        )}

        <div className="flex-1 overflow-y-auto border border-slate-200 bg-white rounded-lg min-h-0">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-55 z-10 border-b border-slate-200">
              <tr className="text-slate-750 bg-slate-50 text-[10px] uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 font-mono">Value</th>
                <th className="px-4 py-3">Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {blocklist.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                    No restricted registry entries found.
                  </td>
                </tr>
              ) : (
                blocklist.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] w-32">{item.type}</td>
                    <td className="px-4 py-3 font-mono text-slate-900 font-semibold">{item.value}</td>
                    <td className="px-4 py-3 text-slate-600">{item.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
