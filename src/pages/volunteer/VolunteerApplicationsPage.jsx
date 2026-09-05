// =======================================================
// Volunteer Applications Page (/volunteer/applications)
// Shows all volunteer applications with real-time MySQL statuses:
// - Pending
// - Accepted
// - Rejected
// - Completed
// Reflects NGO acceptance/rejection immediately upon refresh/re-query
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteersAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  ClipboardList,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Building2,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MessageSquareQuote,
} from 'lucide-react';

export default function VolunteerApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchApplications = async () => {
    try {
      const res = await volunteersAPI.getMyApplications();
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error('Failed to retrieve volunteer applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return {
          badge: (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Accepted
            </span>
          ),
          message: 'Your application has been accepted by the organizing NGO! You are confirmed to participate.',
          borderColor: 'border-emerald-200',
          bgColor: 'bg-emerald-50/30',
        };
      case 'completed':
        return {
          badge: (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Completed
            </span>
          ),
          message: 'Drive completed! Verified service hours have been logged and your certificate is ready.',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50/30',
        };
      case 'rejected':
        return {
          badge: (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Rejected
            </span>
          ),
          message: 'The NGO was unable to accept this application due to capacity or skill alignment.',
          borderColor: 'border-rose-200',
          bgColor: 'bg-rose-50/30',
        };
      case 'pending':
      default:
        return {
          badge: (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Review
            </span>
          ),
          message: 'Application under active review by the NGO team. You will be notified once reviewed.',
          borderColor: 'border-amber-200',
          bgColor: 'bg-amber-50/30',
        };
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status?.toLowerCase() === filterStatus;
  });

  const countByStatus = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    completed: applications.filter((a) => a.status === 'completed').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (loading) {
    return <LoadingSpinner text="Loading your applications from MySQL..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">
            <ClipboardList className="w-3.5 h-3.5 text-orange-600" />
            Application Tracker
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            My Volunteer Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Track real-time decisions from NGOs across MySQL records. As soon as an NGO accepts or
            completes an application, status updates appear here instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2"
            title="Refresh statuses from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking MySQL...' : 'Refresh Statuses'}
          </button>

          <Link
            to="/volunteer/opportunities"
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply to More
          </Link>
        </div>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Applications', count: countByStatus.all },
          { id: 'pending', label: 'Pending', count: countByStatus.pending, color: 'text-amber-700 bg-amber-50' },
          { id: 'accepted', label: 'Accepted', count: countByStatus.accepted, color: 'text-emerald-700 bg-emerald-50' },
          { id: 'completed', label: 'Completed', count: countByStatus.completed, color: 'text-blue-700 bg-blue-50' },
          { id: 'rejected', label: 'Rejected', count: countByStatus.rejected, color: 'text-rose-700 bg-rose-50' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`filter-tab-${tab.id}`}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                filterStatus === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {filterStatus === 'all'
              ? 'No applications submitted yet'
              : `No applications with status "${filterStatus}"`}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse open community initiatives and submit your volunteer participation request today.
          </p>
          <Link
            to="/volunteer/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const statusInfo = getStatusDisplay(app.status);

            return (
              <div
                key={app.id}
                id={`application-item-${app.id}`}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4 ${statusInfo.borderColor}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {statusInfo.badge}
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {app.event_category || 'Volunteering'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {app.event_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-orange-600" />
                        {app.ngo_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {app.event_date || 'TBD'} {app.event_time ? `• ${app.event_time}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {app.event_location || 'Community Location'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Button depending on status */}
                  <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                    {app.status === 'accepted' && (
                      <Link
                        to="/volunteer/events"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Go to My Events
                      </Link>
                    )}

                    {app.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <Link
                          to="/volunteer/certificates"
                          className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Certificate
                        </Link>
                        <Link
                          to="/volunteer/feedback"
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                          Feedback
                        </Link>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Under NGO Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Status explanation bar */}
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${statusInfo.bgColor} text-slate-700`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>{statusInfo.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
