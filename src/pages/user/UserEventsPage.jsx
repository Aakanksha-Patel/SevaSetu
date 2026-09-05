// =======================================================
// User Events / Volunteer Opportunities Page (/user/events)
// Browse events, search, filter, view details, join/apply
// Connected to MySQL /api/events and /api/volunteer-applications
// =======================================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { eventsAPI, volunteerApplicationsAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

const CATEGORIES = ['All', 'Healthcare', 'Education', 'Environment', 'Disaster Relief', 'Food Distribution'];

export default function UserEventsPage() {
  const { user } = useAuth();
  const outletContext = useOutletContext();

  const [events, setEvents] = useState([]);
  const [appliedEventIds, setAppliedEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Event Details Modal
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  // Application feedback state
  const [submittingId, setSubmittingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchEventsAndApplications = async () => {
    setLoading(true);
    try {
      const [eventsRes, myAppsRes] = await Promise.all([
        eventsAPI.getAll({ status: 'approved' }),
        volunteerApplicationsAPI.getMyApplications().catch(() => ({ data: { data: [] } })),
      ]);

      setEvents(eventsRes.data?.data || []);
      const myApps = myAppsRes.data?.data || [];
      setAppliedEventIds(new Set(myApps.map((a) => a.event_id)));
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndApplications();
  }, [user]);

  const handleApplyToEvent = async (event) => {
    // If not registered as volunteer yet, trigger Become Volunteer modal
    if (user?.role !== 'volunteer') {
      setNotification({
        type: 'info',
        message: 'Please complete the one-step "Become a Volunteer" form first to join field events.',
      });
      outletContext?.openVolunteerModal?.();
      return;
    }

    setSubmittingId(event.id);
    setNotification(null);
    try {
      await volunteerApplicationsAPI.apply({
        event_id: event.id,
        ngo_id: event.ngo_id,
        notes: `Applied via SevaSetu Citizen Portal for ${event.title}`,
      });

      setAppliedEventIds((prev) => new Set(prev).add(event.id));
      setNotification({
        type: 'success',
        message: `Successfully applied to "${event.title}"! Track status in My Events.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit application',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.ngo_name && e.ngo_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      e.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="user-events-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Volunteer Opportunities & Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join community drives, food rescue missions, medical camps, and tree planting efforts.
          </p>
        </div>

        {user?.role !== 'volunteer' && (
          <button
            onClick={() => outletContext?.openVolunteerModal?.()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Become a Volunteer First
          </button>
        )}
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : notification.type === 'info'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="search-events-input"
              type="text"
              placeholder="Search by event title, cause, NGO, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <select
            id="filter-events-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium text-slate-700"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching opportunities..." />
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or explore other categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const isApplied = appliedEventIds.has(event.id);
            const isSubmitting = submittingId === event.id;

            return (
              <div
                key={event.id}
                id={`event-card-${event.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative bg-slate-100 overflow-hidden">
                    <img
                      src={
                        event.image ||
                        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold">
                        {event.category}
                      </span>
                    </div>

                    {isApplied && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Applied
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                        {event.ngo_name || 'Verified NGO'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Target Volunteers: {event.required_volunteers || 'Flexible'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedEventDetails(event)}
                    className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer text-center"
                  >
                    Details
                  </button>

                  {isApplied ? (
                    <button
                      disabled
                      className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200 opacity-90 cursor-default flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyToEvent(event)}
                      disabled={isSubmitting}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-70"
                    >
                      {isSubmitting ? 'Joining...' : 'Join Event'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEventDetails && (
        <div
          id="event-details-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            <button
              onClick={() => setSelectedEventDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-48 relative overflow-hidden bg-slate-100">
              <img
                src={
                  selectedEventDetails.image ||
                  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
                }
                alt={selectedEventDetails.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold">
                {selectedEventDetails.category}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Organized by {selectedEventDetails.ngo_name || 'Partner NGO'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedEventDetails.title}</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Date:</span>
                  <span>{new Date(selectedEventDetails.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Venue:</span>
                  <span>{selectedEventDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Volunteer Slots:</span>
                  <span>{selectedEventDetails.required_volunteers || 'Open'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  About Event & Tasks
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedEventDetails.description}
                </p>
              </div>

              <div className="pt-2">
                {appliedEventIds.has(selectedEventDetails.id) ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    You are registered for this event
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const target = selectedEventDetails;
                      setSelectedEventDetails(null);
                      handleApplyToEvent(target);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Join Volunteer Drive Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
