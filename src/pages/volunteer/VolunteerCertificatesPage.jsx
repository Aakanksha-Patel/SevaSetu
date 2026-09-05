// =======================================================
// Volunteer Certificates Page (/volunteer/certificates)
// Displays verified volunteering awards and credentials from MySQL
// Features high-res printable certificate preview modal
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { certificatesAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import {
  Award,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  QrCode,
  FileCheck,
} from 'lucide-react';

export default function VolunteerCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const fetchCertificates = async () => {
    try {
      const res = await certificatesAPI.getMyCertificates();
      setCertificates(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching volunteer certificates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCertificates();
  };

  const handleOpenCertificate = (cert) => {
    setSelectedCert(cert);
    setCertModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving verified certificates from MySQL..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            Verified Credentials
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Volunteer Service Certificates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Every certificate issued on SevaSetu is cryptographically verifiable and anchored in our
            database. Download, print, or share your official honors for college, job, or civic portfolios.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Records'}
        </button>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No certificates issued yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Certificates are automatically generated when an organizing NGO marks your volunteering
            event participation as "Completed".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              id={`certificate-card-${cert.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Card Header Pattern */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 p-5 text-white relative">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SevaSetu Official Seal</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {cert.certificate_number}
                  </span>
                </div>
                <h4 className="font-extrabold text-base tracking-tight mt-3 text-white">
                  Certificate of Appreciation
                </h4>
                <p className="text-xs text-purple-100 mt-0.5">Grassroots Volunteer Service</p>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Presented To
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {cert.volunteer_name || user?.name}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      For Dedicated Participation In
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                      {cert.event_title}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="truncate">{cert.ngo_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Issued:{' '}
                        {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>

                  <button
                    id={`view-cert-btn-${cert.id}`}
                    onClick={() => handleOpenCertificate(cert)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    View & Print
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <Modal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          title="Official Certificate of Appreciation"
          size="2xl"
        >
          <div className="space-y-6">
            {/* Printable Certificate Frame */}
            <div
              id="printable-certificate"
              className="relative bg-white border-8 border-double border-amber-600/40 rounded-2xl p-8 sm:p-12 text-center shadow-md space-y-6 overflow-hidden"
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-500 opacity-60 text-lg">✦</div>
              <div className="absolute top-2 right-2 text-amber-500 opacity-60 text-lg">✦</div>
              <div className="absolute bottom-2 left-2 text-amber-500 opacity-60 text-lg">✦</div>
              <div className="absolute bottom-2 right-2 text-amber-500 opacity-60 text-lg">✦</div>

              {/* Watermark Logo */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-orange-600 font-black text-xl tracking-tight">
                  <Award className="w-7 h-7 text-amber-500" />
                  <span>
                    Seva<span className="text-slate-900">Setu</span>
                  </span>
                </div>
                <p className="text-[11px] tracking-widest uppercase font-bold text-slate-400">
                  National Civic & Volunteer Registry
                </p>
              </div>

              {/* Certificate Title */}
              <div className="space-y-1 pt-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-wide">
                  Certificate of Appreciation
                </h2>
                <p className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                  For Exemplary Grassroots Volunteer Leadership
                </p>
              </div>

              {/* Recipient */}
              <div className="py-2 space-y-1">
                <p className="text-xs text-slate-500 italic">This is proudly presented to</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-8">
                  {selectedCert.volunteer_name || user?.name}
                </h3>
              </div>

              {/* Citation */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                in grateful recognition of selfless contribution, steadfast dedication, and verified
                community hours during the volunteering drive{' '}
                <strong className="text-slate-900">"{selectedCert.event_title}"</strong> conducted by{' '}
                <strong className="text-orange-700">{selectedCert.ngo_name}</strong>.
              </p>

              {/* Signatures & Seal */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 items-center text-left">
                <div className="text-center space-y-1">
                  <div className="h-8 flex items-end justify-center">
                    <span className="font-serif italic font-bold text-slate-700 text-sm">
                      Authorized Signatory
                    </span>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="text-[10px] font-bold text-slate-700">{selectedCert.ngo_name}</p>
                    <p className="text-[9px] text-slate-400">Organizing NGO Partner</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-600/40 bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner">
                    <Award className="w-8 h-8" />
                  </div>
                  <span className="text-[9px] font-bold uppercase text-amber-700 mt-1 tracking-wider">
                    Official Seal
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-8 flex items-end justify-center">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {selectedCert.issued_date
                        ? new Date(selectedCert.issued_date).toLocaleDateString()
                        : 'Verified'}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="text-[10px] font-mono text-slate-700">
                      {selectedCert.certificate_number}
                    </p>
                    <p className="text-[9px] text-slate-400">Blockchain / DB Identifier</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Verified Certificate ID:{' '}
                <strong className="font-mono text-slate-700">
                  {selectedCert.certificate_number}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  id="print-certificate-action-btn"
                  onClick={handlePrint}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
