import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { CreditCard, Lock } from 'lucide-react';

/**
 * MockPaymentForm - Payment form for wallet top-ups
 * Simulated payment processing for development
 */
const MockPaymentForm = ({ amount, onSubmit, onCancel, loading }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic length validation (no real card validation)
    if (cardNumber.replace(/\s/g, '').length < 13) {
      return;
    }

    if (!cardName.trim()) {
      return;
    }

    if (expiryDate.length < 5) {
      return;
    }

    if (cvv.length < 3) {
      return;
    }

    onSubmit({
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardName,
      expiryDate,
      cvv,
      amount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Display */}
      <div className="bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30 rounded-lg p-4">
        <p className="text-sm text-[#f2e9dd]/70 mb-1">Amount to Add</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
          ₱{amount?.toLocaleString()}
        </p>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm text-[#f2e9dd]/70 mb-2">
          <CreditCard size={14} className="inline mr-1" />
          Card Number
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 font-mono"
          required
        />
      </div>

      {/* Card Name */}
      <div>
        <label className="block text-sm text-[#f2e9dd]/70 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          placeholder="JUAN DELA CRUZ"
          className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 uppercase"
          required
        />
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#f2e9dd]/70 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 font-mono"
            maxLength={5}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#f2e9dd]/70 mb-2">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
            placeholder="123"
            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 font-mono"
            maxLength={4}
            required
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-xs text-[#f2e9dd]/50">
        <Lock size={12} />
        <span>Your payment information is secure</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50"
        >
          {loading ? 'Processing...' : `Add ₱${amount?.toLocaleString()}`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MockPaymentForm;
