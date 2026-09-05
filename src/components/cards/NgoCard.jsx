// =======================================================
// Reusable NGO Card Component (SevaSetu)
// Displays verified NGO profiles with impact metrics & links
// =======================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';

const CATEGORY_COLORS = {
  Education: 'bg-blue-50 text-blue-700 border-blue-200',
  Healthcare: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Environment: 'bg-teal-50 text-teal-700 border-teal-200',
  'Animal Welfare': 'bg-amber-50 text-amber-700 border-amber-200',
  'Child Welfare': 'bg-rose-50 text-rose-700 border-rose-200',
  'Women Empowerment': 'bg-purple-50 text-purple-700 border-purple-200',
  'Food Distribution': 'bg-orange-50 text-orange-700 border-orange-200',
  'Disaster Relief': 'bg-red-50 text-red-700 border-red-200',
};

export default function NgoCard({ ngo, onQuickDonate }) {
  if (!ngo) return null;

  const categoryStyle =
    CATEGORY_COLORS[ngo.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div
      id={`ngo-card-${ngo.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {ngo.logo ? (
                <img
                  src={ngo.logo}
                  alt={ngo.name || ngo.organization_name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
                  {(ngo.name || ngo.organization_name || 'N').charAt(0)}
                </div>
              )}
              {ngo.verification_status === 'verified' && (
                <div
                  title="Verified Grassroots NGO"
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <Link
                to={`/ngos/${ngo.id}`}
                className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
              >
                {ngo.name || ngo.organization_name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">
                  {ngo.address?.split(',')[ngo.address?.split(',').length - 2]?.trim() ||
                    ngo.city ||
                    'Pan-India'}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${categoryStyle}`}
          >
            {ngo.category || 'General'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {ngo.description ||
            'Committed to grassroots humanitarian aid, community elevation, and driving tangible social impact.'}
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Active Drives</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {ngo.active_events_count !== undefined ? ngo.active_events_count : 1} Events
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Rating</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {ngo.rating ? Number(ngo.rating).toFixed(1) : '4.9'} / 5.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/ngos/${ngo.id}`}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>View NGO Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onQuickDonate && (
          <button
            onClick={() => onQuickDonate(ngo)}
            title="Support this NGO"
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
