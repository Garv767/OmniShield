'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((mod) => mod.default),
  { ssr: false }
);

interface GraphNode {
  id: string;
  name: string;
  label: string;
  is_device_farm_suspected: boolean;
  is_cyber_flagged: boolean;
  is_alert_flagged: boolean;
  val: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  amount: number;
  count: number;
  is_device_farm_suspected: boolean;
}

interface NetworkGraphProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  onNodeClick: (node: GraphNode) => void;
  selectedAccountId?: string | null;
  loading?: boolean;
}

import { useTheme } from '@/context/ThemeContext';

export default function NetworkGraph({ data, onNodeClick, selectedAccountId, loading }: NetworkGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const prevLoadingRef = useRef(false);
  useEffect(() => {
    const hasData = data.nodes.length > 0;
    const finishedLoading = prevLoadingRef.current && !loading;
    const initialLoad = !prevLoadingRef.current && !loading && hasData && fgRef.current;
    
    if ((finishedLoading || initialLoad) && fgRef.current && dimensions.width > 0) {
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.centerAt(0, 0, 0);
          fgRef.current.zoomToFit(400, 50);
        }
      }, 100);
    }
    prevLoadingRef.current = !!loading;
  }, [loading, data.nodes.length, dimensions.width]);

  const getNodeColor = (node: GraphNode) => {
    const isSelected = selectedAccountId === node.id;
    if (isSelected) return '#3b82f6'; // System Blue
    if (node.is_device_farm_suspected || node.is_cyber_flagged || node.is_alert_flagged) {
      return '#ef4444'; // Red for anomalies
    }
    return '#0d9488'; // Teal for clean/normal accounts
  };

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 relative">
      
      <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[9px] text-slate-500 dark:text-slate-400 pointer-events-none font-mono tracking-wider shadow-sm">
        DRAG TO PAN | SCROLL TO ZOOM | CLICK NODE TO PROFILE
      </div>

      <div ref={containerRef} className="w-full h-full min-h-[450px] flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {data.nodes.length === 0 || dimensions.width === 0 ? (
          <div className="text-slate-400 dark:text-slate-650 text-xs font-mono uppercase tracking-wider">
            {data.nodes.length === 0 ? "No transaction network data loaded" : "Calculating layout..."}
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel="label"
            nodeColor={getNodeColor as any}
            nodeVal={(node: any) => node.val || 2}
            nodeRelSize={4}
            linkWidth={(link: any) => (link.is_device_farm_suspected ? 2.5 : 1.2)}
            linkColor={(link: any) => (link.is_device_farm_suspected ? '#ef4444' : (isDark ? '#334155' : '#cbd5e1'))}
            linkDirectionalArrowLength={4.5}
            linkDirectionalArrowRelPos={0.95}
            linkDirectionalParticles={(link: any) => (link.is_device_farm_suspected ? 4 : 1)}
            linkDirectionalParticleSpeed={(link: any) => (link.is_device_farm_suspected ? 0.015 : 0.005)}
            linkDirectionalParticleWidth={2}
            onNodeClick={(node: any) => onNodeClick(node as GraphNode)}
            cooldownTicks={100}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const label = node.name;
              const fontSize = 10 / globalScale;
              ctx.font = `${fontSize}px Inter, -apple-system, sans-serif`;
              
              const color = getNodeColor(node);
              const isSelected = selectedAccountId === node.id;
              
              if (isSelected) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, (node.val || 2) * 2 + 3, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
                ctx.fill();
                ctx.lineWidth = 1 / globalScale;
                ctx.strokeStyle = '#3b82f6';
                ctx.stroke();
              }
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, (node.val || 2) * 2, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
              
              if (globalScale > 1.2) {
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);
                
                ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                ctx.shadowBlur = 4;
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y - bckgDimensions[1] / 2 - 14,
                  bckgDimensions[0],
                  bckgDimensions[1]
                );
                
                ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
                ctx.lineWidth = 0.5 / globalScale;
                ctx.strokeRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y - bckgDimensions[1] / 2 - 14,
                  bckgDimensions[0],
                  bckgDimensions[1]
                );
                
                ctx.shadowBlur = 0;
 
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
                ctx.fillText(label, node.x, node.y - 14);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
