// =======================================================
// Main App Component with React Router & Auth Context
// Configured with Role-Based Protected Routes:
// User → /user/dashboard
// Volunteer → /volunteer/dashboard
// NGO → /ngo/dashboard
// Admin → /admin/dashboard
// =======================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import CampaignsPage from './pages/CampaignsPage.jsx';
import VolunteersPage from './pages/VolunteersPage.jsx';
import NgosPage from './pages/NgosPage.jsx';
import NgoDetailsPage from './pages/NgoDetailsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// User Panel Sub-pages & Layout
import UserDashboardLayout from './layouts/UserDashboardLayout.jsx';
import UserDashboardHome from './pages/user/UserDashboardHome.jsx';
import UserNgosPage from './pages/user/UserNgosPage.jsx';
import UserEventsPage from './pages/user/UserEventsPage.jsx';
import UserDonationsPage from './pages/user/UserDonationsPage.jsx';
import UserMyEventsPage from './pages/user/UserMyEventsPage.jsx';
import UserSavedNgosPage from './pages/user/UserSavedNgosPage.jsx';
import UserFeedbackPage from './pages/user/UserFeedbackPage.jsx';
import UserProfilePage from './pages/user/UserProfilePage.jsx';

// Volunteer Panel Sub-pages & Layout
import VolunteerDashboardLayout from './layouts/VolunteerDashboardLayout.jsx';
import VolunteerDashboardHome from './pages/volunteer/VolunteerDashboardHome.jsx';
import VolunteerOpportunitiesPage from './pages/volunteer/VolunteerOpportunitiesPage.jsx';
import VolunteerApplicationsPage from './pages/volunteer/VolunteerApplicationsPage.jsx';
import VolunteerEventsPage from './pages/volunteer/VolunteerEventsPage.jsx';
import VolunteerCertificatesPage from './pages/volunteer/VolunteerCertificatesPage.jsx';
import VolunteerFeedbackPage from './pages/volunteer/VolunteerFeedbackPage.jsx';
import VolunteerProfilePage from './pages/volunteer/VolunteerProfilePage.jsx';

// NGO Panel Sub-pages & Layout
import NgoDashboardLayout from './layouts/NgoDashboardLayout.jsx';
import NgoDashboardHome from './pages/ngo/NgoDashboardHome.jsx';
import NgoProfilePage from './pages/ngo/NgoProfilePage.jsx';
import NgoEventsPage from './pages/ngo/NgoEventsPage.jsx';
import NgoApplicationsPage from './pages/ngo/NgoApplicationsPage.jsx';
import NgoDonationsPage from './pages/ngo/NgoDonationsPage.jsx';
import NgoFeedbackPage from './pages/ngo/NgoFeedbackPage.jsx';
import NgoReportsPage from './pages/ngo/NgoReportsPage.jsx';

// Admin Panel Sub-pages & Layout
import AdminDashboardLayout from './layouts/AdminDashboardLayout.jsx';
import AdminDashboardHome from './pages/admin/AdminDashboardHome.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminVolunteersPage from './pages/admin/AdminVolunteersPage.jsx';
import AdminNgosPage from './pages/admin/AdminNgosPage.jsx';
import AdminEventsPage from './pages/admin/AdminEventsPage.jsx';
import AdminDonationsPage from './pages/admin/AdminDonationsPage.jsx';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage.jsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.jsx';

// Role-based Router Dashboard
import DashboardPage from './pages/DashboardPage.jsx';

function AppContent() {
  const location = useLocation();
  const isDashboardPanel =
    location.pathname.startsWith('/user') ||
    location.pathname.startsWith('/volunteer') ||
    location.pathname.startsWith('/ngo') ||
    location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {!isDashboardPanel && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/campaigns" element={<EventsPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/ngos" element={<NgosPage />} />
          <Route path="/ngos/:id" element={<NgoDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Complete User Panel Routes */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['user', 'volunteer', 'admin']}>
                <UserDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboardHome />} />
            <Route path="ngos" element={<UserNgosPage />} />
            <Route path="events" element={<UserEventsPage />} />
            <Route path="donations" element={<UserDonationsPage />} />
            <Route path="my-events" element={<UserMyEventsPage />} />
            <Route path="saved-ngos" element={<UserSavedNgosPage />} />
            <Route path="feedback" element={<UserFeedbackPage />} />
            <Route path="profile" element={<UserProfilePage />} />
          </Route>

          {/* Complete Volunteer Panel Routes */}
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                <VolunteerDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
            <Route path="dashboard" element={<VolunteerDashboardHome />} />
            <Route path="opportunities" element={<VolunteerOpportunitiesPage />} />
            <Route path="applications" element={<VolunteerApplicationsPage />} />
            <Route path="events" element={<VolunteerEventsPage />} />
            <Route path="certificates" element={<VolunteerCertificatesPage />} />
            <Route path="feedback" element={<VolunteerFeedbackPage />} />
            <Route path="profile" element={<VolunteerProfilePage />} />
          </Route>

          {/* Complete NGO Panel Routes */}
          <Route
            path="/ngo"
            element={
              <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                <NgoDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/ngo/dashboard" replace />} />
            <Route path="dashboard" element={<NgoDashboardHome />} />
            <Route path="profile" element={<NgoProfilePage />} />
            <Route path="events" element={<NgoEventsPage />} />
            <Route path="applications" element={<NgoApplicationsPage />} />
            <Route path="donations" element={<NgoDonationsPage />} />
            <Route path="feedback" element={<NgoFeedbackPage />} />
            <Route path="reports" element={<NgoReportsPage />} />
          </Route>

          {/* Complete Admin Panel Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardHome />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="volunteers" element={<AdminVolunteersPage />} />
            <Route path="ngos" element={<AdminNgosPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="donations" element={<AdminDonationsPage />} />
            <Route path="feedback" element={<AdminFeedbackPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>

          {/* Universal dashboard router */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isDashboardPanel && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
