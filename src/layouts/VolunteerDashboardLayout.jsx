// =======================================================
// Volunteer Dashboard Layout Component
// Reusable Dashboard Layout with Sidebar and Navbar for Volunteers
// Routes:
// /volunteer/dashboard
// /volunteer/opportunities
// /volunteer/applications
// /volunteer/events
// /volunteer/certificates
// /volunteer/feedback
// /volunteer/profile
// =======================================================

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleSwitcherBar from '../components/common/RoleSwitcherBar.jsx';
import {
  LayoutDashboard,
  Sparkles,
  ClipboardList,
  CalendarCheck,
  Award,
  MessageSquareQuote,
  User,
  LogOut,
  Menu,
  X,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function VolunteerDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/volunteer/dashboard',
      icon: LayoutDashboard,
      id: 'sidebar-nav-dashboard',
    },
    {
      name: 'Opportunities',
      path: '/volunteer/opportunities',
      icon: Sparkles,
      id: 'sidebar-nav-opportunities',
    },
    {
      name: 'My Applications',
      path: '/volunteer/applications',
      icon: ClipboardList,
      id: 'sidebar-nav-applications',
    },
    {
      name: 'My Events',
      path: '/volunteer/events',
      icon: CalendarCheck,
      id: 'sidebar-nav-events',
    },
    {
      name: 'Certificates',
      path: '/volunteer/certificates',
      icon: Award,
      id: 'sidebar-nav-certificates',
    },
    {
      name: 'Feedback',
      path: '/volunteer/feedback',
      icon: MessageSquareQuote,
      id: 'sidebar-nav-feedback',
    },
    {
      name: 'Profile',
      path: '/volunteer/profile',
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
    return current ? current.name : 'Volunteer Portal';
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
        id="volunteer-panel-sidebar"
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 h-screen ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Seva<span className="text-orange-600">Setu</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Volunteer Portal
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

        {/* Volunteer Mini Profile Card */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.profile_image ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
              }
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-500/20"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-orange-600" />
                  Active Volunteer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Menu
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
                    ? 'bg-orange-50 text-orange-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'
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
            to="/user/dashboard"
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-dashed border-slate-200"
          >
            <span>Switch to Citizen View</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            id="volunteer-logout-btn"
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
          id="volunteer-panel-topbar"
          className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              id="open-sidebar-mobile-btn"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Dedicated Grassroots Volunteer Workbench
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              Verified Volunteer
            </span>

            <Link
              to="/volunteer/profile"
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
            >
              <img
                src={
                  user?.profile_image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                }
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-orange-500/30"
              />
              <span className="text-xs font-semibold text-slate-700 hidden md:block">
                {user?.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Global Role Switcher in Dashboard for testing */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <RoleSwitcherBar />
        </div>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
