import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, ShieldCheck, Flame, Clock, Building2, TrendingUp } from 'lucide-react';
import { DepartmentMetric } from '../types';

interface AnalyticsViewProps {
  departmentMetrics: DepartmentMetric[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ departmentMetrics }) => {
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  const categoryData = [
    { name: 'Road Hazards', value: 342 },
    { name: 'Electrical', value: 210 },
    { name: 'Water & Sewer', value: 185 },
    { name: 'Sanitation', value: 420 },
    { name: 'Environmental', value: 98 },
    { name: 'Public Safety', value: 156 },
  ];

  const resolutionTimeData = departmentMetrics.map((d) => ({
    name: d.department.replace(' Department', ''),
    hours: d.avgResolutionTimeHours,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Analytics Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-sky-400">
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs font-extrabold uppercase tracking-widest bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30">
            Smart City Governance Analytics
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Public Hazard Intelligence Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Real-time metrics on department response velocity, emergency dispatch speeds, category distribution, and public satisfaction rates.
        </p>

        {/* Top Summary Cards */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Total Complaints Logged</span>
            <span className="text-2xl font-black text-white">1,411</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">City Resolution Rate</span>
            <span className="text-2xl font-black text-emerald-400">91.3%</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Avg Emergency Response</span>
            <span className="text-2xl font-black text-red-400">1.8 Hours</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">AI Automated Accuracy</span>
            <span className="text-2xl font-black text-sky-400">96.8%</span>
          </div>
        </div>
      </div>

      {/* Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base">Hazard Category Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Speed Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base">Avg Resolution Time by Department (Hours)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionTimeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base">Department Performance Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">Department</th>
                <th className="p-3">Total Complaints</th>
                <th className="p-3">Resolved</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Emergency Count</th>
                <th className="p-3">Avg Fix Time</th>
                <th className="p-3">Public Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {departmentMetrics.map((d) => (
                <tr key={d.department} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{d.department}</td>
                  <td className="p-3 text-slate-700">{d.totalComplaints}</td>
                  <td className="p-3 font-bold text-emerald-600">{d.resolvedComplaints}</td>
                  <td className="p-3 text-amber-600">{d.pendingComplaints}</td>
                  <td className="p-3 text-red-600 font-bold">{d.emergencyCount}</td>
                  <td className="p-3 font-mono font-bold">{d.avgResolutionTimeHours} hrs</td>
                  <td className="p-3 text-blue-600 font-extrabold">{d.satisfactionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
