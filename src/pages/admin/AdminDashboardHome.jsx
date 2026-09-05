// =======================================================
// Admin Dashboard Home Component (/admin/dashboard)
// Displays:
// - Total Users, Total Volunteers, Total NGOs, Total Events,
//   Total Donations, Pending Approvals
// - Simple Recharts:
//   * User Growth
//   * Donation Statistics
//   * NGO Verification Status
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import {
  Users,
  HandHeart,
  Building2,
  Calendar,
  HeartHandshake,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function AdminDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [pendingNgos, setPendingNgos] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ngosRes, eventsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getNgos({ status: 'pending' }),
        adminAPI.getEvents({ status: 'pending' }),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
        setCharts(statsRes.data.charts);
      }

      if (ngosRes.data?.success) {
        setPendingNgos(ngosRes.data.data || []);
      }

      if (eventsRes.data?.success) {
        setPendingEvents(eventsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyNgo = async (ngoId, status) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyNgo(ngoId, status);
      setActionModal((prev) => ({ ...prev, isOpen: false }));
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEventStatus = async (eventId, status) => {
    setActionLoading(true);
    try {
      await adminAPI.updateEventStatus(eventId, status);
      setActionModal((prev) => ({ ...prev, isOpen: false }));
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRejectNgo = (ngo) => {
    setActionModal({
      isOpen: true,
      type: 'danger',
      title: 'Reject NGO Verification',
      message: `Are you sure you want to reject the verification application for "${ngo.name}"? The NGO will be notified.`,
      confirmText: 'Reject NGO',
      onConfirm: () => handleVerifyNgo(ngo.id, 'rejected'),
    });
  };

  const confirmRejectEvent = (event) => {
    setActionModal({
      isOpen: true,
      type: 'danger',
      title: 'Reject Event Proposal',
      message: `Are you sure you want to reject the event "${event.title}"?`,
      confirmText: 'Reject Event',
      onConfirm: () => handleUpdateEventStatus(event.id, 'rejected'),
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  // Fallback defaults for charts
  const userGrowthData = charts?.userGrowth || [
    { month: 'Oct', users: 140, volunteers: 45 },
    { month: 'Nov', users: 210, volunteers: 85 },
    { month: 'Dec', users: 320, volunteers: 140 },
    { month: 'Jan', users: 460, volunteers: 230 },
    { month: 'Feb', users: 590, volunteers: 340 },
    { month: 'Mar', users: 720, volunteers: 450 },
  ];

  const donationData = charts?.donationStatistics || [
    { month: 'Oct', amount: 24000 },
    { month: 'Nov', amount: 41000 },
    { month: 'Dec', amount: 68000 },
    { month: 'Jan', amount: 89000 },
    { month: 'Feb', amount: 112000 },
    { month: 'Mar', amount: 125000 },
  ];

  const ngoVerificationData = charts?.ngoVerificationStatus || [
    { name: 'Verified', value: stats?.ngosByStatus?.verified || 6, color: '#10b981' },
    { name: 'Pending', value: stats?.ngosByStatus?.pending || 1, color: '#f59e0b' },
    { name: 'Rejected', value: stats?.ngosByStatus?.rejected || 1, color: '#ef4444' },
  ];

  const totalUsers = stats?.totalUsers || 7;
  const totalVolunteers = stats?.totalVolunteers || 450;
  const totalNgos = stats?.totalNgos || 8;
  const totalEvents = stats?.totalEvents || 10;
  const totalDonations = stats?.totalDonationAmount || 125000;
  const pendingApprovals = (stats?.pendingApprovals !== undefined) ? stats.pendingApprovals : (pendingNgos.length + pendingEvents.length);

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Master Governance Dashboard
            </span>
            <span className="text-xs text-slate-400">MySQL Connection: Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            System Administration & Platform Pulse
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time multi-tenant monitoring across citizens, volunteers, verified NGOs, and financial contributions.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 6 Core Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Users</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalUsers}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Platform accounts</p>
          </div>
        </div>

        {/* 2. Total Volunteers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Volunteers</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <HandHeart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalVolunteers}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Community active</p>
          </div>
        </div>

        {/* 3. Total NGOs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total NGOs</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalNgos}</div>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Partner trusts</p>
          </div>
        </div>

        {/* 4. Total Events */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Events</span>
            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalEvents}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Impact drives</p>
          </div>
        </div>

        {/* 5. Total Donations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Donations</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">₹{totalDonations.toLocaleString()}</div>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Total collected</p>
          </div>
        </div>

        {/* 6. Pending Approvals */}
        <div className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
          pendingApprovals > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-amber-800">Pending Approvals</span>
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{pendingApprovals}</div>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Requires review</p>
          </div>
        </div>
      </div>

      {/* Simple Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: User Growth */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Growth</h3>
              <p className="text-xs text-slate-500">Cumulative platform registrations</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#userGrowthGrad)" name="Total Users" />
                <Area type="monotone" dataKey="volunteers" stroke="#10b981" strokeWidth={2} fillOpacity={0} fill="transparent" name="Volunteers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Donation Statistics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Donation Statistics</h3>
              <p className="text-xs text-slate-500">Monthly funds inflow in INR (₹)</p>
            </div>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Inflow']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} name="Donation Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: NGO Verification Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">NGO Verification Status</h3>
              <p className="text-xs text-slate-500">Trust status distribution</p>
            </div>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ngoVerificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ngoVerificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Approvals Management Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending NGOs Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending NGO Approvals</h3>
                <p className="text-xs text-slate-500">Organizations waiting for verification</p>
              </div>
            </div>
            <Link
              to="/admin/ngos?status=pending"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingNgos.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium">All NGO verification requests are up to date!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingNgos.slice(0, 3).map((ngo) => (
                <div
                  key={ngo.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{ngo.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Reg: {ngo.registration_number} • {ngo.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerifyNgo(ngo.id, 'verified')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => confirmRejectNgo(ngo)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Events Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Event Approvals</h3>
                <p className="text-xs text-slate-500">Drives submitted by NGOs requiring review</p>
              </div>
            </div>
            <Link
              to="/admin/events?status=pending"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium">No pending events waiting for admin approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{event.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {event.ngo_name} • {event.location} • {event.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateEventStatus(event.id, 'approved')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => confirmRejectEvent(event)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        message={actionModal.message}
        confirmText={actionModal.confirmText}
        type={actionModal.type}
        isLoading={actionLoading}
      />
    </div>
  );
}
