import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Copy,
  Share2,
  Building2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  Complaint,
  HazardCategory,
  SeverityLevel,
  Department,
  AIAnalysisResponse,
  AIDuplicateCheckResponse,
} from '../types';

interface ReportHazardViewProps {
  onComplaintSubmitted: (complaint: Complaint) => void;
  onTrackComplaint: (complaintId: string) => void;
}

export const ReportHazardView: React.FC<ReportHazardViewProps> = ({
  onComplaintSubmitted,
  onTrackComplaint,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(37.774929);
  const [longitude, setLongitude] = useState<number>(-122.419416);
  const [address, setAddress] = useState<string>('San Francisco, CA');

  // AI Classification State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<AIDuplicateCheckResponse | null>(null);

  // Editable fields initialized by AI
  const [category, setCategory] = useState<HazardCategory>('Road Hazard');
  const [subCategory, setSubCategory] = useState<string>('Pothole');
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [department, setDepartment] = useState<Department>('Road Department');

  // Submitted complaint state for success page
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Handle image file selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample default image picker options
  const setSampleImage = (url: string) => {
    setPhotoUrl(url);
  };

  // Auto-detect browser GPS location
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Smart City Grid)`);
        },
        (err) => {
          console.warn('Geolocation failed:', err);
          setAddress('450 Mission St, San Francisco, CA');
        }
      );
    }
  };

  // Step 3: Run Gemini AI Hazard Analysis
  const handleRunAIAnalysis = async () => {
    if (!description && !photoUrl) {
      alert('Please provide a photo or description for AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Analyze Hazard
      const res = await fetch('/api/ai/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photoUrl,
          description,
          latitude,
          longitude,
        }),
      });

      if (res.ok) {
        const data: AIAnalysisResponse = await res.json();
        setAiAnalysis(data);
        setCategory(data.category);
        setSubCategory(data.subCategory);
        setSeverity(data.severity);
        setIsEmergency(data.isEmergency);
        setDepartment(data.suggestedDepartment);
      }

      // 2. Check Duplicates
      const dupRes = await fetch('/api/ai/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          latitude,
          longitude,
          category,
        }),
      });

      if (dupRes.ok) {
        const dupData: AIDuplicateCheckResponse = await dupRes.json();
        setDuplicateCheck(dupData);
      }
    } catch (err) {
      console.error('AI analysis request failed:', err);
    } finally {
      setIsAnalyzing(false);
      setStep(3);
    }
  };

  // Final Submit
  const handleSubmitReport = async () => {
    const payload = {
      title: `${subCategory} Hazard at ${address.split(',')[0]}`,
      category,
      subCategory,
      severity,
      isEmergency,
      description: description || `Hazard reported near ${address}`,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      latitude,
      longitude,
      address,
      assignedDepartment: department,
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newComplaint: Complaint = await res.json();
        setSubmittedComplaint(newComplaint);
        onComplaintSubmitted(newComplaint);
        setStep(4); // Success screen
      }
    } catch (err) {
      console.error('Submit complaint error:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Wizard Progress Indicator */}
      <div className="bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
        {[
          { num: 1, label: 'Upload Media' },
          { num: 2, label: 'Location & Details' },
          { num: 3, label: 'AI Review & Route' },
          { num: 4, label: 'Submitted' },
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                step === s.num
                  ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md ring-4 ring-indigo-100'
                  : step > s.num
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-xs font-extrabold hidden sm:inline ${
                step === s.num ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Photo / Media Upload */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 text-xs font-black rounded-full border border-indigo-200">
              Step 1 of 3
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Upload Hazard Photo or Video
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Clear visuals enable instant Gemini AI classification and severity scoring.
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-slate-50/80 rounded-2xl p-6 text-center space-y-3 transition-colors">
            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden max-h-72 border border-slate-200 shadow-md inline-block">
                <img src={photoUrl} alt="Uploaded Hazard" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-rose-600 border border-slate-700/80 shadow-md transition-colors"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-100 to-cyan-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-800 block">
                    Click to capture or upload photo/video
                  </span>
                  <span className="text-xs text-slate-500 font-medium">JPG, PNG, MP4 up to 20MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Preset Sample Photo Options */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Or Choose Sample Hazard Photo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  label: 'Open Electric Wire',
                  url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=400&q=80',
                },
                {
                  label: 'Deep Road Pothole',
                  url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80',
                },
                {
                  label: 'Water Main Burst',
                  url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=400&q=80',
                },
                {
                  label: 'Uncovered Manhole',
                  url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
                },
              ].map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => setSampleImage(sample.url)}
                  className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    photoUrl === sample.url
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                    {sample.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!photoUrl}
              className={`px-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center space-x-2 transition-all ${
                photoUrl
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Next: Location & Description</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Description */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 text-xs font-black rounded-full border border-indigo-200">
              Step 2 of 3
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Hazard Location & Description
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Provide exact address or use device GPS capture for automated municipal routing.
            </p>
          </div>

          {/* GPS Location Field */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Hazard Address / Location
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or landmark"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-800"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                className="px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 whitespace-nowrap transition-colors shadow-sm"
              >
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Auto-Detect GPS</span>
              </button>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Describe the Hazard
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Open electric cables exposed on sidewalk near school entrance. Sparking observed after rain..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-800"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Run AI Classification & Routing</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI Review, Classification & Routing */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-full border border-indigo-200">
              Step 3 of 3
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Gemini AI Hazard Analysis & Department Mapping
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              AI classified severity, checked duplicate reports nearby, and auto-routed to the responsible department.
            </p>
          </div>

          {/* Duplicate Detection Alert */}
          {duplicateCheck && duplicateCheck.isDuplicate && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Existing Nearby Complaint Linked ({duplicateCheck.similarityScore}% Match)</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {duplicateCheck.reasoning}
              </p>
              <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                Complaint linked to existing ID: {duplicateCheck.matchedComplaintId}
              </span>
            </div>
          )}

          {/* AI Analysis Findings Card */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-cyan-300" />
                  Gemini AI Vision Assessment
                </span>
                <span className="px-3 py-0.5 text-xs font-bold bg-indigo-500/20 text-cyan-300 rounded-full border border-indigo-500/40">
                  {aiAnalysis.confidenceScore}% Certainty
                </span>
              </div>

              <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                {aiAnalysis.aiSummary}
              </p>

              <div className="p-3 bg-slate-950/80 rounded-xl text-xs text-amber-300 border border-amber-500/30">
                <strong>Safety Guidance:</strong> {aiAnalysis.safetyAdvice}
              </div>
            </div>
          )}

          {/* Editable AI Classification Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hazard Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HazardCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                <option value="Road Hazard">Road Hazard</option>
                <option value="Electrical Hazard">Electrical Hazard</option>
                <option value="Water Hazard">Water Hazard</option>
                <option value="Sanitation Hazard">Sanitation Hazard</option>
                <option value="Environmental Hazard">Environmental Hazard</option>
                <option value="Public Safety Hazard">Public Safety Hazard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => {
                  const val = e.target.value as SeverityLevel;
                  setSeverity(val);
                  if (val === 'Critical') setIsEmergency(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Emergency)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                <option value="Road Department">Road Department</option>
                <option value="Electricity Department">Electricity Department</option>
                <option value="Water & Sewerage">Water & Sewerage</option>
                <option value="Sanitation & Waste">Sanitation & Waste</option>
                <option value="Environmental Protection">Environmental Protection</option>
                <option value="Public Safety & Infrastructure">Public Safety & Infrastructure</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center space-x-2 p-3 bg-red-50 rounded-xl border border-red-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-xs font-extrabold text-red-700 uppercase tracking-wider">
                  Flag as Emergency Priority
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleSubmitReport}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Submit Anonymous Report</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Complaint Success & ID Generation Screen */}
      {step === 4 && submittedComplaint && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              Report Registered Successfully
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Complaint ID: {submittedComplaint.id}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Save this Complaint ID to track real-time verification, worker assignment, and completion evidence.
            </p>
          </div>

          {/* Complaint Details Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Hazard Title:</span>
              <span className="text-slate-900">{submittedComplaint.title}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Routed Department:</span>
              <span className="text-blue-700">{submittedComplaint.assignedDepartment}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Emergency Level:</span>
              <span className={submittedComplaint.isEmergency ? 'text-red-600 font-extrabold' : 'text-slate-700'}>
                {submittedComplaint.isEmergency ? '🚨 CRITICAL EMERGENCY' : submittedComplaint.severity}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTrackComplaint(submittedComplaint.id)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Track Complaint Status Now</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(submittedComplaint.id);
                alert(`Complaint ID ${submittedComplaint.id} copied to clipboard!`);
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center space-x-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>Copy ID</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setPhotoUrl('');
                setDescription('');
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300"
            >
              Report Another Hazard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
