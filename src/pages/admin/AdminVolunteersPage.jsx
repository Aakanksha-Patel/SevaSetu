// =======================================================
// Admin Volunteer Management Page (/admin/volunteers)
// Features:
// - View all registered volunteers with profile, skills, and engagement metrics
// - Search volunteers by name, skills, interests, and location
// - View Volunteer Activity (applied drives, certificates, service hours)
// - Modal showing comprehensive impact ledger
// =======================================================

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import {
  HandHeart,
  Search,
  MapPin,
  Clock,
  Award,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck2,
  Mail,
  Phone,
  Sparkles,
  Tag,
} from 'lucide-react';

export default function AdminVolunteersPage() {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Volunteer Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [selectedVolunteerActivity, setSelectedVolunteerActivity] = useState(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getVolunteers({
        search: searchTerm || undefined,
      });
      if (res.data?.success) {
        setVolunteers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load volunteers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVolunteers();
  };

  const handleViewActivity = async (volunteerId) => {
    setActivityLoading(true);
    setActivityModalOpen(true);
    try {
      const res = await adminAPI.getVolunteerActivity(volunteerId);
      if (res.data?.success) {
        setSelectedVolunteerActivity(res.data.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch volunteer activity');
      setActivityModalOpen(false);
    } finally {
      setActivityLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> {status}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-emerald-600" />
              Volunteer Registry & Activity Tracking
            </h2>
            <p className="text-xs text-slate-500">
              Audit grassroots volunteer participation, verified service hours, and certificates across drives.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg self-start sm:self-auto">
            {volunteers.length} Active Volunteers
          </span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search volunteers by name, skills, interests, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-24 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : volunteers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <HandHeart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No volunteers match your search criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try searching by general skill, city, or name.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Volunteer</th>
                  <th className="py-3.5 px-4">Skills & Interests</th>
                  <th className="py-3.5 px-4">Location & Availability</th>
                  <th className="py-3.5 px-4 text-center">Impact Hours</th>
                  <th className="py-3.5 px-4 text-center">Certificates</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Activity Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {volunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Volunteer Column */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={vol.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={vol.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{vol.name}</p>
                          <p className="text-[11px] text-slate-500">{vol.email}</p>
                          {vol.phone && <p className="text-[11px] text-slate-400">{vol.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Skills & Interests */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">{vol.skills || 'Community Support'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{vol.interests || 'Environment, Healthcare'}</p>
                    </td>

                    {/* Location & Availability */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{vol.location || 'India'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{vol.availability || 'Weekends'}</span>
                      </div>
                    </td>

                    {/* Impact Hours */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/60">
                        {vol.hours_contributed ?? 0} hrs
                      </span>
                    </td>

                    {/* Certificates */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {vol.certificates_count ?? 0}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleViewActivity(vol.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Activity</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Volunteer Detailed Activity Modal */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={selectedVolunteerActivity ? `Volunteer Activity: ${selectedVolunteerActivity.volunteer?.user?.name || 'Volunteer'}` : 'Volunteer Activity'}
        maxWidth="max-w-3xl"
      >
        {activityLoading || !selectedVolunteerActivity ? (
          <div className="py-14 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Applied Drives</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedVolunteerActivity.summary?.totalApplications || 0}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <span className="text-[11px] text-emerald-700 font-medium">Accepted Drives</span>
                <p className="text-xl font-bold text-emerald-800 mt-0.5">
                  {selectedVolunteerActivity.summary?.acceptedApplications || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <span className="text-[11px] text-blue-700 font-medium">Service Hours</span>
                <p className="text-xl font-bold text-blue-800 mt-0.5">
                  {selectedVolunteerActivity.summary?.estimatedHours || 14} hrs
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <span className="text-[11px] text-amber-700 font-medium">Certificates</span>
                <p className="text-xl font-bold text-amber-800 mt-0.5">
                  {selectedVolunteerActivity.summary?.certificatesIssued || 0}
                </p>
              </div>
            </div>

            {/* Applied Events Ledger */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Participation History & Applications ({selectedVolunteerActivity.applications?.length || 0})
              </h4>
              {selectedVolunteerActivity.applications && selectedVolunteerActivity.applications.length > 0 ? (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {selectedVolunteerActivity.applications.map((app) => (
                    <div key={app.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{app.event_title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{app.category}</span>
                          <span>•</span>
                          <span>{app.location}</span>
                          <span>•</span>
                          <span>{app.date}</span>
                        </div>
                      </div>
                      <div className="shrink-0">{getStatusBadge(app.status)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl text-center">
                  No volunteer drive applications logged yet.
                </p>
              )}
            </div>

            {/* Issued Certificates */}
            {selectedVolunteerActivity.certificates && selectedVolunteerActivity.certificates.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  Issued Recognition Certificates
                </h4>
                <div className="space-y-2">
                  {selectedVolunteerActivity.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-950">Ref: {cert.certificate_number || 'SEVA-CERT'}</p>
                          <p className="text-[11px] text-amber-700">Issued for exemplary community drive dedication</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : 'Verified'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setActivityModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
