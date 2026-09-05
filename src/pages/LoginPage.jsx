// =======================================================
// LoginPage Component
// Modern, clean, and responsive login interface
// Redirects according to role:
// User → /user/dashboard
// Volunteer → /volunteer/dashboard
// NGO → /ngo/dashboard
// Admin → /admin/dashboard
// =======================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/common/Alert.jsx';
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  HeartHandshake,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, demoLogin, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Route redirection after login based on role
  const handleRedirectByRole = (role) => {
    // If a specific protected redirect was passed in location.state, we can check if it matches the role
    const defaultRolePath = getRoleDashboardPath(role);
    navigate(defaultRolePath, { replace: true });
  };

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email format (e.g. name@example.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email.trim(), password);
      handleRedirectByRole(userData.role);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    setError('');
    setValidationErrors({});
    try {
      const demoUser = await demoLogin(role);
      handleRedirectByRole(demoUser.role);
    } catch (err) {
      setError(err.message || `Demo login for ${role} failed.`);
    } finally {
      setLoading(false);
    }
  };

  // Demo account profiles
  const demoAccounts = [
    {
      role: 'user',
      title: 'Citizen / User',
      email: 'rahul.user@gmail.com',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hoverBorder: 'hover:border-emerald-400 hover:bg-emerald-50/40',
      icon: User,
      iconColor: 'text-emerald-600',
    },
    {
      role: 'volunteer',
      title: 'Volunteer',
      email: 'priya.volunteer@gmail.com',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      hoverBorder: 'hover:border-amber-400 hover:bg-amber-50/40',
      icon: HeartHandshake,
      iconColor: 'text-amber-600',
    },
    {
      role: 'ngo',
      title: 'NGO Partner',
      email: 'contact@aarogya.org',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverBorder: 'hover:border-blue-400 hover:bg-blue-50/40',
      icon: Building2,
      iconColor: 'text-blue-600',
    },
    {
      role: 'admin',
      title: 'Administrator',
      email: 'admin@sevasetu.org',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverBorder: 'hover:border-purple-400 hover:bg-purple-50/40',
      icon: ShieldCheck,
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-7">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to SevaSetu
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Social-impact network connecting Citizens, Volunteers, NGOs, and Administrators
          </p>
        </div>

        {error && (
          <div id="login-error-banner">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* 1-Click Role Login Cards */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Login (By Role)
            </p>
            <span className="text-[10px] text-slate-400">Instant Redirect</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {demoAccounts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  id={`demo-login-${item.role}-btn`}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoClick(item.role)}
                  className={`p-3 rounded-xl bg-white border border-slate-200 ${item.hoverBorder} text-left transition-all group disabled:opacity-60 shadow-xs`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                      {item.title}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{item.email}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Or sign in with credentials
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' });
                }}
                placeholder="you@example.com"
                className={`w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.email
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {validationErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({ ...validationErrors, password: '' });
                }}
                placeholder="••••••••"
                className={`w-full pl-9.5 pr-10 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.password
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                tabIndex="-1"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{validationErrors.password}</p>
            )}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              id="goto-register-link"
              to="/register"
              className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
