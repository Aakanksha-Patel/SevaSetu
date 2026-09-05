// =======================================================
// Volunteer Opportunities Page (/volunteer/opportunities)
// Displays approved volunteering opportunities from MySQL
// Cards display: Event name, NGO name, Category, Date, Location, Required volunteers, Apply Now
// Prevents duplicate applications
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteersAPI, campaignsAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import Alert from '../../components/common/Alert.jsx';
import {
  Sparkles,
  Search,
  Filter,
  Building2,
  Calendar,
  MapPin,
  Users,
  HeartHandshake,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  RefreshCw,
} from 'lucide-react';

export default function VolunteerOpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Application Modal state
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [applySkills, setApplySkills] = useState('');

  const loadData = async () => {
    try {
      // Fetch approved events from MySQL
      const [oppsRes, appsRes] = await Promise.all([
        campaignsAPI.getAll({ status: 'approved' }).catch(() => ({ data: { data: [] } })),
        volunteersAPI.getMyApplications().catch(() => ({ data: { data: [] } })),
      ]);

      const oppList = oppsRes.data?.data || [];
      const appList = appsRes.data?.data || [];

      setOpportunities(oppList);
      setMyApplications(appList);
    } catch (err) {
      console.error('Error loading opportunities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Build a lookup map of existing applications by event_id
  const appStatusByEventId = {};
  myApplications.forEach((app) => {
    appStatusByEventId[app.event_id] = app.status;
  });

  const categories = [
    'All',
    'Health',
    'Education',
    'Environment',
    'Animal Welfare',
    'Child Welfare',
    'Women Empowerment',
    'Food Distribution',
    'Disaster Relief',
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (opp.category && opp.category.toLowerCase() === selectedCategory.toLowerCase());

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      opp.title?.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query) ||
      opp.ngo_name?.toLowerCase().includes(query) ||
      opp.location?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleOpenApply = (opp) => {
    setSelectedOpp(opp);
    setApplyError('');
    setApplySuccess('');
    setApplyNotes('');
    setApplySkills('');
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;

    // Check frontend duplicate guard
    if (appStatusByEventId[selectedOpp.id]) {
      setApplyError(`You have already applied for this event (Status: ${appStatusByEventId[selectedOpp.id]}).`);
      return;
    }

    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const payload = {
        event_id: selectedOpp.id,
        opportunity_id: selectedOpp.id,
        notes: `${applyNotes} ${applySkills ? `| Skills: ${applySkills}` : ''}`.trim(),
      };

      const res = await volunteersAPI.apply(payload);
      if (res.data?.success) {
        setApplySuccess(
          'Application submitted successfully! It has been recorded in MySQL with status "pending".'
        );
        // Refresh to update my applications
        await loadData();
        setTimeout(() => {
          setApplyModalOpen(false);
          setApplySuccess('');
        }, 1800);
      } else {
        setApplyError(res.data?.message || 'Failed to submit application');
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching approved opportunities from MySQL..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Live Volunteering Drives
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Explore Volunteering Opportunities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Connect with verified grassroots NGOs across India. Select a community drive, apply instantly,
            and log verified service hours towards official certificates.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="opportunity-search-input"
              type="text"
              placeholder="Search by drive title, NGO name, location, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold pr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No opportunities found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or selected category to discover open volunteering initiatives.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const existingStatus = appStatusByEventId[opp.id];
            const isAlreadyApplied = Boolean(existingStatus);

            return (
              <div
                key={opp.id}
                id={`opportunity-card-${opp.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                      {opp.category || 'Community Service'}
                    </span>
                    {isAlreadyApplied ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Applied ({existingStatus})
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Open for Applications
                      </span>
                    )}
                  </div>

                  {/* Event Name */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                      {opp.title}
                    </h3>

                    {/* NGO Name */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {opp.ngo_name || 'Verified NGO Partner'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                {/* Footer Details: Date, Location, Required volunteers & Apply Button */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {opp.date} {opp.time ? `• ${opp.time}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{opp.location || 'Local Community Site'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-500" />
                      <span>
                        Required:{' '}
                        <strong className="text-slate-900">{opp.required_volunteers || 10}</strong>
                      </span>
                    </span>

                    {isAlreadyApplied ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied
                      </button>
                    ) : (
                      <button
                        id={`apply-btn-event-${opp.id}`}
                        onClick={() => handleOpenApply(opp)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Modal */}
      {selectedOpp && (
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title="Apply for Volunteer Drive"
        >
          {applySuccess ? (
            <div className="text-center py-5 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-xs text-slate-600">{applySuccess}</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500">
                You can monitor your application status under{' '}
                <strong className="text-slate-800">My Applications</strong>. Once the NGO accepts
                your application, this event will appear in your{' '}
                <strong className="text-slate-800">My Events</strong> schedule.
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmApply} className="space-y-4">
              {applyError && <Alert type="error" message={applyError} />}

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">{selectedOpp.title}</h4>
                <p className="text-slate-600 font-medium">
                  Organized by:{' '}
                  <strong className="text-slate-800">{selectedOpp.ngo_name}</strong>
                </p>
                <div className="flex flex-wrap gap-3 text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    {selectedOpp.date} {selectedOpp.time ? `(${selectedOpp.time})` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {selectedOpp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-orange-600" />
                    Required: {selectedOpp.required_volunteers || 10} volunteers
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relevant Skills & Experience (Optional)
                </label>
                <input
                  type="text"
                  value={applySkills}
                  onChange={(e) => setApplySkills(e.target.value)}
                  placeholder="e.g., First aid certified, teaching, event coordination, photography"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Why would you like to volunteer for this drive?
                </label>
                <textarea
                  rows={3}
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="Brief note to the NGO team explaining your availability and motivation..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  id="submit-volunteer-application-btn"
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {applying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting to MySQL...
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Confirm & Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
