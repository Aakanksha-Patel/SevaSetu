// =======================================================
// Volunteer Feedback Page (/volunteer/feedback)
// Allows volunteers to submit feedback ONLY for completed events
// Displays previously submitted feedback list
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteersAPI, feedbackAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import {
  MessageSquareQuote,
  Star,
  Building2,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';

export default function VolunteerFeedbackPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);

  // Form State
  const [selectedAppId, setSelectedAppId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const [appsRes, feedbackRes] = await Promise.all([
        volunteersAPI.getMyApplications().catch(() => ({ data: { data: [] } })),
        feedbackAPI.getMyFeedback().catch(() => ({ data: { data: [] } })),
      ]);

      const apps = appsRes.data?.data || [];
      // Only completed events
      const completed = apps.filter((a) => a.status === 'completed');
      setCompletedEvents(completed);

      if (completed.length > 0 && !selectedAppId) {
        setSelectedAppId(completed[0].id.toString());
      }

      setMyFeedbacks(feedbackRes.data?.data || []);
    } catch (err) {
      console.error('Error loading volunteer feedback page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      setErrorMsg('Please select a completed event to review.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment describing your experience.');
      return;
    }

    const app = completedEvents.find((a) => a.id.toString() === selectedAppId);
    if (!app) {
      setErrorMsg('Invalid event selected.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        event_id: app.event_id,
        ngo_id: app.ngo_id,
        rating: Number(rating),
        comment: comment.trim(),
      };

      const res = await feedbackAPI.submit(payload);
      if (res.data?.success) {
        setSuccessMsg('Your feedback has been saved and submitted to the NGO and community!');
        setComment('');
        // Reload feedback
        await loadData();
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your completed drives and feedback..." />;
  }

  const selectedApp = completedEvents.find((a) => a.id.toString() === selectedAppId);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <MessageSquareQuote className="w-3.5 h-3.5 text-blue-600" />
            Impact Reviews
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Event Volunteer Feedback
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Your voice helps grassroots NGOs improve drive coordination and builds transparent trust
            for fellow citizens. You can submit feedback for drives marked as{' '}
            <strong className="text-slate-800 font-bold">Completed</strong> by the host NGO.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Submit Feedback Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Submit Event Feedback</h3>
              <p className="text-xs text-slate-500">
                Rate your on-ground experience and share guidance with the organizing NGO
              </p>
            </div>

            {successMsg && <Alert type="success" message={successMsg} />}
            {errorMsg && <Alert type="error" message={errorMsg} />}

            {completedEvents.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center space-y-3 border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Completed Events Available</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Feedback is enabled once an organizing NGO marks your volunteering participation
                  as "Completed" in MySQL.
                </p>
                <Link
                  to="/volunteer/events"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  View My Scheduled Events
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Select Completed Event */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Completed Drive *
                  </label>
                  <select
                    id="feedback-event-select"
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {completedEvents.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.event_title} — {app.ngo_name} ({app.event_date || 'Completed'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedApp && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{selectedApp.ngo_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedApp.event_date || 'Completed Drive'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Status: Completed
                    </span>
                  </div>
                )}

                {/* Star Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        id={`star-rating-btn-${star}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 text-slate-300 hover:scale-110 transition-transform focus:outline-hidden"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {rating === 5
                        ? '5 - Excellent Experience'
                        : rating === 4
                        ? '4 - Very Good'
                        : rating === 3
                        ? '3 - Average'
                        : rating === 2
                        ? '2 - Needs Improvement'
                        : '1 - Poor'}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Detailed Experience & Feedback *
                  </label>
                  <textarea
                    id="feedback-comment-input"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the drive organization, teamwork, on-ground impact, communication, or suggestions for the NGO team..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    id="submit-feedback-btn"
                    type="submit"
                    disabled={submitting || completedEvents.length === 0}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Verified Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Previously Submitted Feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">My Reviews</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {myFeedbacks.length}
            </span>
          </div>

          <div className="space-y-3">
            {myFeedbacks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-2 shadow-xs">
                <p className="text-xs text-slate-500">You haven't submitted any event reviews yet.</p>
              </div>
            ) : (
              myFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {fb.event_title || fb.ngo_name || 'Community Event'}
                    </h4>
                    <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (fb.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{fb.comment}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Building2 className="w-3 h-3 text-orange-600" />
                      {fb.ngo_name || 'NGO Partner'}
                    </span>
                    <span>
                      {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
