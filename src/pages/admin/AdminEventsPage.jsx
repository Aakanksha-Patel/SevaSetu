// =======================================================
// Admin Event Management Page (/admin/events)
// Features:
// - View events across all statuses: pending, approved, rejected, completed
// - Approve events (makes them visible on public listings)
// - Reject events (with confirmation modal)
// - Delete events (with confirmation modal)
// - View event preview details
// - Status filter pills and text search
// =======================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  MapPin,
  Users,
  Building2,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export default function AdminEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');

  // Event Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getEvents({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      if (res.data?.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleApproveEvent = async (event) => {
    setActionLoading(true);
    try {
      await adminAPI.updateEventStatus(event.id, 'approved');
      await fetchEvents();
      if (selectedEvent && selectedEvent.id === event.id) {
        setSelectedEvent((prev) => ({ ...prev, status: 'approved' }));
      }
    } catch (err) {
      alert(err.message || 'Failed to approve event');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRejectEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reject Event Drive',
      message: `Are you sure you want to reject the event "${event.title}" submitted by ${event.ngo_name}? It will not appear on the public volunteer portal.`,
      confirmText: 'Reject Event',
      type: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminAPI.updateEventStatus(event.id, 'rejected');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await fetchEvents();
          if (selectedEvent && selectedEvent.id === event.id) {
            setSelectedEvent((prev) => ({ ...prev, status: 'rejected' }));
          }
        } catch (err) {
          alert(err.message || 'Failed to reject event');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const confirmDeleteEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Event',
      message: `Are you sure you want to completely delete "${event.title}"? All existing volunteer applications for this drive will be deleted. This cannot be undone.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminAPI.deleteEvent(event.id);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await fetchEvents();
          if (detailsModalOpen) setDetailsModalOpen(false);
        } catch (err) {
          alert(err.message || 'Failed to delete event');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Impact Drive & Event Governance
            </h2>
            <p className="text-xs text-slate-500">
              Audit submitted community campaigns. Approved events immediately publish to the citizen portal.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg self-start sm:self-auto">
            {events.length} Events Listed
          </span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {['All', 'pending', 'approved', 'rejected', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'All' ? 'All Drives' : st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, location, or NGO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No events found</p>
            <p className="text-xs text-slate-400 mt-1">No community drives found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Event Title & NGO</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Volunteers</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Event & NGO */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'}
                          alt={ev.title}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs">{ev.title}</p>
                          <p className="text-[11px] text-teal-700 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                            {ev.ngo_name || 'Partner NGO'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {ev.category || 'Outreach'}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900">{ev.date}</p>
                      <p className="text-[11px] text-slate-500">{ev.time || '10:00 AM'}</p>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </td>

                    {/* Volunteers */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-900">{ev.volunteers_registered || 0}</span>
                      <span className="text-slate-400 text-[11px]"> / {ev.required_volunteers || 20}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{renderStatusBadge(ev.status)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Preview */}
                        <button
                          onClick={() => {
                            setSelectedEvent(ev);
                            setDetailsModalOpen(true);
                          }}
                          title="View Event Details"
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve */}
                        {ev.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveEvent(ev)}
                            title="Approve & Publish Event"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                        )}

                        {/* Reject */}
                        {ev.status !== 'rejected' && (
                          <button
                            onClick={() => confirmRejectEvent(ev)}
                            title="Reject Event"
                            className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => confirmDeleteEvent(ev)}
                          title="Permanently Delete Event"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Details Preview Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedEvent ? `Event: ${selectedEvent.title}` : 'Event Details'}
        maxWidth="max-w-2xl"
      >
        {selectedEvent && (
          <div className="space-y-5 text-xs text-slate-700">
            <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={selectedEvent.image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">{renderStatusBadge(selectedEvent.status)}</div>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white font-semibold text-xs">
                {selectedEvent.category}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedEvent.title}</h3>
              <p className="text-slate-500 font-medium mt-0.5">
                Organized by: <span className="text-teal-700 font-semibold">{selectedEvent.ngo_name}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-500 font-medium">Date & Time</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedEvent.date} @ {selectedEvent.time || '10:00 AM'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Location</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedEvent.location}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Volunteers Target</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {selectedEvent.volunteers_registered || 0} / {selectedEvent.required_volunteers || 20} needed
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                Drive Description & Execution Plan
              </h4>
              <p className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-slate-600 leading-relaxed">
                {selectedEvent.description || 'Community service activity aimed at delivering impactful on-ground change.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedEvent.status !== 'approved' && (
                  <button
                    onClick={() => {
                      handleApproveEvent(selectedEvent);
                      setDetailsModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    Approve Event
                  </button>
                )}
                {selectedEvent.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      confirmRejectEvent(selectedEvent);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                  >
                    Reject Event
                  </button>
                )}
              </div>

              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        isLoading={actionLoading}
      />
    </div>
  );
}
