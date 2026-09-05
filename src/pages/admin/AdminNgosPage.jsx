// =======================================================
// Admin NGO Management Page (/admin/ngos)
// Features:
// - View NGO profiles with registration data and trust status
// - Statuses: Pending, Verified, Rejected
// - Approve NGO (marks verified in MySQL)
// - Reject NGO (with confirmation modal)
// - View full NGO profile details modal
// - Status filters & search by name, reg number, category
// =======================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  HeartHandshake,
} from 'lucide-react';

export default function AdminNgosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [loading, setLoading] = useState(true);
  const [ngos, setNgos] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');

  // NGO Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNgos = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getNgos({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      if (res.data?.success) {
        setNgos(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNgos();
  };

  const handleApproveNgo = async (ngo) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyNgo(ngo.id, 'verified');
      await fetchNgos();
      if (selectedNgo && selectedNgo.id === ngo.id) {
        setSelectedNgo((prev) => ({ ...prev, verification_status: 'verified' }));
      }
    } catch (err) {
      alert(err.message || 'Failed to approve NGO');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRejectNgo = (ngo) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reject NGO Verification',
      message: `Are you sure you want to mark "${ngo.name}" as Rejected? Their publicly listed campaigns and badges will be suppressed.`,
      confirmText: 'Reject Verification',
      type: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminAPI.verifyNgo(ngo.id, 'rejected');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await fetchNgos();
          if (selectedNgo && selectedNgo.id === ngo.id) {
            setSelectedNgo((prev) => ({ ...prev, verification_status: 'rejected' }));
          }
        } catch (err) {
          alert(err.message || 'Failed to reject NGO');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleOpenDetails = (ngo) => {
    setSelectedNgo(ngo);
    setDetailsModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified NGO
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              NGO Trust & Verification Management
            </h2>
            <p className="text-xs text-slate-500">
              Review non-profit accreditation, DARPAN IDs, mission charters, and approve legitimate organizations.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg self-start sm:self-auto">
            {ngos.length} Non-Profits Listed
          </span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {['All', 'pending', 'verified', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'All' ? 'All Organizations' : st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by NGO name, registration number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* NGOs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : ngos.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No NGOs found</p>
            <p className="text-xs text-slate-400 mt-1">No non-profit organizations match this filter category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Non-Profit Organization</th>
                  <th className="py-3.5 px-4">Registration #</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-center">Events</th>
                  <th className="py-3.5 px-4 text-center">Donations Raised</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {ngos.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* NGO Name & Contact */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={ngo.logo || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'}
                          alt={ngo.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{ngo.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{ngo.email}</p>
                          <p className="text-[11px] text-slate-400 truncate">{ngo.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Registration No */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {ngo.registration_number || 'REG-PENDING'}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {ngo.category}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">{renderStatusBadge(ngo.verification_status)}</td>

                    {/* Events Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-800">{ngo.total_events || 0}</span>
                    </td>

                    {/* Donations Raised */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-emerald-700">
                        ₹{parseFloat(ngo.total_donations || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Profile */}
                        <button
                          onClick={() => handleOpenDetails(ngo)}
                          title="View Full NGO Profile"
                          className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve Button */}
                        {ngo.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleApproveNgo(ngo)}
                            title="Approve NGO Verification"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                        )}

                        {/* Reject Button */}
                        {ngo.verification_status !== 'rejected' && (
                          <button
                            onClick={() => confirmRejectNgo(ngo)}
                            title="Reject NGO"
                            className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
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

      {/* Full NGO Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedNgo ? `NGO Profile: ${selectedNgo.name}` : 'NGO Details'}
        maxWidth="max-w-2xl"
      >
        {selectedNgo && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Header branding */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={selectedNgo.logo || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'}
                alt={selectedNgo.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedNgo.name}</h3>
                  {renderStatusBadge(selectedNgo.verification_status)}
                </div>
                <p className="text-slate-500 mt-0.5">Registration Number: <span className="font-mono text-slate-700 font-semibold">{selectedNgo.registration_number}</span></p>
                <div className="flex flex-wrap gap-3 mt-2 text-slate-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedNgo.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedNgo.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedNgo.address || 'India'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About & Mission */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  About the Organization
                </h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50/75 p-3 rounded-xl border border-slate-100">
                  {selectedNgo.about || 'Dedicated to humanitarian service, social advancement, and transparent grassroots impact.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Organizational Mission
                </h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50/75 p-3 rounded-xl border border-slate-100">
                  {selectedNgo.mission || 'To empower underprivileged communities through collaborative citizen mobilization and accountable governance.'}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-slate-500 font-medium">Total Events Hosted</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedNgo.total_events || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-emerald-700 font-medium">Total Donations Received</span>
                <p className="text-lg font-bold text-emerald-800 mt-0.5">₹{parseFloat(selectedNgo.total_donations || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedNgo.verification_status !== 'verified' && (
                  <button
                    onClick={() => {
                      handleApproveNgo(selectedNgo);
                      setDetailsModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    Approve Verification
                  </button>
                )}
                {selectedNgo.verification_status !== 'rejected' && (
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      confirmRejectNgo(selectedNgo);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                  >
                    Reject Verification
                  </button>
                )}
              </div>

              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        isLoading={actionLoading}
      />
    </div>
  );
}
