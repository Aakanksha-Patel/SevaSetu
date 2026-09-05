// =======================================================
// Admin Dashboard Layout Component
// Main Layout for System Administrator
// Routes:
// /admin/dashboard
// /admin/users
// /admin/volunteers
// /admin/ngos
// /admin/events
// /admin/donations
// /admin/feedback
// /admin/reports
// =======================================================

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleSwitcherBar from '../components/common/RoleSwitcherBar.jsx';
import {
  LayoutDashboard,
  Users,
  HandHeart,
  Building2,
  Calendar,
  HeartHandshake,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      id: 'sidebar-nav-admin-dashboard',
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
      id: 'sidebar-nav-admin-users',
    },
    {
      name: 'Volunteers',
      path: '/admin/volunteers',
      icon: HandHeart,
      id: 'sidebar-nav-admin-volunteers',
    },
    {
      name: 'NGOs',
      path: '/admin/ngos',
      icon: Building2,
      id: 'sidebar-nav-admin-ngos',
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: Calendar,
      id: 'sidebar-nav-admin-events',
    },
    {
      name: 'Donations',
      path: '/admin/donations',
      icon: HeartHandshake,
      id: 'sidebar-nav-admin-donations',
    },
    {
      name: 'Feedback',
      path: '/admin/feedback',
      icon: MessageSquare,
      id: 'sidebar-nav-admin-feedback',
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChart3,
      id: 'sidebar-nav-admin-reports',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentPageTitle = () => {
    const item = navItems.find((n) => location.pathname === n.path || location.pathname.startsWith(`${n.path}/`));
    return item ? item.name : 'Admin Control Center';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                SevaSetu
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Master Governance</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Admin Identity Pill */}
        <div className="mx-4 my-3.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={user?.name || 'Admin'}
                className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'System Admin'}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Governance & Operations
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <NavLink
                key={item.path}
                id={item.id}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-950/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>View Public Portal</span>
            </div>
          </Link>
          <button
            id="admin-sidebar-logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {getCurrentPageTitle()}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                MySQL Database Governance & Real-Time Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>MySQL 8.0 Live</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs font-medium text-slate-600 hidden sm:block">
              {user?.email || 'admin@sevasetu.org'}
            </span>
          </div>
        </header>

        {/* Global Role Switcher for Seamless Testing & Simulation */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <RoleSwitcherBar />
        </div>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
