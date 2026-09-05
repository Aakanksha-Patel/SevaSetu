// =======================================================
// HelpPage Component (Community Help Board)
// =======================================================

import React, { useState, useEffect } from 'react';
import { helpRequestsAPI } from '../services/api.js';
import HelpRequestModal from '../components/help/HelpRequestModal.jsx';
import Badge from '../components/common/Badge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, PlusCircle, MapPin, Phone, Clock, CheckCircle2, HeartHandshake } from 'lucide-react';

export default function HelpPage() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await helpRequestsAPI.getAll({
        urgency: selectedUrgency !== 'All' ? selectedUrgency : undefined,
      });
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedUrgency]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await helpRequestsAPI.updateStatus(id, {
        status,
        assigned_to: user?.name || 'Local Volunteer Partner',
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const getUrgencyBadge = (u) => {
    switch (u) {
      case 'critical':
        return { variant: 'red', label: 'CRITICAL NEED' };
      case 'high':
        return { variant: 'orange', label: 'HIGH URGENCY' };
      case 'medium':
        return { variant: 'blue', label: 'MEDIUM' };
      default:
        return { variant: 'green', label: 'NORMAL' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Rapid Community Response
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Emergency Help Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Urgent requests submitted by citizens and local social workers for medical supplies, food kits, and emergency support.
          </p>
        </div>

        <button
          onClick={() => setHelpModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Help Request
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'critical', 'high', 'medium', 'low'].map((urg) => (
          <button
            key={urg}
            onClick={() => setSelectedUrgency(urg)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              selectedUrgency === urg
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {urg === 'All' ? 'All Urgencies' : `${urg} Priority`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching help requests from MySQL database..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <p className="text-base font-bold text-slate-800">No active help requests in this category</p>
          <p className="text-xs text-slate-500">
            All requests in this priority level have been addressed by volunteer teams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => {
            const urg = getUrgencyBadge(req.urgency);
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={urg.variant} size="sm">
                      {urg.label}
                    </Badge>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        req.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{req.category}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Beneficiary: <strong className="text-slate-700">{req.requester_name}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{req.description}"
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{req.location}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-600 truncate">
                      <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{req.contact_number}</span>
                    </span>
                  </div>

                  {req.assigned_to && (
                    <p className="text-[11px] text-slate-500 bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg">
                      Assigned to: <span className="font-semibold">{req.assigned_to}</span>
                    </p>
                  )}

                  {/* Actions for Volunteers & NGOs */}
                  {req.status !== 'resolved' && (
                    <div className="flex items-center gap-2 pt-1">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          Accept Mission
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'resolved')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HelpRequestModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onRequestSubmitted={fetchRequests}
      />
    </div>
  );
}
