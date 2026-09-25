import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
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
  Filter,
  Eye,
  Layers,
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
  const { t, translateDepartment, translateText, translateCategory } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [hazardSearch, setHazardSearch] = useState<string>('');
  const [showAllHazards, setShowAllHazards] = useState<boolean>(true);

  const activeComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
  );
  const emergencyComplaints = complaints.filter(
    (c) => c.isEmergency && c.status !== 'Resolved'
  );
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  // Filtered active hazards based on category pill and search query
  const displayedHazards = activeComplaints.filter((c) => {
    if (selectedFilter === 'Emergency') {
      if (!c.isEmergency && c.severity !== 'Critical') return false;
    } else if (selectedFilter !== 'All') {
      if (c.category !== selectedFilter) return false;
    }

    if (hazardSearch.trim()) {
      const q = hazardSearch.toLowerCase().trim();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchAddr = (c.address || '').toLowerCase().includes(q);
      const matchCat = (c.category || '').toLowerCase().includes(q);
      const matchSub = (c.subCategory || '').toLowerCase().includes(q);
      const matchId = (c.id || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAddr && !matchCat && !matchSub && !matchId) return false;
    }

    return true;
  });

  const visibleHazards = showAllHazards ? displayedHazards : displayedHazards.slice(0, 6);

  const scrollToHazards = (filter: string = 'All') => {
    setSelectedFilter(filter);
    const elem = document.getElementById('active-hazards-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              <span>{t('landing.smart_platform_badge', 'Smart City Hazard Intelligence Platform')}</span>
            </span>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('landing.ai_accuracy_badge', '98.4% AI Verification Accuracy')}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t('landing.hero_title_p1', 'Report Hazards Privately.')}{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
              {t('landing.hero_title_p2', 'Make Your City Safer.')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100/90 max-w-3xl leading-relaxed font-medium">
            {t('landing.hero_description', 'AapdaSetu empowers citizens to report potholes, electrical hazards, pipe bursts, and safety risks in seconds with AI location detection, automated department routing, and live resolution verification.')}
          </p>

          {/* Hero Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('report')}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5 text-cyan-200" />
              <span>{t('landing.report_now', 'Report Public Hazard Now')}</span>
            </button>

            <button
              onClick={() => setActiveTab('live-map')}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl border border-indigo-700/60 transition-all flex items-center space-x-2 shadow-md hover:border-indigo-500"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>{t('landing.explore_map', 'Explore Live Hazard Map')}</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className="px-6 py-3.5 bg-slate-900/70 hover:bg-slate-800 text-indigo-100 font-extrabold text-sm rounded-xl border border-indigo-800/60 transition-all flex items-center space-x-2 shadow-md hover:border-indigo-500"
            >
              <Search className="w-5 h-5 text-indigo-300" />
              <span>{t('nav.tab.track', 'Track Report')}</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="pt-6 border-t border-indigo-900/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => scrollToHazards('All')}
              className="text-left bg-slate-950/80 hover:bg-slate-900 p-4 rounded-2xl border border-indigo-900/50 hover:border-indigo-500 shadow-inner transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-300 transition-colors">{activeComplaints.length}</span>
                <Eye className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">{t('landing.active_hazards', 'Active Hazards')}</span>
              <span className="text-[10px] text-cyan-400 font-semibold flex items-center space-x-1 mt-0.5">
                <span>View all below</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </button>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{resolvedCount}</span>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">{t('landing.resolved_hazards', 'Resolved Hazards')}</span>
            </div>

            <button
              onClick={() => scrollToHazards('Emergency')}
              className="text-left bg-slate-950/80 hover:bg-slate-900 p-4 rounded-2xl border border-indigo-900/50 hover:border-red-500 shadow-inner transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-black text-rose-400 group-hover:text-rose-300 transition-colors">{emergencyComplaints.length}</span>
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              </div>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">{t('landing.emergency_hotspots', 'Emergency Hotspots')}</span>
              <span className="text-[10px] text-rose-400 font-semibold flex items-center space-x-1 mt-0.5">
                <span>Filter critical</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </button>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">4.8 hrs</span>
              <span className="block text-xs font-bold text-indigo-300/80 mt-1">{t('landing.avg_response', 'Avg Response Velocity')}</span>
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
                {t('landing.emergency_title', 'Critical Emergency Hazards Under Dispatch')} ({emergencyComplaints.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('live-map')}
              className="text-xs font-bold text-red-700 hover:underline flex items-center space-x-1"
            >
              <span>{t('landing.view_emergency_map', 'View On Emergency Map')}</span>
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
                      {t('severity.critical', 'CRITICAL')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{translateDepartment(emergency.assignedDepartment)}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {translateText(emergency.title)}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {translateText(emergency.address)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Live Map Radar CTA Banner (Map opens when clicking Live Map) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/50 shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                <MapPin className="w-5 h-5 text-cyan-300" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                Live Geospatial Radar
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t('landing.map_title', 'Live Geospatial Public Hazard Map')}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed font-medium">
              Explore real-time hazard markers, dynamic neighborhood radius radar (1–50 km), street cartography, and satellite imagery in the dedicated Live Map tab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-950/60 border border-indigo-900/50 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-slate-200">{activeComplaints.length} Live Pins Active</span>
            </div>
            <button
              onClick={() => setActiveTab('live-map')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <MapPin className="w-4 h-4 text-cyan-200" />
              <span>{t('landing.explore_map', 'Open Live Hazard Map')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Comprehensive Active Public Hazards Intelligence Hub */}
      <section id="active-hazards-section" className="space-y-5 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-2xl font-black text-slate-900">
                {t('landing.recent_title', 'All Active Public Hazards')}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700 border border-blue-200">
                {activeComplaints.length} Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('landing.recent_subtitle', 'Live citizen submissions across smart city sectors')}
              {selectedFilter !== 'All' && ` • Filtering by ${selectedFilter}`}
              {displayedHazards.length !== activeComplaints.length && ` (${displayedHazards.length} shown)`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAllHazards(!showAllHazards)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center space-x-1.5 border border-slate-300"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>{showAllHazards ? `Showing All (${displayedHazards.length})` : `Show All (${displayedHazards.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('live-map')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-200" />
              <span>{t('landing.view_all_map', 'View All On Interactive Map')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={hazardSearch}
                onChange={(e) => setHazardSearch(e.target.value)}
                placeholder="Search active hazards by location, issue, vehicle plate, or ID..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {hazardSearch && (
                <button
                  onClick={() => setHazardSearch('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-bold flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Category Filter:</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[
              { id: 'All', label: `All Active (${activeComplaints.length})`, icon: '🌐' },
              { id: 'Emergency', label: `🚨 Critical Emergencies (${emergencyComplaints.length})`, icon: '🚨' },
              { id: 'Road Hazard', label: `🛣️ Road (${activeComplaints.filter(c => c.category === 'Road Hazard').length})`, icon: '🛣️' },
              { id: 'Traffic Violation', label: `🚗 Traffic (${activeComplaints.filter(c => c.category === 'Traffic Violation').length})`, icon: '🚗' },
              { id: 'Electrical Hazard', label: `⚡ Electrical (${activeComplaints.filter(c => c.category === 'Electrical Hazard').length})`, icon: '⚡' },
              { id: 'Water Hazard', label: `💧 Water & Sewerage (${activeComplaints.filter(c => c.category === 'Water Hazard').length})`, icon: '💧' },
              { id: 'Sanitation Hazard', label: `🗑️ Sanitation (${activeComplaints.filter(c => c.category === 'Sanitation Hazard').length})`, icon: '🗑️' },
              { id: 'Environmental Hazard', label: `🌳 Environmental (${activeComplaints.filter(c => c.category === 'Environmental Hazard').length})`, icon: '🌳' },
              { id: 'Public Safety Hazard', label: `🛡️ Public Safety (${activeComplaints.filter(c => c.category === 'Public Safety Hazard').length})`, icon: '🛡️' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedFilter === pill.id
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {visibleHazards.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">
              No matching active hazards found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No active hazards match the selected category filter or search query. Reset your filter to see all {activeComplaints.length} active public hazards.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  setSelectedFilter('All');
                  setHazardSearch('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Reset Filters & View All
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('landing.report_btn', 'Report Public Hazard')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleHazards.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onSelect={onSelectComplaint}
                onUpvote={onUpvoteComplaint}
              />
            ))}
          </div>
        )}

        {displayedHazards.length > 6 && !showAllHazards && (
          <div className="text-center pt-2">
            <button
              onClick={() => setShowAllHazards(true)}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 font-black text-xs rounded-2xl border-2 border-blue-200 hover:border-blue-400 shadow-sm transition-all"
            >
              View Remaining {displayedHazards.length - 6} Active Hazards
            </button>
          </div>
        )}
      </section>

      {/* How AapdaSetu AI Workflow Works */}
      <section className="bg-gradient-to-br from-indigo-50/80 via-slate-100 to-cyan-50/50 p-8 rounded-3xl border border-indigo-100 space-y-6 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/90 px-3.5 py-1 rounded-full border border-indigo-200">
            {t('landing.how_badge', 'Autonomous Pipeline')}
          </span>
          <h2 className="text-2xl font-black text-slate-900">{t('landing.how_title', 'How AapdaSetu Solves Public Hazards')}</h2>
          <p className="text-xs font-medium text-slate-600">
            {t('landing.how_subtitle', 'End-to-end transparent hazard intelligence workflow powered by advanced AI vision models')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black shadow-md">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{t('landing.step1_title', 'Anonymous Reporting')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t('landing.step1_desc', 'Upload photos/videos with automated browser GPS capture. No account registration needed.')}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-md">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{t('landing.step2_title', 'AI Analysis & Routing')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t('landing.step2_desc', 'AI classifies severity, checks duplicate hazards nearby, and routes to correct municipal department.')}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{t('landing.step3_title', 'Field Worker Dispatch')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t('landing.step3_desc', 'Department officers verify and assign specialized field technicians equipped with GPS routing.')}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-sm vibrant-card-hover space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
              4
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{t('landing.step4_title', 'AI Completion Audit')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t('landing.step4_desc', 'Worker uploads before & after repair photos. AI calculates confidence score before closing complaint.')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
