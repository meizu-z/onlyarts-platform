import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const WalletPage = () => {
  const transactions = [
    { date: 'Oct 19, 2025', description: 'Premium Subscription', amount: -249, status: 'completed' },
    { date: 'Oct 15, 2025', description: 'NFT Purchase', amount: -5000, status: 'completed' },
    { date: 'Oct 10, 2025', description: 'Wallet Top-up', amount: 10000, status: 'completed' },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-8">Wallet</h1>

      {/* Balance Card */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 animate-fadeIn hover:border-[#7C5FFF]/50 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        
        <div className="relative z-10">
          <p className="text-[#f2e9dd]/70 mb-2">Available Balance</p>
          <p className="text-5xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent mb-6 transform group-hover:scale-105 transition-transform duration-300">
            ₱2,500.00
          </p>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300">
              Add Funds
            </Button>
            <Button variant="secondary" className="transform hover:scale-105 transition-all duration-300">
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '💳', label: 'Add Payment Method', color: 'from-[#7C5FFF]/10 to-[#FF5F9E]/10' },
          { icon: '📊', label: 'Transaction History', color: 'from-blue-600/10 to-[#7C5FFF]/10' },
          { icon: '🎁', label: 'Send Gift', color: 'from-[#FF5F9E]/10 to-orange-600/10' }
        ].map((action, idx) => (
          <Card 
            key={idx}
            className={`p-6 text-center hover:border-[#7C5FFF]/50 border border-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2 animate-fadeIn bg-gradient-to-br ${action.color} group`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="text-4xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              {action.icon}
            </div>
            <p className="text-[#f2e9dd] font-bold group-hover:text-[#B15FFF] transition-colors">
              {action.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Transaction History */}
      <Card className="p-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-bold text-[#f2e9dd] mb-6">Recent Transactions</h2>
        <div className="space-y-4">
          {transactions.map((tx, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0 hover:bg-white/5 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 animate-fadeIn group"
              style={{ animationDelay: `${(idx + 4) * 0.1}s` }}
            >
              <div>
                <p className="font-bold text-[#f2e9dd] group-hover:text-[#B15FFF] transition-colors">
                  {tx.description}
                </p>
                <p className="text-sm text-[#f2e9dd]/50">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold transform group-hover:scale-110 transition-transform ${
                  tx.amount > 0 
                    ? 'text-green-400' 
                    : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent'
                }`}>
                  {tx.amount > 0 ? '+' : ''}₱{Math.abs(tx.amount).toLocaleString()}
                </p>
                <p className="text-sm text-green-400">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export { WalletPage };