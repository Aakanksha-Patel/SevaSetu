// =======================================================
// User Dashboard Layout Component
// Reusable Dashboard Layout with Sidebar and Navbar
// Routes: /user/dashboard, /user/ngos, /user/events,
// /user/donations, /user/my-events, /user/saved-ngos,
// /user/feedback, /user/profile
// =======================================================

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BecomeVolunteerModal from '../components/modals/BecomeVolunteerModal.jsx';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CheckCircle2,
  Heart,
  Bookmark,
  MessageSquareQuote,
  User,
  LogOut,
  Menu,
  X,
  HeartHandshake,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function UserDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);

  const isVolunteer = user?.role === 'volunteer';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/user/dashboard',
      icon: LayoutDashboard,
      id: 'sidebar-nav-dashboard',
    },
    {
      name: 'Explore NGOs',
      path: '/user/ngos',
      icon: Building2,
      id: 'sidebar-nav-ngos',
    },
    {
      name: 'Volunteer Opportunities',
      path: '/user/events',
      icon: Calendar,
      id: 'sidebar-nav-events',
    },
    {
      name: 'My Events',
      path: '/user/my-events',
      icon: CheckCircle2,
      id: 'sidebar-nav-my-events',
    },
    {
      name: 'My Donations',
      path: '/user/donations',
      icon: Heart,
      id: 'sidebar-nav-donations',
    },
    {
      name: 'Saved NGOs',
      path: '/user/saved-ngos',
      icon: Bookmark,
      id: 'sidebar-nav-saved-ngos',
    },
    {
      name: 'Feedback',
      path: '/user/feedback',
      icon: MessageSquareQuote,
      id: 'sidebar-nav-feedback',
    },
    {
      name: 'Profile',
      path: '/user/profile',
      icon: User,
      id: 'sidebar-nav-profile',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const current = navItems.find((item) => location.pathname.startsWith(item.path));
    return current ? current.name : 'User Panel';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          id="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        id="user-panel-sidebar"
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 h-screen ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Seva<span className="text-emerald-600">Setu</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                User Panel
              </span>
            </div>
          </Link>

          <button
            id="close-sidebar-mobile-btn"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.profile_image ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
              }
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-600/20"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Volunteer Status Badge */}
          {isVolunteer ? (
            <div className="mt-3 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Volunteer
              </span>
              <Link
                to="/volunteer/dashboard"
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center"
              >
                Panel <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <button
                id="sidebar-become-volunteer-cta"
                onClick={() => setVolunteerModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Become a Volunteer
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                id={item.id}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer: Public site & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Visit Public Website</span>
          </Link>

          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT & NAVBAR ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header
          id="user-panel-navbar"
          className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="open-sidebar-mobile-btn"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                SevaSetu Citizen Impact Portal
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isVolunteer && (
              <button
                id="navbar-become-volunteer-btn"
                onClick={() => setVolunteerModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Become a Volunteer
              </button>
            )}

            {isVolunteer && (
              <Link
                to="/volunteer/dashboard"
                id="navbar-volunteer-panel-link"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Volunteer Panel
              </Link>
            )}

            <Link
              to="/user/profile"
              id="navbar-user-avatar-btn"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={
                  user?.profile_image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                }
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <span className="text-xs font-bold text-slate-700 hidden lg:inline-block">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openVolunteerModal: () => setVolunteerModalOpen(true) }} />
        </main>
      </div>

      {/* Global Volunteer Registration Modal */}
      <BecomeVolunteerModal
        isOpen={volunteerModalOpen}
        onClose={() => setVolunteerModalOpen(false)}
        onSuccess={() => {
          // Keep open or trigger any parent updates
        }}
      />
    </div>
  );
}
