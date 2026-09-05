// =======================================================
// User Dashboard Home Page (/user/dashboard)
// Cards: Events Joined, NGOs Saved, Volunteer Hours, Total Donations
// Sections: Upcoming Events, Featured NGOs, Quick Actions
// Connected to MySQL backend APIs
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  eventsAPI,
  ngosAPI,
  donationsAPI,
  savedNgosAPI,
  volunteerApplicationsAPI,
} from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DonationModal from '../../components/donations/DonationModal.jsx';
import {
  Calendar,
  Bookmark,
  Clock,
  Heart,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Building2,
  Compass,
  MessageSquareQuote,
  User,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function UserDashboardHome() {
  const { user } = useAuth();
  const outletContext = useOutletContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    eventsJoined: 0,
    ngosSaved: 0,
    volunteerHours: 0,
    totalDonations: 0,
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredNgos, setFeaturedNgos] = useState([]);
  const [savedNgoIds, setSavedNgoIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Donation Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedNgoForDonation, setSelectedNgoForDonation] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        eventsRes,
        myAppsRes,
        donationsRes,
        savedRes,
        ngosRes,
      ] = await Promise.all([
        eventsAPI.getAll({ status: 'approved' }).catch(() => ({ data: { data: [] } })),
        volunteerApplicationsAPI.getMyApplications().catch(() => ({ data: { data: [] } })),
        donationsAPI.getMyDonations().catch(() => ({ data: { data: [] } })),
        savedNgosAPI.getAll().catch(() => ({ data: { data: [] } })),
        ngosAPI.getAll({ status: 'verified' }).catch(() => ({ data: { data: [] } })),
      ]);

      const myApps = myAppsRes.data?.data || [];
      const myDonations = donationsRes.data?.data || [];
      const mySaved = savedRes.data?.data || [];
      const allEvents = eventsRes.data?.data || [];
      const allNgos = ngosRes.data?.data || [];

      // Calculate total donations
      const totalAmount = myDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

      // Calculate volunteer hours: each completed application = 4 hours, each accepted = 2 hours
      const hours = myApps.reduce((sum, app) => {
        if (app.status === 'completed') return sum + 4;
        if (app.status === 'accepted') return sum + 2;
        return sum;
      }, 0);

      setStats({
        eventsJoined: myApps.length,
        ngosSaved: mySaved.length,
        volunteerHours: hours,
        totalDonations: totalAmount,
      });

      setSavedNgoIds(new Set(mySaved.map((s) => s.id)));
      setUpcomingEvents(allEvents.slice(0, 3));
      setFeaturedNgos(allNgos.slice(0, 3));
    } catch (err) {
      console.error('User dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleToggleSaveNgo = async (ngoId) => {
    try {
      if (savedNgoIds.has(ngoId)) {
        await savedNgosAPI.remove(ngoId);
        setSavedNgoIds((prev) => {
          const next = new Set(prev);
          next.delete(ngoId);
          return next;
        });
        setStats((prev) => ({ ...prev, ngosSaved: Math.max(0, prev.ngosSaved - 1) }));
      } else {
        await savedNgosAPI.save(ngoId);
        setSavedNgoIds((prev) => new Set(prev).add(ngoId));
        setStats((prev) => ({ ...prev, ngosSaved: prev.ngosSaved + 1 }));
      }
    } catch (err) {
      console.error('Failed to toggle save NGO:', err);
    }
  };

  const handleOpenDonate = (ngo) => {
    setSelectedNgoForDonation(ngo);
    setDonationModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your citizen dashboard..." />;
  }

  const isVolunteer = user?.role === 'volunteer';

  return (
    <div id="user-dashboard-home" className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Citizen Impact Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {user?.name}!
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Explore verified grassroots NGOs, join inspiring community drives, contribute tax-exempt donations, and build collective social impact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isVolunteer && (
              <button
                id="banner-become-volunteer-btn"
                onClick={() => outletContext?.openVolunteerModal?.()}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-900" />
                Become a Volunteer
              </button>
            )}
            <Link
              to="/user/ngos"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              Explore NGOs
            </Link>
          </div>
        </div>

        {/* Decorative ambient shape */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Events Joined */}
        <div
          id="stat-card-events-joined"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-emerald-200 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Events Joined</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.eventsJoined}</h3>
            <Link to="/user/my-events" className="text-[11px] font-semibold text-emerald-600 hover:underline">
              View registrations →
            </Link>
          </div>
        </div>

        {/* 2. NGOs Saved */}
        <div
          id="stat-card-ngos-saved"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-blue-200 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">NGOs Saved</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.ngosSaved}</h3>
            <Link to="/user/saved-ngos" className="text-[11px] font-semibold text-blue-600 hover:underline">
              View bookmarked →
            </Link>
          </div>
        </div>

        {/* 3. Volunteer Hours */}
        <div
          id="stat-card-volunteer-hours"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-amber-200 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Volunteer Hours</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.volunteerHours} hrs</h3>
            <span className="text-[11px] font-medium text-slate-400">
              {isVolunteer ? 'Active Volunteer' : 'Upgrade to track more'}
            </span>
          </div>
        </div>

        {/* 4. Total Donations */}
        <div
          id="stat-card-total-donations"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-rose-200 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Donations</p>
            <h3 className="text-2xl font-black text-slate-900">₹{stats.totalDonations.toLocaleString()}</h3>
            <Link to="/user/donations" className="text-[11px] font-semibold text-rose-600 hover:underline">
              View receipts →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            id="quick-action-explore-ngos"
            to="/user/ngos"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">Explore NGOs</span>
            <span className="text-[10px] text-slate-400">Browse directory</span>
          </Link>

          <Link
            id="quick-action-find-events"
            to="/user/events"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">Volunteer Drives</span>
            <span className="text-[10px] text-slate-400">Join opportunities</span>
          </Link>

          <Link
            id="quick-action-donations"
            to="/user/donations"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">My Donations</span>
            <span className="text-[10px] text-slate-400">80G Tax Receipts</span>
          </Link>

          <Link
            id="quick-action-saved-ngos"
            to="/user/saved-ngos"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">Saved NGOs</span>
            <span className="text-[10px] text-slate-400">Bookmarked list</span>
          </Link>

          <Link
            id="quick-action-feedback"
            to="/user/feedback"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">Give Feedback</span>
            <span className="text-[10px] text-slate-400">Rate NGOs & Events</span>
          </Link>

          <Link
            id="quick-action-profile"
            to="/user/profile"
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">My Profile</span>
            <span className="text-[10px] text-slate-400">Account settings</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming Events & Drives</h2>
            <p className="text-xs text-slate-500">Grassroots initiatives looking for participation</p>
          </div>
          <Link
            to="/user/events"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View all ({upcomingEvents.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <img
                  src={
                    event.image ||
                    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-semibold">
                  {event.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    {event.ngo_name || 'Verified NGO Partner'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <Link
                    to="/user/events"
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 font-semibold text-xs border border-slate-200 hover:border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Details & Join
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured NGOs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured NGOs</h2>
            <p className="text-xs text-slate-500">Verified organizations making measurable social impact</p>
          </div>
          <Link
            to="/user/ngos"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Explore all NGOs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredNgos.map((ngo) => {
            const isSaved = savedNgoIds.has(ngo.id);
            return (
              <div
                key={ngo.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={ngo.logo || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=150'}
                        alt={ngo.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{ngo.name}</h3>
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 mt-0.5">
                          {ngo.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSaveNgo(ngo.id)}
                      title={isSaved ? 'Remove from saved' : 'Save NGO'}
                      className={`p-2 rounded-xl border transition-colors ${
                        isSaved
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ngo.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ngo.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/ngos/${ngo.id}`}
                    className="py-2 px-3 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleOpenDonate(ngo)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Donate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donation Modal */}
      {selectedNgoForDonation && (
        <DonationModal
          isOpen={donationModalOpen}
          onClose={() => setDonationModalOpen(false)}
          ngo={selectedNgoForDonation}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
