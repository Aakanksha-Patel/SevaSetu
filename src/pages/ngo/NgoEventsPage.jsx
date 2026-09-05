// =======================================================
// NGO Event Management Page
// NGO can:
// - Create Event
// - Edit Event
// - Delete Event
// - View Events
//
// Create Event form:
// - Event Name
// - Description
// - Category
// - Date
// - Time
// - Location
// - Required Volunteers
// - Image
//
// New events should have status "pending".
// After Admin approves the event, it becomes visible publicly.
// =======================================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { eventsAPI } from '../../services/api.js';
import {
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Eye,
  X,
  Save,
  Tag,
  Sparkles,
} from 'lucide-react';

export default function NgoEventsPage() {
  const { ngoProfile } = useOutletContext() || {};
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    category: 'Healthcare',
    date: '',
    time: '09:00 AM - 02:00 PM',
    location: '',
    required_volunteers: 15,
    image: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventsAPI.getAll({ status: 'all' });
      if (res.data?.success) {
        const all = res.data.data || [];
        const ngoId = ngoProfile?.id;
        const filtered = ngoId ? all.filter((e) => e.ngo_id === ngoId) : all;
        setEvents(filtered);
      }
    } catch (err) {
      console.error('Failed to load NGO events:', err);
      setAlert({ type: 'error', message: 'Failed to retrieve events.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [ngoProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Create Event
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.location.trim()) {
      setAlert({
        type: 'error',
        message: 'Please fill in all required fields (title, description, date, time, and location).',
      });
      return;
    }

    setSaving(true);

    try {
      const res = await eventsAPI.create({
        ...formData,
        ngo_id: ngoProfile?.id,
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800',
      });

      if (res.data?.success) {
        setAlert({
          type: 'success',
          message:
            'Event submitted successfully! It has been created with "pending" status and will be visible publicly once approved by an Admin.',
        });
        setCreateModalOpen(false);
        setFormData(initialForm);
        fetchEvents();
      }
    } catch (err) {
      console.error('Create event error:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit event. Please check required fields.',
      });
    } finally {
      setSaving(false);
    }
  };

  // 2. Edit Event
  const openEditModal = (event) => {
    setActiveEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Healthcare',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      required_volunteers: event.required_volunteers || 10,
      image: event.image || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeEvent) return;
    setAlert(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.location.trim()) {
      setAlert({
        type: 'error',
        message: 'Please fill in all required fields (title, description, date, time, and location).',
      });
      return;
    }

    setSaving(true);

    try {
      const res = await eventsAPI.update(activeEvent.id, formData);
      if (res.data?.success) {
        setAlert({ type: 'success', message: 'Event details updated successfully in MySQL!' });
        setEditModalOpen(false);
        setActiveEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Edit event error:', err);
      setAlert({ type: 'error', message: 'Failed to update event.' });
    } finally {
      setSaving(false);
    }
  };

  // 3. Delete Event
  const openDeleteModal = (event) => {
    setActiveEvent(event);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeEvent) return;
    setSaving(true);
    setAlert(null);

    try {
      const res = await eventsAPI.delete(activeEvent.id);
      if (res.data?.success) {
        setAlert({ type: 'success', message: `Event "${activeEvent.title}" was deleted.` });
        setDeleteModalOpen(false);
        setActiveEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Delete event error:', err);
      setAlert({ type: 'error', message: 'Failed to delete event.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Event Management</h2>
          <p className="text-sm text-slate-500">
            Publish social drives, coordinate volunteers, and track event approvals
          </p>
        </div>

        <button
          id="open-create-event-modal-btn"
          onClick={() => {
            setFormData(initialForm);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Approval Status Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Clock3 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold">Event Approval Workflow</p>
          <p className="text-blue-700">
            All newly created events are submitted with <strong>"pending"</strong> status. Once verified and approved
            by the platform Admin, your event will automatically become visible to all registered volunteers and
            citizens in the public events directory.
          </p>
        </div>
      </div>

      {/* Notification Alert */}
      {alert && (
        <div
          id="event-action-alert"
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

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search events by title, category, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
          {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors shrink-0 ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid / Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading organization events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No events found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or status filter.'
                : 'You have not scheduled any events yet. Click "Create Event" to post your first volunteering drive.'}
            </p>
          </div>
          <button
            onClick={() => {
              setFormData(initialForm);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              id={`ngo-event-card-${event.id}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image & Status Badge */}
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=600'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                    {event.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs ${
                      event.status === 'approved'
                        ? 'bg-emerald-500 text-white'
                        : event.status === 'pending'
                        ? 'bg-amber-500 text-white'
                        : event.status === 'rejected'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {event.status === 'pending' ? 'Pending Approval' : event.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{event.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Required Volunteers: <strong>{event.required_volunteers}</strong></span>
                  </div>
                </div>

                {/* Card Action Buttons (Edit / Delete) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    id={`edit-event-btn-${event.id}`}
                    onClick={() => openEditModal(event)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    id={`delete-event-btn-${event.id}`}
                    onClick={() => openDeleteModal(event)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CREATE EVENT MODAL ================= */}
      {/* 
          Requirements:
          Create Event form:
          Event Name
          Description
          Category
          Date
          Time
          Location
          Required Volunteers
          Image
          New events should have status "pending".
      */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2 text-blue-700">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-black text-lg text-slate-900 tracking-tight">Create New Event</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Mega Rural Health & Pediatric Camp"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  >
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                    <option value="Child Welfare">Child Welfare</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Food Distribution">Food Distribution</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>

                {/* Required Volunteers */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Required Volunteers *
                  </label>
                  <input
                    type="number"
                    name="required_volunteers"
                    min="1"
                    required
                    value={formData.required_volunteers}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Time Schedule *
                  </label>
                  <input
                    type="text"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleInputChange}
                    placeholder="e.g. 09:00 AM - 03:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Location */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Venue name, Landmark, City"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide full details regarding volunteer duties, objectives, and equipment provided..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                <strong>Notice:</strong> This new event will receive <strong>"pending"</strong> status upon submission. It will become visible publicly once reviewed and approved by the platform Admin.
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Submit Event for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT EVENT MODAL ================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900 tracking-tight">Edit Event Details</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  >
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                    <option value="Child Welfare">Child Welfare</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Food Distribution">Food Distribution</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Required Volunteers *
                  </label>
                  <input
                    type="number"
                    name="required_volunteers"
                    min="1"
                    required
                    value={formData.required_volunteers}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Time Schedule *
                  </label>
                  <input
                    type="text"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Delete Event?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove <strong>"{activeEvent.title}"</strong> from the MySQL database? This will also remove any associated volunteer applications.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Keep Event
              </button>
              <button
                id="confirm-delete-event-btn"
                onClick={handleDeleteConfirm}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
