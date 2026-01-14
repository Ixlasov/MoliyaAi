
import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';

interface BalanceCardsProps {
  cardBalance: number;
  cashBalance: number;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({ cardBalance, cashBalance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <CreditCard size={28} />
          </div>
          <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Mening Kartam</span>
        </div>
        <div>
          <h3 className="text-gray-400 text-sm mb-1">Karta balansi</h3>
          <p className="text-3xl font-bold tracking-tight">{cardBalance.toLocaleString()} <span className="text-lg font-normal text-gray-500 italic">so'm</span></p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Wallet size={28} />
          </div>
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Naqd Pullar</span>
        </div>
        <div>
          <h3 className="text-gray-400 text-sm mb-1">Naqd balans</h3>
          <p className="text-3xl font-bold tracking-tight">{cashBalance.toLocaleString()} <span className="text-lg font-normal text-gray-500 italic">so'm</span></p>
        </div>
      </div>
    </div>
  );
};

// Icons are from lucide-react, so we need to make sure user knows or we import. 
// Note: As an AI, I'll assume standard icons or provide SVGs if needed.
