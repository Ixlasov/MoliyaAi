
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Person, AIResponse, TransactionType, PaymentMethod } from './types';
import { BalanceCards } from './components/BalanceCards';
import { TransactionTable } from './components/TransactionTable';
import { ChatWidget } from './components/ChatWidget';
import { DebtManagement } from './components/DebtManagement';
import { analyzeInput, getFinancialAdvice } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { LayoutDashboard, Users, History, TrendingUp, Sparkles, X, Save, AlertTriangle, Lightbulb, CreditCard, Wallet } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('moliya_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('moliya_people');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingAction, setPendingAction] = useState<AIResponse | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("Ma'lumotlar tahlil qilinmoqda...");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'people'>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  useEffect(() => {
    localStorage.setItem('moliya_transactions', JSON.stringify(transactions));
    localStorage.setItem('moliya_people', JSON.stringify(people));
    
    const updateAdvice = async () => {
      if (transactions.length > 0) {
        const advice = await getFinancialAdvice(transactions);
        setAiAdvice(advice);
      } else {
        setAiAdvice("Hozircha ma'lumotlar yo'q. Birinchi xarajatingizni yozing va men sizga aqlli tavsiyalar beraman!");
      }
    };
    updateAdvice();
  }, [transactions, people]);

  const peopleWithBalances = useMemo(() => {
    return people.map(person => {
      const balance = transactions
        .filter(t => t.personName?.toLowerCase() === person.name.toLowerCase())
        .reduce((sum, t) => {
          if (t.type === 'Qarz Berdim') return sum + t.amount;
          if (t.type === 'Qarz Oldim') return sum - t.amount;
          return sum;
        }, 0);
      return { ...person, balance };
    });
  }, [transactions, people]);

  const balances = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      const isCard = tx.paymentMethod === 'Karta';
      const isPlus = tx.type === 'Daromad' || tx.type === 'Qarz Oldim';
      if (isPlus) {
        if (isCard) acc.card += tx.amount; else acc.cash += tx.amount;
      } else {
        if (isCard) acc.card -= tx.amount; else acc.cash -= tx.amount;
      }
      return acc;
    }, { card: 0, cash: 0 });
  }, [transactions]);

  const handleProcessInput = async (input: string): Promise<AIResponse | null> => {
    const context = { existingPeople: people.map(p => p.name) };
    const result = await analyzeInput(input, context);
    if (result.intent === 'transaction' || result.intent === 'debt') {
      setPendingAction(result);
    }
    return result;
  };

  const executeAction = (action: AIResponse) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: action.amount || 0,
      type: action.type || 'Xarajat',
      category: action.category || (action.intent === 'debt' ? 'Qarz' : 'Boshqa'),
      date: new Date().toLocaleDateString('uz-UZ'),
      paymentMethod: action.paymentMethod || 'Naqd',
      personName: action.personName || undefined
    };

    setTransactions(prev => [newTx, ...prev]);

    if (action.personName) {
      const exists = people.some(p => p.name.toLowerCase() === action.personName?.toLowerCase());
      if (!exists) {
        setPeople(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: action.personName!, balance: 0 }]);
      }
    }
    setPendingAction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Haqiqatdan ham ushbu amalni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? editingTransaction : t));
      setEditingTransaction(null);
    }
  };

  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      if (!people.some(p => p.name.toLowerCase() === newPersonName.trim().toLowerCase())) {
        setPeople(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: newPersonName.trim(), balance: 0 }]);
        setNewPersonName('');
        setShowAddPersonModal(false);
      } else {
        alert("Bu ismli shaxs allaqachon mavjud!");
      }
    }
  };

  const chartData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'Xarajat').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    const data = Object.entries(categories).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: "Ma'lumot yo'q", value: 0 }];
  }, [transactions]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Moliya AI
          </h1>
        </div>
        <nav className="hidden md:flex glass p-1.5 rounded-[20px] gap-1 shadow-inner">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashbord" />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18} />} label="Tarix" />
          <NavButton active={activeTab === 'people'} onClick={() => setActiveTab('people')} icon={<Users size={18} />} label="Odamlar" />
        </nav>
      </header>

      <main className="space-y-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Expanded AI Advice Section */}
            <section className="relative overflow-hidden glass-card p-8 rounded-[40px] border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl border border-blue-500/30">
                  <Lightbulb size={32} className="text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-2">AI Tavsiyasi</h2>
                  <p className="text-xl md:text-2xl font-semibold text-gray-100 leading-relaxed italic">
                    "{aiAdvice}"
                  </p>
                </div>
              </div>
            </section>

            <BalanceCards cardBalance={balances.card} cashBalance={balances.cash} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-[40px] p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black">Xarajatlar Tahlili</h2>
                  <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-gray-400 uppercase font-bold tracking-widest">Kategoriyalar</div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass rounded-[40px] p-8">
                <h2 className="text-xl font-black mb-8">Umumiy Taqsimot</h2>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={chartData} 
                        innerRadius={80} 
                        outerRadius={110} 
                        dataKey="value" 
                        stroke="none"
                        paddingAngle={8}
                      >
                        {chartData.map((_, i) => <Cell key={i} fill={`hsl(${210 + i * 45}, 70%, 50%)`} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <TransactionTable 
              transactions={transactions} 
              onDelete={handleDeleteTransaction} 
              onEdit={setEditingTransaction} 
            />
          </div>
        )}

        {activeTab === 'people' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <DebtManagement 
              people={peopleWithBalances} 
              onPersonClick={() => {}} 
              onAddPerson={() => setShowAddPersonModal(true)}
            />
          </div>
        )}
      </main>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form onSubmit={saveEdit} className="glass-card p-8 rounded-[40px] w-full max-w-md space-y-6 shadow-2xl border-white/20">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">Amalni Tahrirlash</h3>
              <button type="button" onClick={() => setEditingTransaction(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X /></button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Summa (so'm)</label>
                <input 
                  type="number" 
                  autoFocus
                  value={editingTransaction.amount} 
                  onChange={e => setEditingTransaction({...editingTransaction, amount: parseInt(e.target.value) || 0})} 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 text-xl font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kategoriya</label>
                <input 
                  type="text" 
                  value={editingTransaction.category} 
                  onChange={e => setEditingTransaction({...editingTransaction, category: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingTransaction({...editingTransaction, paymentMethod: 'Karta'})} 
                  className={`py-4 rounded-2xl text-sm font-black border transition-all ${editingTransaction.paymentMethod === 'Karta' ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/30' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  <div className="flex flex-col items-center gap-1"><CreditCard size={18}/> KARTA</div>
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingTransaction({...editingTransaction, paymentMethod: 'Naqd'})} 
                  className={`py-4 rounded-2xl text-sm font-black border transition-all ${editingTransaction.paymentMethod === 'Naqd' ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-600/30' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  <div className="flex flex-col items-center gap-1"><Wallet size={18}/> NAQD</div>
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] font-black text-sm transition-all shadow-xl shadow-blue-600/20">SAQLASH</button>
              <button type="button" onClick={() => setEditingTransaction(null)} className="flex-1 bg-white/5 hover:bg-white/10 py-5 rounded-[24px] font-black text-sm transition-all border border-white/10">BEKOR QILISH</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleAddPersonSubmit} className="glass-card p-8 rounded-[40px] w-full max-w-sm space-y-6 shadow-2xl border-white/20">
            <h3 className="text-2xl font-black">Yangi Odam Qo'shish</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ism Familiya</label>
              <input 
                autoFocus 
                placeholder="Masalan: Azizbek Aliyev" 
                value={newPersonName} 
                onChange={e => setNewPersonName(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" 
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-[24px] font-black text-sm shadow-xl shadow-blue-600/20">QO'SHISH</button>
              <button type="button" onClick={() => setShowAddPersonModal(false)} className="flex-1 bg-white/5 py-5 rounded-[24px] font-black text-sm border border-white/10">YOPISH</button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 px-8 py-5 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} label="Dashbord" />
        <MobileNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={24} />} label="Tarix" />
        <MobileNavItem active={activeTab === 'people'} onClick={() => setActiveTab('people')} icon={<Users size={24} />} label="Odamlar" />
      </div>

      <ChatWidget 
        onProcessInput={handleProcessInput}
        pendingAction={pendingAction}
        onConfirm={executeAction}
        onCancel={() => setPendingAction(null)}
        onQuickClarify={(f, v) => setPendingAction(p => p ? {...p, [f]: v, needsClarification: null} : null)}
      />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-sm ${
      active 
        ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-105' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-2 transition-all ${
      active ? 'text-blue-400 scale-110' : 'text-gray-500'
    }`}
  >
    <div className={`p-1 ${active ? 'bg-blue-400/10 rounded-xl' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-50'}`}>{label}</span>
  </button>
);

export default App;
