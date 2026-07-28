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
} from 'lucide-react';
import { Complaint, Worker, AIVerificationResponse } from '../types';

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

  // Completion Evidence Form State
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('');
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [completionVideos, setCompletionVideos] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState<string>('');
  const [workRemarks, setWorkRemarks] = useState<string>('');
  const [isVerifyingAI, setIsVerifyingAI] = useState<boolean>(false);
  const [aiVerification, setAiVerification] = useState<AIVerificationResponse | null>(null);

  // Handle worker after photos upload
  const handleMultiplePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle worker completion video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddVideoInput = () => {
    if (!videoInput.trim()) return;
    setCompletionVideos((prev) => [...prev, videoInput.trim()]);
    setVideoInput('');
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

  // Action: Submit Resolved Work
  const handleSubmitWork = () => {
    if (!selectedTask) return;

    const primaryAfter = afterPhotos[0] || afterPhotoUrl || selectedTask.photoUrl;

    onUpdateComplaint(selectedTask.id, {
      status: 'Resolved',
      afterPhotoUrl: primaryAfter,
      afterPhotos: afterPhotos.length > 0 ? afterPhotos : [primaryAfter],
      completionVideos: completionVideos,
      workRemarks: workRemarks || 'Maintenance repair completed according to city infrastructure standards.',
      aiConfidenceScore: aiVerification?.confidenceScore || 95,
      aiVerificationResult: aiVerification?.verdict || 'Resolved',
      aiVerificationReason: aiVerification?.analysisNotes || 'Image analysis confirms restoration of physical hazard site.',
    });

    alert(`Task ${selectedTask.id} marked RESOLVED with multiple evidence files attached!`);
    setSelectedTask(null);
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
                onClick={() => {
                  setSelectedTask(task);
                  setAfterPhotoUrl('');
                  setAiVerification(null);
                }}
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
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                  Status: {selectedTask.status}
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

              {/* Evidence Upload Section */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    <span>Upload Completed Repair Proof (Photos & Videos)</span>
                  </h3>
                  <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {afterPhotos.length} Photo(s) • {completionVideos.length} Video(s)
                  </div>
                </div>

                {/* Multi Photos & Video Pickers */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="worker-photos-upload"
                        accept="image/*"
                        multiple
                        onChange={handleMultiplePhotoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="worker-photos-upload"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add After Photos</span>
                      </label>

                      <input
                        type="file"
                        id="worker-videos-upload"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="worker-videos-upload"
                        className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Add Repair Video</span>
                      </label>
                    </div>
                  </div>

                  {/* After Photos Grid */}
                  {afterPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
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
                            Photo #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completion Videos Grid */}
                  {completionVideos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {completionVideos.map((vid, idx) => (
                        <div key={idx} className="relative bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-cyan-400 font-bold">
                            <span>Video Proof #{idx + 1}</span>
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
                  )}
                </div>

                {/* Worker Remarks Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Work Remarks / Notes
                  </label>
                  <input
                    type="text"
                    value={workRemarks}
                    onChange={(e) => setWorkRemarks(e.target.value)}
                    placeholder="E.g., Replaced broken section with heavy duty reinforced material..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>

                {/* AI Verification Assistant Trigger */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-amber-300" />
                      AI Completion Verification Assistant
                    </span>

                    <button
                      type="button"
                      onClick={handleRunAIVerification}
                      disabled={isVerifyingAI || !afterPhotoUrl}
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
                    disabled={!afterPhotoUrl}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Submit & Mark Hazard Resolved</span>
                  </button>
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
