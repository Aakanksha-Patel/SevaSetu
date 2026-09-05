// =======================================================
// Donation Modal Component
// =======================================================

import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Alert from '../common/Alert.jsx';
import { campaignsAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Heart, CheckCircle2, CreditCard, Smartphone, Building } from 'lucide-react';

export default function DonationModal({ isOpen, onClose, campaign, onDonationSuccess }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('1000');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const presetAmounts = ['500', '1000', '2500', '5000'];

  const handlePresetSelect = (preset) => {
    setAmount(preset);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setAmount(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const finalAmount = parseFloat(amount);

    if (!finalAmount || finalAmount < 10) {
      setError('Please enter a valid donation amount of at least ₹10.');
      return;
    }

    if (!donorName.trim()) {
      setError('Please provide your name.');
      return;
    }

    setLoading(true);
    try {
      const res = await campaignsAPI.donate(campaign.id, {
        amount: finalAmount,
        donor_name: donorName,
        donor_email: donorEmail,
        payment_method: paymentMethod,
        message,
        user_id: user?.id || null,
      });

      if (res.data?.success) {
        setReceipt({
          transactionId: res.data.transactionId,
          amount: finalAmount,
          campaignTitle: campaign.title,
        });
        if (onDonationSuccess) {
          onDonationSuccess(res.data.updatedCampaign);
        }
      }
    } catch (err) {
      setError(err.message || 'Donation failed to process');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReceipt(null);
    setError('');
    onClose();
  };

  if (!campaign) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Make a Social Impact Donation">
      {receipt ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Thank You, Changemaker!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your contribution is recorded in the SevaSetu MySQL database.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono font-semibold text-slate-800">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Contributed:</span>
              <span className="font-bold text-emerald-600 text-sm">₹{receipt.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Campaign:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">{receipt.campaignTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="inline-flex items-center text-emerald-600 font-semibold">Verified & Allocated</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} />}

          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              {campaign.category}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 mt-0.5">{campaign.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Organized by {campaign.ngo_name}</p>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Donation Amount (₹)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {presetAmounts.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                    amount === preset && !customAmount
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="10"
              placeholder="Or enter custom amount in ₹"
              value={customAmount}
              onChange={handleCustomChange}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                { id: 'Card', label: 'Debit / Credit', icon: CreditCard },
                { id: 'NetBanking', label: 'Net Banking', icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Donor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Donor Name</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Rahul Verma"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email (for 80G receipt)</label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="donor@example.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Encouragement Message (Optional)
            </label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wishing the best for this initiative..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Heart className="w-4 h-4 fill-current" />
              {loading ? 'Recording in MySQL...' : `Confirm & Donate ₹${Number(amount || 0).toLocaleString()}`}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Simulated payment gateway integration for student demo. Records directly into MySQL `donations` table.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
}
