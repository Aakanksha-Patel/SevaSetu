// =======================================================
// NGO Dashboard Layout Component
// Reusable Dashboard Layout with Sidebar and Navbar for NGOs
// Routes:
// /ngo/dashboard
// /ngo/profile
// /ngo/events
// /ngo/applications
// /ngo/donations
// /ngo/feedback
// /ngo/reports
// =======================================================

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleSwitcherBar from '../components/common/RoleSwitcherBar.jsx';
import { ngosAPI } from '../services/api.js';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  ClipboardList,
  Heart,
  MessageSquareQuote,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function NgoDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [ngoProfile, setNgoProfile] = useState(null);

  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const res = await ngosAPI.getMyProfile();
        if (res.data?.success) {
          setNgoProfile(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load NGO layout profile:', err);
      }
    };
    fetchNgoData();
  }, [user]);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/ngo/dashboard',
      icon: LayoutDashboard,
      id: 'sidebar-nav-ngo-dashboard',
    },
    {
      name: 'NGO Profile',
      path: '/ngo/profile',
      icon: Building2,
      id: 'sidebar-nav-ngo-profile',
    },
    {
      name: 'Events',
      path: '/ngo/events',
      icon: Calendar,
      id: 'sidebar-nav-ngo-events',
    },
    {
      name: 'Volunteer Applications',
      path: '/ngo/applications',
      icon: ClipboardList,
      id: 'sidebar-nav-ngo-applications',
    },
    {
      name: 'Donations',
      path: '/ngo/donations',
      icon: Heart,
      id: 'sidebar-nav-ngo-donations',
    },
    {
      name: 'Feedback',
      path: '/ngo/feedback',
      icon: MessageSquareQuote,
      id: 'sidebar-nav-ngo-feedback',
    },
    {
      name: 'Reports',
      path: '/ngo/reports',
      icon: BarChart3,
      id: 'sidebar-nav-ngo-reports',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const current = navItems.find((item) => location.pathname.startsWith(item.path));
    return current ? current.name : 'NGO Management Portal';
  };

  const isVerified = (ngoProfile?.verification_status || 'verified') === 'verified';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          id="ngo-mobile-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        id="ngo-panel-sidebar"
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 h-screen ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Seva<span className="text-blue-600">Setu</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                NGO Portal
              </span>
            </div>
          </Link>

          <button
            id="close-ngo-sidebar-mobile-btn"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NGO Mini Organization Badge Card */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={
                ngoProfile?.logo ||
                user?.profile_image ||
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200'
              }
              alt={ngoProfile?.name || user?.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/20 bg-white"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {ngoProfile?.name || 'Aarogya Health Foundation'}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {ngoProfile?.category || 'Healthcare'} • {ngoProfile?.registration_number || 'REG-NGO-2026'}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {isVerified ? (
                  <span
                    id="verified-ngo-badge-sidebar"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified NGO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Organization Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                id={item.id}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions / Logout */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <Link
            to="/events"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-dashed border-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              View Public Directory
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            id="ngo-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header
          id="ngo-panel-top-nav"
          className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <button
              id="open-ngo-sidebar-mobile-btn"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="hidden sm:block text-xs text-slate-500">
                Manage organization events, volunteer rosters, incoming donations, and community impact.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isVerified ? (
              <div
                id="verified-ngo-pill-header"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified NGO</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Verification Under Review</span>
              </div>
            )}

            <Link
              to="/ngo/profile"
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <img
                src={
                  ngoProfile?.logo ||
                  user?.profile_image ||
                  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200'
                }
                alt="NGO Logo"
                className="w-7 h-7 rounded-lg object-cover bg-white"
              />
              <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[130px] truncate">
                {ngoProfile?.name || 'NGO Profile'}
              </span>
            </Link>
          </div>
        </header>

        {/* Global Role Switcher Banner */}
        <div className="px-4 sm:px-8 pt-4">
          <RoleSwitcherBar />
        </div>

        {/* Page Content Rendered via Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ ngoProfile, setNgoProfile }} />
        </main>
      </div>
    </div>
  );
}
