// =======================================================
// User Donations Page (/user/donations)
// History, 80G Tax Exemption Receipts, New Donation Action
// Connected to MySQL /api/donations/my-donations
// =======================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { donationsAPI, ngosAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import DonationModal from '../../components/donations/DonationModal.jsx';
import {
  Heart,
  Download,
  Receipt,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Plus,
} from 'lucide-react';

export default function UserDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Donation Modal
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const [donationsRes, ngosRes] = await Promise.all([
        donationsAPI.getMyDonations(),
        ngosAPI.getAll({ status: 'verified' }),
      ]);
      setDonations(donationsRes.data?.data || []);
      setNgos(ngosRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const total80gSaved = (totalAmount * 0.5).toFixed(0); // Standard 50% deduction under Section 80G

  const handleOpenDonate = () => {
    if (ngos.length > 0) {
      setSelectedNgo(ngos[0]);
      setDonationModalOpen(true);
    }
  };

  return (
    <div id="user-donations-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">My Donations & Receipts</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your social contributions and generate 80G tax exemption certificates.
          </p>
        </div>

        <button
          id="new-donation-btn"
          onClick={handleOpenDonate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Make New Donation
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Donated</p>
            <h3 className="text-2xl font-black text-slate-900">₹{totalAmount.toLocaleString()}</h3>
            <span className="text-[11px] font-semibold text-emerald-600">100% directly to causes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Donations Count</p>
            <h3 className="text-2xl font-black text-slate-900">{donations.length}</h3>
            <span className="text-[11px] font-semibold text-blue-600">Verified receipts logged</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Estimated 80G Benefit</p>
            <h3 className="text-2xl font-black text-slate-900">₹{Number(total80gSaved).toLocaleString()}</h3>
            <span className="text-[11px] font-semibold text-purple-600">Sec 80G IT Act</span>
          </div>
        </div>
      </div>

      {/* Donations List */}
      {loading ? (
        <LoadingSpinner text="Fetching donation records..." />
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No donations yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your donations help grassroots organizations deliver food, healthcare, and education to vulnerable communities.
            </p>
          </div>
          <button
            onClick={handleOpenDonate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            Support an NGO Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
            <span className="text-xs text-slate-400">{donations.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Receipt ID</th>
                  <th className="py-3.5 px-4">Beneficiary NGO</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tax Exemption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      REC-{String(d.id).padStart(5, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{d.ngo_name}</span>
                      <span className="text-[11px] text-slate-400">Direct Cause Support</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900 text-sm">
                        ₹{parseFloat(d.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(d.donated_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium capitalize">
                        {d.payment_method || 'UPI / Razorpay'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                        80G Eligible
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {selectedNgo && (
        <DonationModal
          isOpen={donationModalOpen}
          onClose={() => setDonationModalOpen(false)}
          ngo={selectedNgo}
          onSuccess={() => {
            fetchDonations();
          }}
        />
      )}
    </div>
  );
}
