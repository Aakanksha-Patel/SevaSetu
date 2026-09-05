// =======================================================
// NGO Dashboard Home Page
// Dashboard cards:
// - Total Volunteers
// - Upcoming Events
// - Total Donations
// - Pending Applications
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ngosAPI, volunteerApplicationsAPI, eventsAPI } from '../../services/api.js';
import {
  Users,
  Calendar,
  Heart,
  ClipboardList,
  PlusCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export default function NgoDashboardHome() {
  const { ngoProfile } = useOutletContext() || {};
  const [stats, setStats] = useState({
    total_volunteers: 0,
    upcoming_events: 0,
    total_donations: 0,
    pending_applications: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes, eventsRes] = await Promise.all([
        ngosAPI.getMyStats().catch(() => ({ data: { data: {} } })),
        volunteerApplicationsAPI.getNgoApplications().catch(() => ({ data: { data: [] } })),
        eventsAPI.getAll({ status: 'all' }).catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }

      const allApps = appsRes.data?.data || [];
      setRecentApplications(allApps.slice(0, 5));

      const allEvents = eventsRes.data?.data || [];
      // Filter for this NGO's events if ngoProfile is loaded
      const filteredEvents = ngoProfile?.id
        ? allEvents.filter((e) => e.ngo_id === ngoProfile.id)
        : allEvents.slice(0, 4);
      setMyEvents(filteredEvents);
    } catch (err) {
      console.error('Error loading NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [ngoProfile]);

  const handleApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await volunteerApplicationsAPI.updateStatus(appId, newStatus);
      if (res.data?.success) {
        setActionAlert({
          type: 'success',
          message: `Application ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully! MySQL database updated.`,
        });
        // Optimistically update list
        setRecentApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
        // Refresh stats
        const updatedStats = await ngosAPI.getMyStats();
        if (updatedStats.data?.success) setStats(updatedStats.data.data);
      }
    } catch (err) {
      setActionAlert({ type: 'error', message: 'Failed to update application status. Please try again.' });
    }
  };

  const isVerified = (ngoProfile?.verification_status || 'verified') === 'verified';

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          id="ngo-action-alert"
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
              {isVerified ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Admin Verified Organization</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Verification Application Under Review</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {ngoProfile?.name || 'Welcome, NGO Partner'}
            </h2>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              {ngoProfile?.description ||
                'Track volunteer participation, coordinate community events, monitor citizen contributions, and scale your social impact.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              id="dashboard-create-event-btn"
              to="/ngo/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
            <Link
              to="/ngo/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm backdrop-blur-md transition-colors"
            >
              <span>View Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 4 DASHBOARD CARDS ================= */}
      {/* 
          Requirements:
          Total Volunteers
          Upcoming Events
          Total Donations
          Pending Applications
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Volunteers */}
        <div
          id="stat-card-total-volunteers"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Volunteers
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              {loading ? '...' : stats.total_volunteers}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">Active & Approved</span> across drives
            </p>
          </div>
        </div>

        {/* Card 2: Upcoming Events */}
        <div
          id="stat-card-upcoming-events"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upcoming Events
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              {loading ? '...' : stats.upcoming_events}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              Active community campaigns
            </p>
          </div>
        </div>

        {/* Card 3: Total Donations */}
        <div
          id="stat-card-total-donations"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Donations
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              {loading ? '...' : `₹${Number(stats.total_donations || 0).toLocaleString()}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Direct citizen contributions
            </p>
          </div>
        </div>

        {/* Card 4: Pending Applications */}
        <div
          id="stat-card-pending-applications"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Applications
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              {loading ? '...' : stats.pending_applications}
            </h3>
            <p className="text-xs text-amber-700 font-medium mt-1">
              Awaiting your review & decision
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Applications & Active Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Volunteer Applications Awaiting Review (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <span>Recent Volunteer Applications</span>
              </h3>
              <p className="text-xs text-slate-500">
                Volunteers who applied to join your community events
              </p>
            </div>
            <Link
              to="/ngo/applications"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading applications...</div>
          ) : recentApplications.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              No pending volunteer applications right now.
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  id={`home-app-row-${app.id}`}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {app.volunteer_name || 'Volunteer Applicant'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          app.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Applied for: <span className="font-semibold text-slate-800">{app.event_title}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Skills: {app.skills || 'Community Outreach'} • {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>

                  {app.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        id={`quick-accept-btn-${app.id}`}
                        onClick={() => handleApplicationStatus(app.id, 'accepted')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        id={`quick-reject-btn-${app.id}`}
                        onClick={() => handleApplicationStatus(app.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700 font-semibold text-xs transition-colors"
                      >
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">
                      Decision logged
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Events Overview (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Event Roster</span>
            </h3>
            <Link
              to="/ngo/events"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              No events scheduled yet. Click "Create Event" to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        event.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : event.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {event.location?.split(',')[0]}
                    </span>
                    <span>{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/ngo/events"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold text-xs bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Community Drive</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
