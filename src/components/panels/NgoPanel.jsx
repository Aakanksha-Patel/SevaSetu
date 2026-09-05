// =======================================================
// NGO Panel Component
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { campaignsAPI, volunteersAPI } from '../../services/api.js';
import StatCard from '../common/StatCard.jsx';
import Badge from '../common/Badge.jsx';
import Modal from '../common/Modal.jsx';
import Alert from '../common/Alert.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import {
  Building2,
  Heart,
  Calendar,
  Users,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';

export default function NgoPanel() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Modals
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [createDriveOpen, setCreateDriveOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    category: 'Healthcare',
    description: '',
    target_amount: '',
    image_url: '',
    location: user?.city || 'Mumbai, Maharashtra',
    end_date: '2026-12-31',
  });

  // New Opportunity Form State
  const [newDrive, setNewDrive] = useState({
    title: '',
    category: 'Education',
    description: '',
    location: user?.city || 'Mumbai, Maharashtra',
    mode: 'on-site',
    skills_required: '',
    spots_needed: 10,
    date_schedule: 'Weekend Mornings',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, appRes, oppRes] = await Promise.all([
        campaignsAPI.getAll().catch(() => ({ data: { data: [] } })),
        volunteersAPI.getNgoApplications().catch(() => ({ data: { data: [] } })),
        volunteersAPI.getOpportunities().catch(() => ({ data: { data: [] } })),
      ]);

      const allCamps = campRes.data?.data || [];
      setCampaigns(allCamps);
      setApplications(appRes.data?.data || []);
      setOpportunities(oppRes.data?.data || []);
    } catch (err) {
      console.error('NGO panel load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const totalFundsRaised = campaigns.reduce((acc, c) => acc + parseFloat(c.raised_amount || 0), 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + parseInt(c.donors_count || 0, 10), 0);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlertInfo({ type: '', message: '' });

    try {
      const res = await campaignsAPI.create(newCampaign);
      if (res.data?.success) {
        setAlertInfo({ type: 'success', message: 'Campaign published successfully to MySQL database!' });
        setCreateCampaignOpen(false);
        setNewCampaign({
          title: '',
          category: 'Healthcare',
          description: '',
          target_amount: '',
          image_url: '',
          location: user?.city || 'Mumbai, Maharashtra',
          end_date: '2026-12-31',
        });
        fetchData();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlertInfo({ type: '', message: '' });

    try {
      const res = await volunteersAPI.createOpportunity(newDrive);
      if (res.data?.success) {
        setAlertInfo({ type: 'success', message: 'Volunteer drive posted successfully!' });
        setCreateDriveOpen(false);
        setNewDrive({
          title: '',
          category: 'Education',
          description: '',
          location: user?.city || 'Mumbai, Maharashtra',
          mode: 'on-site',
          skills_required: '',
          spots_needed: 10,
          date_schedule: 'Weekend Mornings',
        });
        fetchData();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId, status, hours = 4) => {
    try {
      await volunteersAPI.updateApplicationStatus(appId, { status, hours_logged: hours });
      setAlertInfo({ type: 'success', message: `Application status updated to ${status}.` });
      fetchData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.message });
    }
  };

  if (loading) return <LoadingSpinner text="Loading NGO administration dashboard..." />;

  return (
    <div className="space-y-6">
      {alertInfo.message && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          className="animate-in fade-in duration-200"
        />
      )}

      {/* NGO Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              Verified NGO Partner Portal
            </span>
            <Badge variant="green" size="sm">
              REG: MH/2018/009182
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name || 'Aarogya Health Foundation'}
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Manage your donation campaigns, mobilize passionate volunteers, and review incoming candidate applications with transparent impact metrics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setCreateCampaignOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-xs shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            + New Campaign
          </button>
          <button
            onClick={() => setCreateDriveOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            + Volunteer Drive
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Funds Raised"
          value={`₹${totalFundsRaised.toLocaleString()}`}
          subtitle={`${totalDonors} individual supporters`}
          icon={Heart}
          color="green"
        />
        <StatCard
          title="Active Campaigns"
          value={campaigns.length}
          subtitle="Fundraising drives"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Volunteer Drives"
          value={opportunities.length}
          subtitle="Community tasks"
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Applications"
          value={applications.length}
          subtitle={`${applications.filter((a) => a.status === 'pending').length} pending review`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'campaigns', label: 'Our Campaigns', count: campaigns.length },
            { id: 'applications', label: 'Volunteer Applicants', count: applications.length },
            { id: 'drives', label: 'Our Volunteer Drives', count: opportunities.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB 1: Campaigns */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-slate-500">
                  Manage fundraising goals and monitor incoming citizen contributions
                </p>
                <button
                  onClick={() => setCreateCampaignOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Launch another campaign
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((c) => {
                  const raised = parseFloat(c.raised_amount || 0);
                  const target = parseFloat(c.target_amount || 1);
                  const pct = Math.min(100, Math.round((raised / target) * 100));

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Badge variant="blue" size="sm">
                            {c.category}
                          </Badge>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {c.status || 'Active'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">{c.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-900">
                            ₹{raised.toLocaleString()}
                            <span className="font-normal text-slate-400 ml-1">
                              / ₹{target.toLocaleString()}
                            </span>
                          </span>
                          <span className="font-semibold text-blue-600">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>{c.donors_count || 0} donors supported</span>
                          <span>Location: {c.location || 'India'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Volunteer Applications */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Review volunteer candidates, approve their slots, and award service hours
              </p>

              {applications.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No volunteer applications yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Volunteer Name</th>
                        <th className="py-3 px-4">Opportunity</th>
                        <th className="py-3 px-4">Notes / Background</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900 text-xs">{app.volunteer_name}</p>
                            <p className="text-[11px] text-slate-400">{app.volunteer_email}</p>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-800">
                            {app.opportunity_title}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                            {app.notes || 'Interested in contributing'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                app.status === 'approved'
                                  ? 'green'
                                  : app.status === 'rejected'
                                  ? 'red'
                                  : 'orange'
                              }
                              size="sm"
                            >
                              {app.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {app.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'approved', 4)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                              )}
                              {app.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'rejected', 0)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Volunteer Drives */}
          {activeTab === 'drives' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((o) => (
                <div key={o.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="orange" size="sm">
                      {o.category}
                    </Badge>
                    <span className="text-xs text-slate-500">{o.mode}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{o.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{o.description}</p>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                    <span>{o.location}</span>
                    <span>{o.spots_filled || 0} / {o.spots_needed || 10} filled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <Modal
        isOpen={createCampaignOpen}
        onClose={() => setCreateCampaignOpen(false)}
        title="Launch New Donation Campaign"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
            <input
              type="text"
              required
              value={newCampaign.title}
              onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
              placeholder="e.g. Free Eye Surgeries & Cataract Camps for Rural Elders"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newCampaign.category}
                onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {['Healthcare', 'Education', 'Hunger Relief', 'Disaster Relief', 'Environment'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
              <input
                type="number"
                required
                min="1000"
                value={newCampaign.target_amount}
                onChange={(e) => setNewCampaign({ ...newCampaign, target_amount: e.target.value })}
                placeholder="e.g. 250000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Target Region</label>
            <input
              type="text"
              value={newCampaign.location}
              onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
              placeholder="e.g. Nashik, Maharashtra"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL (Optional)</label>
            <input
              type="url"
              value={newCampaign.image_url}
              onChange={(e) => setNewCampaign({ ...newCampaign, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description & Beneficiary Impact</label>
            <textarea
              rows="3"
              required
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
              placeholder="Explain how funds will be spent, number of people helped, and milestones..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {actionLoading ? 'Saving to MySQL...' : 'Publish Campaign'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE VOLUNTEER DRIVE MODAL */}
      <Modal
        isOpen={createDriveOpen}
        onClose={() => setCreateDriveOpen(false)}
        title="Post Volunteer Opportunity"
      >
        <form onSubmit={handleCreateDrive} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Drive / Task Title</label>
            <input
              type="text"
              required
              value={newDrive.title}
              onChange={(e) => setNewDrive({ ...newDrive, title: e.target.value })}
              placeholder="e.g. Weekend Science Tutor for Primary School Kids"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newDrive.category}
                onChange={(e) => setNewDrive({ ...newDrive, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                {['Education', 'Healthcare', 'Hunger Relief', 'Awareness', 'Disaster Support'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Participation Mode</label>
              <select
                value={newDrive.mode}
                onChange={(e) => setNewDrive({ ...newDrive, mode: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="on-site">On-Site</option>
                <option value="remote">Remote / Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Spots Needed</label>
              <input
                type="number"
                min="1"
                value={newDrive.spots_needed}
                onChange={(e) => setNewDrive({ ...newDrive, spots_needed: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule / Timing</label>
              <input
                type="text"
                value={newDrive.date_schedule}
                onChange={(e) => setNewDrive({ ...newDrive, date_schedule: e.target.value })}
                placeholder="e.g. Saturdays 10 AM - 1 PM"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Desired</label>
            <input
              type="text"
              value={newDrive.skills_required}
              onChange={(e) => setNewDrive({ ...newDrive, skills_required: e.target.value })}
              placeholder="e.g. Spoken English, Basic Science, Empathy"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role Description & Expectations</label>
            <textarea
              rows="3"
              required
              value={newDrive.description}
              onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
              placeholder="Describe volunteer responsibilities and logistics..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {actionLoading ? 'Posting...' : 'Post Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
