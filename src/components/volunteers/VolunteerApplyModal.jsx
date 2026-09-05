// =======================================================
// Volunteer Application Modal
// =======================================================

import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Alert from '../common/Alert.jsx';
import { volunteersAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { HeartHandshake, CheckCircle2, MapPin, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VolunteerApplyModal({ isOpen, onClose, opportunity, onApplicationSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await volunteersAPI.apply({
        opportunity_id: opportunity.id,
        notes: `${notes} ${skills ? `| Key Skills: ${skills}` : ''}`.trim(),
      });

      if (res.data?.success) {
        setSubmitted(true);
        if (onApplicationSuccess) onApplicationSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit volunteer application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    setNotes('');
    onClose();
  };

  if (!opportunity) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Apply as Volunteer">
      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your application has been registered in the MySQL database under <span className="font-semibold">{opportunity.ngo_name}</span>.
            </p>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            You can track this task, your approved hours, and completion certificate in your Volunteer Panel.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} />}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">{opportunity.title}</h4>
            <p className="text-slate-600 font-medium">By {opportunity.ngo_name}</p>
            <div className="flex flex-wrap gap-3 text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {opportunity.location} ({opportunity.mode})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {opportunity.date_schedule || 'Flexible'}
              </span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
              <p className="font-semibold">Sign in required to record your volunteer hours</p>
              <p>Please log in as Volunteer (or use 1-click test role) to submit your application.</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 bg-amber-600 text-white font-medium rounded-lg"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why would you like to volunteer for this drive?
                </label>
                <textarea
                  rows="3"
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share a short note about your motivation or past community service..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relevant Skills / Background (Optional)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Teaching, First Aid, Photography, Spoken Languages"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <HeartHandshake className="w-4 h-4" />
                  {loading ? 'Submitting Application...' : 'Confirm Volunteer Application'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </Modal>
  );
}
