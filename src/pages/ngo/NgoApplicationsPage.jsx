// =======================================================
// NGO Volunteer Applications Page
// Requirements:
// Show:
// - Volunteer
// - Event
// - Date
// - Status
//
// Actions:
// - Accept
// - Reject
//
// When NGO accepts an application, update the MySQL record
// so the Volunteer immediately sees "Accepted".
// =======================================================

import React, { useState, useEffect } from 'react';
import { volunteerApplicationsAPI } from '../../services/api.js';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Calendar,
  MapPin,
  Sparkles,
  AlertCircle,
  Mail,
  Phone,
  Award,
} from 'lucide-react';

export default function NgoApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await volunteerApplicationsAPI.getNgoApplications();
      if (res.data?.success) {
        setApplications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load volunteer applications:', err);
      setAlert({ type: 'error', message: 'Could not load applications from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update application status (Accept / Reject)
  const handleUpdateStatus = async (appId, newStatus) => {
    setProcessingId(appId);
    setAlert(null);

    try {
      const res = await volunteerApplicationsAPI.updateStatus(appId, newStatus);
      if (res.data?.success) {
        // Optimistically update the list
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );

        setAlert({
          type: 'success',
          message: `Application ${
            newStatus === 'accepted' ? 'accepted' : 'rejected'
          } successfully! MySQL database updated and synchronized with the volunteer's portal.`,
        });
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
      setAlert({
        type: 'error',
        message: 'Failed to update application status. Please try again.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (app.volunteer_name && app.volunteer_name.toLowerCase().includes(q)) ||
      (app.event_title && app.event_title.toLowerCase().includes(q)) ||
      (app.skills && app.skills.toLowerCase().includes(q)) ||
      (app.volunteer_email && app.volunteer_email.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const completedCount = applications.filter((a) => a.status === 'completed').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Volunteer Applications
          </h2>
          <p className="text-sm text-slate-500">
            Review applicant qualifications, verify skills, and approve roster assignments
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
            {acceptedCount} Accepted
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs">
            {completedCount} Completed
          </span>
        </div>
      </div>

      {/* Real-time synchronization notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-slate-100">Instant MySQL Synchronization</p>
            <p className="text-slate-400">
              When you click <strong>"Accept"</strong>, the MySQL database updates immediately and the Volunteer will instantly see <strong>"Accepted"</strong> with their digital certificate and event pass.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Alert */}
      {alert && (
        <div
          id="applications-action-alert"
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search volunteer name, event, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter:</span>
          {[
            { key: 'all', label: 'All Applications' },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'accepted', label: `Accepted (${acceptedCount})` },
            { key: 'completed', label: `Completed (${completedCount})` },
            { key: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= VOLUNTEER APPLICATIONS TABLE ================= */}
      {/* 
          Requirements:
          Show:
          - Volunteer
          - Event
          - Date
          - Status

          Actions:
          - Accept
          - Reject
      */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Loading volunteer applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No applications found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No records match your selected filter. Clear filters to see all applications.'
                : 'There are currently no volunteer applications submitted for your events.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Volunteer</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApplications.map((app) => {
                  const isPending = app.status === 'pending';
                  const isAccepted = app.status === 'accepted';
                  const isCompleted = app.status === 'completed';
                  const isRejected = app.status === 'rejected';

                  return (
                    <tr
                      key={app.id}
                      id={`application-row-${app.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Volunteer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              app.volunteer_avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
                            }
                            alt={app.volunteer_name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {app.volunteer_name || 'Volunteer Applicant'}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{app.volunteer_email}</p>
                            {app.skills && (
                              <p className="text-[11px] text-blue-700 font-medium truncate max-w-xs mt-0.5">
                                Skills: {app.skills}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {app.event_title || 'Community Volunteering Drive'}
                          </span>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {app.event_location || 'Mumbai, Maharashtra'}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                        {app.applied_at
                          ? new Date(app.applied_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            isCompleted
                              ? 'bg-purple-50 border border-purple-200 text-purple-700'
                              : isAccepted
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                              : isRejected
                              ? 'bg-rose-50 border border-rose-200 text-rose-700'
                              : 'bg-amber-50 border border-amber-200 text-amber-700'
                          }`}
                        >
                          {isCompleted ? (
                            <Award className="w-3.5 h-3.5 text-purple-600" />
                          ) : isAccepted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isRejected ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>{app.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              id={`accept-app-btn-${app.id}`}
                              onClick={() => handleUpdateStatus(app.id, 'accepted')}
                              disabled={processingId === app.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>

                            <button
                              id={`reject-app-btn-${app.id}`}
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              disabled={processingId === app.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : isAccepted ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              Accepted
                            </span>
                            <button
                              id={`complete-app-btn-${app.id}`}
                              onClick={() => handleUpdateStatus(app.id, 'completed')}
                              disabled={processingId === app.id}
                              title="Mark volunteer participation as completed and issue certificate"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Complete & Issue Cert</span>
                            </button>
                          </div>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                            <Award className="w-3.5 h-3.5" />
                            Completed & Certified
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
