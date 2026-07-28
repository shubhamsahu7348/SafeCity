import React, { useState, useEffect } from 'react';
import { Complaint, Worker, DepartmentMetric, UserRole, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
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
            <DepartmentDashboardView
              complaints={complaints}
              workers={workers}
              onUpdateComplaint={handleUpdateComplaint}
              onUpvoteComplaint={handleUpvoteComplaint}
            />
          )}

          {activeTab === 'worker' && (
            <WorkerDashboardView
              complaints={complaints}
              workers={workers}
              onUpdateComplaint={handleUpdateComplaint}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView departmentMetrics={departmentMetrics} />
          )}

          {activeTab === 'admin' && (
            <AdminView workers={workers} onAddWorker={handleAddWorker} />
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
