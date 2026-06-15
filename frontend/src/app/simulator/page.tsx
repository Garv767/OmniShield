'use client';

import React, { useState } from 'react';
import { Globe, Send, Loader } from 'lucide-react';

export default function SimulatorPage() {
  const [txSender, setTxSender] = useState('ACC_001');
  const [txReceiver, setTxReceiver] = useState('ACC_002');
  const [txAmount, setTxAmount] = useState('250.00');
  const [txIp, setTxIp] = useState('192.168.1.100');
  const [txFingerprint, setTxFingerprint] = useState('fingerprint_desktop_chrome');
  const [txLoginDelay, setTxLoginDelay] = useState('1.5');
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);

  const handleSimulateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxSubmitting(true);
    setTxResult(null);

    const now = new Date();
    const delaySecs = parseFloat(txLoginDelay) || 0.0;
    const loginTime = new Date(now.getTime() - (delaySecs * 1000));

    const payload = {
      sender_account: txSender,
      receiver_account: txReceiver,
      amount: parseFloat(txAmount),
      timestamp: now.toISOString(),
      device_metadata: {
        ip_address: txIp,
        device_fingerprint: txFingerprint,
        login_time: loginTime.toISOString()
      }
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setTxResult({
          success: true,
          data: data
        });
      } else {
        setTxResult({
          success: false,
          error: data.detail || 'Failed to process transaction'
        });
      }
    } catch (err: any) {
      setTxResult({
        success: false,
        error: 'API offline.'
      });
    } finally {
      setTxSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-6 font-sans">
      <h1 className="text-sm font-bold text-slate-900">Transaction Ingestion Simulator</h1>
      
      <div className="bg-white p-6 border border-slate-200 rounded-xl max-w-2xl shadow-sm">
        <div className="space-y-1.5 mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Globe className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span>Transaction Parameters</span>
          </h3>
          <p className="text-xs text-slate-500">
            Inject custom simulated transaction streams to evaluate IP velocity or device emulator anomalies.
          </p>
        </div>

        <form onSubmit={handleSimulateTransaction} className="space-y-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Sender Account ID</label>
                <input
                  type="text"
                  value={txSender}
                  onChange={(e) => setTxSender(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none px-3 py-2 text-xs font-mono text-slate-900 transition rounded-lg"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Receiver Account ID</label>
                <input
                  type="text"
                  value={txReceiver}
                  onChange={(e) => setTxReceiver(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none px-3 py-2 text-xs font-mono text-slate-900 transition rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none px-3 py-2 text-xs text-slate-900 transition rounded-lg font-mono"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">IP Address</label>
                <input
                  type="text"
                  value={txIp}
                  onChange={(e) => setTxIp(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none px-3 py-2 text-xs font-mono text-slate-900 transition rounded-lg"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Fingerprint</label>
                <input
                  type="text"
                  value={txFingerprint}
                  onChange={(e) => setTxFingerprint(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none px-3 py-2 text-xs font-mono text-slate-900 transition rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500 uppercase text-[9px]">Time-To-Transfer</span>
                <span className="text-blue-600 font-bold font-mono">{txLoginDelay} Seconds</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={txLoginDelay}
                onChange={(e) => setTxLoginDelay(e.target.value)}
                className="w-full accent-blue-500 bg-slate-200 h-1 appearance-none cursor-pointer rounded-full"
              />
              <div className="flex justify-between text-[9px] text-slate-400 uppercase mt-1">
                <span>Emulator Threshold (&lt; 2s)</span>
                <span>Human Tolerance (&gt; 2s)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={txSubmitting}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition flex items-center space-x-2 cursor-pointer rounded-lg shadow-sm"
            >
              {txSubmitting ? (
                <Loader className="w-4 h-4 animate-spin text-white" strokeWidth={1.5} />
              ) : (
                <Send className="w-4 h-4 text-white" strokeWidth={1.5} />
              )}
              <span>Transmit Ingestion</span>
            </button>
          </div>
        </form>

        {txResult && (
          <div className={`mt-6 p-4 border rounded-lg text-xs ${txResult.success
            ? txResult.data.is_device_farm_suspected
              ? 'bg-red-500/5 border-red-500/20 text-red-700'
              : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700'
            : 'bg-red-500/5 border-red-500/20 text-red-700'
            }`}>
            {txResult.success ? (
              <div className="space-y-1.5">
                <p className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Ingestion Ingress Analysis:</p>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-700">Audit Status:</span>
                  {txResult.data.is_device_farm_suspected ? (
                    <span className="flex items-center space-x-1.5 font-bold">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                      <span>Flagged Anomaly</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 font-bold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                      <span>Approved / Standard Risk</span>
                    </span>
                  )}
                </div>
                {txResult.data.device_farm_reason && (
                  <p className="mt-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-500">Diagnostics:</span> {txResult.data.device_farm_reason}
                  </p>
                )}
              </div>
            ) : (
              <p className="font-mono">System Classification Error: {txResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
