'use client';

import { useState } from "react";
import { Brain, RefreshCw, AlertTriangle, BarChart3 } from "lucide-react";

export default function MLAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [sampleData, setSampleData] = useState<any>({
    actual_target: 1,
    features: {
      "Time-to-Transfer (F115)": 1.45,
      "IP Ingress Velocity (F531)": 4.8,
      "Emulator Flags (F670)": true
    }
  });

  const mockSHAP = [
    { feature: "Time-to-Transfer (F115)", importance: 0.88, value: 1.45 },
    { feature: "IP Ingress Velocity (F531)", importance: 0.76, value: 4.8 },
    { feature: "Shared Device Fingerprint (F3894)", importance: 0.65, value: "farm_hash_928" },
    { feature: "Emulator Flag Trigger (F670)", importance: 0.54, value: true },
    { feature: "Transaction Frequency (F2122)", importance: 0.42, value: 18.5 },
  ];

  const [prediction, setPrediction] = useState<any>({
    is_suspicious: true,
    mule_probability: 0.942,
    top_contributing_features: mockSHAP
  });
  const [error, setError] = useState<string | null>(null);

  const fetchSampleAndPredict = async () => {
    setLoading(true);
    setError(null);
    setSampleData(null);
    setPrediction(null);
    
    try {
      // 1. Fetch random sample from dataset
      const sampleRes = await fetch("/api/ml-sample");
      if (!sampleRes.ok) throw new Error("Failed to fetch ML sample. Make sure DataSet.csv exists and backend is running.");
      
      const sample = await sampleRes.json();
      setSampleData(sample);

      // 2. Predict using the features
      const predictRes = await fetch("/api/ml-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sample.features)
      });
      
      if (!predictRes.ok) throw new Error("Prediction failed. Model may not be loaded.");
      const result = await predictRes.json();
      setPrediction(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-y-auto transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-4 h-4 text-lime-primary" strokeWidth={1.5} />
            <span>AI/ML Mule Classification</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1.5">
            Evaluate suspicious accounts using high-dimensional feature engineering and predictive risk scoring models.
          </p>
        </div>
        <button
          onClick={fetchSampleAndPredict}
          disabled={loading}
          className="bg-lime-primary hover:bg-lime-primary/90 text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm animate-none border-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          <span>{loading ? "Analyzing Vector..." : "Load Random Test Sample"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/20 text-red-650 p-4 rounded-lg flex items-start gap-3 text-xs shrink-0">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" strokeWidth={1.5} />
          <p>{error}</p>
        </div>
      )}

      {prediction && sampleData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans flex-grow">
          
          {/* Risk Score Card */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-6">Mule Probability Score</h2>
            
            <div className="relative w-40 h-40 mb-6">
              {/* Simple CSS Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={prediction.is_suspicious ? "#ef4444" : "#A0D585"} 
                  strokeWidth="6" 
                  strokeDasharray={`${prediction.mule_probability * 283} 283`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100 font-mono leading-none">
                  {(prediction.mule_probability * 100).toFixed(1)}%
                </span>
                <span className="text-slate-705 dark:text-slate-400 text-[9px] mt-1 font-bold uppercase tracking-wider">Confidence</span>
              </div>
            </div>

            {prediction.is_suspicious ? (
              <div className="flex items-center space-x-1.5 text-xs text-red-655 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                <span>Suspicious Mule</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-xs text-teal-650 dark:text-teal-400 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-teal-650 dark:bg-teal-400 rounded-full inline-block"></span>
                <span>Legitimate</span>
              </div>
            )}
            
            {sampleData.actual_target !== null && (
              <div className="mt-4 text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                Actual Ground Truth: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{sampleData.actual_target === 1 ? "MULE (1)" : "NORMAL (0)"}</span>
              </div>
            )}
          </div>

          {/* Feature Importance XAI Chart */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <BarChart3 className="w-4 h-4 text-lime-primary" strokeWidth={1.5} />
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Explainable AI: Key Contributors</h2>
            </div>
            
            <div className="space-y-4">
              {prediction.top_contributing_features.map((feat: any, idx: number) => {
                const importancePercent = feat.importance * 100;
                const isKeyHackathonFeature = ['F115', 'F321', 'F527', 'F531', 'F670', 'F1692', 'F2082', 'F2122', 'F2582', 'F2678', 'F2737', 'F2956', 'F3043', 'F3836', 'F3887', 'F3889', 'F3891', 'F3894'].includes(feat.feature);
                
                return (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className={`font-mono font-bold ${isKeyHackathonFeature ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {feat.feature} {isKeyHackathonFeature && '★'}
                      </span>
                      <span className="text-slate-550 dark:text-slate-450 font-mono text-[10px]">
                        Value: {feat.value !== null ? (typeof feat.value === 'number' ? feat.value.toFixed(4) : String(feat.value)) : "NaN"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-850">
                      <div 
                        className={`h-full rounded-full ${isKeyHackathonFeature ? 'bg-lime-primary' : 'bg-slate-400 dark:bg-slate-600'}`}
                        style={{ width: `${Math.max(importancePercent, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-6 text-center">
              Features marked with <span className="text-lime-primary font-bold">★</span> indicate key fraud indicators flagged by the consortium.
            </p>
          </div>
          
        </div>
      )}

      {!prediction && !loading && !error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center flex flex-col items-center shadow-sm">
          <Brain className="w-12 h-12 text-slate-500 dark:text-slate-400 mb-4" strokeWidth={1.5} />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Ready for Machine Learning Evaluation</h3>
          <p className="text-xs text-slate-550 dark:text-slate-400 max-w-sm leading-relaxed font-medium">
            Click the button above to load an anonymous 3,924-dimensional feature vector from the dataset and evaluate it using our trained ensemble classifier.
          </p>
        </div>
      )}
    </div>
  );
}
