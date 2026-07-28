import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Complaint, Worker, DepartmentMetric, UserRole, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { EditProfileModal } from './components/EditProfileModal';
import { LandingView } from './views/LandingView';
import { ReportHazardView } from './views/ReportHazardView';
import { LiveMapView } from './views/LiveMapView';
import { PublicRiskMapView } from './views/PublicRiskMapView';
import { ComplaintTrackingView } from './views/ComplaintTrackingView';
import { DepartmentDashboardView } from './views/DepartmentDashboardView';
import { WorkerDashboardView } from './views/WorkerDashboardView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdminView } from './views/AdminView';
import { AboutView } from './views/AboutView';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginModalTargetRole, setLoginModalTargetRole] = useState<UserRole | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  // State loaded from API
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetric[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [trackedId, setTrackedId] = useState<string>('');

  // Fetch initial data from server
  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        if (data.departments) setDepartmentMetrics(data.departments);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchWorkers();
    fetchAnalytics();
  }, []);

  // Upvote complaint
  const handleUpvoteComplaint = async (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c))
    );

    try {
      const target = complaints.find((c) => c.id === id);
      if (target) {
        await fetch(`/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upvotes: target.upvotes + 1 }),
        });
      }
    } catch (err) {
      console.error('Upvote API call error:', err);
    }
  };

  // Update complaint status / properties
  const handleUpdateComplaint = async (id: string, updates: Partial<Complaint>) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
      }
    } catch (err) {
      console.error('Update complaint error:', err);
    }
  };

  // Add worker
  const handleAddWorker = async (workerData: Partial<Worker>) => {
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });

      if (res.ok) {
        const newWorker = await res.json();
        setWorkers((prev) => [...prev, newWorker]);
      }
    } catch (err) {
      console.error('Add worker error:', err);
    }
  };

  const emergencyCount = complaints.filter(
    (c) => c.isEmergency && c.status !== 'Resolved'
  ).length;

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setLoginModalTargetRole(null);

    // Switch view to relevant role dashboard
    if (user.role === 'officer') setActiveTab('department');
    else if (user.role === 'worker') setActiveTab('worker');
    else if (user.role === 'admin') setActiveTab('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('citizen');
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          setUserRole={setUserRole}
          currentUser={currentUser}
          onRequestLogin={(role) => setLoginModalTargetRole(role)}
          onLogout={handleLogout}
          onEditProfile={() => setShowEditProfileModal(true)}
          emergencyCount={emergencyCount}
        />

        {/* Main View Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === 'landing' && (
            <LandingView
              complaints={complaints}
              setActiveTab={setActiveTab}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              onUpvoteComplaint={handleUpvoteComplaint}
            />
          )}

          {activeTab === 'report' && (
            <ReportHazardView
              onComplaintSubmitted={(newC) => {
                setComplaints((prev) => [newC, ...prev]);
                fetchAnalytics();
              }}
              onTrackComplaint={(id) => {
                setTrackedId(id);
                setActiveTab('track');
              }}
            />
          )}

          {activeTab === 'live-map' && (
            <LiveMapView
              complaints={complaints}
              setActiveTab={setActiveTab}
              onUpvoteComplaint={handleUpvoteComplaint}
            />
          )}

          {activeTab === 'risk-heatmap' && (
            <PublicRiskMapView complaints={complaints} />
          )}

          {activeTab === 'track' && (
            <ComplaintTrackingView
              complaints={complaints}
              initialComplaintId={trackedId}
              onUpvoteComplaint={handleUpvoteComplaint}
            />
          )}

          {activeTab === 'department' && (
            (currentUser?.role === 'officer' || currentUser?.role === 'admin' || userRole === 'officer') ? (
              <DepartmentDashboardView
                complaints={complaints}
                workers={workers}
                onUpdateComplaint={handleUpdateComplaint}
                onUpvoteComplaint={handleUpvoteComplaint}
                onGoHome={() => setActiveTab('landing')}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Department Portal Restricted</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    The Department Dashboard is strictly restricted to authorized municipal officers and department administrators. Citizens cannot view internal department dispatch operations.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setLoginModalTargetRole('officer')}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    Login as Department Officer
                  </button>
                  <button
                    onClick={() => setActiveTab('landing')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Return to Citizen Home
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'worker' && (
            (currentUser?.role === 'worker' || currentUser?.role === 'admin' || userRole === 'worker') ? (
              <WorkerDashboardView
                complaints={complaints}
                workers={workers}
                onUpdateComplaint={handleUpdateComplaint}
                onGoHome={() => setActiveTab('landing')}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Worker Tasks Restricted</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    The Field Worker Task Panel is strictly restricted to dispatched maintenance technicians. Citizens cannot view worker task logs.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setLoginModalTargetRole('worker')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    Login as Field Worker
                  </button>
                  <button
                    onClick={() => setActiveTab('landing')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Return to Citizen Home
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView departmentMetrics={departmentMetrics} />
          )}

          {activeTab === 'admin' && (
            (currentUser?.role === 'admin' || userRole === 'admin') ? (
              <AdminView
                workers={workers}
                onAddWorker={handleAddWorker}
                onGoHome={() => setActiveTab('landing')}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Admin Portal Restricted</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    The System Administration Panel is restricted to platform managers and system administrators.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setLoginModalTargetRole('admin')}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    Login as System Admin
                  </button>
                  <button
                    onClick={() => setActiveTab('landing')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Return to Citizen Home
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>

      {/* Global Complaint Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpvote={handleUpvoteComplaint}
        />
      )}

      {/* Login Modal */}
      {loginModalTargetRole && (
        <LoginModal
          targetRole={loginModalTargetRole}
          onClose={() => setLoginModalTargetRole(null)}
          onLoginSuccess={handleLoginSuccess}
          onGoHome={() => {
            setLoginModalTargetRole(null);
            setActiveTab('landing');
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && currentUser && currentUser.role !== 'worker' && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={() => setShowEditProfileModal(false)}
          onUserUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            fetchWorkers();
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm">SafeCity</span>
            <span>– AI Powered Public Hazard Intelligence Platform</span>
          </div>
          <p>© 2026 SafeCity Platform. Smart City Operations & Governance.</p>
        </div>
      </footer>
    </div>
  );
}
