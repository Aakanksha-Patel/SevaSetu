// =======================================================
// User My Events Page (/user/my-events)
// Displays all events the user joined/applied to
// Connected to MySQL /api/volunteer-applications/my-applications
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteerApplicationsAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function UserMyEventsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await volunteerApplicationsAPI.getMyApplications();
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load my events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Drive Completed (4 hrs logged)
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Accepted / Confirmed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            Application Under Review
          </span>
        );
    }
  };

  return (
    <div id="user-my-events-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">My Registered Events</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your participations, application statuses, and verified field hours.
          </p>
        </div>

        <Link
          to="/user/events"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          Find More Events
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your event participations..." />
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No events joined yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't applied to any community drives yet. Explore upcoming opportunities and join one today!
            </p>
          </div>
          <Link
            to="/user/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors"
          >
            Browse Volunteer Drives <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      {app.ngo_name || 'Verified NGO'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {app.event_title || 'Community Impact Drive'}
                    </h3>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {app.event_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(app.event_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  {app.event_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{app.event_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Applied on {new Date(app.applied_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {app.notes && (
                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-0.5">Application Note:</span>
                    {app.notes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Application ID: #{app.id}</span>
                <Link
                  to="/user/feedback"
                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Give Event Feedback →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
