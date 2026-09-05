// =======================================================
// User NGOs Directory Page (/user/ngos)
// Search, Category Filter, Location Filter, Save NGO, Donate, Details
// Connected to MySQL /api/ngos and /api/saved-ngos
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ngosAPI, savedNgosAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DonationModal from '../../components/donations/DonationModal.jsx';
import {
  Search,
  Filter,
  MapPin,
  Heart,
  Bookmark,
  ShieldCheck,
  Building2,
  ExternalLink,
  Phone,
  Mail,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Healthcare',
  'Education',
  'Environment',
  'Animal Welfare',
  'Child Welfare',
  'Women Empowerment',
  'Food Distribution',
  'Disaster Relief',
];

const LOCATIONS = ['All', 'Mumbai', 'New Delhi', 'Bengaluru', 'Pune', 'Kolkata', 'Chennai', 'Lucknow'];

export default function UserNgosPage() {
  const [ngos, setNgos] = useState([]);
  const [savedNgoIds, setSavedNgoIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // NGO Details Quick Modal
  const [activeNgoDetails, setActiveNgoDetails] = useState(null);

  // Donation Modal
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedNgoForDonation, setSelectedNgoForDonation] = useState(null);

  const fetchNgosAndSaved = async () => {
    setLoading(true);
    try {
      const [ngosRes, savedRes] = await Promise.all([
        ngosAPI.getAll(),
        savedNgosAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      setNgos(ngosRes.data?.data || []);
      const savedList = savedRes.data?.data || [];
      setSavedNgoIds(new Set(savedList.map((s) => s.id)));
    } catch (err) {
      console.error('Failed to load NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgosAndSaved();
  }, []);

  const handleToggleSave = async (ngoId) => {
    try {
      if (savedNgoIds.has(ngoId)) {
        await savedNgosAPI.remove(ngoId);
        setSavedNgoIds((prev) => {
          const next = new Set(prev);
          next.delete(ngoId);
          return next;
        });
      } else {
        await savedNgosAPI.save(ngoId);
        setSavedNgoIds((prev) => new Set(prev).add(ngoId));
      }
    } catch (err) {
      console.error('Error saving NGO:', err);
    }
  };

  const handleOpenDonate = (ngo) => {
    setSelectedNgoForDonation(ngo);
    setDonationModalOpen(true);
  };

  // Filter logic
  const filteredNgos = ngos.filter((ngo) => {
    const matchesSearch =
      !searchQuery ||
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ngo.address && ngo.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      ngo.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLocation =
      selectedLocation === 'All' ||
      (ngo.address && ngo.address.toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div id="user-ngos-page" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Explore NGOs</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse verified social impact foundations, save favorites, and contribute.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs font-semibold self-start sm:self-auto">
          Showing <span className="text-emerald-700 font-bold">{filteredNgos.length}</span> verified NGOs
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="search-ngos-input"
              type="text"
              placeholder="Search by NGO name, mission, or cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all font-medium text-slate-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Cause: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="sm:col-span-3">
            <select
              id="filter-location-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all font-medium text-slate-700"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  Location: {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0 mr-1">Popular:</span>
          {CATEGORIES.slice(1, 7).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
          {(selectedCategory !== 'All' || selectedLocation !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocation('All');
                setSearchQuery('');
              }}
              className="px-2.5 py-1 text-xs text-rose-600 hover:underline font-semibold shrink-0"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* NGOs Grid */}
      {loading ? (
        <LoadingSpinner text="Loading NGO directory..." />
      ) : filteredNgos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No NGOs match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, cause filter, or location filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLocation('All');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNgos.map((ngo) => {
            const isSaved = savedNgoIds.has(ngo.id);
            return (
              <div
                key={ngo.id}
                id={`ngo-card-${ngo.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Row: Logo, Name, Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          ngo.logo ||
                          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=150'
                        }
                        alt={ngo.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                          {ngo.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {ngo.category}
                          </span>
                          {ngo.verification_status === 'verified' && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(ngo.id)}
                      title={isSaved ? 'Remove from saved' : 'Save NGO'}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {ngo.description}
                  </p>

                  {/* Details info */}
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ngo.address}</span>
                    </div>
                    {ngo.registration_number && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Reg: {ngo.registration_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveNgoDetails(ngo)}
                    className="py-2.5 px-3 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenDonate(ngo)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Donate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick NGO Details Modal */}
      {activeNgoDetails && (
        <div
          id="ngo-details-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            <button
              onClick={() => setActiveNgoDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={
                    activeNgoDetails.logo ||
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={activeNgoDetails.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-600/20"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeNgoDetails.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {activeNgoDetails.category}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">About Mission</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {activeNgoDetails.description}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{activeNgoDetails.address}</span>
                </div>
                {activeNgoDetails.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{activeNgoDetails.email}</span>
                  </div>
                )}
                {activeNgoDetails.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{activeNgoDetails.phone}</span>
                  </div>
                )}
                {activeNgoDetails.registration_number && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Govt. Registration: <span className="font-mono font-semibold text-slate-800">{activeNgoDetails.registration_number}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  to={`/ngos/${activeNgoDetails.id}`}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Full Public Profile
                </Link>
                <button
                  onClick={() => {
                    const target = activeNgoDetails;
                    setActiveNgoDetails(null);
                    handleOpenDonate(target);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {selectedNgoForDonation && (
        <DonationModal
          isOpen={donationModalOpen}
          onClose={() => setDonationModalOpen(false)}
          ngo={selectedNgoForDonation}
        />
      )}
    </div>
  );
}
