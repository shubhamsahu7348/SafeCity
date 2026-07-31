import React from 'react';
import {
  ShieldAlert,
  PlusCircle,
  MapPin,
  Search,
  Sparkles,
  Zap,
  Building2,
  HardHat,
  Flame,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Complaint } from '../types';
import { ComplaintCard } from '../components/ComplaintCard';

interface LandingViewProps {
  complaints: Complaint[];
  setActiveTab: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onUpvoteComplaint: (id: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  complaints,
  setActiveTab,
  onSelectComplaint,
  onUpvoteComplaint,
}) => {
  const activeComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
  );
  const emergencyComplaints = complaints.filter(
    (c) => c.isEmergency && c.status !== 'Resolved'
  );
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl text-white border border-indigo-900/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-violet-900/20 to-cyan-900/20 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />

        <div className="relative p-8 lg:p-12 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 flex items-center space-x-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart City Hazard Intelligence Platform</span>
            </span>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>98.4% AI Verification Accuracy</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Report Hazards Privately.{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
              Make Your City Safer.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100/90 max-w-3xl leading-relaxed font-medium">
            SafeCity empowers citizens to report potholes, electrical hazards, pipe bursts, and safety risks in seconds with AI location detection, automated department routing, and live resolution verification.
          </p>

          {/* Hero Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('report')}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5 text-cyan-200" />
              <span>Report Public Hazard Now</span>
            </button>

            <button
              onClick={() => setActiveTab('live-map')}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl border border-indigo-700/60 transition-all flex items-center space-x-2 shadow-md hover:border-indigo-500"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Explore Live Hazard Map</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className="px-6 py-3.5 bg-slate-900/70 hover:bg-slate-800 text-indigo-100 font-extrabold text-sm rounded-xl border border-indigo-800/60 transition-all flex items-center space-x-2 shadow-md hover:border-indigo-500"
            >
              <Search className="w-5 h-5 text-indigo-300" />
              <span>Track Complaint ID</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="pt-6 border-t border-indigo-900/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-white">{activeComplaints.length}</span>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">Active Hazards</span>
            </div>
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{resolvedCount}</span>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">Resolved Hazards</span>
            </div>
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-rose-400">{emergencyComplaints.length}</span>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">Emergency Hotspots</span>
            </div>
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">4.8 hrs</span>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">Avg Response Velocity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Active Hazards Ticker (If any exist) */}
      {emergencyComplaints.length > 0 && (
        <section className="bg-red-950/20 border-2 border-red-500/40 rounded-2xl p-5 text-slate-900 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-600 animate-bounce" />
              <h3 className="text-base font-extrabold text-red-700 uppercase tracking-wider">
                Critical Emergency Hazards Under Dispatch ({emergencyComplaints.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('live-map')}
              className="text-xs font-bold text-red-700 hover:underline flex items-center space-x-1"
            >
              <span>View On Emergency Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyComplaints.map((emergency) => (
              <div
                key={emergency.id}
                onClick={() => onSelectComplaint(emergency)}
                className="p-3 bg-white rounded-xl border border-red-300 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center space-x-3"
              >
                <img
                  src={emergency.photoUrl}
                  alt={emergency.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-red-600 text-white rounded">
                      CRITICAL
                    </span>
                    <span className="text-xs font-bold text-slate-500">{emergency.assignedDepartment}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {emergency.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {emergency.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Public Hazards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Recent Public Hazards Reported</h2>
            <p className="text-xs text-slate-500">Live citizen submissions across smart city sectors</p>
          </div>

          <button
            onClick={() => setActiveTab('live-map')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All On Interactive Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.slice(0, 6).map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onSelect={onSelectComplaint}
              onUpvote={onUpvoteComplaint}
            />
          ))}
        </div>
      </section>

      {/* How SafeCity AI Workflow Works */}
      <section className="bg-gradient-to-br from-indigo-50/80 via-slate-100 to-cyan-50/50 p-8 rounded-3xl border border-indigo-100 space-y-6 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/90 px-3.5 py-1 rounded-full border border-indigo-200">
            Autonomous Pipeline
          </span>
          <h2 className="text-2xl font-black text-slate-900">How SafeCity Solves Public Hazards</h2>
          <p className="text-xs font-medium text-slate-600">
            End-to-end transparent hazard intelligence workflow powered by advanced AI vision models
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black shadow-md">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Anonymous Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Upload photos/videos with automated browser GPS capture. No account registration needed.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-md">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">AI Analysis & Routing</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              AI classifies severity, checks duplicate hazards nearby, and routes to correct municipal department.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Field Worker Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Department officers verify and assign specialized field technicians equipped with GPS routing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
              4
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">AI Completion Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Worker uploads before & after repair photos. AI calculates confidence score before closing complaint.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
