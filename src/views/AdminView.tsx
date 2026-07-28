import React, { useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { Worker } from '../types';
import { UserAccountManager } from '../components/UserAccountManager';

interface AdminViewProps {
  workers: Worker[];
  onAddWorker: (workerData: Partial<Worker>) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ workers }) => {
  // AI threshold configuration settings
  const [aiThreshold, setAiThreshold] = useState<number>(85);
  const [duplicateDistance, setDuplicateDistance] = useState<number>(350);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-purple-900 text-white p-8 rounded-3xl border border-purple-800 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-purple-300">
          <Settings className="w-6 h-6" />
          <span className="text-xs font-extrabold uppercase tracking-widest bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            System Administrator Console
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">SafeCity Platform Control</h1>
        <p className="text-xs sm:text-sm text-purple-200 max-w-2xl">
          Manage officer & field worker accounts, credentials & access control, Gemini AI classification thresholds, and system integration parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Account & Credentials Manager */}
        <div className="lg:col-span-2">
          <UserAccountManager currentRole="admin" workers={workers} />
        </div>

        {/* AI Threshold & Settings Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>AI Model Settings</span>
          </h2>

          <div className="space-y-4 text-xs font-medium text-slate-700">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Primary Gemini Model</label>
              <input
                type="text"
                disabled
                value="gemini-3.6-flash (Server Side @google/genai)"
                className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-[11px] font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-bold text-slate-800">AI Completion Threshold</label>
                <span className="font-mono font-bold text-blue-600">{aiThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={98}
                value={aiThreshold}
                onChange={(e) => setAiThreshold(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-[10px] text-slate-400 block">
                Minimum visual confidence required to auto-approve worker repair evidence.
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-bold text-slate-800">Duplicate Radius Buffer</label>
                <span className="font-mono font-bold text-blue-600">{duplicateDistance} meters</span>
              </div>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={duplicateDistance}
                onChange={(e) => setDuplicateDistance(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
