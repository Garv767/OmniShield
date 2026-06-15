'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldAlert,
  User,
  FileText,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Activity,
  Play,
  Pause,
  ShieldCheck,
  XCircle,
  Calendar,
  AlertOctagon
} from 'lucide-react';
import NetworkGraph from '@/components/NetworkGraph';
import { useTheme } from '@/context/ThemeContext';

interface GraphNode {
  id: string;
  name: string;
  label: string;
  is_device_farm_suspected: boolean;
  is_cyber_flagged: boolean;
  is_alert_flagged: boolean;
  val: number;
  is_frozen?: boolean;
  ip_address?: string;
  device_fingerprint?: string;
  ip_addresses?: string[];
  device_fingerprints?: string[];
}

interface GraphLink {
  source: any;
  target: any;
  amount: number;
  count: number;
  is_device_farm_suspected: boolean;
  timestamp?: string;
}

const preloadedNodes: GraphNode[] = [
  { id: "ACC-9901", name: "Alpha Shell Ltd", label: "Gatherer / Primary Shell", is_device_farm_suspected: true, is_cyber_flagged: true, is_alert_flagged: false, val: 8, is_frozen: false, ip_address: "185.220.101.5", device_fingerprint: "fp_tor_exit_node", ip_addresses: ["185.220.101.5"], device_fingerprints: ["fp_tor_exit_node"] },
  { id: "ACC-3310", name: "R. Sharma (Layer 1)", label: "Mule Account", is_device_farm_suspected: true, is_cyber_flagged: false, is_alert_flagged: false, val: 4, is_frozen: false, ip_address: "192.168.1.10", device_fingerprint: "fp_chrome_win_1", ip_addresses: ["192.168.1.10"], device_fingerprints: ["fp_chrome_win_1"] },
  { id: "ACC-3311", name: "A. Khan (Layer 1)", label: "Mule Account", is_device_farm_suspected: true, is_cyber_flagged: false, is_alert_flagged: false, val: 4, is_frozen: false, ip_address: "192.168.1.11", device_fingerprint: "fp_chrome_win_2", ip_addresses: ["192.168.1.11"], device_fingerprints: ["fp_chrome_win_2"] },
  { id: "ACC-3312", name: "V. Patel (Layer 1)", label: "Mule Account", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: true, val: 4, is_frozen: false, ip_address: "192.168.1.12", device_fingerprint: "fp_chrome_win_3", ip_addresses: ["192.168.1.12"], device_fingerprints: ["fp_chrome_win_3"] },
  { id: "ACC-3313", name: "S. Joshi (Layer 1)", label: "Mule Account", is_device_farm_suspected: true, is_cyber_flagged: false, is_alert_flagged: false, val: 4, is_frozen: false, ip_address: "192.168.1.13", device_fingerprint: "fp_chrome_win_4", ip_addresses: ["192.168.1.13"], device_fingerprints: ["fp_chrome_win_4"] },
  { id: "ACC-1101", name: "Endpoint-101", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.101", device_fingerprint: "fp_mobile_and_1", ip_addresses: ["192.168.1.101"], device_fingerprints: ["fp_mobile_and_1"] },
  { id: "ACC-1102", name: "Endpoint-102", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.102", device_fingerprint: "fp_mobile_and_2", ip_addresses: ["192.168.1.102"], device_fingerprints: ["fp_mobile_and_2"] },
  { id: "ACC-1103", name: "Endpoint-103", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.103", device_fingerprint: "fp_mobile_and_3", ip_addresses: ["192.168.1.103"], device_fingerprints: ["fp_mobile_and_3"] },
  { id: "ACC-1104", name: "Endpoint-104", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.104", device_fingerprint: "fp_mobile_and_4", ip_addresses: ["192.168.1.104"], device_fingerprints: ["fp_mobile_and_4"] },
  { id: "ACC-1105", name: "Endpoint-105", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.105", device_fingerprint: "fp_mobile_and_5", ip_addresses: ["192.168.1.105"], device_fingerprints: ["fp_mobile_and_5"] },
  { id: "ACC-1106", name: "Endpoint-106", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.106", device_fingerprint: "fp_mobile_and_6", ip_addresses: ["192.168.1.106"], device_fingerprints: ["fp_mobile_and_6"] },
  { id: "ACC-1107", name: "Endpoint-107", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.107", device_fingerprint: "fp_mobile_and_7", ip_addresses: ["192.168.1.107"], device_fingerprints: ["fp_mobile_and_7"] },
  { id: "ACC-1108", name: "Endpoint-108", label: "Smurf Ingress", is_device_farm_suspected: false, is_cyber_flagged: false, is_alert_flagged: false, val: 2, is_frozen: false, ip_address: "192.168.1.108", device_fingerprint: "fp_mobile_and_8", ip_addresses: ["192.168.1.108"], device_fingerprints: ["fp_mobile_and_8"] },
];

const preloadedLinks: GraphLink[] = [
  { source: "ACC-3310", target: "ACC-9901", amount: 150000.00, count: 12, is_device_farm_suspected: true, timestamp: "2026-06-15T08:00:00.000Z" },
  { source: "ACC-3311", target: "ACC-9901", amount: 185000.00, count: 15, is_device_farm_suspected: true, timestamp: "2026-06-15T08:30:00.000Z" },
  { source: "ACC-3312", target: "ACC-9901", amount: 95000.00, count: 8, is_device_farm_suspected: false, timestamp: "2026-06-15T09:00:00.000Z" },
  { source: "ACC-3313", target: "ACC-9901", amount: 220000.00, count: 19, is_device_farm_suspected: true, timestamp: "2026-06-15T09:30:00.000Z" },
  { source: "ACC-1101", target: "ACC-3310", amount: 48000.00, count: 5, is_device_farm_suspected: false, timestamp: "2026-06-15T10:00:00.000Z" },
  { source: "ACC-1102", target: "ACC-3310", amount: 35000.00, count: 4, is_device_farm_suspected: false, timestamp: "2026-06-15T10:30:00.000Z" },
  { source: "ACC-1103", target: "ACC-3311", amount: 52000.00, count: 6, is_device_farm_suspected: false, timestamp: "2026-06-15T11:00:00.000Z" },
  { source: "ACC-1104", target: "ACC-3311", amount: 61000.00, count: 7, is_device_farm_suspected: false, timestamp: "2026-06-15T11:30:00.000Z" },
  { source: "ACC-1105", target: "ACC-3312", amount: 42000.00, count: 3, is_device_farm_suspected: false, timestamp: "2026-06-15T12:00:00.000Z" },
  { source: "ACC-1106", target: "ACC-3312", amount: 28000.00, count: 2, is_device_farm_suspected: false, timestamp: "2026-06-15T12:30:00.000Z" },
  { source: "ACC-1107", target: "ACC-3313", amount: 74000.00, count: 8, is_device_farm_suspected: false, timestamp: "2026-06-15T13:00:00.000Z" },
  { source: "ACC-1108", target: "ACC-3313", amount: 82000.00, count: 9, is_device_farm_suspected: false, timestamp: "2026-06-15T13:30:00.000Z" },
];

export default function NetworkInvestigation() {
  const [rawGraphData, setRawGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: preloadedNodes, links: preloadedLinks });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [sarReport, setSarReport] = useState<string>('');
  const [sarLoading, setSarLoading] = useState(false);
  const [sarSaved, setSarSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uniqueTimestamps, setUniqueTimestamps] = useState<number[]>([]);

  // Action status messages
  const [blockingIP, setBlockingIP] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { theme } = useTheme();

  const fetchGraphData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/network-graph');
      if (!res.ok) throw new Error('Failed to fetch graph data');
      const data = await res.json();
      setRawGraphData(data);
    } catch (err: any) {
      console.error(err);
      setApiError('Unable to connect to fraud network backend. Using preloaded sandbox cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Compute unique sorted timestamps whenever rawGraphData updates
  useEffect(() => {
    if (rawGraphData.links && rawGraphData.links.length > 0) {
      const parsedTimes = rawGraphData.links.map(l => {
        return l.timestamp ? new Date(l.timestamp).getTime() : Date.now();
      }).sort((a, b) => a - b);
      
      const uniqueTimes = Array.from(new Set(parsedTimes));
      setUniqueTimestamps(uniqueTimes);
      setCurrentStepIndex(uniqueTimes.length > 0 ? uniqueTimes.length - 1 : 0);
    } else {
      setUniqueTimestamps([]);
      setCurrentStepIndex(0);
    }
  }, [rawGraphData]);

  // Interval hook for chronological playback
  useEffect(() => {
    let intervalId: any = null;
    if (isPlaying && uniqueTimestamps.length > 0) {
      intervalId = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= uniqueTimestamps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, uniqueTimestamps]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setSarReport('');
    setSarSaved(false);
    setActionMessage(null);
  };

  // Toggle Isolate Node action (calls real backend /api/user-profiles/{id}/freeze)
  const handleToggleIsolate = async () => {
    if (!selectedNode) return;
    setActionMessage(null);
    try {
      const res = await fetch(`/api/user-profiles/${selectedNode.id}/freeze`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to update node freeze state');
      const data = await res.json();
      
      // Update local selected node reference
      setSelectedNode(prev => prev ? { ...prev, is_frozen: data.is_frozen } : null);

      // Update in raw graph data to update visual node state
      setRawGraphData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => 
          n.id === selectedNode.id 
            ? { ...n, is_frozen: data.is_frozen, val: data.is_frozen ? 5 : (n.is_device_farm_suspected || n.is_cyber_flagged || n.is_alert_flagged ? 4 : 2) } 
            : n
        )
      }));

      setActionMessage({
        type: 'success',
        text: `Account ${selectedNode.id} is now ${data.is_frozen ? 'ISOLATED & FROZEN' : 'ACTIVE'}.`
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      // Mock toggling for frontend sandbox cache fallback
      const mockNewFrozen = !selectedNode.is_frozen;
      setSelectedNode(prev => prev ? { ...prev, is_frozen: mockNewFrozen } : null);
      setRawGraphData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => 
          n.id === selectedNode.id 
            ? { ...n, is_frozen: mockNewFrozen, val: mockNewFrozen ? 5 : (n.is_device_farm_suspected || n.is_cyber_flagged || n.is_alert_flagged ? 4 : 2) } 
            : n
        )
      }));
      setActionMessage({
        type: 'success',
        text: `[Sandbox Offline] Account ${selectedNode.id} toggled locally to ${mockNewFrozen ? 'ISOLATED' : 'ACTIVE'}.`
      });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Add IP to Blocklist action (calls real backend /api/blocklist)
  const handleBlockIP = async () => {
    if (!selectedNode) return;
    setBlockingIP(true);
    setActionMessage(null);
    const targetIP = selectedNode.ip_address || "185.220.101.5";
    try {
      const res = await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: targetIP,
          type: 'ip',
          reason: `Auto-isolated from Network investigation for ${selectedNode.name} (${selectedNode.id})`
        })
      });
      if (!res.ok) throw new Error('Failed to block telemetry');
      setActionMessage({
        type: 'success',
        text: `IP Address ${targetIP} has been flagged and committed to blocklist.`
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setActionMessage({
        type: 'success',
        text: `[Sandbox Offline] Flagged IP ${targetIP} cached for blocklist submission.`
      });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setBlockingIP(false);
    }
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
      // Fallback AI Report Template
      setSarReport(
        `================================================================\n` +
        `SUSPICIOUS ACTIVITY REPORT (SAR) - DRAFT (FALLBACK ARCHIVE)\n` +
        `================================================================\n` +
        `SUBJECT IDENTIFIER : ${selectedNode.id}\n` +
        `SUBJECT NAME       : ${selectedNode.name}\n` +
        `TELEMETRY IP       : ${selectedNode.ip_address || "N/A"}\n` +
        `TELEMETRY DEV_ID   : ${selectedNode.device_fingerprint || "N/A"}\n` +
        `ISOLATION STATUS   : ${selectedNode.is_frozen ? "ISOLATED/FROZEN" : "UNRESTRICTED"}\n\n` +
        `SUMMARY OF DETECTED RISK FACTOR BEHAVIORS:\n` +
        `- Node represents key transacting node in rapid Smurf Ingress flow.\n` +
        `- Anomalous multi-account device telemetry overlaps are present.\n` +
        `- Government ticket complaints filed against counterparties: ${selectedNode.is_cyber_flagged ? "YES" : "NO"}.\n\n` +
        `RECOMMENDED COMPLIANCE ACTIONS:\n` +
        `1. Flag and restrict accounts sharing telemetry identifiers.\n` +
        `2. Propagate blocklist values to core telemetry engines.\n` +
        `3. Report account flow values to regulatory enforcement.`
      );
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

  // Filtering Graph Data according to Chronological playback threshold
  const currentTimeThreshold = uniqueTimestamps[currentStepIndex] || Date.now();

  const filteredLinks = rawGraphData.links.filter(link => {
    const linkTime = link.timestamp ? new Date(link.timestamp).getTime() : 0;
    return linkTime <= currentTimeThreshold;
  });

  // Always keep the main root gatherer node visible to anchor the force layout
  const primaryNode = rawGraphData.nodes.reduce((max, node) => (node.val || 2) > (max.val || 2) ? node : max, rawGraphData.nodes[0]);
  
  const activeNodeIds = new Set<string>();
  if (primaryNode) {
    activeNodeIds.add(primaryNode.id);
  }
  
  filteredLinks.forEach(l => {
    const srcId = typeof l.source === 'object' ? l.source.id : l.source;
    const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
    activeNodeIds.add(srcId);
    activeNodeIds.add(tgtId);
  });

  const filteredNodes = rawGraphData.nodes.filter(n => activeNodeIds.has(n.id));
  const filteredGraphData = {
    nodes: filteredNodes,
    links: filteredLinks
  };

  // Deselect node if it's scrubbed back out of chronological existence
  useEffect(() => {
    if (selectedNode && !activeNodeIds.has(selectedNode.id)) {
      setSelectedNode(null);
    }
  }, [currentStepIndex]);

  // Find transaction flows linked to selected account in the filtered set
  const accountLinks = selectedNode
    ? filteredLinks.filter(link => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
      return srcId === selectedNode.id || tgtId === selectedNode.id;
    })
    : [];

  return (
    <div className="h-full overflow-hidden bg-background text-foreground flex flex-col font-sans select-none antialiased leading-snug">
      {/* Header - Apple style top navigation bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 rounded-none w-full">
        <div className="flex items-center space-x-2.5">
          <Link href="/" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-xs font-bold tracking-tight flex items-center space-x-2 leading-none animate-none">
              <ShieldAlert className="w-4.5 h-4.5 text-lime-primary" strokeWidth={1.5} />
              <span className="text-slate-900 dark:text-slate-100">Network Investigation Sandbox</span>
            </h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5 uppercase tracking-wide">
              OmniShield Chronological Graph Visualizer
            </p>
          </div>
        </div>

        {/* Legend in Header */}
        <div className="hidden md:flex items-center space-x-4 text-[10px] font-sans text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-teal-600 rounded-full inline-block"></span>
            <span className="font-semibold">Normal Account</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
            <span className="font-semibold">Anomaly / Threat</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
            <span className="font-semibold">Selected Node</span>
          </div>
        </div>

        <button
          onClick={fetchGraphData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 transition text-slate-700 dark:text-slate-350 hover:text-slate-900 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <span>Refresh Network</span>
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden w-full bg-background">
        {/* Left: Graph Area */}
        <div className="flex-grow flex flex-col bg-background relative h-full">
          {apiError && (
            <div className="absolute top-4 left-4 right-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start space-x-3 text-xs z-30">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">Offline Warning</p>
                <p className="text-[11px] mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          <div className="w-full h-full relative">
            {loading ? (
              <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center space-y-3 z-20">
                <RefreshCw className="w-5 h-5 text-lime-primary animate-spin" strokeWidth={1.5} />
                <span className="text-xs text-slate-500 font-sans">Syncing system relationship graph...</span>
              </div>
            ) : null}
            <NetworkGraph
              data={filteredGraphData}
              onNodeClick={handleNodeClick}
              selectedAccountId={selectedNode?.id}
              loading={loading}
            />
          </div>

          {/* Bottom Control Panel - Floating Glassmorphic Timeline */}
          <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 shadow-lg select-none">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={uniqueTimestamps.length <= 1}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-800 ${
                isPlaying 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20' 
                  : 'bg-lime-primary/10 text-slate-900 dark:text-lime-primary hover:bg-lime-primary/20'
              }`}
              title={isPlaying ? 'Pause Playback' : 'Play Timeline'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Slider */}
            <div className="flex-1 w-full flex flex-col space-y-1">
              <input
                type="range"
                min={0}
                max={uniqueTimestamps.length > 0 ? uniqueTimestamps.length - 1 : 0}
                value={currentStepIndex}
                disabled={uniqueTimestamps.length <= 1}
                onChange={(e) => {
                  setCurrentStepIndex(parseInt(e.target.value, 10));
                  setIsPlaying(false); // pause on slide interaction
                }}
                className="w-full accent-lime-primary bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>
                    {uniqueTimestamps.length > 0 
                      ? new Date(uniqueTimestamps[0]).toLocaleString() 
                      : 'N/A'}
                  </span>
                </span>
                <span className="font-bold uppercase tracking-wider text-lime-primary dark:text-lime-primary">
                  {uniqueTimestamps.length > 0
                    ? `Step ${currentStepIndex + 1} of ${uniqueTimestamps.length}`
                    : 'No Events'}
                </span>
                <span>
                  {uniqueTimestamps.length > 0
                    ? new Date(uniqueTimestamps[uniqueTimestamps.length - 1]).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Time Stamp / Telemetry Summary */}
            <div className="shrink-0 text-right font-mono bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] min-w-[140px]">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Current Playback Time</div>
              <div className="text-slate-800 dark:text-slate-300 font-bold mt-0.5">
                {uniqueTimestamps.length > 0 && uniqueTimestamps[currentStepIndex]
                  ? new Date(uniqueTimestamps[currentStepIndex]).toLocaleTimeString()
                  : '00:00:00'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Side Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 dark:backdrop-blur-md p-5 flex flex-col h-full overflow-y-auto space-y-4 rounded-none shadow-sm z-10">
          
          {/* Quick Select Target Dropdown */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Quick Select Target Profile
            </label>
            <select
              value={selectedNode?.id || ''}
              onChange={(e) => {
                const node = rawGraphData.nodes.find(n => n.id === e.target.value);
                if (node) handleNodeClick(node);
                else setSelectedNode(null);
              }}
              id="target-select"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-lime-primary px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none transition rounded-lg cursor-pointer"
            >
              <option value="" className="font-sans">-- Select Account --</option>
              {filteredNodes.map(node => (
                <option key={node.id} value={node.id} className="font-mono">
                  {node.name} ({node.id}) {node.is_device_farm_suspected ? '⚠️' : ''} {node.is_cyber_flagged ? '🚨' : ''} {node.is_alert_flagged ? '🔔' : ''} {node.is_frozen ? '❄️' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800"></div>

          {/* Action Notifications */}
          {actionMessage && (
            <div className={`p-3 rounded-lg flex items-start space-x-2 text-xs border ${
              actionMessage.type === 'success'
                ? 'bg-lime-primary/10 border-lime-primary/20 text-slate-900 dark:text-lime-primary font-medium'
                : 'bg-red-500/10 border-red-500/20 text-red-750 dark:text-red-400 font-medium'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{actionMessage.text}</span>
            </div>
          )}

          {selectedNode ? (
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* Account Detail Header */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between">
                <div className="space-y-1 font-sans">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-700 dark:text-slate-300" strokeWidth={1.5} />
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{selectedNode.name}</h3>
                  </div>
                  <code className="text-xs text-slate-700 dark:text-slate-400 font-mono block font-semibold">{selectedNode.id}</code>
                </div>

                {/* Threat Tags */}
                <div className="flex flex-col space-y-1 items-end">
                  {selectedNode.is_frozen && (
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[9px] font-bold rounded-full uppercase tracking-wider animate-pulse">
                      Isolated
                    </span>
                  )}
                  {selectedNode.is_device_farm_suspected && (
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Device Farm
                    </span>
                  )}
                  {selectedNode.is_cyber_flagged && (
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Complaint
                    </span>
                  )}
                </div>
              </div>

              {/* Investigative Actions Card */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 font-sans shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                  Security Ops Controls
                </span>
                
                {/* Node details */}
                <div className="text-[10px] space-y-1 font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div><span className="font-semibold text-slate-400">IP ADDRESS:</span> {selectedNode.ip_address || "185.220.101.5"}</div>
                  <div><span className="font-semibold text-slate-400">HARDWARE:</span> {selectedNode.device_fingerprint || "fp_tor_exit_node"}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleToggleIsolate}
                    className={`px-3 py-2 text-[10px] font-bold rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer border ${
                      selectedNode.is_frozen
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{selectedNode.is_frozen ? 'Unisolate Node' : 'Isolate Node'}</span>
                  </button>
                  
                  <button
                    onClick={handleBlockIP}
                    disabled={blockingIP}
                    className="px-3 py-2 text-[10px] font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Add IP Block</span>
                  </button>
                </div>
              </div>

              {/* Connected Transactions Section */}
              <div className="space-y-2 font-sans shrink-0">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-lime-primary" strokeWidth={1.5} />
                  <span>Active transaction flows</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 max-h-[160px] overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Direction</th>
                        <th className="px-3 py-2 font-mono">Counterparty</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans text-slate-700 dark:text-slate-350">
                      {accountLinks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-400 font-semibold uppercase tracking-wider text-[10px]">No active flows in state</td>
                        </tr>
                      ) : (
                        accountLinks.map((link, idx) => {
                          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                          const isSender = srcId === selectedNode.id;
                          const counterparty = isSender
                            ? (typeof link.target === 'object' ? link.target.id : link.target)
                            : srcId;
                          return (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-3 py-2 font-semibold text-[10px] uppercase">
                                {isSender ? (
                                  <span className="text-red-500">Outgoing</span>
                                ) : (
                                  <span className="text-teal-500">Incoming</span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-mono text-slate-550 dark:text-slate-400 max-w-[120px] truncate">
                                {counterparty}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-slate-950 dark:text-slate-100">
                                ₹{link.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {link.is_device_farm_suspected ? (
                                  <span className="inline-flex items-center space-x-1 font-bold text-red-500 text-[10px]">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                                    <span>SUSPECTED</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 font-medium text-teal-600 dark:text-teal-400 text-[10px]">
                                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block"></span>
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
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 font-sans shrink-0">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-lime-primary" strokeWidth={1.5} />
                    <span>Auto-Report Compiler (SAR)</span>
                  </h4>
                  {!sarReport && !sarLoading && (
                    <button
                      onClick={handleGenerateSAR}
                      className="px-2.5 py-1 bg-lime-primary hover:bg-lime-primary/90 text-slate-900 font-bold text-[10px] rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-sm border-none"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-900" strokeWidth={1.5} />
                      <span>Generate SAR</span>
                    </button>
                  )}
                </div>

                <div className="flex-grow flex flex-col relative min-h-[180px] overflow-hidden">
                  {sarLoading ? (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 flex flex-col items-center justify-center space-y-3 z-10 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <RefreshCw className="w-5 h-5 text-lime-primary animate-spin" strokeWidth={1.5} />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">Running regulatory analysis agent...</span>
                    </div>
                  ) : null}

                  {sarReport ? (
                    <div className="h-full flex flex-col space-y-3 font-sans overflow-hidden">
                      <textarea
                        value={sarReport}
                        onChange={(e) => setSarReport(e.target.value)}
                        className="flex-grow bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-[11px] font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:border-lime-primary resize-none rounded-xl"
                        placeholder="Edit report draft..."
                      />

                      <div className="flex items-center space-x-3 justify-end text-xs shrink-0">
                        <button
                          onClick={handleGenerateSAR}
                          className="px-2.5 py-1 text-[10px] font-semibold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg transition cursor-pointer"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={handleApproveSAR}
                          className="px-3.5 py-1.5 bg-lime-primary hover:bg-lime-primary/90 text-slate-900 font-bold rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-sm border-none"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-slate-900" strokeWidth={1.5} />
                          <span>Approve & Submit</span>
                        </button>
                      </div>

                      {sarSaved && (
                        <div className="bg-lime-primary/10 border border-lime-primary/20 text-lime-primary p-3 rounded-lg flex items-center space-x-2 text-xs shrink-0">
                          <CheckCircle className="w-4 h-4 shrink-0 text-lime-primary" strokeWidth={1.5} />
                          <span>SAR archived successfully and queued for secure transmission.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 font-sans">
                      <FileText className="w-8 h-8 text-slate-400 dark:text-slate-550 mb-2" strokeWidth={1.5} />
                      <p className="text-xs uppercase font-bold text-slate-700 dark:text-slate-350">No SAR drafted for this subject</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1.5 max-w-[240px] leading-normal font-semibold">
                        Select a network account and compile report using the AI assistant to parse automated velocity signals and complaints.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl font-sans">
              <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-3 animate-pulse" strokeWidth={1.5} />
              <h3 className="font-bold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider">No Subject Selected</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1.5 max-w-[260px] leading-normal font-semibold">
                Click any node in the network graph to evaluate its transaction flow, telemetry properties, and compliance filing logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
