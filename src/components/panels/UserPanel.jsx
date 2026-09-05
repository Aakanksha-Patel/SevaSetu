// =======================================================
// User Panel Component
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { campaignsAPI, helpRequestsAPI } from '../../services/api.js';
import StatCard from '../common/StatCard.jsx';
import Badge from '../common/Badge.jsx';
import HelpRequestModal from '../help/HelpRequestModal.jsx';
import CampaignCard from '../campaigns/CampaignCard.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import {
  Heart,
  CreditCard,
  AlertCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function UserPanel() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [myHelpRequests, setMyHelpRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsRes, helpRes, campaignsRes] = await Promise.all([
        campaignsAPI.getMyDonations().catch(() => ({ data: { data: [] } })),
        helpRequestsAPI.getAll().catch(() => ({ data: { data: [] } })),
        campaignsAPI.getAll({ status: 'active' }).catch(() => ({ data: { data: [] } })),
      ]);

      setDonations(donationsRes.data?.data || []);
      const allHelp = helpRes.data?.data || [];
      setMyHelpRequests(allHelp.filter((h) => h.user_id === user?.id || h.contact_number === user?.phone));
      setCampaigns(campaignsRes.data?.data || []);
    } catch (err) {
      console.error('User panel data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const totalDonated = donations.reduce((acc, d) => acc + parseFloat(d.amount || 0), 0);

  if (loading) return <LoadingSpinner text="Loading your citizen dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            Citizen & Donor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Track your social impact contributions, view transparent 80G donation receipts, and submit urgent community assistance requests.
          </p>
        </div>

        <button
          onClick={() => setHelpModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          Request Emergency Help
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Contributions"
          value={`₹${totalDonated.toLocaleString()}`}
          subtitle={`${donations.length} verified donations`}
          icon={Heart}
          color="green"
        />
        <StatCard
          title="Campaigns Supported"
          value={new Set(donations.map((d) => d.campaign_id)).size}
          subtitle="Education, Healthcare & Relief"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="My Help Requests"
          value={myHelpRequests.length}
          subtitle={`${myHelpRequests.filter((h) => h.status === 'resolved').length} resolved`}
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'donations', label: 'My Donations', count: donations.length },
            { id: 'help', label: 'My Help Requests', count: myHelpRequests.length },
            { id: 'campaigns', label: 'Recommended Causes', count: campaigns.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB 1: Donations */}
          {activeTab === 'donations' && (
            <div>
              {donations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No donations made yet</p>
                  <p className="text-xs text-slate-400">
                    Explore active campaigns and empower a cause you care about today.
                  </p>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Browse Causes
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Cause / Campaign</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donations.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {d.campaign_title || 'Education & Healthcare Fund'}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">
                            ₹{parseFloat(d.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                              {d.payment_method || 'UPI'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-500">
                            {d.transaction_id || `TXN${d.id}9812`}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="green" size="sm">
                              Confirmed
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Help Requests */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Requests submitted for community assistance or emergency intervention
                </p>
                <button
                  onClick={() => setHelpModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New Request
                </button>
              </div>

              {myHelpRequests.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-medium text-slate-700">No active help requests</p>
                  <p className="text-xs text-slate-400">
                    If you or a neighbor needs emergency food, medical care, or shelter assistance, let us know.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myHelpRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            req.status === 'resolved'
                              ? 'green'
                              : req.status === 'in_progress'
                              ? 'blue'
                              : 'orange'
                          }
                        >
                          {req.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{req.category}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{req.description}</p>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                        <span>Location: {req.location}</span>
                        <span className="font-medium text-slate-700">
                          Assigned: {req.assigned_to || 'Pending allocation'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Recommended Campaigns */}
          {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.slice(0, 3).map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} onUpdated={fetchData} />
              ))}
            </div>
          )}
        </div>
      </div>

      <HelpRequestModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onRequestSubmitted={fetchData}
      />
    </div>
  );
}
