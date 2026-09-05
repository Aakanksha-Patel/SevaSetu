// =======================================================
// Volunteer Dashboard Home Page (/volunteer/dashboard)
// Cards: Volunteer Hours, Events Joined, Pending Applications, Certificates
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteersAPI, certificatesAPI } from '../../services/api.js';
import StatCard from '../../components/common/StatCard.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  Clock,
  CalendarCheck,
  ClipboardList,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export default function VolunteerDashboardHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    volunteer_hours: 0,
    events_joined: 0,
    pending_applications: 0,
    certificates_count: 0,
  });
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, appsRes, certsRes] = await Promise.all([
        volunteersAPI.getStats().catch(() => ({ data: { data: null } })),
        volunteersAPI.getMyApplications().catch(() => ({ data: { data: [] } })),
        certificatesAPI.getMyCertificates().catch(() => ({ data: { data: [] } })),
      ]);

      const appsList = appsRes.data?.data || [];
      const certsList = certsRes.data?.data || [];
      setApplications(appsList);
      setCertificates(certsList);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      } else {
        // Fallback computation
        const completed = appsList.filter((a) => a.status === 'completed').length;
        const accepted = appsList.filter((a) => a.status === 'accepted').length;
        const pending = appsList.filter((a) => a.status === 'pending').length;
        setStats({
          volunteer_hours: completed * 4,
          events_joined: completed + accepted,
          pending_applications: pending,
          certificates_count: certsList.length,
        });
      }
    } catch (err) {
      console.error('Error fetching volunteer dashboard home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to MySQL and loading volunteer workbench..." />;
  }

  // Active / Upcoming accepted drives
  const acceptedEvents = applications.filter((a) => a.status === 'accepted' || a.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Grassroots Impact
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-orange-100 text-sm max-w-xl leading-relaxed">
            Every hour you give transforms lives. You have accumulated{' '}
            <strong className="text-white font-bold">{stats.volunteer_hours} volunteer hours</strong>{' '}
            across your community drives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-2"
            title="Refresh latest status from MySQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Database'}
          </button>

          <Link
            to="/volunteer/opportunities"
            className="px-5 py-2.5 rounded-xl bg-white text-orange-700 font-bold text-xs shadow-md hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            Find Opportunities
          </Link>
        </div>
      </div>

      {/* Required Dashboard Cards:
          1. Volunteer Hours
          2. Events Joined
          3. Pending Applications
          4. Certificates */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Volunteer Impact Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div id="card-volunteer-hours">
            <StatCard
              title="Volunteer Hours"
              value={`${stats.volunteer_hours} hrs`}
              subtitle="Verified community service"
              icon={Clock}
              color="orange"
            />
          </div>

          <div id="card-events-joined">
            <StatCard
              title="Events Joined"
              value={stats.events_joined}
              subtitle="Accepted & completed drives"
              icon={CalendarCheck}
              color="green"
            />
          </div>

          <div id="card-pending-applications">
            <StatCard
              title="Pending Applications"
              value={stats.pending_applications}
              subtitle="Awaiting NGO review"
              icon={ClipboardList}
              color="blue"
            />
          </div>

          <div id="card-certificates">
            <StatCard
              title="Certificates"
              value={stats.certificates_count}
              subtitle="Verified service awards"
              icon={Award}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Split Section: Active/Accepted Drives & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active/Accepted Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Active & Upcoming Events</h3>
              <p className="text-xs text-slate-500">
                Events where your volunteer application was accepted by the NGO
              </p>
            </div>
            <Link
              to="/volunteer/events"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View All Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {acceptedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No active events right now</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't been accepted to any upcoming drives yet. Apply to open opportunities to start volunteering!
              </p>
              <Link
                to="/volunteer/opportunities"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {acceptedEvents.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {app.event_category || 'Volunteering'}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {app.event_title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-orange-600" />
                        {app.ngo_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {app.event_date || 'Upcoming'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.event_location || 'Community Venue'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {app.status === 'completed' ? (
                      <Link
                        to="/volunteer/feedback"
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        Give Feedback
                      </Link>
                    ) : (
                      <Link
                        to="/volunteer/events"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                      >
                        Event Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Recent Applications Status Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Application Status</h3>
            <Link
              to="/volunteer/applications"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              All Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs divide-y divide-slate-100">
            {applications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No volunteer applications submitted yet.
              </p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {app.event_title}
                    </h5>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {app.ngo_name}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Quick Certificate Widget */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-200" />
              <h4 className="font-bold text-sm">Service Certificates</h4>
            </div>
            <p className="text-xs text-amber-100 leading-relaxed">
              Earn official, verifiable certificates with digital signature seals whenever an NGO completes your service drive.
            </p>
            <Link
              to="/volunteer/certificates"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-orange-800 text-xs font-bold rounded-xl shadow-xs hover:bg-amber-50 transition-colors"
            >
              View My Certificates ({certificates.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
