import React, { useState } from 'react';
import {
  HardHat,
  Camera,
  MapPin,
  CheckCircle2,
  Sparkles,
  Upload,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Home,
  Video,
  Film,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { Complaint, Worker, AIVerificationResponse, ComplaintStatus } from '../types';

interface WorkerDashboardViewProps {
  complaints: Complaint[];
  workers: Worker[];
  onUpdateComplaint: (id: string, updates: Partial<Complaint>) => void;
  onGoHome?: () => void;
}

export const WorkerDashboardView: React.FC<WorkerDashboardViewProps> = ({
  complaints,
  workers,
  onUpdateComplaint,
  onGoHome,
}) => {
  // Current active worker (Marcus Vance by default for field demo)
  const currentWorker = workers[0];

  // Get tasks assigned to this worker or in 'Assigned' / 'In Progress' state
  const assignedTasks = complaints.filter(
    (c) =>
      c.status !== 'Resolved' &&
      c.status !== 'Rejected' &&
      (c.assignedWorkerId === currentWorker.id || c.status === 'Assigned' || c.status === 'In Progress')
  );

  const [selectedTask, setSelectedTask] = useState<Complaint | null>(assignedTasks[0] || null);

  // Before Maintenance State
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [beforeVideos, setBeforeVideos] = useState<string[]>([]);
  const [beforeVideoInput, setBeforeVideoInput] = useState<string>('');

  // Completion / After Maintenance State
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('');
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [completionVideos, setCompletionVideos] = useState<string[]>([]);
  const [afterVideoInput, setAfterVideoInput] = useState<string>('');
  const [workRemarks, setWorkRemarks] = useState<string>('');
  const [isVerifyingAI, setIsVerifyingAI] = useState<boolean>(false);
  const [aiVerification, setAiVerification] = useState<AIVerificationResponse | null>(null);

  // Sync state when selectedTask changes
  const handleSelectTask = (task: Complaint) => {
    setSelectedTask(task);
    setBeforePhotos(
      task.beforePhotos && task.beforePhotos.length > 0
        ? task.beforePhotos
        : task.beforePhotoUrl
        ? [task.beforePhotoUrl]
        : task.photos && task.photos.length > 0
        ? [task.photos[0]]
        : [task.photoUrl]
    );
    setBeforeVideos(
      task.beforeVideos && task.beforeVideos.length > 0
        ? task.beforeVideos
        : task.beforeVideoUrl
        ? [task.beforeVideoUrl]
        : task.videos || (task.videoUrl ? [task.videoUrl] : [])
    );
    setAfterPhotos(
      task.afterPhotos && task.afterPhotos.length > 0
        ? task.afterPhotos
        : task.afterPhotoUrl
        ? [task.afterPhotoUrl]
        : []
    );
    setCompletionVideos(
      task.completionVideos && task.completionVideos.length > 0
        ? task.completionVideos
        : task.completionVideoUrl
        ? [task.completionVideoUrl]
        : []
    );
    setWorkRemarks(task.workRemarks || '');
    setAiVerification(null);
  };

  // Upload Handlers for BEFORE Maintenance
  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBeforePhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBeforeVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBeforeVideos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBeforeVideoLink = () => {
    if (!beforeVideoInput.trim()) return;
    setBeforeVideos((prev) => [...prev, beforeVideoInput.trim()]);
    setBeforeVideoInput('');
  };

  // Upload Handlers for AFTER Maintenance
  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = reader.result;
          setAfterPhotos((prev) => [...prev, img]);
          if (!afterPhotoUrl) setAfterPhotoUrl(img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCompletionVideos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAfterVideoLink = () => {
    if (!afterVideoInput.trim()) return;
    setCompletionVideos((prev) => [...prev, afterVideoInput.trim()]);
    setAfterVideoInput('');
  };

  // Action: Save Onsite Arrival BEFORE Evidence
  const handleSaveBeforeEvidence = () => {
    if (!selectedTask) return;

    const primaryBefore = beforePhotos[0] || selectedTask.photoUrl;

    onUpdateComplaint(selectedTask.id, {
      status: 'In Progress',
      beforePhotos: beforePhotos,
      beforeVideos: beforeVideos,
      beforePhotoUrl: primaryBefore,
      beforeVideoUrl: beforeVideos[0],
      updatedAt: new Date().toISOString(),
      timeline: [
        ...selectedTask.timeline,
        {
          id: `tl-${Date.now()}`,
          status: 'In Progress',
          timestamp: new Date().toISOString(),
          actor: currentWorker.name,
          actorRole: 'Field Technician',
          note: `Onsite arrival logged with ${beforePhotos.length} BEFORE maintenance photo(s) and ${beforeVideos.length} video(s).`,
        },
      ],
    });

    alert(`Saved Before-Maintenance evidence for Task #${selectedTask.id}. Status set to In Progress.`);
  };

  // Action: Trigger AI Verification Assistant
  const handleRunAIVerification = async () => {
    const primaryImg = afterPhotos[0] || afterPhotoUrl;
    if (!selectedTask || !primaryImg) {
      alert('Please upload or select an After-Repair photo first.');
      return;
    }

    setIsVerifyingAI(true);
    try {
      const res = await fetch('/api/ai/verify-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPhotoUrl: selectedTask.photoUrl,
          workerAfterPhotoUrl: primaryImg,
          hazardType: selectedTask.subCategory,
          workRemarks,
        }),
      });

      if (res.ok) {
        const data: AIVerificationResponse = await res.json();
        setAiVerification(data);
      }
    } catch (err) {
      console.error('AI verification failed:', err);
    } finally {
      setIsVerifyingAI(false);
    }
  };

  // Action: Submit Work for Officer Re-Verification
  const handleSubmitWork = () => {
    if (!selectedTask) return;

    const primaryAfter = afterPhotos[0] || afterPhotoUrl || selectedTask.photoUrl;
    const primaryBefore = beforePhotos[0] || selectedTask.beforePhotoUrl || selectedTask.photoUrl;

    const newTimeline = [
      ...selectedTask.timeline,
      {
        id: `tl-${Date.now()}`,
        status: 'Work Submitted' as ComplaintStatus,
        timestamp: new Date().toISOString(),
        actor: currentWorker.name,
        actorRole: 'Field Technician',
        note: `Maintenance repair completed with Before & After proof attached. Submitted to Department Officer for re-verification.`,
      },
    ];

    onUpdateComplaint(selectedTask.id, {
      status: 'Work Submitted',
      beforePhotos: beforePhotos,
      beforeVideos: beforeVideos,
      beforePhotoUrl: primaryBefore,
      beforeVideoUrl: beforeVideos[0] || selectedTask.beforeVideoUrl,
      afterPhotoUrl: primaryAfter,
      afterPhotos: afterPhotos.length > 0 ? afterPhotos : [primaryAfter],
      completionVideos: completionVideos,
      completionVideoUrl: completionVideos[0],
      workRemarks: workRemarks || 'Maintenance repair completed according to city infrastructure standards.',
      aiConfidenceScore: aiVerification?.confidenceScore || 95,
      aiVerificationResult: aiVerification?.verdict || 'Resolved',
      aiVerificationReason: aiVerification?.analysisNotes || 'Image analysis confirms restoration of physical hazard site.',
      updatedAt: new Date().toISOString(),
      timeline: newTimeline,
    });

    alert(`Task #${selectedTask.id} submitted for Officer Re-Verification! The Department Officer will review your proof and confirm resolution or request rework.`);
    setSelectedTask(null);
    setBeforePhotos([]);
    setBeforeVideos([]);
    setAfterPhotoUrl('');
    setAfterPhotos([]);
    setCompletionVideos([]);
    setWorkRemarks('');
    setAiVerification(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Field Worker Header Card */}
      <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentWorker.avatarUrl}
            alt={currentWorker.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold text-xs rounded-md">
                Field Technician
              </span>
              <span className="text-xs font-semibold text-emerald-200">{currentWorker.department}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">{currentWorker.name}</h1>
            <p className="text-xs text-emerald-200">
              {assignedTasks.length} Assigned Repair Task{assignedTasks.length > 1 ? 's' : ''} Pending Field Completion
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-400/40 text-white text-xs font-black rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              title="Return to Public Home Page"
            >
              <Home className="w-4 h-4 text-emerald-100" />
              <span>Home Page</span>
            </button>
          )}

          <div className="flex items-center space-x-3 bg-emerald-950 p-3 rounded-2xl border border-emerald-800 text-xs font-bold text-emerald-200">
            <span>Worker Rating:</span>
            <span className="text-amber-400 text-sm">★ {currentWorker.rating}</span>
            <span className="text-emerald-400">| {currentWorker.completedTasksCount} Closed</span>
          </div>
        </div>
      </div>

      {/* Main Task List & Repair Verification Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Tasks List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base">
            Assigned Tasks ({assignedTasks.length})
          </h2>

          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedTask?.id === task.id
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-700">{task.id}</span>
                  <span
                    className={`px-2 py-0.5 font-extrabold uppercase rounded text-[10px] ${
                      task.isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {task.isEmergency ? 'Emergency' : task.severity}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{task.title}</h3>

                <div className="flex items-center text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1 flex-shrink-0" />
                  <span className="truncate">{task.address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Task Details & Evidence Upload Form */}
        <div className="lg:col-span-2">
          {selectedTask ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-md">
                    {selectedTask.id}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">{selectedTask.title}</h2>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-xs rounded-full inline-flex items-center space-x-1.5 shadow-sm">
                  {selectedTask.status === 'In Progress' && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />}
                  {selectedTask.status === 'Submitted' && <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  {selectedTask.status === 'Assigned' && <HardHat className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
                  {selectedTask.status === 'Work Submitted' && <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  {selectedTask.status === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  <span>Status: {selectedTask.status}</span>
                </span>
              </div>

              {/* Original Reported Hazard Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-500 uppercase tracking-wider">Hazard Particulars</div>
                  <p className="text-slate-700">{selectedTask.description}</p>
                  <div className="pt-2 font-semibold text-slate-600">Location: {selectedTask.address}</div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                  <img src={selectedTask.photoUrl} alt="Before" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Evidence Upload Section: BEFORE & AFTER MAINTENANCE */}
              <div className="space-y-6 pt-4 border-t border-slate-100">

                {/* ---------------- SECTION 1: BEFORE MAINTENANCE MEDIA ---------------- */}
                <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                    <div className="flex items-center space-x-2.5 text-amber-900">
                      <div className="p-2 bg-amber-200/80 rounded-xl text-amber-800">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-amber-950">
                          1. BEFORE Maintenance Media (Onsite Arrival)
                        </h3>
                        <p className="text-xs text-amber-800">
                          Capture photos/videos of the hazard site immediately upon worker arrival.
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-900 bg-white/80 px-3 py-1 rounded-xl border border-amber-200">
                      {beforePhotos.length} Photo(s) • {beforeVideos.length} Video(s)
                    </div>
                  </div>

                  {/* Upload Controls for BEFORE Media */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      id="worker-before-photos-upload"
                      accept="image/*"
                      multiple
                      onChange={handleBeforePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="worker-before-photos-upload"
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload BEFORE Photo(s)</span>
                    </label>

                    <input
                      type="file"
                      id="worker-before-videos-upload"
                      accept="video/*"
                      multiple
                      onChange={handleBeforeVideoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="worker-before-videos-upload"
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                    >
                      <Video className="w-4 h-4 text-cyan-400" />
                      <span>Upload BEFORE Video(s)</span>
                    </label>

                    <div className="flex items-center space-x-1.5 flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={beforeVideoInput}
                        onChange={(e) => setBeforeVideoInput(e.target.value)}
                        placeholder="Paste video link (optional)..."
                        className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs bg-white text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddBeforeVideoLink}
                        className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded-xl whitespace-nowrap flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-200" />
                        <span>Add Link</span>
                      </button>
                    </div>
                  </div>

                  {/* BEFORE Photos Grid */}
                  {beforePhotos.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Before Maintenance Photos ({beforePhotos.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {beforePhotos.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden h-24 border border-amber-300 bg-slate-900 group">
                            <img src={img} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setBeforePhotos((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md text-[10px]"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white font-mono text-[9px] rounded">
                              Before #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BEFORE Videos Grid */}
                  {beforeVideos.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Before Maintenance Videos ({beforeVideos.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {beforeVideos.map((vid, idx) => (
                          <div key={idx} className="relative bg-slate-950 p-2 rounded-xl border border-amber-900/40">
                            <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-amber-400 font-bold">
                              <span>Before Video #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setBeforeVideos((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {vid.startsWith('data:video') || vid.endsWith('.mp4') || vid.endsWith('.webm') ? (
                              <video src={vid} controls className="w-full h-24 rounded-lg object-cover bg-black" />
                            ) : (
                              <div className="text-[10px] font-mono text-slate-300 truncate p-2 bg-slate-900 rounded-lg">
                                🔗 {vid}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveBeforeEvidence}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Save Onsite Arrival Evidence (Set In-Progress)</span>
                    </button>
                  </div>
                </div>


                {/* ---------------- SECTION 2: AFTER MAINTENANCE MEDIA ---------------- */}
                <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                    <div className="flex items-center space-x-2.5 text-emerald-900">
                      <div className="p-2 bg-emerald-200/80 rounded-xl text-emerald-800">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-emerald-950">
                          2. AFTER Maintenance Media (Completed Work)
                        </h3>
                        <p className="text-xs text-emerald-800">
                          Upload photos/videos of the repaired hazard to prove work completion.
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-900 bg-white/80 px-3 py-1 rounded-xl border border-emerald-200">
                      {afterPhotos.length} Photo(s) • {completionVideos.length} Video(s)
                    </div>
                  </div>

                  {/* Upload Controls for AFTER Media */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      id="worker-after-photos-upload"
                      accept="image/*"
                      multiple
                      onChange={handleAfterPhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="worker-after-photos-upload"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload AFTER Photo(s)</span>
                    </label>

                    <input
                      type="file"
                      id="worker-after-videos-upload"
                      accept="video/*"
                      multiple
                      onChange={handleAfterVideoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="worker-after-videos-upload"
                      className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>Upload AFTER Video(s)</span>
                    </label>

                    <div className="flex items-center space-x-1.5 flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={afterVideoInput}
                        onChange={(e) => setAfterVideoInput(e.target.value)}
                        placeholder="Paste completion video link..."
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-xl text-xs bg-white text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddAfterVideoLink}
                        className="px-3 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl whitespace-nowrap flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Add Link</span>
                      </button>
                    </div>
                  </div>

                  {/* AFTER Photos Grid */}
                  {afterPhotos.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                        After Repair Photos ({afterPhotos.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {afterPhotos.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden h-24 border border-emerald-300 bg-slate-900 group">
                            <img src={img} alt={`After ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAfterPhotos((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md text-[10px]"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white font-mono text-[9px] rounded">
                              After #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AFTER Videos Grid */}
                  {completionVideos.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                        After Repair Videos ({completionVideos.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {completionVideos.map((vid, idx) => (
                          <div key={idx} className="relative bg-slate-950 p-2 rounded-xl border border-emerald-900/40">
                            <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-cyan-400 font-bold">
                              <span>After Video #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setCompletionVideos((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {vid.startsWith('data:video') || vid.endsWith('.mp4') || vid.endsWith('.webm') ? (
                              <video src={vid} controls className="w-full h-24 rounded-lg object-cover bg-black" />
                            ) : (
                              <div className="text-[10px] font-mono text-slate-300 truncate p-2 bg-slate-900 rounded-lg">
                                🔗 {vid}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Worker Remarks Field */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Maintenance Worker Completion Remarks
                    </label>
                    <textarea
                      value={workRemarks}
                      onChange={(e) => setWorkRemarks(e.target.value)}
                      rows={2}
                      placeholder="E.g., Cleared blockage, resurfaced asphalt layer, and verified drainage flow..."
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-800"
                    />
                  </div>

                  {/* AI Verification Assistant Trigger */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1 text-amber-300" />
                        AI Completion Verification Audit
                      </span>

                      <button
                        type="button"
                        onClick={handleRunAIVerification}
                        disabled={isVerifyingAI || (afterPhotos.length === 0 && !afterPhotoUrl)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                      >
                        {isVerifyingAI ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Run AI Inspection Audit</span>
                          </>
                        )}
                      </button>
                    </div>

                    {aiVerification && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-emerald-400">Verdict: {aiVerification.verdict}</span>
                          <span className="text-amber-300">Confidence: {aiVerification.confidenceScore}%</span>
                        </div>
                        <p className="text-slate-300">{aiVerification.analysisNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Submit Work Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSubmitWork}
                      disabled={afterPhotos.length === 0 && !afterPhotoUrl}
                      className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submit Work for Officer Re-Verification</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">All Assigned Tasks Completed!</h3>
              <p className="text-xs text-slate-500">Select a task from the sidebar to start maintenance work.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
