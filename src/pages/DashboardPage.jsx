// =======================================================
// DashboardPage Component
// Routes authenticated users directly to their designated role dashboard:
// User → /user/dashboard
// Volunteer → /volunteer/dashboard
// NGO → /ngo/dashboard
// Admin → /admin/dashboard
// =======================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user, isAuthenticated, loading, getRoleDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Routing to role dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const destination = getRoleDashboardPath(user.role);
  return <Navigate to={destination} replace />;
}
