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
    <div className="p-8 h-full flex flex-col space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-y-auto transition-colors duration-200">
      <div>
        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cyber Complaint Ingestion</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
          Upload standardized CSV complaint registries received from local cyber authorities to queue target investigations.
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl min-h-0 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-3">
          <div className="text-slate-700 dark:text-slate-400 uppercase text-[9px] font-bold border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between">
            <span>Required CSV Fields</span>
            <span>CSV Ingestion Standard</span>
          </div>
          <code className="block select-all bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-nowrap rounded-md">
            ticket_id,reported_account,scam_type,report_date,details
          </code>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
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
             className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-lime-primary/50 dark:hover:border-lime-primary/50 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition flex flex-col items-center justify-center space-y-2.5 cursor-pointer rounded-xl shadow-sm border-none"
          >
             {csvUploading ? (
                <Loader className="w-5 h-5 text-lime-primary animate-spin" strokeWidth={1.5} />
             ) : (
                <Upload className="w-5 h-5 text-slate-700 dark:text-slate-300" strokeWidth={1.5} />
             )}
             <span className="font-bold text-xs tracking-wide">
                {csvUploading ? 'Processing CSV Records...' : 'Load Complaints CSV File'}
             </span>
             <div className="flex flex-col items-center space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                <span>Supported format: RFC 4180 compliant CSV</span>
                <span className="text-[9px] text-slate-600 dark:text-slate-400">Maximum file size: 50MB. Records will be queued in PostgreSQL.</span>
             </div>
          </button>

          {csvMessage && (
             <div className={`p-4 border text-xs text-center rounded-lg ${csvMessage.includes('Successfully')
               ? 'border-lime-primary/20 text-lime-primary bg-lime-primary/10'
               : 'border-red-500/20 text-red-600 bg-red-500/10'
             }`}>
               {csvMessage}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
