// =======================================================
// Become a Volunteer Modal Component
// Simple Form: Skills, Interests, Availability, Location
// Seamlessly promotes user to volunteer without re-registering
// =======================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  HeartHandshake,
  X,
  Sparkles,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'Teaching & Mentorship',
  'First Aid & Triage',
  'Event Logistics',
  'Content & Media',
  'Community Outreach',
  'Food Rescue',
];

const SUGGESTED_INTERESTS = [
  'Education',
  'Healthcare',
  'Environment',
  'Child Welfare',
  'Animal Welfare',
  'Disaster Relief',
];

export default function BecomeVolunteerModal({ isOpen, onClose, onSuccess }) {
  const { user, becomeVolunteer } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    skills: '',
    interests: '',
    availability: 'Weekends (Saturday & Sunday)',
    location: user?.location || 'Mumbai, Maharashtra',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleAddSkill = (skill) => {
    const current = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!current.includes(skill)) {
      setFormData({
        ...formData,
        skills: current.length > 0 ? `${formData.skills}, ${skill}` : skill,
      });
    }
  };

  const handleAddInterest = (interest) => {
    const current = formData.interests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);
    if (!current.includes(interest)) {
      setFormData({
        ...formData,
        interests: current.length > 0 ? `${formData.interests}, ${interest}` : interest,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.skills.trim()) {
      setError('Please list at least one skill or contribution area.');
      return;
    }
    if (!formData.interests.trim()) {
      setError('Please specify your cause interests.');
      return;
    }

    setLoading(true);
    try {
      const result = await becomeVolunteer(formData);
      setSuccessData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || 'Failed to submit volunteer application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="become-volunteer-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          id="close-volunteer-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors flex items-center justify-center z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {successData ? (
          // Success State
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Volunteer Status Activated
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                Welcome to the SevaSetu Volunteer Corps!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your volunteer profile has been created and linked to your account. You can now participate in verified grassroots drives, log impact hours, and access the Volunteer Panel without creating another account.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Skills Registered:</span>
                <span className="font-medium text-slate-900">{formData.skills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Causes:</span>
                <span className="font-medium text-slate-900">{formData.interests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Availability:</span>
                <span className="font-medium text-slate-900">{formData.availability}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="modal-goto-volunteer-panel-btn"
                onClick={() => {
                  onClose();
                  navigate('/volunteer/dashboard');
                }}
                className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                Go to Volunteer Panel
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="modal-stay-user-panel-btn"
                onClick={onClose}
                className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                Stay in User Panel
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-7 text-white">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-amber-300" />
                Community Impact Network
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Become a Volunteer</h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                Help verified NGOs across education, healthcare, and relief drives. Upgrade your account instantly.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Skills & Expertise <span className="text-rose-500">*</span>
                </label>
                <input
                  id="volunteer-skills-input"
                  type="text"
                  required
                  placeholder="e.g. Teaching, First Aid, Photography, Social Media"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                />
                {/* Tag suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 self-center mr-1">Quick add:</span>
                  {SUGGESTED_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Causes & Interests <span className="text-rose-500">*</span>
                </label>
                <input
                  id="volunteer-interests-input"
                  type="text"
                  required
                  placeholder="e.g. Education, Child Welfare, Environment"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 self-center mr-1">Popular:</span>
                  {SUGGESTED_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleAddInterest(interest)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors"
                    >
                      + {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Availability & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Availability <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="volunteer-availability-select"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all"
                  >
                    <option value="Weekends (Saturday & Sunday)">Weekends (Sat & Sun)</option>
                    <option value="Weekday Evenings (After 6 PM)">Weekday Evenings</option>
                    <option value="Flexible / On-Call for Drives">Flexible / On-Call</option>
                    <option value="Full-Time Volunteering">Full-Time Volunteering</option>
                    <option value="Virtual / Remote Support">Virtual / Remote Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="volunteer-location-input"
                      type="text"
                      required
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="pt-3">
                <button
                  id="submit-become-volunteer-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering Volunteer Profile...
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4" />
                      Submit & Unlock Volunteer Panel
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  No additional password or separate registration needed. Your account gets instant volunteer access.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
