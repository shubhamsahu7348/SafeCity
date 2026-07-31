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
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { DepartmentMetric } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsViewProps {
  departmentMetrics: DepartmentMetric[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ departmentMetrics }) => {
  const { t, translateCategory, translateDepartment } = useLanguage();
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  const categoryData = [
    { name: translateCategory('Road Hazards'), value: 342 },
    { name: translateCategory('Electrical'), value: 210 },
    { name: translateCategory('Water & Sewer'), value: 185 },
    { name: translateCategory('Sanitation'), value: 420 },
    { name: translateCategory('Environmental'), value: 98 },
    { name: translateCategory('Public Safety'), value: 156 },
  ];

  const resolutionTimeData = departmentMetrics.map((d) => ({
    name: translateDepartment(d.department).replace(' Department', '').replace(' विभाग', ''),
    hours: d.avgResolutionTimeHours,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Analytics Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-sky-400">
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs font-extrabold uppercase tracking-widest bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30">
            {t('analytics.badge', 'Smart City Governance Analytics')}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {t('analytics.title', 'Public Hazard Intelligence Analytics')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          {t('analytics.subtitle', 'Real-time metrics on department response velocity, emergency dispatch speeds, category distribution, and public satisfaction rates.')}
        </p>

        {/* Top Summary Cards */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">{t('analytics.total_logged', 'Total Complaints Logged')}</span>
            <span className="text-2xl font-black text-white">1,411</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">{t('analytics.resolution_rate', 'City Resolution Rate')}</span>
            <span className="text-2xl font-black text-emerald-400">91.3%</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">{t('analytics.avg_emergency', 'Avg Emergency Response')}</span>
            <span className="text-2xl font-black text-red-400">1.8 {t('analytics.hrs', 'Hours')}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">{t('analytics.ai_accuracy', 'AI Automated Accuracy')}</span>
            <span className="text-2xl font-black text-sky-400">96.8%</span>
          </div>
        </div>
      </div>

      {/* Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base">{t('analytics.category_dist', 'Hazard Category Distribution')}</h2>
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
          <h2 className="font-extrabold text-slate-900 text-base">{t('analytics.avg_res_dept', 'Avg Resolution Time by Department (Hours)')}</h2>
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
        <h2 className="font-extrabold text-slate-900 text-base">{t('analytics.leaderboard', 'Department Performance Leaderboard')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">{t('analytics.dept_col', 'Department')}</th>
                <th className="p-3">{t('analytics.total_col', 'Total Complaints')}</th>
                <th className="p-3">{t('analytics.resolved_col', 'Resolved')}</th>
                <th className="p-3">{t('analytics.pending_col', 'Pending')}</th>
                <th className="p-3">{t('analytics.emergency_col', 'Emergency Count')}</th>
                <th className="p-3">{t('analytics.avg_time_col', 'Avg Fix Time')}</th>
                <th className="p-3">{t('analytics.score_col', 'Public Score')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {departmentMetrics.map((d) => (
                <tr key={d.department} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{translateDepartment(d.department)}</td>
                  <td className="p-3 text-slate-700">{d.totalComplaints}</td>
                  <td className="p-3 font-bold text-emerald-600">{d.resolvedComplaints}</td>
                  <td className="p-3 text-amber-600">{d.pendingComplaints}</td>
                  <td className="p-3 text-red-600 font-bold">{d.emergencyCount}</td>
                  <td className="p-3 font-mono font-bold">{d.avgResolutionTimeHours} {t('analytics.hrs', 'hrs')}</td>
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
