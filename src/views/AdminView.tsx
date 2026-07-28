import React, { useState } from 'react';
import { Settings, Users, Building2, Sparkles, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Worker, Department } from '../types';

interface AdminViewProps {
  workers: Worker[];
  onAddWorker: (workerData: Partial<Worker>) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ workers, onAddWorker }) => {
  const [showAddWorker, setShowAddWorker] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [department, setDepartment] = useState<Department>('Road Department');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // AI threshold configuration settings
  const [aiThreshold, setAiThreshold] = useState<number>(85);
  const [duplicateDistance, setDuplicateDistance] = useState<number>(350);

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddWorker({
      name,
      department,
      phone: phone || '+1 (555) 000-1122',
      email: email || `${name.toLowerCase().replace(' ', '.')}@safecity.gov`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    setName('');
    setPhone('');
    setEmail('');
    setShowAddWorker(false);
    alert('New Field Technician created!');
  };

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
          Manage department rosters, field worker accounts, Gemini AI classification thresholds, and system integration parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Management Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Field Worker Roster ({workers.length})</span>
            </h2>
            <button
              onClick={() => setShowAddWorker(!showAddWorker)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Worker</span>
            </button>
          </div>

          {/* Add Worker Form */}
          {showAddWorker && (
            <form onSubmit={handleCreateWorker} className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-3">
              <h3 className="font-extrabold text-xs text-purple-900 uppercase">Register New Field Worker</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  required
                />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="Road Department">Road Department</option>
                  <option value="Electricity Department">Electricity Department</option>
                  <option value="Water & Sewerage">Water & Sewerage</option>
                  <option value="Sanitation & Waste">Sanitation & Waste</option>
                  <option value="Environmental Protection">Environmental Protection</option>
                  <option value="Public Safety & Infrastructure">Public Safety</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
                <input
                  type="email"
                  placeholder="Official Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorker(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          )}

          {/* Workers Table */}
          <div className="space-y-3">
            {workers.map((w) => (
              <div key={w.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img src={w.avatarUrl} alt={w.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-slate-900">{w.name} ({w.id})</div>
                    <div className="text-slate-500 text-[11px]">{w.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-700 block">{w.status}</span>
                  <span className="text-[10px] text-slate-400">{w.completedTasksCount} Tasks Closed</span>
                </div>
              </div>
            ))}
          </div>
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
