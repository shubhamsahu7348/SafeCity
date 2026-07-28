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
} from 'lucide-react';
import { Complaint, Worker, Department, ComplaintStatus } from '../types';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

interface DepartmentDashboardViewProps {
  complaints: Complaint[];
  workers: Worker[];
  onUpdateComplaint: (id: string, updates: Partial<Complaint>) => void;
  onUpvoteComplaint: (id: string) => void;
}

export const DepartmentDashboardView: React.FC<DepartmentDashboardViewProps> = ({
  complaints,
  workers,
  onUpdateComplaint,
  onUpvoteComplaint,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
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
            <option value="Resolved">Resolved</option>
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
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {c.status === 'Submitted' && (
                      <button
                        onClick={() => handleVerify(c.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                      >
                        Verify Complaint
                      </button>
                    )}

                    {(c.status === 'Submitted' || c.status === 'Verified') && (
                      <button
                        onClick={() => setAssigningComplaint(c)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                      >
                        Assign Worker
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Assignment Modal */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
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
                className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWorker}
                disabled={!selectedWorkerId}
                className="px-5 py-2 bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                Confirm Dispatch
              </button>
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
