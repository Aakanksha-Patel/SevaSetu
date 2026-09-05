// =======================================================
// Admin Donation Management Page (/admin/donations)
// Features:
// - View all platform donations across all donors and NGOs
// - Aggregate metrics: Total Funds, Transactions, Average Donation
// - Search by donor, email, NGO, or transaction reference
// - Export audit ledger to CSV
// =======================================================

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  HeartHandshake,
  Search,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Receipt,
  User,
  CreditCard,
} from 'lucide-react';

export default function AdminDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDonations({
        search: searchTerm || undefined,
      });
      if (res.data?.success) {
        setDonations(res.data.data || []);
        setTotalAmount(res.data.totalAmount || 0);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleExportCSV = () => {
    if (donations.length === 0) return;
    const headers = ['Transaction ID', 'Donor Name', 'Donor Email', 'Recipient NGO', 'Amount (INR)', 'Date', 'Status'];
    const rows = donations.map((d) => [
      d.transaction_id,
      `"${d.donor_name}"`,
      `"${d.donor_email}"`,
      `"${d.ngo_name}"`,
      d.amount,
      new Date(d.donated_at).toISOString().split('T')[0],
      d.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SevaSetu_Platform_Donations_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const avgDonation = donations.length > 0 ? (totalAmount / donations.length).toFixed(0) : 0;
  const maxDonation = donations.length > 0 ? Math.max(...donations.map((d) => d.amount)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Financial Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Funds Collected</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{totalAmount.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% transferred to verified NGOs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Transactions</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{donations.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Processed contributions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Average Donation</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{Number(avgDonation).toLocaleString()}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Per generous citizen</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Largest Single Gift</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{maxDonation.toLocaleString()}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Single philanthropic grant</p>
        </div>
      </div>

      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              Platform-Wide Financial Audit & Donations
            </h2>
            <p className="text-xs text-slate-500">
              Live ledger of all monetary contributions facilitated through SevaSetu escrow and direct channels.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit</span>
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by donor name, email, recipient NGO, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-24 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No donations found</p>
            <p className="text-xs text-slate-400 mt-1">No transaction records match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Transaction Ref</th>
                  <th className="py-3.5 px-4">Citizen Donor</th>
                  <th className="py-3.5 px-4">Recipient Organization</th>
                  <th className="py-3.5 px-4 text-right">Amount (INR)</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Ref */}
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-900">
                      {d.transaction_id}
                    </td>

                    {/* Donor */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{d.donor_name}</p>
                      <p className="text-[11px] text-slate-500">{d.donor_email}</p>
                    </td>

                    {/* Recipient NGO */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{d.ngo_name}</span>
                      </p>
                      <span className="text-[11px] text-slate-400">{d.ngo_category}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-sm text-emerald-700">
                        ₹{d.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(d.donated_at).toLocaleDateString()} at{' '}
                      {new Date(d.donated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
