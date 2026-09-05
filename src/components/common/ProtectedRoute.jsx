import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

/**
 * ProtectedRoute:
 * - Checks authentication status; redirects unauthenticated visitors to /login
 * - Enforces role-based access control (RBAC); displays clean authorization screen if user lacks required role
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated, logout, getRoleDashboardPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div id="auth-loading-screen" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Verifying credentials & session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login with redirect back path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role authorization check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleColors = {
      admin: 'bg-rose-50 text-rose-700 border-rose-200',
      ngo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      volunteer: 'bg-blue-50 text-blue-700 border-blue-200',
      user: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    return (
      <div id="unauthorized-role-screen" className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            This module is reserved exclusively for{' '}
            <span className="font-semibold text-slate-900">
              {allowedRoles.map((r) => r.toUpperCase()).join(' or ')}
            </span>{' '}
            accounts.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Signed-in Identity
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-full border ${
                  roleColors[user.role] || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="redirect-to-my-dashboard-btn"
              onClick={() => navigate(getRoleDashboardPath(user.role))}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <span>Go to My {user.role.toUpperCase()} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="unauthorized-logout-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
