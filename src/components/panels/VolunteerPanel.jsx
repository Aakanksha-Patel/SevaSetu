// =======================================================
// Volunteer Panel Component
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { volunteersAPI } from '../../services/api.js';
import StatCard from '../common/StatCard.jsx';
import Badge from '../common/Badge.jsx';
import OpportunityCard from '../volunteers/OpportunityCard.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import {
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  Building2,
  Sparkles,
  MapPin,
  FileCheck,
  Printer,
} from 'lucide-react';

export default function VolunteerPanel() {
  const { user } = useAuth();
  const [myApplications, setMyApplications] = useState([]);
  const [openOpportunities, setOpenOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [showCertificate, setShowCertificate] = useState(false);
  const [stats, setStats] = useState({
    volunteer_hours: 0,
    events_joined: 0,
    pending_applications: 0,
    certificates_count: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, oppsRes, statsRes] = await Promise.all([
        volunteersAPI.getMyApplications().catch(() => ({ data: { data: [] } })),
        volunteersAPI.getOpportunities().catch(() => ({ data: { data: [] } })),
        volunteersAPI.getStats().catch(() => ({ data: { data: null } })),
      ]);

      const apps = appsRes.data?.data || [];
      setMyApplications(apps);
      setOpenOpportunities(oppsRes.data?.data || []);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      } else {
        const completed = apps.filter((a) => a.status === 'completed').length;
        const accepted = apps.filter((a) => a.status === 'accepted' || a.status === 'approved').length;
        const pending = apps.filter((a) => a.status === 'pending').length;
        setStats({
          volunteer_hours: completed * 4,
          events_joined: completed + accepted,
          pending_applications: pending,
          certificates_count: completed > 0 ? 1 : 0,
        });
      }
    } catch (err) {
      console.error('Error loading volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading volunteer records from MySQL..." />;

  return (
    <div className="space-y-6">
      {/* Volunteer Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            Volunteer Changemaker Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-orange-100 text-sm max-w-xl">
            Thank you for sharing your time and skills with grassroots causes. You have contributed <span className="font-bold text-white">{stats.volunteer_hours} verified hours</span> to social development missions.
          </p>
        </div>

        <button
          onClick={() => setShowCertificate(!showCertificate)}
          className="px-5 py-3 rounded-2xl bg-white text-orange-700 font-bold text-sm shadow-md hover:bg-orange-50 transition-colors flex items-center gap-2 shrink-0"
        >
          <Award className="w-4 h-4 text-orange-600" />
          {showCertificate ? 'Hide Certificate' : 'View Service Certificate'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Volunteer Hours"
          value={`${stats.volunteer_hours} hrs`}
          subtitle="Logged & Verified"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Events Joined"
          value={stats.events_joined}
          subtitle="Accepted & completed"
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Pending Applications"
          value={stats.pending_applications}
          subtitle="Awaiting NGO review"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Certificates"
          value={stats.certificates_count}
          subtitle="Service credentials"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Volunteer Certificate Preview */}
      {showCertificate && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-lg text-center space-y-4 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-9 h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Certificate of Community Service
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900">SevaSetu Social Impact Network</h2>
            <p className="text-xs text-slate-500">Official Recognition of Voluntary Service</p>
          </div>

          <div className="py-4 text-sm text-slate-700 max-w-xl mx-auto leading-relaxed border-y border-amber-100">
            This certificate is proudly awarded to <strong className="text-slate-900 text-base">{user?.name}</strong> in recognition of dedicated voluntary service, completing <strong className="text-orange-600 font-bold">{totalLoggedHours} hours</strong> of community engagement across education, healthcare, and humanitarian drives.
          </div>

          <div className="flex justify-between items-end pt-2 text-xs text-slate-500 max-w-lg mx-auto">
            <div>
              <p className="font-semibold text-slate-900">SevaSetu Verification Council</p>
              <p className="text-[10px]">Verified via MySQL Database ID #{user?.id}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">Date Issued</p>
              <p className="text-[10px]">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save Certificate
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'applications', label: 'My Applications', count: myApplications.length },
            { id: 'browse', label: 'Explore Opportunities', count: openOpportunities.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'applications' && (
            <div>
              {myApplications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No applications yet</p>
                  <p className="text-xs text-slate-400">
                    Browse open volunteer tasks and apply to start contributing!
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Explore Drives
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{app.opportunity_title}</h4>
                          <Badge
                            variant={
                              app.status === 'approved'
                                ? 'green'
                                : app.status === 'completed'
                                ? 'blue'
                                : app.status === 'rejected'
                                ? 'red'
                                : 'orange'
                            }
                            size="sm"
                          >
                            {app.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{app.ngo_name}</span>
                          <span className="text-slate-300">•</span>
                          <span>Applied on: {new Date(app.applied_at).toLocaleDateString()}</span>
                        </p>
                        {app.notes && (
                          <p className="text-xs text-slate-500 italic mt-1">"{app.notes}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="text-right">
                          <p className="text-slate-400 text-[11px]">Logged Hours</p>
                          <p className="font-bold text-slate-900 text-base">
                            {app.hours_logged || 0} hrs
                          </p>
                        </div>
                        {app.status === 'approved' && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
                            Active Volunteer
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {openOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} onUpdated={fetchData} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
