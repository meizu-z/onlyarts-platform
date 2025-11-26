import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { walletService, mockWallet, mockTransactions } from '../services/wallet.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = false;

const WalletPage = () => {
  const toast = useToast();

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setBalance(mockWallet.balance);
        setTransactions(mockTransactions);
        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      const [walletData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions({ limit: 10 }),
      ]);

      setBalance(walletData.balance || 0);
      setTransactions(transactionsData.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err.message || 'Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = () => {
    toast.info('Add funds feature coming soon!');
  };

  const handleWithdraw = () => {
    toast.info('Withdraw feature coming soon!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-4 md:mb-8 px-3 md:px-0">Wallet</h1>
        <LoadingPaint message="Loading wallet..." />
        <div className="mt-8">
          <SkeletonGrid count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-4 md:mb-8 px-3 md:px-0">Wallet</h1>
        <APIError error={error} retry={fetchWalletData} />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-4 md:mb-8 px-3 md:px-0">Wallet</h1>

      {/* Balance Card */}
      <Card className="p-4 md:p-8 mb-4 md:mb-8 mx-3 md:mx-0 bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 animate-fadeIn hover:border-[#7C5FFF]/50 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

        <div className="relative z-10">
          <p className="text-[#f2e9dd]/70 mb-2 light:text-gray-600">Available Balance</p>
          <p className="text-3xl md:text-5xl font-bold text-[#7C5FFF] light:text-[#7952cc] mb-4 md:mb-6 transform group-hover:scale-105 transition-transform duration-300">
            ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddFunds}
              className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
            >
              Add Funds
            </Button>
            <Button
              onClick={handleWithdraw}
              variant="secondary"
              className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8 px-3 md:px-0">
        {[
          { icon: '💳', label: 'Add Payment Method', color: 'from-[#7C5FFF]/10 to-[#FF5F9E]/10' },
          { icon: '📊', label: 'Transaction History', color: 'from-blue-600/10 to-[#7C5FFF]/10' },
          { icon: '🎁', label: 'Send Gift', color: 'from-[#FF5F9E]/10 to-orange-600/10' }
        ].map((action, idx) => (
          <Card
            key={idx}
            className={`p-4 md:p-6 text-center hover:border-[#7C5FFF]/50 border border-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2 animate-fadeIn bg-gradient-to-br ${action.color} group`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="text-3xl md:text-4xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              {action.icon}
            </div>
            <p className="text-sm md:text-base text-[#f2e9dd] font-bold group-hover:text-[#B15FFF] transition-colors">
              {action.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Transaction History */}
      <Card className="p-3 md:p-6 mx-3 md:mx-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Recent Transactions</h2>
        <div className="space-y-3 md:space-y-4">
          {transactions.map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between pb-3 md:pb-4 border-b border-white/10 last:border-0 hover:bg-white/5 p-2 md:p-4 rounded-lg transition-all duration-300 transform hover:scale-105 animate-fadeIn group"
              style={{ animationDelay: `${(idx + 4) * 0.1}s` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-bold text-[#f2e9dd] group-hover:text-[#B15FFF] transition-colors truncate">
                  {tx.description}
                </p>
                <p className="text-xs md:text-sm text-[#f2e9dd]/50">{formatDate(tx.date)}</p>
              </div>
              <div className="text-right ml-2">
                <p className={`text-sm md:text-base font-bold transform group-hover:scale-110 transition-transform ${
                  tx.amount > 0
                    ? 'text-green-400 light:text-green-600'
                    : 'text-[#FF5F9E] light:text-[#d946ef]'
                }`}>
                  {tx.amount > 0 ? '+' : ''}₱{Math.abs(tx.amount).toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-green-400 light:text-green-600">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export { WalletPage };