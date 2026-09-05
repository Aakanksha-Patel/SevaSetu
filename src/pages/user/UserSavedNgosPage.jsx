// =======================================================
// User Saved NGOs Page (/user/saved-ngos)
// Displays bookmarked NGOs with category filtering, donation, and removal
// Connected to MySQL /api/saved-ngos
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedNgosAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DonationModal from '../../components/donations/DonationModal.jsx';
import {
  Bookmark,
  BookmarkX,
  Heart,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';

export default function UserSavedNgosPage() {
  const [savedNgos, setSavedNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Donation modal
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedNgoForDonation, setSelectedNgoForDonation] = useState(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await savedNgosAPI.getAll();
      setSavedNgos(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load saved NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (ngoId) => {
    try {
      await savedNgosAPI.remove(ngoId);
      setSavedNgos((prev) => prev.filter((item) => item.id !== ngoId));
    } catch (err) {
      console.error('Failed to remove saved NGO:', err);
    }
  };

  const handleOpenDonate = (ngo) => {
    setSelectedNgoForDonation(ngo);
    setDonationModalOpen(true);
  };

  const categories = ['All', ...new Set(savedNgos.map((n) => n.category).filter(Boolean))];

  const filtered = savedNgos.filter(
    (n) => selectedCategory === 'All' || n.category === selectedCategory
  );

  return (
    <div id="user-saved-ngos-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Saved NGOs</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Quickly access your bookmarked organizations, support their initiatives, or donate.
          </p>
        </div>

        <Link
          to="/user/ngos"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Building2 className="w-3.5 h-3.5" />
          Explore More NGOs
        </Link>
      </div>

      {/* Category filter pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving saved organizations..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No saved NGOs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You can bookmark any verified NGO from the directory to keep track of their progress and upcoming drives.
            </p>
          </div>
          <Link
            to="/user/ngos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors"
          >
            Browse NGOs Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
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
                      <h3 className="text-sm font-bold text-slate-900 truncate">{ngo.name}</h3>
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
                    onClick={() => handleRemove(ngo.id)}
                    title="Remove from saved"
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    <BookmarkX className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {ngo.description}
                </p>

                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ngo.address}</span>
                  </div>
                  {ngo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ngo.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <Link
                  to={`/ngos/${ngo.id}`}
                  className="py-2.5 px-3 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                >
                  Full Profile
                </Link>
                <button
                  onClick={() => handleOpenDonate(ngo)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Donate
                </button>
              </div>
            </div>
          ))}
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
