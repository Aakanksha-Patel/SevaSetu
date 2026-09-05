// =======================================================
// Community Help Request Modal
// =======================================================

import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Alert from '../common/Alert.jsx';
import { helpRequestsAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { AlertCircle, CheckCircle2, Phone, MapPin, Send } from 'lucide-react';

export default function HelpRequestModal({ isOpen, onClose, onRequestSubmitted }) {
  const { user } = useAuth();
  const [requesterName, setRequesterName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.city || '');
  const [category, setCategory] = useState('Medical Support');
  const [urgency, setUrgency] = useState('high');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Medical Support',
    'Food & Nutrition',
    'Shelter & Clothing',
    'Education Support',
    'Elderly Assistance',
    'Disaster Relief',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requesterName || !contactNumber || !location || !description) {
      setError('Please fill in all mandatory contact and assistance details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await helpRequestsAPI.create({
        requester_name: requesterName,
        contact_number: contactNumber,
        location,
        category,
        urgency,
        description,
        user_id: user?.id || null,
      });

      if (res.data?.success) {
        setSubmitted(true);
        if (onRequestSubmitted) onRequestSubmitted();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit help request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit Community Help Request">
      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Help Request Registered</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your urgent request is logged in the SevaSetu MySQL network.
            </p>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            Local NGO partners and active volunteers near <strong className="text-slate-900">{location}</strong> have been notified on the community board.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} />}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Use this form if you or someone you know requires urgent grassroots assistance (medical supplies, ration, shelter, or education assistance).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requester / Beneficiary Name</label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Name of contact person"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp Number</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Area</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune Rural, Sector 12"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Urgency selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Urgency Level</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'border-slate-300 text-slate-700' },
                { id: 'medium', label: 'Medium', color: 'border-blue-300 text-blue-700' },
                { id: 'high', label: 'High', color: 'border-orange-300 text-orange-700' },
                { id: 'critical', label: 'Critical', color: 'border-rose-400 text-rose-700 font-bold' },
              ].map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => setUrgency(u.id)}
                  className={`py-2 px-2 rounded-xl text-xs border capitalize transition-all ${
                    urgency === u.id
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                      : `bg-white hover:bg-slate-50 ${u.color}`
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description of Need
            </label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what help is urgently needed (e.g., medical prescription, oxygen concentrator, food kit, textbook support)..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting to MySQL...' : 'Submit Help Request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
