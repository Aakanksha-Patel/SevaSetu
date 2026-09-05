// =======================================================
// Volunteer My Events Page (/volunteer/events)
// Requirements: Accepted and completed events appear in My Events
// Displays schedule, event details, NGO host info, and actions
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteersAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  CalendarCheck,
  Calendar,
  MapPin,
  Clock,
  Building2,
  Users,
  Award,
  MessageSquareQuote,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function VolunteerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('all'); // all, accepted, completed

  const fetchMyEvents = async () => {
    try {
      const res = await volunteersAPI.getMyApplications();
      const allApps = res.data?.data || [];
      // Filter only accepted and completed events
      const joinedEvents = allApps.filter(
        (app) => app.status === 'accepted' || app.status === 'completed'
      );
      setEvents(joinedEvents);
    } catch (err) {
      console.error('Error fetching volunteer events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
  };

  const filtered = events.filter((ev) => {
    if (tab === 'accepted') return ev.status === 'accepted';
    if (tab === 'completed') return ev.status === 'completed';
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Fetching your scheduled drives from MySQL..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed Participations
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Volunteer Events</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            All events where your application has been accepted or completed by the organizing NGO.
            Review venue coordinates, timing guidelines, and access certificates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Sync Schedule'}
          </button>

          <Link
            to="/volunteer/opportunities"
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find More Drives
          </Link>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            tab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All My Events ({events.length})
        </button>
        <button
          onClick={() => setTab('accepted')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            tab === 'accepted'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Upcoming & Active ({events.filter((e) => e.status === 'accepted').length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            tab === 'completed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Completed Drives ({events.filter((e) => e.status === 'completed').length})
        </button>
      </div>

      {/* Events List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {tab === 'all'
              ? 'No accepted or completed events yet'
              : tab === 'accepted'
              ? 'No upcoming accepted drives'
              : 'No completed drives yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When an NGO approves your application from the opportunities board, the drive immediately
            appears here under your confirmed schedule.
          </p>
          <Link
            to="/volunteer/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Browse Open Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((item) => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                id={`my-event-card-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Event Image Banner if available */}
                {item.event_image && (
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={item.event_image}
                      alt={item.event_title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
                        {item.event_category || 'Volunteering'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {isCompleted ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          Completed Drive
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirmed Volunteer
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {!item.event_image && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          {item.event_category || 'Volunteering'}
                        </span>
                        {isCompleted ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmed Volunteer
                          </span>
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {item.event_title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{item.ngo_name}</span>
                      </div>
                    </div>

                    {item.event?.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {item.event.description}
                      </p>
                    )}

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800">Date:</span>
                        <span>{item.event_date || 'Upcoming'}</span>
                        {item.event_time && <span className="text-slate-400">({item.event_time})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">Venue:</span>
                        <span className="truncate">{item.event_location || 'Community Venue'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      {isCompleted ? (
                        <span className="text-blue-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Service hours logged & verified
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Info className="w-3 h-3" /> Please arrive 15 minutes before start
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <>
                          <Link
                            to="/volunteer/certificates"
                            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Certificate
                          </Link>
                          <Link
                            to="/volunteer/feedback"
                            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <MessageSquareQuote className="w-3.5 h-3.5" />
                            Give Feedback
                          </Link>
                        </>
                      ) : (
                        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ready for participation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
