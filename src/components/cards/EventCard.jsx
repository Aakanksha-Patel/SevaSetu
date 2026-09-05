// =======================================================
// Reusable Event Card Component (SevaSetu)
// Displays community drives & volunteer opportunities
// =======================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteerApplicationsAPI } from '../../services/api.js';

const CATEGORY_STYLES = {
  Education: 'bg-blue-100/90 text-blue-800 border-blue-200',
  Healthcare: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
  Environment: 'bg-teal-100/90 text-teal-800 border-teal-200',
  'Animal Welfare': 'bg-amber-100/90 text-amber-800 border-amber-200',
  'Child Welfare': 'bg-rose-100/90 text-rose-800 border-rose-200',
  'Women Empowerment': 'bg-purple-100/90 text-purple-800 border-purple-200',
  'Food Distribution': 'bg-orange-100/90 text-orange-800 border-orange-200',
  'Disaster Relief': 'bg-red-100/90 text-red-800 border-red-200',
};

export default function EventCard({ event, onApplied, onSelect }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!event) return null;

  const categoryStyle =
    CATEGORY_STYLES[event.category] || 'bg-slate-100 text-slate-800 border-slate-200';

  const required = Number(event.required_volunteers || 10);
  const registered = Number(event.total_applicants || event.spots_filled || 0);
  const spotsLeft = Math.max(0, required - registered);
  const progressPercent = Math.min(100, Math.round((registered / required) * 100));

  const handleApply = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      // Redirect or signal login required
      navigate(`/login?redirect=/events&applyEvent=${event.id}`);
      return;
    }

    try {
      setApplying(true);
      setErrorMsg('');
      await volunteerApplicationsAPI.apply({ event_id: event.id });
      setAppliedSuccess(true);
      if (onApplied) onApplied(event.id);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit volunteer application.');
    } finally {
      setApplying(false);
    }
  };

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Upcoming';

  return (
    <div
      id={`event-card-${event.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Event Banner Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={
              event.image ||
              'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
            }
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Badge on Image */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xs ${categoryStyle}`}
            >
              {event.category || 'Community Drive'}
            </span>
          </div>

          {/* Date pill on Image */}
          <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Organizing NGO link */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {event.ngo_id ? (
              <Link
                to={`/ngos/${event.ngo_id}`}
                className="font-medium text-slate-700 hover:text-emerald-700 hover:underline truncate"
              >
                {event.ngo_name || 'Registered Partner NGO'}
              </Link>
            ) : (
              <span className="font-medium text-slate-700 truncate">
                {event.ngo_name || 'Registered Partner NGO'}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Time & Location */}
          <div className="space-y-1 pt-1 text-xs text-slate-500">
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.time}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.location || 'Location upon acceptance'}</span>
            </div>
          </div>

          {/* Volunteers Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-medium">
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3 h-3 text-orange-500" />
                <span>{registered} registered</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">
                {spotsLeft > 0 ? `${spotsLeft} spots open` : 'Drive Full'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
              {errorMsg}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 flex items-center gap-2">
        {onSelect ? (
          <button
            onClick={() => onSelect(event)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        ) : (
          <Link
            to={event.ngo_id ? `/ngos/${event.ngo_id}` : '/events'}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        )}

        {appliedSuccess ? (
          <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Applied!</span>
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying || spotsLeft <= 0}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all ${
              spotsLeft <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{applying ? 'Applying...' : spotsLeft <= 0 ? 'Full' : 'Volunteer'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
