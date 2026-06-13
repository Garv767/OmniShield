'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldAlert,
  User,
  FileText,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Activity
} from 'lucide-react';
import NetworkGraph from '@/components/NetworkGraph';

interface GraphNode {
  id: string;
  name: string;
  label: string;
  is_device_farm_suspected: boolean;
  is_cyber_flagged: boolean;
  is_alert_flagged: boolean;
  val: number;
}

interface GraphLink {
  source: any;
  target: any;
  amount: number;
  count: number;
  is_device_farm_suspected: boolean;
}

const preloadedNodes: GraphNode[] = [
  { id: "ACC-9901", name: "Alpha Shell Ltd", label: "Gatherer / Primary Shell", is_device_farm_suspected: true, is_cyber_flagged: true, is_alert_flagged: false, val: 8 },
  { id: "ACC-3310", name: "R. Sharma (Layer 1)", label: "Mule Account", is_device_farm_suspected: true, is_cyber_flagged: false, is_alert_flagged: false, val: 4 },
  { id: "ACC-3311", name: "A. Khan (Layer 1)", label: "Mule Account", is_device_farm_suspected: true, is_cyber_flagged: false, is_alert_flagged: false, val: 4 },
  { id: "ACC-3312", name: "V. Patel (Layer 1)", label: "Mule Account", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: true, val: 4 },
  { id: "ACC-3313", name: "S. Joshi (Layer 1)", label: "Mule Account", is_device_farm_suspected: true, is_cyber_flagged: false, is_alert_flagged: false, val: 4 },
  { id: "ACC-1101", name: "Endpoint-101", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1102", name: "Endpoint-102", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1103", name: "Endpoint-103", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1104", name: "Endpoint-104", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1105", name: "Endpoint-105", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1106", name: "Endpoint-106", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1107", name: "Endpoint-107", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
  { id: "ACC-1108", name: "Endpoint-108", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2 },
];

const preloadedLinks: GraphLink[] = [
  { source: "ACC-3310", target: "ACC-9901", amount: 150000.00, count: 12, is_device_farm_suspected: true },
  { source: "ACC-3311", target: "ACC-9901", amount: 185000.00, count: 15, is_device_farm_suspected: true },
  { source: "ACC-3312", target: "ACC-9901", amount: 95000.00, count: 8, is_device_farm_suspected: false },
  { source: "ACC-3313", target: "ACC-9901", amount: 220000.00, count: 19, is_device_farm_suspected: true },
  { source: "ACC-1101", target: "ACC-3310", amount: 48000.00, count: 5, is_device_farm_suspected: false },
  { source: "ACC-1102", target: "ACC-3310", amount: 35000.00, count: 4, is_device_farm_suspected: false },
  { source: "ACC-1103", target: "ACC-3311", amount: 52000.00, count: 6, is_device_farm_suspected: false },
  { source: "ACC-1104", target: "ACC-3311", amount: 61000.00, count: 7, is_device_farm_suspected: false },
  { source: "ACC-1105", target: "ACC-3312", amount: 42000.00, count: 3, is_device_farm_suspected: false },
  { source: "ACC-1106", target: "ACC-3312", amount: 28000.00, count: 2, is_device_farm_suspected: false },
  { source: "ACC-1107", target: "ACC-3313", amount: 74000.00, count: 8, is_device_farm_suspected: false },
  { source: "ACC-1108", target: "ACC-3313", amount: 82000.00, count: 9, is_device_farm_suspected: false },
];

export default function NetworkInvestigation() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: preloadedNodes, links: preloadedLinks });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [sarReport, setSarReport] = useState<string>('');
  const [sarLoading, setSarLoading] = useState(false);
  const [sarSaved, setSarSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchGraphData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/network-graph');
      if (!res.ok) throw new Error('Failed to fetch graph data');
      const data = await res.json();
      setGraphData(data);
    } catch (err: any) {
      console.error(err);
      // Fallback data is preloaded, so we do not clear it on connection issues
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setSarReport('');
    setSarSaved(false);
  };

  const handleGenerateSAR = async () => {
    if (!selectedNode) return;
    setSarLoading(true);
    setSarSaved(false);
    setSarReport('');
    try {
      const res = await fetch(`/api/generate-sar/${selectedNode.id}`);
      if (!res.ok) throw new Error('Failed to generate SAR');
      const data = await res.json();
      setSarReport(data.report);
    } catch (err: any) {
      console.error(err);
      setSarReport('Error generating report. Please ensure the backend is active.');
    } finally {
      setSarLoading(false);
    }
  };

  const handleApproveSAR = () => {
    setSarSaved(true);
    setTimeout(() => {
      setSarSaved(false);
    }, 4000);
  };

  // Find transaction flows linked to selected account
  const accountLinks = selectedNode
    ? graphData.links.filter(link => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
      return srcId === selectedNode.id || tgtId === selectedNode.id;
    })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased leading-snug">
      {/* Header - Apple top navigation bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 rounded-none w-full">
        <div className="flex items-center space-x-2.5">
          <Link href="/" className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-xs font-bold text-slate-900 tracking-tight flex items-center space-x-2 leading-none animate-none">
              <ShieldAlert className="w-4.5 h-4.5 text-slate-800" strokeWidth={1.5} />
              <span>Network Investigation Sandbox</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-sans mt-0.5 uppercase tracking-wide">OmniShield Graph Visualizer & Fraud Analyzer</p>
          </div>
        </div>

        {/* Legend in Header */}
        <div className="hidden md:flex items-center space-x-4 text-[10px] font-sans text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-slate-500 rounded-full inline-block"></span>
            <span className="font-medium">Normal Account</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
            <span className="font-medium">Anomaly / Threat</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
            <span className="font-medium">Selected Account</span>
          </div>
        </div>

        <button
          onClick={fetchGraphData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-medium rounded-md border border-slate-200 transition text-slate-700 cursor-pointer shadow-sm shadow-slate-100/50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-450 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <span>Refresh Graph</span>
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden w-full bg-slate-50 h-[calc(100vh-53px)]">
        {/* Left: Graph Area */}
        <div className="flex-grow flex flex-col bg-slate-50 relative h-full">
          {apiError && (
            <div className="absolute top-4 left-4 right-4 bg-red-500/5 border border-red-500/20 text-red-700 p-3 rounded-lg flex items-start space-x-3 text-xs z-30">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">Connection Error</p>
                <p className="text-[11px] mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          <div className="w-full h-full relative">
            {loading ? (
              <div className="absolute inset-0 bg-slate-50/95 flex flex-col items-center justify-center space-y-3 z-20">
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" strokeWidth={1.5} />
                <span className="text-xs text-slate-550">Loading transactional relationship network...</span>
              </div>
            ) : null}
            <NetworkGraph
              data={graphData}
              onNodeClick={handleNodeClick}
              selectedAccountId={selectedNode?.id}
            />
          </div>
        </div>

        {/* Right: Side Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 flex flex-col overflow-y-auto max-h-screen space-y-4 rounded-none shadow-sm">
          
          {/* Quick Select Target Dropdown */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">
              Quick Select Target Profile
            </label>
            <select
              value={selectedNode?.id || ''}
              onChange={(e) => {
                const node = graphData.nodes.find(n => n.id === e.target.value);
                if (node) handleNodeClick(node);
                else setSelectedNode(null);
              }}
              id="target-select"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none transition rounded-lg cursor-pointer"
            >
              <option value="" className="font-sans">-- Select Account to Investigate --</option>
              {graphData.nodes.map(node => (
                <option key={node.id} value={node.id} className="font-mono text-slate-800">
                  {node.name} ({node.id}) {node.is_device_farm_suspected ? '⚠️' : ''} {node.is_cyber_flagged ? '🚨' : ''} {node.is_alert_flagged ? '🔔' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100"></div>

          {selectedNode ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Account Detail Header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between">
                <div className="space-y-1 font-sans">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    <h3 className="font-bold text-xs text-slate-900">{selectedNode.name}</h3>
                  </div>
                  <code className="text-xs text-blue-600 font-mono block font-semibold">{selectedNode.id}</code>
                </div>

                {/* Threat Tags */}
                <div className="flex flex-col space-y-1 items-end">
                  {selectedNode.is_device_farm_suspected && (
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Device Farm
                    </span>
                  )}
                  {selectedNode.is_cyber_flagged && (
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Gov Complaint
                    </span>
                  )}
                  {selectedNode.is_alert_flagged && (
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Security Alert
                    </span>
                  )}
                </div>
              </div>

              {/* Connected Transactions Section */}
              <div className="space-y-2 font-sans">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                  <span>Network Transaction Flows</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20 max-h-[200px] overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Direction</th>
                        <th className="px-3 py-2 font-mono">Counterparty</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250 font-sans text-slate-700">
                      {accountLinks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-500 font-semibold uppercase tracking-wider text-[10px]">No active flows linked</td>
                        </tr>
                      ) : (
                        accountLinks.map((link, idx) => {
                          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                          const isSender = srcId === selectedNode.id;
                          const counterparty = isSender
                            ? (typeof link.target === 'object' ? link.target.id : link.target)
                            : srcId;
                          return (
                            <tr key={idx} className="hover:bg-slate-55 transition-colors">
                              <td className="px-3 py-2 font-semibold text-[10px] uppercase">
                                {isSender ? (
                                  <span className="text-red-600">Outgoing</span>
                                ) : (
                                  <span className="text-emerald-600">Incoming</span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-mono text-blue-600 max-w-[120px] truncate">
                                {counterparty}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-slate-900">
                                ₹{link.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {link.is_device_farm_suspected ? (
                                  <span className="inline-flex items-center space-x-1 font-bold text-red-600 text-[10px]">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                    <span>FLAGGED</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 font-medium text-slate-500 text-[10px]">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                                    <span>Clean</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SAR Report Generator Section */}
              <div className="border-t border-slate-200 pt-4 flex-1 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-3 font-sans">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>Auto-Report Compiler (SAR)</span>
                  </h4>
                  {!sarReport && !sarLoading && (
                    <button
                      onClick={handleGenerateSAR}
                      className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-[10px] font-bold text-white rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3 text-white" strokeWidth={1.5} />
                      <span>Compile Report</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col relative min-h-[200px]">
                  {sarLoading ? (
                    <div className="absolute inset-0 bg-slate-50/90 flex flex-col items-center justify-center space-y-3 z-10 border border-slate-200 rounded-xl">
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" strokeWidth={1.5} />
                      <span className="text-xs text-slate-600 font-sans">Running risk reasoning agent...</span>
                    </div>
                  ) : null}

                  {sarReport ? (
                    <div className="flex-1 flex flex-col space-y-3 font-sans">
                      <textarea
                        value={sarReport}
                        onChange={(e) => setSarReport(e.target.value)}
                        className="flex-1 min-h-[200px] bg-slate-50 border border-slate-200 p-3.5 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-blue-500 resize-y rounded-xl"
                        placeholder="Edit report draft..."
                      />

                      <div className="flex items-center space-x-3 justify-end text-xs">
                        <button
                          onClick={handleGenerateSAR}
                          className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={handleApproveSAR}
                          className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-[10px] font-bold text-white rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                          <span>Approve & Submit SAR</span>
                        </button>
                      </div>

                      {sarSaved && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 p-3 rounded-lg flex items-center space-x-2 text-xs">
                          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-none" strokeWidth={1.5} />
                          <span>SAR archived successfully and queued for secure transmission.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-50/50 font-sans">
                      <FileText className="w-8 h-8 text-slate-400 mb-2" strokeWidth={1.5} />
                      <p className="text-xs uppercase font-bold text-slate-800">No SAR drafted for this subject</p>
                      <p className="text-[11px] text-slate-500 mt-1.5 max-w-[240px] leading-normal">
                        Select a network account and compile report using the AI assistant to parse automated velocity signals and complaints.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 bg-slate-50/50 border border-slate-200 rounded-xl font-sans">
              <ShieldAlert className="w-8 h-8 text-slate-400 mb-3 animate-pulse" strokeWidth={1.5} />
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">No Subject Selected</h3>
              <p className="text-[11px] text-slate-550 mt-1.5 max-w-[260px] leading-normal">
                Click any node in the network graph to evaluate its transaction flow, telemetry properties, and compliance filing logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
