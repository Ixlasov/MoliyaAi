
import React from 'react';
import { Person } from '../types';
import { User, ChevronRight, UserPlus } from 'lucide-react';

interface DebtManagementProps {
  people: Person[];
  onPersonClick: (person: Person) => void;
  onAddPerson: () => void;
}

export const DebtManagement: React.FC<DebtManagementProps> = ({ people, onPersonClick, onAddPerson }) => {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Odamlar & Qarzlar</h2>
        <button 
          onClick={onAddPerson}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all flex items-center gap-2 text-xs font-bold"
        >
          <UserPlus size={18} /> Qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500 italic">
            Hali hech kim qo'shilmagan
          </div>
        ) : (
          people.map(person => (
            <button
              key={person.id}
              onClick={() => onPersonClick(person)}
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  person.balance > 0 ? 'bg-emerald-500/20 text-emerald-400' : 
                  person.balance < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{person.name}</h4>
                  <p className={`text-xs font-semibold ${
                    person.balance > 0 ? 'text-emerald-400' : 
                    person.balance < 0 ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {person.balance === 0 ? 'Balans: 0' : 
                     person.balance > 0 ? `Sizdan qarzi: ${person.balance.toLocaleString()}` : 
                     `Sizning qarzingiz: ${Math.abs(person.balance).toLocaleString()}`}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
