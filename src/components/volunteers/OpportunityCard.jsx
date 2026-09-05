// =======================================================
// Volunteer Opportunity Card Component
// =======================================================

import React, { useState } from 'react';
import Badge from '../common/Badge.jsx';
import VolunteerApplyModal from './VolunteerApplyModal.jsx';
import { Building2, MapPin, Calendar, Users, Sparkles, HeartHandshake } from 'lucide-react';

export default function OpportunityCard({ opportunity, onUpdated }) {
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'remote':
        return { variant: 'blue', text: 'Remote / Virtual' };
      case 'hybrid':
        return { variant: 'purple', text: 'Hybrid' };
      default:
        return { variant: 'green', text: 'On-Site' };
    }
  };

  const modeInfo = getModeBadge(opportunity.mode);
  const spotsLeft = Math.max(0, (opportunity.spots_needed || 10) - (opportunity.spots_filled || 0));

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant={modeInfo.variant} size="sm">
              {modeInfo.text}
            </Badge>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {opportunity.category}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-emerald-700 transition-colors">
              {opportunity.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">{opportunity.ngo_name}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {opportunity.description}
          </p>

          {/* Skills Required Tag */}
          {opportunity.skills_required && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Looking for: </span>
              {opportunity.skills_required}
            </div>
          )}
        </div>

        {/* Footer Meta & Button */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{opportunity.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{opportunity.date_schedule || 'Flexible'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              <strong className="text-slate-900">{spotsLeft}</strong> spots open
            </span>

            <button
              onClick={() => setApplyModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Apply Now
            </button>
          </div>
        </div>
      </div>

      <VolunteerApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        opportunity={opportunity}
        onApplicationSuccess={onUpdated}
      />
    </>
  );
}
