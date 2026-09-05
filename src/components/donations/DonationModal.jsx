// =======================================================
// Donation Modal Component (src/components/donations/DonationModal.jsx)
// Supports direct donation to NGOs with 80G tax exemption & receipt
// Connected to MySQL /api/donations
// =======================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { donationsAPI } from '../../services/api.js';
import {
  Heart,
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  CreditCard,
  QrCode,
  Building,
  Receipt,
} from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonationModal({ isOpen, onClose, ngo, onSuccess }) {
  const { user } = useAuth();

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  if (!isOpen || !ngo) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handlePreset = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustom = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentAmount || currentAmount < 50) {
      setError('Minimum donation amount is ₹50.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await donationsAPI.donate({
        ngo_id: ngo.id,
        amount: currentAmount,
        user_id: user?.id,
        payment_method: paymentMethod,
      });

      const receiptData = {
        donationId: res.data?.donationId || Date.now(),
        amount: currentAmount,
        ngoName: ngo.name,
        donorName: user?.name || 'Anonymous Donor',
        donorEmail: user?.email || '',
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };

      setSuccessReceipt(receiptData);
      if (onSuccess) onSuccess(receiptData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete donation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="donation-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors flex items-center justify-center z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {successReceipt ? (
          // Receipt & Success State
          <div className="p-7 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Donation Completed
              </span>
              <h3 className="text-xl font-bold text-slate-900">Thank You for Your Generosity!</h3>
              <p className="text-xs text-slate-500">
                Your contribution directly funds the grassroots projects of {successReceipt.ngoName}.
              </p>
            </div>

            {/* Official 80G Receipt Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Official 80G Receipt
                </div>
                <span className="font-mono text-slate-500">
                  REC-{String(successReceipt.donationId).padStart(5, '0')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Amount Contributed:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{successReceipt.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary NGO:</span>
                <span className="font-semibold text-slate-800">{successReceipt.ngoName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Donor:</span>
                <span className="font-semibold text-slate-800">{successReceipt.donorName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tax Benefit:</span>
                <span className="font-semibold text-purple-700">50% Deduction under Sec 80G</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Done & View in My Donations
            </button>
          </div>
        ) : (
          // Donation Form
          <form onSubmit={handleSubmit}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Verified NGO Donation
              </div>
              <h3 className="text-lg font-bold">Support {ngo.name}</h3>
              <p className="text-emerald-100 text-xs mt-0.5 line-clamp-1">{ngo.category} Initiative</p>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                  {error}
                </div>
              )}

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Contribution Amount (INR)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePreset(val)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        !customAmount && amount === val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="50"
                    placeholder="Or enter custom amount in Rupees"
                    value={customAmount}
                    onChange={handleCustom}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI / QR', label: 'UPI / GPay', icon: QrCode },
                    { id: 'Card', label: 'Debit/Credit', icon: CreditCard },
                    { id: 'NetBanking', label: 'NetBanking', icon: Building },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                          paymentMethod === method.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tax benefit notice */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>All donations are eligible for 50% deduction under Section 80G of the Income Tax Act.</span>
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={submitting || !currentAmount}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Donation...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Donate ₹{currentAmount ? currentAmount.toLocaleString() : 0} Now
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
