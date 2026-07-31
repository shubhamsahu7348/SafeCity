import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  HardHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Flame,
  ArrowRight,
  Filter,
  Sparkles,
  Home,
  XCircle,
  Ban,
  X,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Complaint, Worker, Department, ComplaintStatus, TimelineEvent } from '../types';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { UserAccountManager } from '../components/UserAccountManager';

interface DepartmentDashboardViewProps {
  complaints: Complaint[];
  workers: Worker[];
  onUpdateComplaint: (id: string, updates: Partial<Complaint>) => void;
  onUpvoteComplaint: (id: string) => void;
  onGoHome?: () => void;
}

export const DepartmentDashboardView: React.FC<DepartmentDashboardViewProps> = ({
  complaints,
  workers,
  onUpdateComplaint,
  onUpvoteComplaint,
  onGoHome,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // Rejection State
  const [rejectingComplaint, setRejectingComplaint] = useState<Complaint | null>(null);
  const [rejectReasonCategory, setRejectReasonCategory] = useState<string>('Fake / Unverified Hazard Report');
  const [rejectExplanation, setRejectExplanation] = useState<string>('');

  // Re-verification & Rework State
  const [reverifyingComplaint, setReverifyingComplaint] = useState<Complaint | null>(null);
  const [reverifyDecision, setReverifyDecision] = useState<'Satisfactory' | 'Unsatisfactory'>('Satisfactory');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [reworkWorkerId, setReworkWorkerId] = useState<string>('');
  const [reworkReasonCategory, setReworkReasonCategory] = useState<string>('Hazard repair incomplete or unsatisfactory');

  const handleStartReverification = (complaint: Complaint) => {
    setReverifyingComplaint(complaint);
    setReverifyDecision('Satisfactory');
    setOfficerNotes('');
    setReworkWorkerId(complaint.assignedWorkerId || (workers[0] ? workers[0].id : ''));
    setReworkReasonCategory('Hazard repair incomplete or unsatisfactory');
  };

  const handleConfirmReverification = () => {
    if (!reverifyingComplaint) return;

    if (reverifyDecision === 'Satisfactory') {
      const fullNote = officerNotes.trim()
        ? `OFFICER RE-VERIFICATION SATISFACTORY: ${officerNotes.trim()}`
        : 'Work inspected onsite by Officer Sarah Jenkins and verified as Satisfactory.';

      const newTimelineEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        status: 'Resolved',
        timestamp: new Date().toISOString(),
        actor: 'Officer Sarah Jenkins',
        actorRole: 'Department Officer',
        note: fullNote,
      };

      onUpdateComplaint(reverifyingComplaint.id, {
        status: 'Resolved',
        officerSatisfaction: 'Satisfactory',
        verifiedByOfficer: 'Officer Sarah Jenkins',
        officerReviewNotes: fullNote,
        updatedAt: new Date().toISOString(),
        timeline: [...reverifyingComplaint.timeline, newTimelineEvent],
      });

      alert(`Complaint #${reverifyingComplaint.id} approved and officially marked RESOLVED!`);
    } else {
      // Unsatisfactory -> Reassign for rework
      const selectedWorker = workers.find((w) => w.id === reworkWorkerId) || workers.find((w) => w.id === reverifyingComplaint.assignedWorkerId);

      const reworkNote = `UNSATISFACTORY RE-VERIFICATION (${reworkReasonCategory})${
        officerNotes.trim() ? ` - Officer Notes: ${officerNotes.trim()}` : ''
      }. Reassigned to ${selectedWorker?.name || 'field worker'} for rework.`;

      const newTimelineEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        status: 'Assigned',
        timestamp: new Date().toISOString(),
        actor: 'Officer Sarah Jenkins',
        actorRole: 'Department Officer',
        note: reworkNote,
      };

      onUpdateComplaint(reverifyingComplaint.id, {
        status: 'Assigned',
        officerSatisfaction: 'Unsatisfactory',
        reworkReason: reworkNote,
        officerReviewNotes: officerNotes,
        verifiedByOfficer: 'Officer Sarah Jenkins',
        assignedWorkerId: selectedWorker?.id,
        assignedWorkerName: selectedWorker?.name,
        updatedAt: new Date().toISOString(),
        timeline: [...reverifyingComplaint.timeline, newTimelineEvent],
      });

      alert(`Complaint #${reverifyingComplaint.id} marked Unsatisfactory and reassigned to ${selectedWorker?.name || 'worker'} for rework!`);
    }

    setReverifyingComplaint(null);
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (selectedDept !== 'All' && c.assignedDepartment !== selectedDept) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  // Action: Officer Verifies Complaint
  const handleVerify = (id: string) => {
    onUpdateComplaint(id, {
      status: 'Verified',
      verifiedByOfficer: 'Officer Sarah Jenkins',
      verificationNotes: 'Verified onsite via official patrol inspection.',
    });
  };

  // Action: Officer Rejects Complaint (Fake / Invalid)
  const handleConfirmReject = () => {
    if (!rejectingComplaint) return;

    const fullReasonNote = `REJECTED BY OFFICER: [${rejectReasonCategory}] ${
      rejectExplanation.trim() ? `- ${rejectExplanation.trim()}` : ''
    }`;

    const newTimelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'Rejected' as ComplaintStatus,
      timestamp: new Date().toISOString(),
      actor: 'Officer Sarah Jenkins',
      actorRole: 'Department Officer',
      note: fullReasonNote,
    };

    onUpdateComplaint(rejectingComplaint.id, {
      status: 'Rejected',
      verifiedByOfficer: 'Officer Sarah Jenkins',
      verificationNotes: fullReasonNote,
      updatedAt: new Date().toISOString(),
      timeline: [...rejectingComplaint.timeline, newTimelineEvent],
    });

    setRejectingComplaint(null);
    setRejectReasonCategory('Fake / Unverified Hazard Report');
    setRejectExplanation('');
  };

  // Action: Officer Assigns Worker
  const handleAssignWorker = () => {
    if (!assigningComplaint || !selectedWorkerId) return;

    const worker = workers.find((w) => w.id === selectedWorkerId);
    onUpdateComplaint(assigningComplaint.id, {
      status: 'Assigned',
      assignedWorkerId: worker?.id,
      assignedWorkerName: worker?.name,
    });

    setAssigningComplaint(null);
    setSelectedWorkerId('');
  };

  // Action: Officer Closes Complaint
  const handleCloseComplaint = (id: string) => {
    onUpdateComplaint(id, {
      status: 'Resolved',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-amber-900 text-white p-6 sm:p-8 rounded-3xl border border-amber-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-amber-300" />
            <h1 className="text-2xl font-extrabold text-white">Department Officer Operations Portal</h1>
          </div>
          <p className="text-xs text-amber-200 mt-1">
            Verify citizen complaints, dispatch field workers, and review AI completion audits
          </p>
        </div>

        {/* Filters & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-400/40 text-white text-xs font-black rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              title="Return to Public Home Page"
            >
              <Home className="w-4 h-4 text-amber-100" />
              <span>Home Page</span>
            </button>
          )}

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2 bg-amber-950 border border-amber-800 text-white text-xs font-bold rounded-xl focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Road Department">Road Department</option>
            <option value="Electricity Department">Electricity Department</option>
            <option value="Water & Sewerage">Water & Sewerage</option>
            <option value="Sanitation & Waste">Sanitation & Waste</option>
            <option value="Environmental Protection">Environmental Protection</option>
            <option value="Public Safety & Infrastructure">Public Safety</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-amber-950 border border-amber-800 text-white text-xs font-bold rounded-xl focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Needs Verification</option>
            <option value="Verified">Verified (Needs Worker)</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Work Submitted">Pending Re-Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected / Fake Reports</option>
          </select>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base">
            Department Complaint Queue ({filtered.length})
          </h2>
          <span className="text-xs text-slate-500">Sorted by Emergency Severity & Date</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-4">Complaint ID</th>
                <th className="p-4">Title & Category</th>
                <th className="p-4">Severity / Emergency</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Officer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{c.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                    <div className="text-slate-500 text-[11px] truncate max-w-xs">{c.address}</div>
                  </td>
                  <td className="p-4">
                    {c.isEmergency ? (
                      <span className="px-2.5 py-1 bg-red-600 text-white font-black text-[10px] uppercase rounded-full animate-pulse inline-flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>EMERGENCY</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 font-bold text-slate-700 text-[10px] uppercase rounded-full">
                        {c.severity}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{c.assignedDepartment}</td>
                  <td className="p-4">
                    {c.status === 'Work Submitted' ? (
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full font-black text-[11px] animate-pulse inline-flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Work Submitted (Needs Audit)</span>
                      </span>
                    ) : c.status === 'Rejected' ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-extrabold inline-flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Rejected (Fake)</span>
                      </span>
                    ) : c.status === 'Resolved' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Resolved</span>
                      </span>
                    ) : c.status === 'In Progress' ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold inline-flex items-center space-x-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>In Progress</span>
                      </span>
                    ) : c.status === 'Submitted' ? (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded-full font-bold inline-flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span>Submitted</span>
                      </span>
                    ) : c.status === 'Verified' ? (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-full font-bold inline-flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Verified</span>
                      </span>
                    ) : c.status === 'Assigned' ? (
                      <span className="px-2.5 py-1 bg-violet-100 text-violet-900 border border-violet-300 rounded-full font-bold inline-flex items-center space-x-1">
                        <HardHat className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span>Assigned</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold inline-flex items-center space-x-1">
                        <span>{c.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {c.status === 'Work Submitted' && (
                      <button
                        onClick={() => handleStartReverification(c)}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-lg shadow-sm inline-flex items-center space-x-1 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Re-Verify Work</span>
                      </button>
                    )}

                    {(c.status === 'In Progress' || c.status === 'Resolved') && (
                      <button
                        onClick={() => handleStartReverification(c)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 rounded-lg shadow-sm text-[11px] inline-flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Audit / Reassign</span>
                      </button>
                    )}

                    {c.status === 'Submitted' && (
                      <button
                        onClick={() => handleVerify(c.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm inline-flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Verify Complaint</span>
                      </button>
                    )}

                    {(c.status === 'Submitted' || c.status === 'Verified') && (
                      <button
                        onClick={() => setAssigningComplaint(c)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm inline-flex items-center space-x-1"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-200" />
                        <span>Assign Worker</span>
                      </button>
                    )}

                    {c.status !== 'Resolved' && c.status !== 'Rejected' && (
                      <button
                        onClick={() => setRejectingComplaint(c)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg shadow-sm inline-flex items-center space-x-1 transition-all"
                        title="Reject as Fake or Invalid Hazard"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Reject (Fake)</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Audit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Worker Accounts & Credentials Management Section */}
      <UserAccountManager currentRole="officer" workers={workers} />

      {/* Worker Assignment Modal */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              Dispatch Worker for {assigningComplaint.id}
            </h3>
            <p className="text-xs text-slate-500">
              Select available field technician in {assigningComplaint.assignedDepartment}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Available Workers</label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl font-bold text-sm"
              >
                <option value="">-- Choose Field Worker --</option>
                {workers
                  .filter((w) => w.department === assigningComplaint.assignedDepartment || true)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.status} - {w.activeTasksCount} active tasks)
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setAssigningComplaint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl flex items-center space-x-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleAssignWorker}
                disabled={!selectedWorkerId}
                className="px-5 py-2 bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Confirm Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Complaint Modal */}
      {rejectingComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-rose-200 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <Ban className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Reject Complaint #{rejectingComplaint.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Mark this hazard report as fake or invalid and send official notice to citizen.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong className="text-slate-900">Hazard Title:</strong> {rejectingComplaint.title}</div>
              <div><strong className="text-slate-900">Location:</strong> {rejectingComplaint.address}</div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Select Rejection Reason Category
              </label>
              <select
                value={rejectReasonCategory}
                onChange={(e) => setRejectReasonCategory(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl font-bold text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Fake / Unverified Hazard Report">Fake / Unverified Hazard Report</option>
                <option value="No Hazard Found Onsite During Patrol Inspection">No Hazard Found Onsite During Patrol Inspection</option>
                <option value="Inaccurate / Irrelevant Media Photos Attached">Inaccurate / Irrelevant Media Photos Attached</option>
                <option value="Duplicate Report (Already Covered Under Active Task)">Duplicate Report (Already Covered Under Active Task)</option>
                <option value="Out of Municipal Jurisdiction / Private Property">Out of Municipal Jurisdiction / Private Property</option>
              </select>

              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider pt-2">
                Officer Remarks & Citizen Explanation Note (Optional)
              </label>
              <textarea
                value={rejectExplanation}
                onChange={(e) => setRejectExplanation(e.target.value)}
                rows={3}
                placeholder="Explain why this report was verified as fake or invalid so the citizen can view it when tracking their Complaint ID..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 flex items-start space-x-2 text-[11px] text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>
                Rejecting this complaint will update its status to <strong>"Rejected"</strong>. Citizens searching for ID <code className="font-mono font-bold">{rejectingComplaint.id}</code> will see this notice and officer explanation.
              </span>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setRejectingComplaint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl transition-colors flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
              >
                <Ban className="w-4 h-4" />
                <span>Confirm Rejection & Notify Citizen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Officer Re-Verification Modal */}
      {reverifyingComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-purple-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3 text-purple-900">
                <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Officer Work Re-Verification Audit
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Complaint ID <code className="font-mono font-bold text-purple-700">{reverifyingComplaint.id}</code> • Worker: <strong>{reverifyingComplaint.assignedWorkerName || 'Field Tech'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReverifyingComplaint(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complaint summary info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div><strong className="text-slate-900">Hazard Title:</strong> {reverifyingComplaint.title} ({reverifyingComplaint.category})</div>
              <div><strong className="text-slate-900">Location Address:</strong> {reverifyingComplaint.address}</div>
              <div><strong className="text-slate-900">Worker Field Remarks:</strong> <em className="text-slate-700">"{reverifyingComplaint.workRemarks || 'No remarks provided.'}"</em></div>
              {reverifyingComplaint.aiConfidenceScore && (
                <div className="pt-1 flex items-center space-x-1 text-emerald-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Completion Match Score: {reverifyingComplaint.aiConfidenceScore}%</span>
                </div>
              )}
            </div>

            {/* Before & After Proof Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Before Media */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">
                  1. BEFORE Maintenance Photos
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(reverifyingComplaint.beforePhotos && reverifyingComplaint.beforePhotos.length > 0
                    ? reverifyingComplaint.beforePhotos
                    : [reverifyingComplaint.beforePhotoUrl || reverifyingComplaint.photoUrl]
                  ).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Before ${idx}`}
                      className="w-full h-24 object-cover rounded-xl border border-amber-300"
                    />
                  ))}
                </div>
              </div>

              {/* After Media */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider block">
                  2. AFTER Maintenance Proof
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(reverifyingComplaint.afterPhotos && reverifyingComplaint.afterPhotos.length > 0
                    ? reverifyingComplaint.afterPhotos
                    : [reverifyingComplaint.afterPhotoUrl || reverifyingComplaint.photoUrl]
                  ).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`After ${idx}`}
                      className="w-full h-24 object-cover rounded-xl border border-emerald-300"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Verdict Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Select Officer Inspection Verdict
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReverifyDecision('Satisfactory')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    reverifyDecision === 'Satisfactory'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Satisfactory (Approve & Resolve)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Work meets city maintenance standards. Approve and officially close hazard complaint as Resolved.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReverifyDecision('Unsatisfactory')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    reverifyDecision === 'Unsatisfactory'
                      ? 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Unsatisfactory (Reassign / Rework)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Work is incomplete or defective. Reassign complaint back to a field technician for rework.
                  </p>
                </button>
              </div>

              {/* Options for Satisfactory */}
              {reverifyDecision === 'Satisfactory' && (
                <div className="space-y-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fadeIn">
                  <label className="block text-xs font-bold text-emerald-950">
                    Officer Verification Approval Notes
                  </label>
                  <textarea
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    rows={2}
                    placeholder="E.g., Verified onsite asphalt leveling and drainage clearance. Maintenance quality is satisfactory."
                    className="w-full p-3 border border-emerald-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Options for Unsatisfactory / Rework */}
              {reverifyDecision === 'Unsatisfactory' && (
                <div className="space-y-3 p-4 bg-rose-50 rounded-2xl border border-rose-200 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-rose-950">
                      Rework Defect Category
                    </label>
                    <select
                      value={reworkReasonCategory}
                      onChange={(e) => setReworkReasonCategory(e.target.value)}
                      className="w-full p-2.5 border border-rose-300 rounded-xl text-xs bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Hazard repair incomplete or unsatisfactory">Hazard repair incomplete or unsatisfactory</option>
                      <option value="Surface / asphalt leveling uneven or substandard">Surface / asphalt leveling uneven or substandard</option>
                      <option value="Debris / hazardous materials remaining on site">Debris / hazardous materials remaining on site</option>
                      <option value="Clearer completion photo or video proof required">Clearer completion photo or video proof required</option>
                      <option value="Safety inspection failed upon patrol review">Safety inspection failed upon patrol review</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-rose-950">
                      Reassign to Field Worker
                    </label>
                    <select
                      value={reworkWorkerId}
                      onChange={(e) => setReworkWorkerId(e.target.value)}
                      className="w-full p-2.5 border border-rose-300 rounded-xl text-xs bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {workers
                        .filter((w) => w.department === reverifyingComplaint.assignedDepartment || true)
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.status}) {w.id === reverifyingComplaint.assignedWorkerId ? '(Currently Assigned)' : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-rose-950">
                      Officer Instructions to Technician for Rework
                    </label>
                    <textarea
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      rows={2}
                      placeholder="Specify exact corrections required (e.g. repatch hole, clear loose gravel from roadway)..."
                      className="w-full p-3 border border-rose-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setReverifyingComplaint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              {reverifyDecision === 'Satisfactory' ? (
                <button
                  onClick={handleConfirmReverification}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Work & Officially Resolve Hazard</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmReverification}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Confirm Reassign & Send for Rework</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpvote={onUpvoteComplaint}
        />
      )}
    </div>
  );
};
