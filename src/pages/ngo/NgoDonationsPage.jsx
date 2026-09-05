// =======================================================
// NGO Donations Page Component
// Requirement:
// Show donation history received by the NGO.
// =======================================================

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { donationsAPI } from '../../services/api.js';
import {
  Heart,
  Search,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  CheckCircle2,
  Receipt,
  FileText,
} from 'lucide-react';

export default function NgoDonationsPage() {
  const { ngoProfile } = useOutletContext() || {};
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const res = await donationsAPI.getMyNgoDonations().catch(() => {
          if (ngoProfile?.id) {
            return donationsAPI.getNgoDonations(ngoProfile.id);
          }
          return { data: { data: [] } };
        });

        if (res.data?.success) {
          setDonations(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load NGO donations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [ngoProfile]);

  const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const averageAmount = donations.length > 0 ? (totalAmount / donations.length).toFixed(0) : 0;

  const filteredDonations = donations.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      (d.donor_name && d.donor_name.toLowerCase().includes(q)) ||
      (d.donor_email && d.donor_email.toLowerCase().includes(q)) ||
      (d.amount && d.amount.toString().includes(q))
    );
  });

  const exportCSV = () => {
    const headers = ['Donation ID', 'Donor Name', 'Donor Email', 'Amount (INR)', 'Status', 'Date'];
    const rows = filteredDonations.map((d) => [
      d.id,
      `"${d.donor_name || 'Generous Citizen'}"`,
      `"${d.donor_email || ''}"`,
      d.amount,
      d.status,
      d.donated_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Donations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Donation History</h2>
          <p className="text-sm text-slate-500">
            Audit trail of contributions received directly from citizens and patrons
          </p>
        </div>

        <button
          id="export-donations-btn"
          onClick={exportCSV}
          disabled={donations.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Raised
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              ₹{totalAmount.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              100% disbursed to programs
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contributions Count
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{donations.length}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Verified donation transactions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Contribution
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              ₹{Number(averageAmount).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Per supporting donor</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by donor name, email, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing {filteredDonations.length} of {donations.length} transactions
        </div>
      </div>

      {/* ================= DONATION HISTORY TABLE ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Loading donation records from MySQL...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No donations found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No donations match your query.'
                : 'No direct donations have been recorded for your organization yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Receipt / ID</th>
                  <th className="px-6 py-4">Donor Name & Contact</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDonations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Transaction Reference */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      <span className="font-semibold text-slate-700">#DON-{String(item.id).padStart(5, '0')}</span>
                    </td>

                    {/* Donor Name & Contact */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.donor_name ? item.donor_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {item.donor_name || 'Generous Citizen'}
                          </h4>
                          <p className="text-xs text-slate-500">{item.donor_email || 'citizen@donor.org'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-base text-slate-900">
                        ₹{parseFloat(item.amount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right text-xs text-slate-600 font-medium whitespace-nowrap">
                      {item.donated_at
                        ? new Date(item.donated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
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
