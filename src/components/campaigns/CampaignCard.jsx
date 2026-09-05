// =======================================================
// Campaign Card Component
// =======================================================

import React, { useState } from 'react';
import Badge from '../common/Badge.jsx';
import DonationModal from './DonationModal.jsx';
import { Heart, MapPin, Users, Building2, CheckCircle2 } from 'lucide-react';

export default function CampaignCard({ campaign, onUpdated }) {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [localCampaign, setLocalCampaign] = useState(campaign);

  const raised = parseFloat(localCampaign.raised_amount || 0);
  const target = parseFloat(localCampaign.target_amount || 1);
  const percent = Math.min(100, Math.round((raised / target) * 100));

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Healthcare':
        return 'blue';
      case 'Education':
        return 'green';
      case 'Hunger Relief':
        return 'orange';
      case 'Disaster Relief':
        return 'red';
      default:
        return 'purple';
    }
  };

  const handleSuccess = (updated) => {
    setLocalCampaign((prev) => ({
      ...prev,
      ...updated,
    }));
    if (onUpdated) onUpdated();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
        {/* Image & Category */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={localCampaign.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800'}
            alt={localCampaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={getCategoryColor(localCampaign.category)} size="md">
              {localCampaign.category}
            </Badge>
          </div>
          {localCampaign.location && (
            <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{localCampaign.location}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* NGO info */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-700 truncate">{localCampaign.ngo_name}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            </div>

            <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
              {localCampaign.title}
            </h3>

            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
              {localCampaign.description}
            </p>
          </div>

          {/* Progress Bar & Financials */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-baseline mb-1.5 text-xs">
              <span className="font-bold text-slate-900 text-sm">
                ₹{raised.toLocaleString()}
                <span className="font-normal text-slate-500 text-xs ml-1">raised</span>
              </span>
              <span className="font-semibold text-emerald-600">{percent}% of ₹{target.toLocaleString()}</span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{localCampaign.donors_count || 0} donors</span>
              </div>
              <span className="capitalize font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                {localCampaign.status || 'active'}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            onClick={() => setDonateModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Heart className="w-4 h-4 fill-current" />
            Donate to this Cause
          </button>
        </div>
      </div>

      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        campaign={localCampaign}
        onDonationSuccess={handleSuccess}
      />
    </>
  );
}
