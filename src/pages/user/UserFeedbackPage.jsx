// =======================================================
// User Feedback Page (/user/feedback)
// Form: Select NGO, Event (optional), Star Rating, Comment
// List: Past feedback submitted by user
// Connected to MySQL /api/feedback
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { feedbackAPI, ngosAPI, eventsAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  MessageSquareQuote,
  Star,
  CheckCircle2,
  Building2,
  Calendar,
  Send,
  Loader2,
  ThumbsUp,
} from 'lucide-react';

export default function UserFeedbackPage() {
  const { user } = useAuth();

  const [ngos, setNgos] = useState([]);
  const [events, setEvents] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    ngo_id: '',
    event_id: '',
    rating: 5,
    comment: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ngosRes, eventsRes, feedbackRes] = await Promise.all([
        ngosAPI.getAll(),
        eventsAPI.getAll({ status: 'approved' }),
        feedbackAPI.getMyFeedback().catch(() => ({ data: { data: [] } })),
      ]);

      const ngoList = ngosRes.data?.data || [];
      setNgos(ngoList);
      setEvents(eventsRes.data?.data || []);
      setMyFeedback(feedbackRes.data?.data || []);

      if (ngoList.length > 0 && !formData.ngo_id) {
        setFormData((prev) => ({ ...prev, ngo_id: ngoList[0].id }));
      }
    } catch (err) {
      console.error('Error loading feedback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!formData.ngo_id) {
      setErrorMessage('Please choose an NGO organization.');
      return;
    }
    if (!formData.comment.trim()) {
      setErrorMessage('Please provide a brief feedback comment or testimonial.');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        ngo_id: Number(formData.ngo_id),
        event_id: formData.event_id ? Number(formData.event_id) : null,
        rating: Number(formData.rating),
        comment: formData.comment.trim(),
      });

      setSuccessMessage('Thank you! Your feedback has been recorded and shared with the NGO.');
      setFormData((prev) => ({ ...prev, comment: '', rating: 5, event_id: '' }));

      // Reload submitted list
      const refreshed = await feedbackAPI.getMyFeedback();
      setMyFeedback(refreshed.data?.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="user-feedback-page" className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Community Feedback & Reviews</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Share your experience with partner NGOs and field events to build transparency and trust.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feedback Submission Form */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <MessageSquareQuote className="w-5 h-5 text-emerald-600" />
              Write a Review
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Your honest ratings help donors and prospective volunteers identify impactful initiatives.
            </p>

            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select NGO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target NGO Organization <span className="text-rose-500">*</span>
                </label>
                <select
                  id="feedback-ngo-select"
                  value={formData.ngo_id}
                  onChange={(e) => setFormData({ ...formData, ngo_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium text-slate-800"
                  required
                >
                  {ngos.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.name} ({ngo.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Event (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Associated Event (Optional)
                </label>
                <select
                  id="feedback-event-select"
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-slate-700"
                >
                  <option value="">-- General NGO Feedback / No Specific Event --</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          formData.rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {formData.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Comment Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Feedback & Comments <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="feedback-comment-textarea"
                  rows={4}
                  required
                  placeholder="Share details of your interaction, event experience, or positive words for the field team..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                id="submit-feedback-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Feedback...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* User Past Feedback History */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">My Submitted Reviews</h3>
            <p className="text-xs text-slate-500 mb-4">
              All feedback submitted through your SevaSetu citizen account.
            </p>

            {loading ? (
              <LoadingSpinner text="Loading feedback history..." />
            ) : myFeedback.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <ThumbsUp className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No feedback given yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Use the form on the left to submit your first review for an NGO partner.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {myFeedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {fb.ngo_name}
                        </span>
                        {fb.event_title && (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Event: {fb.event_title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < fb.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-100">
                      "{fb.comment}"
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Feedback #{fb.id}</span>
                      <span>{new Date(fb.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
