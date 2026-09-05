// =======================================================
// Admin Feedback Management Page (/admin/feedback)
// Features:
// - View feedback and reviews across all NGOs and events
// - Search feedback by commenter, NGO, event, or keyword
// - Visual 5-star ratings and engagement details
// - Delete inappropriate feedback with confirmation modal
// =======================================================

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import {
  MessageSquare,
  Search,
  Star,
  Trash2,
  Building2,
  Calendar,
  AlertTriangle,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getFeedback({
        search: searchTerm || undefined,
      });
      if (res.data?.success) {
        setFeedbackList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeedback();
  };

  const confirmDeleteFeedback = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Inappropriate Feedback',
      message: `Are you sure you want to permanently delete this feedback review submitted by "${item.user_name}"? This action cannot be undone.`,
      confirmText: 'Delete Feedback',
      type: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminAPI.deleteFeedback(item.id);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await fetchFeedback();
        } catch (err) {
          alert(err.message || 'Failed to delete feedback');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const renderStars = (rating) => {
    const num = Math.min(5, Math.max(1, Number(rating) || 5));
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= num ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const avgRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Community Reviews & Feedback Moderation
            </h2>
            <p className="text-xs text-slate-500">
              Audit feedback left by volunteers and donors for NGOs. Moderate inappropriate or abusive submissions.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{avgRating} Avg Platform Rating</span>
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {feedbackList.length} Total Reviews
            </span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews by contributor, NGO name, drive, or review words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-24 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Feedback List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No feedback entries found</p>
            <p className="text-xs text-slate-400 mt-1">No community reviews match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Contributor</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Recipient NGO & Drive</th>
                  <th className="py-3.5 px-4">Review Content</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {feedbackList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Contributor */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {f.user_name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{f.user_name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{f.user_email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStars(f.rating)}
                      <span className="text-[11px] text-slate-500 font-medium ml-1">({f.rating}/5)</span>
                    </td>

                    {/* NGO & Event */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{f.ngo_name}</span>
                      </p>
                      {f.event_title && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{f.event_title}</span>
                        </p>
                      )}
                    </td>

                    {/* Comment */}
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-slate-700 italic leading-relaxed">
                        "{f.comment || 'Wonderful experience volunteering and contributing.'}"
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => confirmDeleteFeedback(f)}
                        title="Delete Inappropriate Feedback"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
