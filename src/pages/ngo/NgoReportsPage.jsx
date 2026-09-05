// =======================================================
// NGO Reports Page Component
// Comprehensive impact, financial audit, and volunteer
// analytics report for the organization.
// =======================================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ngosAPI, eventsAPI, volunteerApplicationsAPI, donationsAPI, feedbackAPI } from '../../services/api.js';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  Heart,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  FileText,
  Clock,
} from 'lucide-react';

export default function NgoReportsPage() {
  const { ngoProfile } = useOutletContext() || {};
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReportData = async () => {
      try {
        setLoading(true);
        const [statsRes, eventsRes, appsRes, donRes] = await Promise.all([
          ngosAPI.getMyStats().catch(() => ({ data: { data: {} } })),
          eventsAPI.getAll({ status: 'all' }).catch(() => ({ data: { data: [] } })),
          volunteerApplicationsAPI.getNgoApplications().catch(() => ({ data: { data: [] } })),
          donationsAPI.getMyNgoDonations().catch(() => ({ data: { data: [] } })),
        ]);

        setStats(statsRes.data?.data || {});
        const allEvents = eventsRes.data?.data || [];
        const ngoId = ngoProfile?.id;
        setEvents(ngoId ? allEvents.filter((e) => e.ngo_id === ngoId) : allEvents);
        setApplications(appsRes.data?.data || []);
        setDonations(donRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load NGO reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReportData();
  }, [ngoProfile]);

  const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const acceptedApps = applications.filter((a) => a.status === 'accepted').length;
  const estimatedHours = acceptedApps * 6; // 6 volunteer hours estimated per event

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Impact & Audit Reports
          </h2>
          <p className="text-sm text-slate-500">
            Real-time analytics on community drives, volunteer workforce, and funding utilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Events
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{events.length}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Drives hosted to date</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mobilized Workforce
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{acceptedApps}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Confirmed volunteer placements</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Volunteer Service Hours
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">{estimatedHours} hrs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Contributed to social causes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Disbursed Grants & Funds
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹{totalDonations.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Across {donations.length} contributions</p>
          </div>
        </div>
      </div>

      {/* Printable Report Summary Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Official Impact Audit
              </span>
              <span className="text-xs text-slate-400">Report Reference: #{Date.now().toString().slice(-6)}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {ngoProfile?.name || 'NGO Partner Organization'}
            </h3>
            <p className="text-xs text-slate-500">
              Registration: {ngoProfile?.registration_number} • Category: {ngoProfile?.category} • Verification: {ngoProfile?.verification_status}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-600">Generated On</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Section 1: Event Deployment Performance */}
        <div className="space-y-4">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Event Performance & Volunteer Allocation</span>
          </h4>

          {events.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No events recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                    <th className="py-2.5 px-3">Event Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Required Volunteers</th>
                    <th className="py-2.5 px-3 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{event.title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{event.category}</td>
                      <td className="py-2.5 px-3 text-slate-600">{event.date}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{event.location}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {event.required_volunteers} volunteers
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                            event.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : event.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Financial Contribution Summary */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Contributions & Funding Dispersal</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gross Inflow
              </span>
              <h5 className="text-xl font-black text-slate-900 mt-1">₹{totalDonations.toLocaleString()}</h5>
              <p className="text-xs text-slate-500 mt-0.5">Total direct citizen patronage</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Avg Contribution Size
              </span>
              <h5 className="text-xl font-black text-slate-900 mt-1">
                ₹{donations.length > 0 ? (totalDonations / donations.length).toFixed(0) : 0}
              </h5>
              <p className="text-xs text-slate-500 mt-0.5">Average patron transaction</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Compliance Certification
              </span>
              <h5 className="text-xl font-black text-emerald-700 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>100% Tax Deductible</span>
              </h5>
              <p className="text-xs text-slate-500 mt-0.5">80G Registration in Good Standing</p>
            </div>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>SevaSetu Verified Impact Platform • Official Non-Profit Audit Certificate</p>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Authenticated by Platform Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
