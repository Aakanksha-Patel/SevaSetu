// =======================================================
// EventsPage Component (Explore Volunteer Events)
// Displays community drives & volunteer opportunities across causes
// =======================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api.js';
import EventCard from '../components/cards/EventCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  X,
  HeartHandshake,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { volunteerApplicationsAPI } from '../services/api.js';

const CAUSES = [
  'All Causes',
  'Education',
  'Healthcare',
  'Environment',
  'Animal Welfare',
  'Child Welfare',
  'Women Empowerment',
  'Food Distribution',
  'Disaster Relief',
];

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCause = searchParams.get('category') || 'All Causes';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCause, setSelectedCause] = useState(initialCause);
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Application state for modal
  const { user, isAuthenticated } = useAuth();
  const [modalApplying, setModalApplying] = useState(false);
  const [modalApplied, setModalApplied] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventsAPI.getAll({ status: 'approved' });
      setEvents(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCauseChange = (cause) => {
    setSelectedCause(cause);
    if (cause === 'All Causes') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cause });
    }
  };

  const filteredEvents = events.filter((ev) => {
    const searchMatch =
      (ev.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.ngo_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const causeMatch =
      selectedCause === 'All Causes' ||
      (ev.category || '').toLowerCase() === selectedCause.toLowerCase();

    return searchMatch && causeMatch;
  });

  const handleModalApply = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events&applyEvent=${selectedEventModal.id}`);
      return;
    }
    try {
      setModalApplying(true);
      setModalError('');
      await volunteerApplicationsAPI.apply({ event_id: selectedEventModal.id });
      setModalApplied(true);
      loadEvents();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setModalApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-orange-600" />
          Real-World Community Drives & Field Volunteer Opportunities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Upcoming Volunteer Events
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Dedicate your weekends or free hours to meaningful causes. Browse active events led by verified non-profits across health, education, green drives, and hunger relief.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, organizing NGO, city or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {(searchQuery || selectedCause !== 'All Causes') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCause('All Causes');
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Cause Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CAUSES.map((cause) => {
            const isSelected = selectedCause.toLowerCase() === cause.toLowerCase();
            return (
              <button
                key={cause}
                onClick={() => handleCauseChange(cause)}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cause}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Loading upcoming volunteer events..." />
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{filteredEvents.length}</strong> active events</span>
            {selectedCause !== 'All Causes' && (
              <span>Cause: <strong>{selectedCause}</strong></span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={(ev) => {
                  setSelectedEventModal(ev);
                  setModalApplied(false);
                  setModalError('');
                }}
                onApplied={() => loadEvents()}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No events matched your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try choosing a different cause category or clearing the search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCause('All Causes');
              searchParams.delete('category');
              setSearchParams(searchParams);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Show All Events
          </button>
        </div>
      )}

      {/* Event Details Quick Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="relative h-48 w-full">
              <img
                src={
                  selectedEventModal.image ||
                  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
                }
                alt={selectedEventModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedEventModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800">
                {selectedEventModal.category}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedEventModal.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-1 font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Organized by {selectedEventModal.ngo_name || 'Verified NGO'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedEventModal.description}
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs text-slate-600 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Date:</strong>{' '}
                    {selectedEventModal.date
                      ? new Date(selectedEventModal.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Upcoming'}
                  </span>
                </div>
                {selectedEventModal.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Time:</strong> {selectedEventModal.time}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Venue:</strong> {selectedEventModal.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>
                    <strong>Volunteers Needed:</strong> {selectedEventModal.required_volunteers || 10}
                  </span>
                </div>
              </div>

              {modalError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                  {modalError}
                </p>
              )}

              {modalApplied ? (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Application Submitted Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    The NGO organizers will review your profile and update your volunteer status.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedEventModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleModalApply}
                    disabled={modalApplying}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>{modalApplying ? 'Applying...' : 'Apply as Volunteer'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
