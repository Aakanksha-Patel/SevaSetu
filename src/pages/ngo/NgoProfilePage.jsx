// =======================================================
// NGO Profile Page Component
// NGO Profile should show:
// Logo, NGO Name, About, Mission, Category, Location,
// Phone, Email, Registration Number, Verification Status
// Show a "Verified NGO" badge when Admin approves the NGO.
// =======================================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ngosAPI } from '../../services/api.js';
import {
  Building2,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Target,
  Tag,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Sparkles,
} from 'lucide-react';

export default function NgoProfilePage() {
  const { ngoProfile, setNgoProfile } = useOutletContext() || {};
  const [profile, setProfile] = useState(ngoProfile || null);
  const [loading, setLoading] = useState(!ngoProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mission: '',
    category: 'Healthcare',
    address: '',
    phone: '',
    email: '',
    registration_number: '',
    logo: '',
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await ngosAPI.getMyProfile();
      if (res.data?.success) {
        setProfile(res.data.data);
        if (setNgoProfile) setNgoProfile(res.data.data);
        populateForm(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setAlert({ type: 'error', message: 'Could not load NGO profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setFormData({
      name: data.name || '',
      description: data.description || '',
      mission: data.mission || '',
      category: data.category || 'Healthcare',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      registration_number: data.registration_number || '',
      logo: data.logo || '',
    });
  };

  useEffect(() => {
    if (ngoProfile) {
      setProfile(ngoProfile);
      populateForm(ngoProfile);
      setLoading(false);
    } else {
      loadProfile();
    }
  }, [ngoProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const res = await ngosAPI.updateMyProfile(formData);
      if (res.data?.success) {
        setProfile(res.data.data);
        if (setNgoProfile) setNgoProfile(res.data.data);
        setEditing(false);
        setAlert({
          type: 'success',
          message: 'NGO profile details updated successfully in the MySQL database!',
        });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setAlert({ type: 'error', message: 'Failed to update NGO profile. Please verify all fields.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading NGO organization profile...</p>
      </div>
    );
  }

  const isVerified = (profile?.verification_status || 'verified') === 'verified';

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Profile</h2>
          <p className="text-sm text-slate-500">
            Public identity, legal registration, mission, and accreditation credentials
          </p>
        </div>

        {!editing ? (
          <button
            id="edit-ngo-profile-btn"
            onClick={() => {
              populateForm(profile);
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            id="cancel-edit-profile-btn"
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel Editing</span>
          </button>
        )}
      </div>

      {/* Notification Alert */}
      {alert && (
        <div
          id="ngo-profile-alert"
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Cover Header Banner */}
        <div className="h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-700 relative">
          <div className="absolute top-4 right-4">
            {/* 
                Requirement:
                Show a "Verified NGO" badge when Admin approves the NGO.
            */}
            {isVerified ? (
              <div
                id="verified-ngo-badge-card"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-emerald-400"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verified NGO</span>
              </div>
            ) : (
              <div
                id="unverified-ngo-badge-card"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-amber-400"
              >
                <Clock className="w-4 h-4" />
                <span>Verification Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Logo positioning */}
          <div className="-mt-16 flex flex-col sm:flex-row sm:items-end gap-5">
            <img
              src={
                profile?.logo ||
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300'
              }
              alt={profile?.name}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {profile?.name}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Government Approved
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {profile?.category} NGO • Registered under Section 8 / Trust Act • Reg No:{' '}
                <span className="font-bold text-slate-700">{profile?.registration_number}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editing Form OR Detail View */}
      {editing ? (
        <form
          id="ngo-profile-edit-form"
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Edit Organization Information</h3>
            <p className="text-xs text-slate-500">
              Update your public facing NGO details stored in the MySQL database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NGO Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                NGO Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. Aarogya Health Foundation"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Environment">Environment</option>
                <option value="Animal Welfare">Animal Welfare</option>
                <option value="Child Welfare">Child Welfare</option>
                <option value="Women Empowerment">Women Empowerment</option>
                <option value="Food Distribution">Food Distribution</option>
                <option value="Disaster Relief">Disaster Relief</option>
              </select>
            </div>

            {/* Registration Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Registration Number *
              </label>
              <input
                type="text"
                name="registration_number"
                required
                value={formData.registration_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. MH/2018/009182"
              />
            </div>

            {/* Logo Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Logo Image URL
              </label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="https://..."
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="+91 98220 11112"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="contact@aarogya.org"
              />
            </div>

            {/* Location / Address */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Registered Location & Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="Street address, City, State, PIN"
              />
            </div>

            {/* About / Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                About the NGO *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="Describe your organization history, areas of service, and impact..."
              />
            </div>

            {/* Mission */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mission Statement *
              </label>
              <textarea
                name="mission"
                rows={2}
                required
                value={formData.mission}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="State your clear organizational mission and core purpose..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================= READ-ONLY PROFILE SPECIFICATION VIEW ================= */
        /*
            Requirements:
            NGO Profile should show:
            - Logo
            - NGO Name
            - About
            - Mission
            - Category
            - Location
            - Phone
            - Email
            - Registration Number
            - Verification Status
            Show a "Verified NGO" badge when Admin approves the NGO.
        */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left 2 Columns: Mission & About */}
          <div className="md:col-span-2 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>About Our Organization</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Empowering Grassroots Communities
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {profile?.description || 'No about description provided.'}
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Mission Statement</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Our Purpose & Vision
              </h3>
              <blockquote className="text-base text-slate-700 italic border-l-4 border-indigo-500 pl-4 py-1 leading-relaxed bg-indigo-50/40 rounded-r-xl">
                "{profile?.mission || 'To foster inclusive, equitable community development and deliver essential social assistance directly to those in greatest need.'}"
              </blockquote>
            </div>
          </div>

          {/* Right Column: Key Details & Accreditation */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
                Organization Details
              </h3>

              <div className="space-y-4">
                {/* Category */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Category
                    </span>
                    <span className="text-sm font-bold text-slate-800">{profile?.category}</span>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Verification Status
                    </span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified NGO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Registration Number */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Registration Number
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {profile?.registration_number}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Location / Headquarters
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{profile?.address}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Phone
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{profile?.phone}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Official Email
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{profile?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
