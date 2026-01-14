
import React from 'react';
import { Transaction } from '../types';
import { Trash2, Edit2, ArrowUpRight, ArrowDownLeft, Handshake } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onEdit }) => {
  return (
    <div className="glass rounded-3xl overflow-hidden mb-8">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold">Amallar Tarixi</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Sana</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Turi</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Kategoriya</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">To'lov</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Summa</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Hozircha hech qanday amal yo'q</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'Xarajat' && <ArrowUpRight size={16} className="text-red-400" />}
                      {tx.type === 'Daromad' && <ArrowDownLeft size={16} className="text-emerald-400" />}
                      {(tx.type === 'Qarz Berdim' || tx.type === 'Qarz Oldim') && <Handshake size={16} className="text-amber-400" />}
                      <span className="text-sm font-medium">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {tx.category} {tx.personName && `(${tx.personName})`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      tx.paymentMethod === 'Karta' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    <span className={tx.type === 'Xarajat' || tx.type === 'Qarz Berdim' ? 'text-red-400' : 'text-emerald-400'}>
                      {tx.type === 'Xarajat' || tx.type === 'Qarz Berdim' ? '-' : '+'}{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(tx)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(tx.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
