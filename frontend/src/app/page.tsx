'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Database,
  Activity,
  Loader,
  X,
  FileText,
  MapPin,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';
import FraudCanvas from '@/components/FraudCanvas';

interface Stats {
  total_transactions: number;
  suspected_transactions: number;
  government_tickets: number;
  cross_channel_alerts: number;
  total_fraud_volume: number;
  suspected_devices: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total_transactions: 12,
    suspected_transactions: 2,
    government_tickets: 1,
    cross_channel_alerts: 2,
    total_fraud_volume: 14300,
    suspected_devices: 2
  });

  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [velocityData, setVelocityData] = useState<number[]>([30, 45, 38, 55, 48, 65, 58, 72, 63, 85, 78, 92]);

  const mockTransactions = [
    {
      id: "TXN-9023",
      sender_account: "ACC-0924",
      receiver_account: "ACC-5521",
      amount: 1420.00,
      timestamp: "2026-06-15T00:01:22Z",
      is_device_farm_suspected: false,
      ip_address: "192.168.1.14",
      device_fingerprint: "macos_safari_v19",
      device_type: "macOS Desktop",
      location: "Mumbai, IN",
      emulator_flags: "None detected",
      trigger_reason: "Standard Activity"
    },
    {
      id: "TXN-7412",
      sender_account: "ACC-8392",
      receiver_account: "ACC-2093",
      amount: 4500.00,
      timestamp: "2026-06-15T00:02:05Z",
      is_device_farm_suspected: true,
      ip_address: "185.220.101.5",
      device_fingerprint: "android_emu_x86_64",
      device_type: "Android SDK (Generic)",
      location: "St. Petersburg, RU",
      emulator_flags: "Emulator detected; Shared system hash; High velocity",
      trigger_reason: "Known Emulator"
    },
    {
      id: "TXN-3829",
      sender_account: "ACC-4739",
      receiver_account: "ACC-1932",
      amount: 320.50,
      timestamp: "2026-06-15T00:03:10Z",
      is_device_farm_suspected: false,
      ip_address: "103.45.201.88",
      device_fingerprint: "ios_iphone_15_pro",
      device_type: "iOS Mobile (iPhone 15 Pro)",
      location: "Delhi, IN",
      emulator_flags: "None detected",
      trigger_reason: "Standard Activity"
    },
    {
      id: "TXN-6610",
      sender_account: "ACC-8392",
      receiver_account: "ACC-2093",
      amount: 9800.00,
      timestamp: "2026-06-15T00:03:40Z",
      is_device_farm_suspected: true,
      ip_address: "185.220.101.5",
      device_fingerprint: "android_emu_x86_64",
      device_type: "Android SDK (Generic)",
      location: "St. Petersburg, RU",
      emulator_flags: "Emulator detected; Shared system hash; High velocity",
      trigger_reason: "IP Velocity Limit"
    },
    {
      id: "TXN-1092",
      sender_account: "ACC-5120",
      receiver_account: "ACC-8830",
      amount: 75.00,
      timestamp: "2026-06-15T00:04:12Z",
      is_device_farm_suspected: false,
      ip_address: "172.56.21.9",
      device_fingerprint: "windows_edge_v124",
      device_type: "Windows Desktop",
      location: "San Jose, US",
      emulator_flags: "None detected",
      trigger_reason: "Standard Activity"
    }
  ];

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/statistics');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching statistics', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/network-graph');
      if (res.ok) {
        const graphData = await res.json();
        const rawTxs = graphData.links.map((link: any, idx: number) => ({
          id: `TXN-${2000 + idx}`,
          sender_account: link.source,
          receiver_account: link.target,
          amount: link.amount,
          timestamp: new Date().toISOString(),
          is_device_farm_suspected: link.is_device_farm_suspected,
          ip_address: link.is_device_farm_suspected ? '185.220.101.5' : '192.168.1.99',
          device_fingerprint: link.is_device_farm_suspected ? 'shared_farm_hash' : 'user_chrome_hash',
          device_type: link.is_device_farm_suspected ? 'Android SDK Emulator' : 'macOS Desktop',
          location: link.is_device_farm_suspected ? 'St. Petersburg, RU' : 'Mumbai, IN',
          emulator_flags: link.is_device_farm_suspected ? 'Emulator detected; high velocity' : 'None detected',
          trigger_reason: link.is_device_farm_suspected 
            ? (idx % 2 === 0 ? "IP Velocity Limit" : "Known Emulator") 
            : "Standard Activity"
        }));
        setTransactions(rawTxs.slice(0, 15));
      } else {
        setTransactions(mockTransactions);
      }
    } catch (err) {
      console.error('Error fetching transactions', err);
      setTransactions(mockTransactions);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransactions();

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    const sparklineInterval = setInterval(() => {
      setVelocityData(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 15;
        const val = Math.max(15, Math.min(95, last + change));
        next.push(val);
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(sparklineInterval);
    };
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const res = await fetch('/api/seed-mock-data', { method: 'POST' });
      if (res.ok) {
        setSeedMessage('Database re-seeded successfully.');
        setTransactions(mockTransactions);
        setStats({
          total_transactions: 15,
          suspected_transactions: 2,
          government_tickets: 1,
          cross_channel_alerts: 2,
          total_fraud_volume: 14300,
          suspected_devices: 2
        });
      } else {
        setSeedMessage('Seeding failed. Mock transaction telemetry populated.');
        setTransactions(mockTransactions);
      }
    } catch (err) {
      console.error(err);
      setSeedMessage('API connection failed. Populated mock telemetry data.');
      setTransactions(mockTransactions);
    } finally {
      setSeeding(false);
      setSelectedTransaction(null);
      setReportText(null);
      setReportLoading(false);
    }
  };

  const handleQuickBlock = async (value: string, type: string, reason: string) => {
    try {
      const res = await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value,
          type,
          reason
        })
      });
      if (res.ok) {
        setSeedMessage(`Blocked ${type} successfully.`);
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDraftReport = () => {
    if (!selectedTransaction) return;
    setReportLoading(true);
    setReportText(null);
    setTimeout(() => {
      setReportLoading(false);
      setReportText(`OMNISHIELD COMPLIANCE AUDIT
=============================
INCIDENT ID: SAR-${selectedTransaction.id || "0000"}
TIMESTAMP: ${new Date().toISOString()}
INVESTIGATION SUBJECT: ${selectedTransaction.sender_account} -> ${selectedTransaction.receiver_account}
RISK EVALUATION: ${selectedTransaction.is_device_farm_suspected ? "HIGH RISK / SUSPECTED FRAUD" : "STANDARD ACTIVITY"}

DETAILED EVIDENCE LEDGER:
-------------------------
* Ingress Vector: IP Address ${selectedTransaction.ip_address}
* Geolocational Mapping: ${selectedTransaction.location || "Unknown"}
* Client Environment: ${selectedTransaction.device_type || "Unknown"}
* Device Token Hash: ${selectedTransaction.device_fingerprint || "Unknown"}
* Threat Analysis Diagnostics: ${selectedTransaction.emulator_flags || "None detected"}

REGULATORY ASSESSMENT:
----------------------
${selectedTransaction.is_device_farm_suspected 
  ? "Subject displays anomaly flags indicative of automated transaction velocity farms and emulated devices. Compliance transmission to the Department of Financial Services is recommended."
  : "Transaction conforms to standard consumer behavior. No anomalies detected."
}`);
    }, 1500);
  };

  const handleClosePanel = () => {
    setSelectedTransaction(null);
    setReportText(null);
    setReportLoading(false);
  };

  return (
    <main className="h-full overflow-hidden flex flex-col font-sans select-none antialiased leading-snug bg-slate-50 text-slate-900">
      
      {/* Header - Apple Developer styled top navigation bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 rounded-none w-full">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-lg">
            <ShieldAlert className="w-4.5 h-4.5 text-slate-800" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-900 tracking-tight flex items-center space-x-2 leading-none">
              <span>Real-Time Anomaly Detection</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-sans font-medium mt-0.5">Cross-channel transaction telemetry and risk scoring</p>
          </div>
        </div>

        <div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 bg-white text-slate-705 hover:text-slate-900 text-xs font-medium rounded-md transition duration-150 flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {seeding ? (
              <Loader className="w-3.5 h-3.5 animate-spin text-slate-600" strokeWidth={1.5} />
            ) : (
              <Database className="w-3.5 h-3.5 text-slate-700" strokeWidth={1.5} />
            )}
            <span>Re-seed DB</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Column: Dashboard metrics and Ingestion Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Status Notification banner */}
          {seedMessage && (
            <div className="bg-white border border-slate-200 px-4 py-2.5 text-xs font-sans flex items-center justify-between rounded-lg w-full shadow-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <span className="w-1.5 h-1.5 bg-lime-primary rounded-full inline-block"></span>
                <span>{seedMessage}</span>
              </div>
              <button 
                onClick={() => { setSeedMessage(''); }} 
                className="text-xs text-lime-primary hover:text-lime-mint font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Hero Banner - System Telemetry Overview */}
          <div className="relative bg-white border border-slate-200 px-6 py-6 rounded-xl w-full overflow-hidden min-h-[130px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="relative z-10 space-y-1.5 max-w-xl pointer-events-auto">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-lime-primary inline-block rounded-full"></span>
                <span className="text-[9px] font-bold tracking-wider text-slate-750 uppercase">Visual Graph Explainability Engine</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase">System Telemetry Overview</h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed font-sans">
                Observe cross-channel transaction vectors immediately. OmniShield maps device configuration velocities, geolocation mismatches, and complaints directly within the workspace.
              </p>
            </div>

            {/* Sparkline Visualization */}
            <div className="w-full md:w-64 bg-slate-50 border border-slate-150 rounded-xl p-3.5 flex flex-col justify-between h-[100px] shrink-0 font-sans relative">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-750 uppercase tracking-wider leading-none">
                <span>Transaction Velocity</span>
                <span className="text-lime-primary font-mono font-bold">Live Ingestion</span>
              </div>
              <div className="h-8 w-full flex items-end mt-1">
                {(() => {
                  const maxVal = Math.max(...velocityData, 10);
                  const minVal = Math.min(...velocityData, 0);
                  const range = maxVal - minVal || 1;
                  const w = 220;
                  const h = 32;
                  
                  const points = velocityData.map((val, i) => {
                    const x = (i / (velocityData.length - 1)) * w;
                    const y = h - ((val - minVal) / range) * h;
                    return `${x},${y}`;
                  }).join(' ');

                  const fillPoints = `0,${h} ` + velocityData.map((val, i) => {
                    const x = (i / (velocityData.length - 1)) * w;
                    const y = h - ((val - minVal) / range) * h;
                    return `${x},${y}`;
                  }).join(' ') + ` ${w},${h}`;

                  return (
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A0D585" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#A0D585" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon points={fillPoints} fill="url(#sparkline-grad)" />
                      <polyline points={points} fill="none" stroke="#A0D585" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      <circle 
                        cx={w} 
                        cy={h - ((velocityData[velocityData.length - 1] - minVal) / range) * h} 
                        r={2.5} 
                        fill="#A0D585" 
                        className="animate-pulse"
                      />
                    </svg>
                  );
                })()}
              </div>
              <div className="absolute bottom-1.5 left-3.5 right-3.5 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>T-24s</span>
                <span className="text-[9px] text-slate-700 font-sans font-medium">Current: {velocityData[velocityData.length - 1].toFixed(0)} txn/sec</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          {/* Statistics Grid (Metric Cards with 1px border, no background colors) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            
            <div className="border border-slate-200 bg-white p-5 rounded-xl flex flex-col justify-between h-24 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-750 font-bold leading-none">Suspected Transactions</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono leading-none">
                    {stats.suspected_transactions}
                  </span>
                  <span className="text-[10px] text-slate-650 font-sans font-semibold">/ {stats.total_transactions} total</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 rounded-xl flex flex-col justify-between h-24 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-755 font-bold leading-none">Estimated Fraud Volume</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono leading-none">
                    ₹{stats.total_fraud_volume.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-655 font-semibold uppercase ml-1">INR</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 rounded-xl flex flex-col justify-between h-24 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-755 font-bold leading-none">Active Complaints</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono leading-none">
                    {stats.government_tickets}
                  </span>
                  <span className="text-[10px] text-slate-655 font-sans font-semibold">Pending reports</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 rounded-xl flex flex-col justify-between h-24 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-755 font-bold leading-none">Cross-Channel Alerts</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono leading-none">
                    {stats.cross_channel_alerts}
                  </span>
                  <span className="text-[10px] text-slate-655 font-sans font-semibold">Triggered flags</span>
                </div>
              </div>

          </div>

          {/* Data Table */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
                <span>Real-Time Ingestion Feed</span>
              </h3>
              <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold">
                <span className="w-1.5 h-1.5 bg-lime-primary rounded-full inline-block animate-pulse"></span>
                <span>Operational</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-750 uppercase text-[10px] tracking-wider bg-slate-50/30 font-bold">
                    <th className="py-2.5 px-4 font-semibold">Risk Evaluation</th>
                    <th className="py-2.5 px-4 font-semibold font-mono">Transaction ID</th>
                    <th className="py-2.5 px-4 font-semibold font-mono">Sender Account</th>
                    <th className="py-2.5 px-4 font-semibold font-mono">Receiver Account</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Volume</th>
                    <th className="py-2.5 px-4 font-semibold">Trigger Reason</th>
                    <th className="py-2.5 px-4 font-semibold font-mono">Network Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-medium tracking-wide">
                        No transactions registered. Click &quot;Re-seed DB&quot; above to ingest live mock telemetry feed.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedTransaction(tx)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 ${selectedTransaction?.id === tx.id ? 'bg-slate-100/50' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2 text-[11px]">
                            {tx.is_device_farm_suspected ? (
                              <>
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                <span className="text-red-600 font-medium">Flagged</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 bg-lime-primary rounded-full inline-block"></span>
                                <span className="text-slate-800 font-medium">Approved</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px] font-normal">{tx.id}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{tx.sender_account}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{tx.receiver_account}</td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                          ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          {tx.is_device_farm_suspected ? (
                            <span className="px-2 py-0.5 bg-red-500/5 border border-red-500/20 text-red-600 text-[9px] font-bold rounded-full uppercase tracking-wider">
                              {tx.trigger_reason}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-lime-primary/15 border border-lime-primary/30 text-slate-800 text-[9px] font-medium rounded-full uppercase tracking-wider">
                              {tx.trigger_reason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                          IP: {tx.ip_address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Detail / Investigation Inspection Panel */}
        {selectedTransaction && (
          <div className="w-96 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-200 shadow-sm z-40">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
                <span>Inspection Panel</span>
              </h3>
              <button 
                onClick={handleClosePanel}
                className="text-slate-500 hover:text-slate-850 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block mb-1">Transaction ID</span>
                <span className="font-mono text-sm font-semibold text-slate-900">{selectedTransaction.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block mb-1">Sender</span>
                  <span className="font-mono text-xs text-slate-900 block">{selectedTransaction.sender_account}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block mb-1">Receiver</span>
                  <span className="font-mono text-xs text-slate-900 block">{selectedTransaction.receiver_account}</span>
                </div>
              </div>

              {/* Extended Metadata */}
              <div className="space-y-3.5 pt-3.5 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Extended Telemetry</h4>
                
                <div className="flex items-start space-x-2.5">
                  <Cpu className="w-4 h-4 text-slate-650 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-700 block">Device Type</span>
                    <span className="text-xs text-slate-805 font-sans font-medium">{selectedTransaction.device_type}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-slate-655 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-700 block">Ingress Location</span>
                    <span className="text-xs text-slate-805 font-sans font-medium">{selectedTransaction.location}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Globe className="w-4 h-4 text-slate-655 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-700 block">IP Address</span>
                    <span className="text-xs text-slate-805 font-mono font-medium">{selectedTransaction.ip_address}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Layers className="w-4 h-4 text-slate-655 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-700 block">Emulator Flags</span>
                    <span className="text-xs text-slate-805 font-sans font-medium">{selectedTransaction.emulator_flags}</span>
                  </div>
                </div>
              </div>

              {/* Action & Report Compiling */}
              <div className="pt-5 border-t border-slate-100 space-y-4">
                <button
                  onClick={handleDraftReport}
                  disabled={reportLoading}
                  className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition duration-150 font-sans"
                >
                  <FileText className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
                  <span>{reportLoading ? "Assembling ledger context..." : "Draft Report"}</span>
                </button>

                {reportLoading && (
                  <div className="flex items-center justify-center py-4 space-x-2 text-xs text-slate-500 animate-pulse font-sans">
                    <Loader className="w-3.5 h-3.5 animate-spin text-slate-400" strokeWidth={1.5} />
                    <span>Parsing audit telemetry logs...</span>
                  </div>
                )}

                {reportText && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-[10px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {reportText}
                  </div>
                )}

                {selectedTransaction.is_device_farm_suspected && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleQuickBlock(selectedTransaction.ip_address, 'ip', 'Linked to suspected device farm')}
                      className="w-full py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition duration-150 font-sans"
                    >
                      <span>Restrict Source IP</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/30 py-3.5 text-center text-[10px] text-slate-500 uppercase tracking-wide">
        OmniShield &copy; 2026. Risk Assessment & Ingestion Utilities Suite.
      </footer>
    </main>
  );
}
