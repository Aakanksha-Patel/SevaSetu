// =======================================================
// NgosPage Component (Explore NGOs Directory)
// Browse, filter and search verified grassroots non-profits
// =======================================================

import React, { useState, useEffect } from 'react';
/*import { useSearchParams } from 'react-router-dom';*/
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ngosAPI } from '../services/api.js';
import NgoCard from '../components/cards/NgoCard.jsx';
import DonationModal from '../components/campaigns/DonationModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Search,
  Filter,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All Causes',
  'Education',
  'Healthcare',
  'Environment',
  'Animal Welfare',
  'Child Welfare',
  'Women Empowerment',
  'Food Distribution',
  'Disaster Relief',
];

export default function NgosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All Causes';
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [donateModalNgo, setDonateModalNgo] = useState(null);

  useEffect(() => {
    async function loadNgos() {
      try {
        setLoading(true);
        const res = await ngosAPI.getAll();
        setNgos(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching NGOs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNgos();
  }, []);

  // Update URL param when category changes
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All Causes') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Filter logic
  const filteredNgos = ngos.filter((ngo) => {
    const nameMatch =
      (ngo.name || ngo.organization_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ngo.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ngo.address || ngo.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch =
      selectedCategory === 'All Causes' ||
      (ngo.category || '').toLowerCase() === selectedCategory.toLowerCase();

    const verifiedMatch = !verifiedOnly || ngo.verification_status === 'verified';

    return nameMatch && categoryMatch && verifiedMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

    {/* Top Navigation + Header Badge */}
    <div className="relative flex items-center justify-center">

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute left-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
      >
        ← Back to Home
      </button>

      {/* Header Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        Transparent & Government-Registered NGO Network
      </div>

    </div>

    {/* Header Title */}
    <div className="text-center max-w-3xl mx-auto space-y-3">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Explore Grassroots NGOs
      </h1>

      <p className="text-sm text-slate-500 leading-relaxed">
        Discover verified non-profit organizations creating tangible change across
        education, healthcare, environment, animal care, and disaster relief.
      </p>
    </div>
    
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by NGO name, city, cause or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Verified Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all shrink-0 ${
                verifiedOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Verified Only</span>
            </button>

            {(searchQuery || selectedCategory !== 'All Causes' || verifiedOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Causes');
                  setVerifiedOnly(false);
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                title="Reset all filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* NGO Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Loading verified NGO directory..." />
      ) : filteredNgos.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{filteredNgos.length}</strong> non-profits</span>
            {selectedCategory !== 'All Causes' && (
              <span>Filtered by: <strong>{selectedCategory}</strong></span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNgos.map((ngo) => (
              <NgoCard
                key={ngo.id}
                ngo={ngo}
                onQuickDonate={(item) => setDonateModalNgo(item)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No NGOs matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, choosing a different cause category, or clearing the verified filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Causes');
              setVerifiedOnly(false);
              searchParams.delete('category');
              setSearchParams(searchParams);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Donation Modal */}
      {donateModalNgo && (
        <DonationModal
          isOpen={Boolean(donateModalNgo)}
          onClose={() => setDonateModalNgo(null)}
          campaign={{
            id: donateModalNgo.id,
            title: `Support ${donateModalNgo.name || donateModalNgo.organization_name}`,
            ngo_name: donateModalNgo.name || donateModalNgo.organization_name,
            target_amount: 500000,
            raised_amount: donateModalNgo.total_donations_received || 35000,
          }}
          onDonationSuccess={() => setDonateModalNgo(null)}
        />
      )}
    </div>
  );
}
