// =======================================================
// RegisterPage Component
// Modern, clean, and responsive registration interface
// Supported Roles: User, Volunteer, NGO
// Admin is strictly prohibited and not selectable
// Redirects according to role:
// User → /user/dashboard
// Volunteer → /volunteer/dashboard
// NGO → /ngo/dashboard
// =======================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/common/Alert.jsx';
import {
  Heart,
  User,
  HeartHandshake,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  Clock,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:(?:\+91|91)[ -]?)?[6-9]\d{9}$/;

const AVAILABLE_VOLUNTEER_SKILLS = [
  'Community Outreach',
  'Teaching & Tutoring',
  'Healthcare & First Aid',
  'Disaster Relief',
  'Event Coordination',
  'Food Packing & Logistics',
  'Digital Media & IT',
  'Counseling & Support',
];

export default function RegisterPage() {
  const { register, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user'); // 'user', 'volunteer', 'ngo' (Admin strictly excluded)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: 'Mumbai, Maharashtra',
    // NGO specific
    organization_name: '',
    registration_number: '',
    category: 'Healthcare',
    description: '',
    // Volunteer specific
    skills: ['Community Outreach'],
    interests: 'Social Welfare, Education',
    availability: 'Flexible Weekends',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const newSkills = exists
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const errors = {};

    // 1. Full name
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    // 2. Email
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format (e.g. name@example.com).';
    }

    // Phone number
    const phone = formData.phone.trim();

    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else if (!PHONE_REGEX.test(phone)) {
      errors.phone =
        'Enter a valid Indian mobile number (e.g. 9876543210 or +91 9876543210).';
    }
    // 3. Password
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    // 4. Confirm Password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // 5. NGO specific
    if (role === 'ngo') {
      if (!formData.organization_name.trim()) {
        errors.organization_name = 'Registered NGO organization name is required.';
      }
    }

    if (!formData.location.trim()) {
      errors.location = 'City / State is required.';
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        // NGO payload
        organization_name: formData.organization_name.trim(),
        registration_number: formData.registration_number.trim(),
        category: formData.category,
        description: formData.description.trim(),
        // Volunteer payload
        skills: formData.skills.join(', '),
        interests: formData.interests,
        availability: formData.availability,
      };

      const newUser = await register(payload);

      // Redirect user according to role:
      // User → /user/dashboard
      // Volunteer → /volunteer/dashboard
      // NGO → /ngo/dashboard
      const destination = getRoleDashboardPath(newUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account on SevaSetu
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Choose your account type below to get started. All data is securely stored in our MySQL relational platform.
          </p>
        </div>

        {error && (
          <div id="register-error-banner">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* Role Selector Tabs (Only User, Volunteer, NGO - Admin strictly excluded) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Your Account Role
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                id: 'user',
                label: 'Citizen / User',
                desc: 'Donate, request aid & track events',
                icon: User,
                activeBorder: 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30',
                iconColor: 'text-emerald-600',
              },
              {
                id: 'volunteer',
                label: 'Volunteer',
                desc: 'Apply for events & earn certificates',
                icon: HeartHandshake,
                activeBorder: 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/30',
                iconColor: 'text-amber-600',
              },
              {
                id: 'ngo',
                label: 'NGO Partner',
                desc: 'Host events & manage volunteers',
                icon: Building2,
                activeBorder: 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/30',
                iconColor: 'text-blue-600',
              },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  id={`role-select-${r.id}-btn`}
                  onClick={() => {
                    setRole(r.id);
                    setValidationErrors({});
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? r.activeBorder
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    </div>
                  )}
                  <Icon className={`w-5 h-5 mb-1.5 ${r.iconColor}`} />
                  <div className="text-xs font-bold text-slate-900 mb-0.5">{r.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight hidden sm:block">
                    {r.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs" noValidate>
          {/* Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {role === 'ngo' ? 'Representative Full Name' : 'Full Name'} *
              </label>
              <div className="relative">
                <input
                  id="register-name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleTextChange}
                  placeholder={role === 'ngo' ? 'e.g. Dr. Rajesh Kulkarni' : 'e.g. Priya Sharma'}
                  className={`w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.name
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {validationErrors.name && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  id="register-email-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  placeholder="name@example.com"
                  className={`w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.email
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{validationErrors.email}</p>
              )}
            </div>
          </div>

          {/* Password & Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password * (min 6 chars)
              </label>
              <div className="relative">
                <input
                  id="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleTextChange}
                  placeholder="••••••••"
                  className={`w-full pl-9.5 pr-10 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.password
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
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

              {/* Password strength visual indicator */}
              {formData.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    ></div>
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    ></div>
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleTextChange}
                  placeholder="••••••••"
                  className={`w-full pl-9.5 pr-10 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.confirmPassword
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="register-phone-input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleTextChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {validationErrors.phone && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                City / State
              </label>
              <div className="relative">
                <input
                  id="register-location-input"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleTextChange}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Conditional Role Section: NGO Organization Details */}
          {role === 'ngo' && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 space-y-3 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>NGO Entity Profile & Compliance</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Organization Name *
                </label>
                <input
                  id="register-ngo-org-input"
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleTextChange}
                  placeholder="e.g. Aarogya Health Foundation"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    validationErrors.organization_name
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {validationErrors.organization_name && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {validationErrors.organization_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration / FCRA # (Optional)
                  </label>
                  <input
                    id="register-ngo-regnum-input"
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleTextChange}
                    placeholder="MH/2022/0129"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Sector
                  </label>
                  <select
                    id="register-ngo-category-select"
                    name="category"
                    value={formData.category}
                    onChange={handleTextChange}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Healthcare">Healthcare & Medicine</option>
                    <option value="Education">Education & Literacy</option>
                    <option value="Hunger Relief">Hunger Relief & Food</option>
                    <option value="Environment">Environment & Sanitation</option>
                    <option value="Disaster Relief">Disaster Response</option>
                    <option value="Women Welfare">Women Empowerment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Organization Description
                </label>
                <textarea
                  id="register-ngo-desc-input"
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleTextChange}
                  placeholder="Provide a brief summary of your NGO mission, key beneficiaries, and operations..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          )}

          {/* Conditional Role Section: Volunteer Profile Details */}
          {role === 'volunteer' && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-3 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>Volunteer Skills & Availability</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Your Skills (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VOLUNTEER_SKILLS.map((skill) => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs font-semibold'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Availability
                  </label>
                  <select
                    id="register-volunteer-avail-select"
                    name="availability"
                    value={formData.availability}
                    onChange={handleTextChange}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Flexible Weekends">Flexible Weekends</option>
                    <option value="Weekdays (Morning)">Weekdays (Morning)</option>
                    <option value="Weekdays (Evening)">Weekdays (Evening)</option>
                    <option value="Full-time Available">Full-time Available</option>
                    <option value="Emergency On-Call">Emergency / On-Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Cause Interests
                  </label>
                  <input
                    id="register-volunteer-interests-input"
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleTextChange}
                    placeholder="e.g. Healthcare, Child Welfare"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registering Account in MySQL...</span>
              </>
            ) : (
              <>
                <span>Complete Registration as {role.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-1">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              id="goto-login-link"
              to="/login"
              className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Sign in to your panel
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
