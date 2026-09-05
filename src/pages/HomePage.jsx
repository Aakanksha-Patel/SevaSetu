// =======================================================
// HomePage Component (SevaSetu Public Home)
// Matches exact user specifications with all 8 requested sections
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ngosAPI, eventsAPI, adminAPI } from '../services/api.js';
import NgoCard from '../components/cards/NgoCard.jsx';
import EventCard from '../components/cards/EventCard.jsx';
import DonationModal from '../components/campaigns/DonationModal.jsx';
import {
  Heart,
  HeartHandshake,
  Users,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  Activity,
  Trees,
  Dog,
  Baby,
  Smile,
  Utensils,
  LifeBuoy,
  CheckCircle2,
  Star,
  Quote,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

const POPULAR_CAUSES = [
  {
    name: 'Education',
    slug: 'Education',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    desc: 'Digital classrooms, STEM workshops & literacy for rural children.',
  },
  {
    name: 'Healthcare',
    slug: 'Healthcare',
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    desc: 'Mobile clinics, pediatric screening & vital medicines outreach.',
  },
  {
    name: 'Environment',
    slug: 'Environment',
    icon: Trees,
    color: 'from-green-600 to-emerald-700',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    desc: 'Afforestation, Miyawaki forests & wetland conservation drives.',
  },
  {
    name: 'Animal Welfare',
    slug: 'Animal Welfare',
    icon: Dog,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    desc: 'Stray rescue ambulances, free rabies clinics & loving adoptions.',
  },
  {
    name: 'Child Welfare',
    slug: 'Child Welfare',
    icon: Baby,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    desc: 'Malnutrition rescue, foster counseling & safe shelter homes.',
  },
  {
    name: 'Women Empowerment',
    slug: 'Women Empowerment',
    icon: Smile,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    desc: 'Handloom artisan collectives, digital banking & legal rights.',
  },
  {
    name: 'Food Distribution',
    slug: 'Food Distribution',
    icon: Utensils,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    desc: 'Surplus food rescue & community kitchens for night shelters.',
  },
  {
    name: 'Disaster Relief',
    slug: 'Disaster Relief',
    icon: LifeBuoy,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    desc: 'Flood rescue taskforces, water purification & emergency rations.',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'SevaSetu connected our tribal health foundation with 80+ licensed medical volunteers in two weeks. The transparency and verification made coordination seamless.',
    author: 'Dr. Anand Deshmukh',
    role: 'Founder, Aarogya Health Foundation',
    location: 'Mumbai, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'As a university student wanting to give back on weekends, finding authentic on-ground events used to be tough. With SevaSetu, I have logged 45 hours teaching coding to young girls.',
    author: 'Priya Sharma',
    role: 'Active Volunteer',
    location: 'Bengaluru, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'The ability to directly support verified causes with 100% trace of where donations go gave our family immense confidence. A truly transformative civic platform.',
    author: 'Rahul Verma',
    role: 'Donor & Civic Citizen',
    location: 'Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalNgos: 8,
    totalEvents: 10,
    totalVolunteers: 450,
    livesImpacted: '25,000+',
  });
  const [loading, setLoading] = useState(true);
  const [donateModalNgo, setDonateModalNgo] = useState(null);
  const [activeStepTab, setActiveStepTab] = useState('volunteers');

  useEffect(() => {
    async function loadData() {
      try {
        const [ngosRes, eventsRes, statsRes] = await Promise.all([
          ngosAPI.getAll().catch(() => ({ data: { data: [] } })),
          eventsAPI.getAll({ status: 'approved' }).catch(() => ({ data: { data: [] } })),
          adminAPI.getSystemStats().catch(() => ({ data: { data: null } })),
        ]);

        const ngosList = ngosRes.data?.data || [];
        const eventsList = eventsRes.data?.data || [];
        setNgos(ngosList.slice(0, 3));
        setEvents(eventsList.slice(0, 3));

        const s = statsRes.data?.data || statsRes.data?.stats || null;
        if (s) {
          setStats({
            totalNgos: s.total_ngos || s.totalNgos || ngosList.length || 8,
            totalEvents: s.total_events || s.totalEvents || eventsList.length || 10,
            totalVolunteers: s.total_volunteers || s.totalVolunteers || 450,
            livesImpacted: (s.total_donations || s.totalDonationAmount || s.totalDonations)
              ? `₹${Number(s.total_donations || s.totalDonationAmount || s.totalDonations).toLocaleString('en-IN')}`
              : '25,000+',
          });
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* =================================================== */}
      {/* 1. HERO SECTION */}
      {/* =================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Empowering India's Social Welfare Ecosystem
          </div>

          {/* Exact user requested hero heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Find an NGO. Volunteer. Make an Impact.
          </h1>

          {/* Exact user requested subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            SevaSetu connects people with NGOs and meaningful opportunities to create positive change.
          </p>

          {/* Exact user requested buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/ngos"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              Explore NGOs
            </Link>

            <Link
              to="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================== */}
      {/* 2. IMPACT STATISTICS SECTION */}
      {/* =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 p-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalNgos}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified NGOs
            </p>
          </div>

          <div className="space-y-1 p-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalEvents}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Community Drives
            </p>
          </div>

          <div className="space-y-1 p-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalVolunteers}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Volunteers
            </p>
          </div>

          <div className="space-y-1 p-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {stats.livesImpacted}
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lives Touched
            </p>
          </div>
        </div>
      </section>

      {/* =================================================== */}
      {/* 3. POPULAR CAUSES SECTION */}
      {/* =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Dedicated Sectors
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Causes You Can Support
          </h2>
          <p className="text-sm text-slate-500">
            Choose a sector close to your heart to discover grassroots organizations and events.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {POPULAR_CAUSES.map((cause) => {
            const Icon = cause.icon;
            return (
              <Link
                key={cause.name}
                to={`/ngos?category=${encodeURIComponent(cause.slug)}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center text-center space-y-3"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${cause.bgColor} ${cause.textColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cause.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cause.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =================================================== */}
      {/* 4. FEATURED NGOS SECTION (Connected to backend API) */}
      {/* =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Vetted Organizations
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured NGOs
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Legally compliant non-profits leading verified social impact drives across India.
            </p>
          </div>

          <Link
            to="/ngos"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Explore all NGOs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {ngos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ngos.map((ngo) => (
              <NgoCard
                key={ngo.id}
                ngo={ngo}
                onQuickDonate={(item) => setDonateModalNgo(item)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">Loading registered NGOs...</p>
          </div>
        )}
      </section>

      {/* =================================================== */}
      {/* 5. UPCOMING EVENTS SECTION (Connected to backend API) */}
      {/* =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
              Make a Tangible Difference
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Upcoming Volunteer Events
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign up for active on-ground and virtual campaigns organized by verified NGOs.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Browse all events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onApplied={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">Loading upcoming volunteer opportunities...</p>
          </div>
        )}
      </section>

      {/* =================================================== */}
      {/* 6. HOW SEVASETU WORKS SECTION */}
      {/* =================================================== */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 rounded-3xl border border-slate-200/80 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Transparent Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How SevaSetu Works
          </h2>
          <p className="text-sm text-slate-500">
            A secure ecosystem connecting every stakeholder through clear, streamlined steps.
          </p>

          {/* Stakeholder Switcher */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl mt-4">
            <button
              onClick={() => setActiveStepTab('volunteers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStepTab === 'volunteers'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Volunteers
            </button>
            <button
              onClick={() => setActiveStepTab('citizens')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStepTab === 'citizens'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Citizens / Donors
            </button>
            <button
              onClick={() => setActiveStepTab('ngos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStepTab === 'ngos'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For NGOs
            </button>
          </div>
        </div>

        {/* Steps Content based on active tab */}
        {activeStepTab === 'volunteers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-emerald-600/30">01</span>
              <h3 className="text-base font-bold text-slate-900">Explore & Filter Drives</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter through active health camps, afforestation drives, or digital education sessions tailored to your schedule and location.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-emerald-600/30">02</span>
              <h3 className="text-base font-bold text-slate-900">One-Click Application</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply instantly with your verified volunteer profile. NGOs review and accept applications with real-time status updates.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-emerald-600/30">03</span>
              <h3 className="text-base font-bold text-slate-900">Log Hours & Certificates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Participate on-ground, gain hands-on experience, and receive verifiable certificates and hours tracked automatically in your dashboard.
              </p>
            </div>
          </div>
        )}

        {activeStepTab === 'citizens' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-blue-600/30">01</span>
              <h3 className="text-base font-bold text-slate-900">Discover Vetted NGOs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse non-profits vetted with genuine registration credentials, audits, and real photos of field operations.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-blue-600/30">02</span>
              <h3 className="text-base font-bold text-slate-900">Direct Transparent Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support campaigns or sponsor rations directly with instant receipt generation, tracking every rupee down to community outcome.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-blue-600/30">03</span>
              <h3 className="text-base font-bold text-slate-900">Emergency Help Requests</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Need urgent community aid for vulnerable families? Submit assistance tickets directly to local volunteer networks.
              </p>
            </div>
          </div>
        )}

        {activeStepTab === 'ngos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-purple-600/30">01</span>
              <h3 className="text-base font-bold text-slate-900">Register & Verify Credentials</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit organization registration documents for swift administrator review to gain the trusted verified badge.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-purple-600/30">02</span>
              <h3 className="text-base font-bold text-slate-900">Publish Events & Drives</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post detailed event listings specify skills, time slots, and required volunteer counts with zero hosting overhead.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <span className="text-3xl font-black text-purple-600/30">03</span>
              <h3 className="text-base font-bold text-slate-900">Manage Roster & Impact</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Approve applicants, coordinate attendance, collect reviews, and publish verified impact reports to prospective donors.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* =================================================== */}
      {/* 7. TESTIMONIALS SECTION */}
      {/* =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Voices of Change
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Stories from Our Community
          </h2>
          <p className="text-sm text-slate-500">
            Real feedback from NGO directors, volunteers, and citizen donors on the ground.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4 relative hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-emerald-600/30" />
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.author}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                  <p className="text-[10px] text-slate-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================== */}
      {/* 8. CALL TO ACTION SECTION */}
      {/* =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Join 5,000+ Changemakers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Make a Lasting Community Impact?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Whether you are an individual wanting to volunteer your skills, an NGO seeking support, or a citizen wanting to donate, SevaSetu makes it transparent and rewarding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              to="/register?role=volunteer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-emerald-50 font-bold text-xs text-center shadow-md transition-all"
            >
              Sign Up as Volunteer
            </Link>
            <Link
              to="/register?role=ngo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center border border-emerald-400/30 shadow-md transition-all"
            >
              Register Your NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Donation Modal */}
      {donateModalNgo && (
        <DonationModal
          isOpen={Boolean(donateModalNgo)}
          onClose={() => setDonateModalNgo(null)}
          campaign={{
            id: donateModalNgo.id,
            title: `Support ${donateModalNgo.name || donateModalNgo.organization_name}`,
            ngo_name: donateModalNgo.name || donateModalNgo.organization_name,
            target_amount: 500000,
            raised_amount: donateModalNgo.total_donations_received || 45000,
          }}
          onDonationSuccess={() => setDonateModalNgo(null)}
        />
      )}
    </div>
  );
}
