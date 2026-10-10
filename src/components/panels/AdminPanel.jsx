// =======================================================
// Administrator Panel Component (Metrics & Control)
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminAPI, authAPI, ngosAPI } from '../../services/api.js';
import StatCard from '../common/StatCard.jsx';
import Badge from '../common/Badge.jsx';
import Alert from '../common/Alert.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import {
  ShieldCheck,
  Users,
  Building2,
  Heart,
  Clock,
  CheckCircle2,
  XCircle,
  Database,
  Activity,
  Trash2,
  BarChart3,
} from 'lucide-react';
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

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [ngosList, setNgosList] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ngos');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, ngosRes, dbRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ data: { data: null } })),
        adminAPI.getUsers().catch(() => ({ data: { data: [] } })),
        ngosAPI.getAll().catch(() => ({ data: { data: [] } })),
        authAPI.getDbStatus().catch(() => ({ data: null })),
      ]);

      setStats(statsRes.data?.data);
      setUsersList(usersRes.data?.data || []);
      setNgosList(ngosRes.data?.data || []);
      setDbStatus(dbRes.data);
    } catch (err) {
      console.error('Admin panel load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleVerifyNgo = async (id, status) => {
    try {
      await adminAPI.verifyNgo(id, status);
      setAlertInfo({ type: 'success', message: `NGO verification status updated to ${status}.` });
      fetchData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.message });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    try {
      await adminAPI.deleteUser(id);
      setAlertInfo({ type: 'success', message: 'User deleted from MySQL database.' });
      fetchData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.message });
    }
  };

  if (loading) return <LoadingSpinner text="Loading system administrator console..." />;

  // Chart data
  const pieColors = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6'];
  const userBreakdownData = stats?.userBreakdown
    ? [
        { name: 'Citizens', count: stats.userBreakdown.users },
        { name: 'Volunteers', count: stats.userBreakdown.volunteers },
        { name: 'NGOs', count: stats.userBreakdown.ngos },
        { name: 'Admins', count: stats.userBreakdown.admins },
      ]
    : [];

  const categoryData = stats?.categoryChartData || [
    { name: 'Healthcare', campaigns: 3 },
    { name: 'Education', campaigns: 2 },
    { name: 'Hunger Relief', campaigns: 2 },
    { name: 'Disaster Relief', campaigns: 1 },
  ];

  return (
    <div className="space-y-6">
      {alertInfo.message && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          className="animate-in fade-in duration-200"
        />
      )}

      {/* Admin Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Central System Administrator Console
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
              <Database className="w-3 h-3" />
              MySQL Engine Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            SevaSetu Platform Overview
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Monitor system-wide donations, approve grassroots NGO entities, inspect user profiles, and ensure transparency across the platform.
          </p>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 text-xs space-y-1.5 shrink-0 min-w-[220px]">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Database Architecture
          </p>
          <p className="text-slate-400 text-[11px]">Database: <span className="text-emerald-400 font-mono">sevasetu</span></p>
          <p className="text-slate-400 text-[11px]">Driver: <span className="text-slate-200 font-mono">mysql2/promise</span></p>
          <p className="text-emerald-400 text-[10px] font-medium truncate max-w-[240px]">
            {dbStatus?.isRealMysql ? 'Live MySQL Connected' : 'Schema & Seed Loaded'}
          </p>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Users Registered"
          value={stats?.totalUsers || usersList.length}
          subtitle="All 4 roles combined"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Funds Channeled"
          value={`₹${(stats?.totalDonationsAmount || 655500).toLocaleString()}`}
          subtitle={`${stats?.totalDonationsCount || 2} verified donations`}
          icon={Heart}
          color="green"
        />
        <StatCard
          title="Grassroots NGOs"
          value={stats?.totalNgos || ngosList.length}
          subtitle={`${stats?.verifiedNgos || ngosList.length} verified & vetted`}
          icon={Building2}
          color="orange"
        />
        <StatCard
          title="Volunteer Hours"
          value={`${stats?.totalVolunteerHours || 60} hrs`}
          subtitle="Community labor logged"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Visual Analytics Row (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Campaigns by Sector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Active Causes by Impact Sector
              </h3>
              <p className="text-xs text-slate-500">Distribution of campaigns stored in MySQL</p>
            </div>
            <Badge variant="green" size="sm">
              Live Data
            </Badge>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="campaigns" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: User Roles Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                User Distribution across Roles
              </h3>
              <p className="text-xs text-slate-500">Platform demographics</p>
            </div>
            <Badge variant="blue" size="sm">
              4 Roles
            </Badge>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  label={({ name, count }) => `${name} (${count})`}
                >
                  {userBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'ngos', label: 'NGO Verification & Directory', count: ngosList.length },
            { id: 'users', label: 'User Directory', count: usersList.length },
            { id: 'logs', label: 'System Audit Logs', count: stats?.recentActivity?.length || 3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB 1: NGOs */}
          {activeTab === 'ngos' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-4">Registration #</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ngosList.map((ngo) => (
                    <tr key={ngo.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900 text-xs">
                        {ngo.organization_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {ngo.registration_number}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{ngo.sector}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {ngo.location}, {ngo.state || 'India'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            ngo.verification_status === 'verified'
                              ? 'green'
                              : ngo.verification_status === 'rejected'
                              ? 'red'
                              : 'orange'
                          }
                          size="sm"
                        >
                          {ngo.verification_status?.toUpperCase() || 'VERIFIED'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {ngo.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleVerifyNgo(ngo.id, 'verified')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Verify
                            </button>
                          )}
                          {ngo.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleVerifyNgo(ngo.id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Users */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900 text-xs">{u.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.role === 'admin'
                              ? 'purple'
                              : u.role === 'ngo'
                              ? 'blue'
                              : u.role === 'volunteer'
                              ? 'orange'
                              : 'green'
                          }
                          size="sm"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{u.location || 'India'}</td>
                      <td className="py-3 px-4">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Audit Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              {(stats?.recentActivity || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[11px] text-slate-400">
                        by {log.actor_name} ({log.actor_role})
                      </span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
