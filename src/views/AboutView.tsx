import React from 'react';
import { Info, ShieldAlert, Cpu, Database, Server, Layers, CheckCircle2, Code2, Globe } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
          MCA Research & Smart City Architecture Project
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          SafeCity Architecture Specification
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Full-stack public hazard intelligence platform architecture combining browser GPS detection, computer vision AI classification with Gemini 3.6 Flash, geospatial GIS heatmapping, and automated municipal workflow state machines.
        </p>
      </div>

      {/* System Workflow Pipeline Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>Autonomous Hazard Intelligence Workflow</span>
        </h2>

        <div className="space-y-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-blue-700">1. Citizen Anonymous Capture:</strong> Photo/Video upload + Browser Geolocation API capture. ID generated via <code className="bg-slate-200 px-1 rounded">SC-2026-XXXX</code> format.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-indigo-700">2. Gemini 3.6 Flash Server AI Analysis:</strong> Vision model extracts hazard category, subcategory, severity score, emergency flag, and auto-routes to municipal department.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-amber-700">3. Spatial Duplicate Filter:</strong> Haversine distance formula (&lt;350m buffer) + AI semantic match checks if hazard is already registered.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-purple-700">4. Officer Verification & Worker Dispatch:</strong> Department officer verifies and assigns field technician equipped with GPS direction details.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-emerald-700">5. AI Completion Audit:</strong> Field worker uploads before & after repair photos. AI calculates confidence score (&gt;85% required) before marking complaint resolved.
          </div>
        </div>
      </div>

      {/* Database Schema & API Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Database Data Schema</span>
          </h3>
          <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
{`interface Complaint {
  id: string; // e.g. SC-2026-8921
  title: string;
  category: HazardCategory;
  severity: 'Low'|'Medium'|'High'|'Critical';
  isEmergency: boolean;
  latitude: number;
  longitude: number;
  status: 'Submitted'|'Verified'|
          'Assigned'|'In Progress'|'Resolved';
  assignedDepartment: Department;
  assignedWorkerId?: string;
  timeline: TimelineEvent[];
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  aiConfidenceScore?: number;
}`}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Server API Specification</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-slate-700">
            <li className="p-2 bg-slate-50 rounded-lg"><strong className="text-emerald-600">GET</strong> /api/complaints</li>
            <li className="p-2 bg-slate-50 rounded-lg"><strong className="text-blue-600">POST</strong> /api/complaints</li>
            <li className="p-2 bg-slate-50 rounded-lg"><strong className="text-indigo-600">POST</strong> /api/ai/analyze-hazard</li>
            <li className="p-2 bg-slate-50 rounded-lg"><strong className="text-amber-600">POST</strong> /api/ai/check-duplicate</li>
            <li className="p-2 bg-slate-50 rounded-lg"><strong className="text-purple-600">POST</strong> /api/ai/verify-completion</li>
            <li className="p-2 bg-slate-50 rounded-lg"><strong className="text-sky-600">GET</strong> /api/analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
