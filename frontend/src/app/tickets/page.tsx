'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader } from 'lucide-react';

export default function TicketsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    setCsvMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-government-tickets', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCsvMessage(`Successfully imported ${data.records_imported} government tickets.`);
      } else {
        setCsvMessage(data.detail || 'Failed to process CSV.');
      }
    } catch (err) {
      console.error(err);
      setCsvMessage('Upload connection error.');
    } finally {
      setCsvUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 min-h-[calc(100vh-53px)] flex flex-col space-y-6 bg-slate-50 font-sans">
      <div>
        <h1 className="text-sm font-bold text-slate-900">Cyber Complaint Ingestion</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload standardized CSV complaint registries received from local cyber authorities to queue target investigations.
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl min-h-0 space-y-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
          <div className="text-slate-500 uppercase text-[9px] font-bold border-b border-slate-100 pb-2 flex justify-between">
            <span>Required CSV Fields</span>
            <span>CSV Ingestion Standard</span>
          </div>
          <code className="block select-all bg-slate-50 p-2.5 border border-slate-200 text-slate-800 font-mono text-[11px] overflow-x-auto whitespace-nowrap rounded-md">
            ticket_id,reported_account,scam_type,report_date,details
          </code>
          <p className="text-[10px] text-slate-400">
            Example: TKT-99, ACC_005, CryptoPhishing, 2026-06-03T12:00, Phishing transfer target
          </p>
        </div>

        <div className="space-y-4">
          <input
             type="file"
             ref={fileInputRef}
             onChange={handleCsvUpload}
             accept=".csv"
             className="hidden"
          />
          
          <button
             onClick={() => fileInputRef.current?.click()}
             disabled={csvUploading}
             className="w-full py-8 border-2 border-dashed border-slate-200 hover:border-blue-500/50 bg-white hover:bg-slate-50/50 text-xs text-slate-500 hover:text-slate-800 transition flex flex-col items-center justify-center space-y-2.5 cursor-pointer rounded-xl shadow-sm"
          >
             {csvUploading ? (
               <Loader className="w-5 h-5 text-blue-500 animate-spin" strokeWidth={1.5} />
             ) : (
               <Upload className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
             )}
             <span className="font-bold text-xs tracking-wide">
               {csvUploading ? 'Processing CSV Records...' : 'Load Complaints CSV File'}
             </span>
             <div className="flex flex-col items-center space-y-0.5 text-[10px] text-slate-450">
               <span>Supported format: RFC 4180 compliant CSV</span>
               <span className="text-[9px] text-slate-400">Maximum file size: 50MB. Records will be queued in PostgreSQL.</span>
             </div>
          </button>

          {csvMessage && (
             <div className={`p-4 border text-xs text-center rounded-lg ${csvMessage.includes('Successfully')
               ? 'border-emerald-500/20 text-emerald-700 bg-emerald-500/5'
               : 'border-red-500/20 text-red-700 bg-red-500/5'
             }`}>
               {csvMessage}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
