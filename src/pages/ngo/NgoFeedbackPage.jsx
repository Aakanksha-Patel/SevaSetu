// =======================================================
// NGO Feedback Page Component
// Requirement:
// Show ratings and comments received from users and volunteers.
// =======================================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { feedbackAPI } from '../../services/api.js';
import {
  MessageSquareQuote,
  Star,
  User,
  Calendar,
  Filter,
  CheckCircle2,
  Award,
  Sparkles,
} from 'lucide-react';

export default function NgoFeedbackPage() {
  const { ngoProfile } = useOutletContext() || {};
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await feedbackAPI.getMyNgoFeedback().catch(() => {
          if (ngoProfile?.id) {
            return feedbackAPI.getByNgo(ngoProfile.id);
          }
          return { data: { data: [] } };
        });

        if (res.data?.success) {
          setFeedbackList(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load NGO feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [ngoProfile]);

  const totalReviews = feedbackList.length;
  const avgRating =
    totalReviews > 0
      ? (feedbackList.reduce((sum, f) => sum + Number(f.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0';

  // Count by stars
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbackList.forEach((f) => {
    const r = Math.min(5, Math.max(1, parseInt(f.rating, 10) || 5));
    starCounts[r] = (starCounts[r] || 0) + 1;
  });

  const filteredList = feedbackList.filter((f) => {
    if (ratingFilter === 'all') return true;
    return parseInt(f.rating, 10) === parseInt(ratingFilter, 10);
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Community Ratings & Feedback
        </h2>
        <p className="text-sm text-slate-500">
          Reviews, ratings, and testimonial comments shared by volunteers and community members
        </p>
      </div>

      {/* Ratings Summary Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Overall Score */}
        <div className="text-center md:border-r border-slate-100 md:pr-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Community Score
          </span>
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-5xl font-black text-slate-900">{avgRating}</h3>
            <span className="text-xl font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">Based on {totalReviews} volunteer reviews</p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-medium">
                <span className="w-12 text-slate-600 font-bold shrink-0">{stars} Stars</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400 font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 shrink-0">Filter by Rating:</span>
        {['all', '5', '4', '3', '2', '1'].map((star) => (
          <button
            key={star}
            onClick={() => setRatingFilter(star)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1 ${
              ratingFilter === star
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{star === 'all' ? 'All Reviews' : `${star} Star`}</span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading ratings and feedback...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No reviews found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {ratingFilter !== 'all'
              ? `No feedback with ${ratingFilter} stars recorded yet.`
              : 'Feedback submitted by volunteers and beneficiaries after attending your events will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((item) => (
            <div
              key={item.id}
              id={`ngo-feedback-card-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.user_avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
                      }
                      alt={item.user_name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 bg-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.user_name}</h4>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">
                        {item.user_role === 'volunteer' ? 'Verified Volunteer' : 'Community Participant'}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= Number(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="truncate max-w-[200px] text-slate-600 font-semibold">
                  Event: {item.event_title || 'General NGO Feedback'}
                </span>
                <span>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
