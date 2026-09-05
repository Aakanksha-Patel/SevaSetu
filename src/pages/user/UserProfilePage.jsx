// =======================================================
// User Profile Page (/user/profile)
// Update name, phone, location, profile avatar
// View volunteer credentials / quick upgrade button
// Connected to MySQL /api/auth/profile and /api/auth/become-volunteer
// =======================================================

import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  Save,
  Loader2,
  Camera,
  ExternalLink,
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
];

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const outletContext = useOutletContext();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profile_image: user?.profile_image || AVATAR_OPTIONS[0],
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      setSuccessMsg('Your profile was successfully updated in the database!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isVolunteer = user?.role === 'volunteer';

  return (
    <div id="user-profile-page" className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Account Profile</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details, contact information, and volunteer credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Role Card */}
        <div className="md:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img
                src={formData.profile_image}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-600/20 mx-auto"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold capitalize border border-slate-200">
                  Role: {user?.role}
                </span>
                {isVolunteer && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Volunteer Verified
                  </span>
                )}
              </div>
            </div>

            {/* Quick avatar selection */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block mb-2">Choose Avatar</span>
              <div className="flex justify-center gap-2">
                {AVATAR_OPTIONS.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, profile_image: imgUrl })}
                    className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                      formData.profile_image === imgUrl
                        ? 'border-emerald-600 scale-110 shadow-xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Volunteer Status Callout */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Volunteer Status
            </h4>

            {isVolunteer ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  You are registered as a SevaSetu Community Volunteer. You can apply directly for field drives and log hours.
                </p>
                <Link
                  to="/volunteer/dashboard"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  Go to Volunteer Panel
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Want to participate in ground events and mentor youth? Upgrade your account instantly.
                </p>
                <button
                  id="profile-become-volunteer-btn"
                  onClick={() => outletContext?.openVolunteerModal?.()}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Become a Volunteer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-8">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5"
          >
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Personal Information
            </h3>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address (Account Identifier)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Email is linked to your registered login account and cannot be modified.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-phone-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Location (City / State)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-location-input"
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Custom Avatar URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Custom Profile Picture URL
              </label>
              <input
                id="profile-image-url-input"
                type="url"
                placeholder="https://..."
                value={formData.profile_image}
                onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                id="save-profile-btn"
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
