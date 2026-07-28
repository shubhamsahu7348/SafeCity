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
} from 'lucide-react';
import { Complaint, Worker, AIVerificationResponse } from '../types';

interface WorkerDashboardViewProps {
  complaints: Complaint[];
  workers: Worker[];
  onUpdateComplaint: (id: string, updates: Partial<Complaint>) => void;
}

export const WorkerDashboardView: React.FC<WorkerDashboardViewProps> = ({
  complaints,
  workers,
  onUpdateComplaint,
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
  const [workRemarks, setWorkRemarks] = useState<string>('');
  const [isVerifyingAI, setIsVerifyingAI] = useState<boolean>(false);
  const [aiVerification, setAiVerification] = useState<AIVerificationResponse | null>(null);

  // Handle worker after photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample photo choices for rapid testing
  const sampleAfterPhotos = [
    {
      label: 'New Asphalt Patch Laid',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Sleeved Electrical Box Closed',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Repaired Valve Assembly',
      url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Action: Trigger AI Verification Assistant
  const handleRunAIVerification = async () => {
    if (!selectedTask || !afterPhotoUrl) {
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
          workerAfterPhotoUrl: afterPhotoUrl,
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

    onUpdateComplaint(selectedTask.id, {
      status: 'Resolved',
      afterPhotoUrl: afterPhotoUrl || selectedTask.photoUrl,
      workRemarks: workRemarks || 'Maintenance repair completed according to city infrastructure standards.',
      aiConfidenceScore: aiVerification?.confidenceScore || 95,
      aiVerificationResult: aiVerification?.verdict || 'Resolved',
      aiVerificationReason: aiVerification?.analysisNotes || 'Image analysis confirms restoration of physical hazard site.',
    });

    alert(`Task ${selectedTask.id} marked RESOLVED with evidence uploaded!`);
    setSelectedTask(null);
    setAfterPhotoUrl('');
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

        <div className="flex items-center space-x-3 bg-emerald-950 p-3 rounded-2xl border border-emerald-800 text-xs font-bold text-emerald-200">
          <span>Worker Rating:</span>
          <span className="text-amber-400 text-sm">★ {currentWorker.rating}</span>
          <span className="text-emerald-400">| {currentWorker.completedTasksCount} Closed</span>
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
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  <span>Upload Completed Repair Photo Evidence</span>
                </h3>

                {/* Upload or Choose Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-4 text-center space-y-2">
                    {afterPhotoUrl ? (
                      <img src={afterPhotoUrl} alt="After Evidence" className="w-full h-36 object-cover rounded-xl" />
                    ) : (
                      <label className="cursor-pointer block py-4 space-y-2">
                        <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                        <span className="text-xs font-bold text-slate-700 block">Upload After Repair Photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Sample Evidence Options */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Quick Sample Repair Photos:
                    </span>
                    <div className="space-y-2">
                      {sampleAfterPhotos.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => setAfterPhotoUrl(s.url)}
                          className={`w-full p-2 rounded-xl border text-left flex items-center space-x-2 text-xs font-semibold ${
                            afterPhotoUrl === s.url
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={s.url} alt={s.label} className="w-8 h-8 rounded-lg object-cover" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
