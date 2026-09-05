// =======================================================
// NgoDetailsPage Component (/ngos/:id)
// Comprehensive NGO profile with active events, mission & reviews
// =======================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ngosAPI, feedbackAPI } from '../services/api.js';
import EventCard from '../components/cards/EventCard.jsx';
import DonationModal from '../components/campaigns/DonationModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  Heart,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Send,
  MessageSquare,
  Award,
} from 'lucide-react';

export default function NgoDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [ngo, setNgo] = useState(null);
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadNgoDetails = async () => {
    try {
      setLoading(true);
      const res = await ngosAPI.getById(id);
      const data = res.data?.data || {};
      setNgo(data.ngo || null);
      setEvents(data.events || []);
      setFeedback(data.feedback || []);
    } catch (err) {
      console.error('Error fetching NGO details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgoDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewError('');
      await feedbackAPI.create({
        ngo_id: Number(id),
        rating: Number(rating),
        comments: comment.trim(),
      });
      setReviewSuccess('Thank you for submitting your review!');
      setComment('');
      // Reload NGO details to reflect new review
      loadNgoDetails();
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner text="Loading NGO profile & activities..." />
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">NGO Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested NGO profile does not exist or has been relocated.
        </p>
        <Link
          to="/ngos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to NGO Directory
        </Link>
      </div>
    );
  }

  const averageRating =
    feedback.length > 0
      ? (feedback.reduce((acc, f) => acc + (f.rating || 5), 0) / feedback.length).toFixed(1)
      : ngo.rating ? Number(ngo.rating).toFixed(1) : '4.9';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/ngos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore NGOs</span>
        </Link>
      </div>

      {/* Main NGO Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {ngo.logo ? (
                <img
                  src={ngo.logo}
                  alt={ngo.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-3xl border border-emerald-100">
                  {ngo.name.charAt(0)}
                </div>
              )}
              {ngo.verification_status === 'verified' && (
                <div
                  title="Government Registered & Verified"
                  className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ngo.category || 'Humanitarian'}
                </span>
                {ngo.verification_status === 'verified' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Verified NGO
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {ngo.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ngo.address || 'India'}</span>
                </div>
                {ngo.registration_number && (
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-slate-400">Reg:</span>
                    <span>{ngo.registration_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{averageRating} / 5.0</span>
                  <span className="text-slate-400 font-normal">({feedback.length} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => setDonateOpen(true)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current text-white" />
              Support / Donate
            </button>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied to clipboard!');
                }
              }}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact Info Pills */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">{ngo.email}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{ngo.phone || '+91 98000 00000'}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
            <span>Active Drives: <strong>{events.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column Description & Events, Right Column Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Mission Description & Active Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Organization</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {ngo.description ||
                'This grassroots non-profit works tirelessly with civic communities, donors, and on-ground volunteer networks to resolve acute local challenges.'}
            </p>
          </div>

          {/* Active Campaigns & Drives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Active Volunteer Opportunities</h2>
                <p className="text-xs text-slate-500">Upcoming community events led by {ngo.name}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                {events.length} Drives
              </span>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      ...event,
                      ngo_name: ngo.name,
                      ngo_id: ngo.id,
                    }}
                    onApplied={() => loadNgoDetails()}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No active events right now</p>
                <p className="text-[11px] text-slate-400">
                  New volunteer drives will be announced soon. You can support through direct donations.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Community Reviews & Write Review */}
        <div className="space-y-6">
          {/* Reviews List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Community Reviews</h3>
                <p className="text-xs text-slate-500">From verified volunteers & donors</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-slate-900">{averageRating}</div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {feedback.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {feedback.map((f, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{f.user_name || 'Community Member'}</span>
                      <div className="flex items-center text-amber-400">
                        {[...Array(f.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{f.comments}</p>
                    <p className="text-[10px] text-slate-400">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No reviews yet. Be the first to share your experience with this NGO!
              </p>
            )}

            {/* Submit Review Box */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Leave Feedback</h4>

              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              val <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Your Comments
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience working with or donating to this NGO..."
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {reviewSuccess && (
                    <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      {reviewSuccess}
                    </p>
                  )}
                  {reviewError && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                      {reviewError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReview || !comment.trim()}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">Sign in to leave a review</p>
                  <Link
                    to={`/login?redirect=/ngos/${ngo.id}`}
                    className="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {donateOpen && (
        <DonationModal
          isOpen={donateOpen}
          onClose={() => setDonateOpen(false)}
          campaign={{
            id: ngo.id,
            title: `Support ${ngo.name}`,
            ngo_name: ngo.name,
            target_amount: 500000,
            raised_amount: ngo.total_donations_received || 25000,
          }}
          onDonationSuccess={() => {
            setDonateOpen(false);
            loadNgoDetails();
          }}
        />
      )}
    </div>
  );
}
