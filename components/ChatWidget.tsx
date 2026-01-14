
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, X, Check, MessageSquare, CreditCard, Wallet, HelpCircle, Sparkles } from 'lucide-react';
import { AIResponse } from '../types';

interface ChatWidgetProps {
  onProcessInput: (text: string) => Promise<AIResponse | null>;
  pendingAction: AIResponse | null;
  onConfirm: (action: AIResponse) => void;
  onCancel: () => void;
  onQuickClarify: (field: string, value: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  onProcessInput, 
  pendingAction, 
  onConfirm, 
  onCancel,
  onQuickClarify
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatLog, setChatLog] = useState<{sender: 'ai' | 'user', text: string}[]>([
    { sender: 'ai', text: "Salom! Men sizning aqlli moliya yordamchingizman. Bugun qancha xarajat qildingiz yoki kimgadir qarz berdingizmi? Menga yozing yoki ovozli xabar yuboring." }
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, pendingAction, isOpen]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'uz-UZ';
      recognitionRef.current.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        handleSend(text);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    setChatLog(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsLoading(true);
    const response = await onProcessInput(text);
    if (response) {
      setChatLog(prev => [...prev, { sender: 'ai', text: response.message }]);
    }
    setIsLoading(false);
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center z-[60] hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0f172a] animate-bounce"></div>
      </button>

      {/* Large Chat Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full h-full md:max-w-4xl md:h-[80vh] flex flex-col rounded-none md:rounded-[40px] overflow-hidden border-none md:border border-white/20 shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Moliya AI Yordamchisi</h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Hozir onlayn
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-black/20">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-[28px] text-base leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                      : 'glass border border-white/10 text-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass p-4 rounded-2xl flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin text-blue-400" />
                    <span className="text-sm text-gray-400 italic">Tahlil qilinmoqda...</span>
                  </div>
                </div>
              )}

              {/* Action Cards (Inline Buttons) */}
              {pendingAction && (
                <div className="flex justify-start animate-in zoom-in-95 duration-300">
                  <div className="glass-card w-full max-w-sm p-6 rounded-[32px] border-blue-500/30 space-y-4 shadow-xl">
                    {pendingAction.needsClarification === 'paymentMethod' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-300 font-bold">
                          <HelpCircle size={20}/>
                          <span>To'lov turini tanlang</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => onQuickClarify('paymentMethod', 'Karta')}
                            className="flex flex-col items-center gap-2 py-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-2xl border border-blue-500/20 transition-all active:scale-95"
                          >
                            <CreditCard size={24}/>
                            <span className="font-bold text-xs">KARTA</span>
                          </button>
                          <button 
                            onClick={() => onQuickClarify('paymentMethod', 'Naqd')}
                            className="flex flex-col items-center gap-2 py-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-2xl border border-emerald-500/20 transition-all active:scale-95"
                          >
                            <Wallet size={24}/>
                            <span className="font-bold text-xs">NAQD</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-widest text-xs">
                          <Check size={18}/>
                          <span>Amalni Tasdiqlang</span>
                        </div>
                        <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex justify-between text-sm"><span className="text-gray-400">Summa:</span> <span className="font-bold text-blue-400">{pendingAction.amount?.toLocaleString()} so'm</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-400">Turi:</span> <span className="font-bold">{pendingAction.type}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-400">Kategoriya:</span> <span className="font-bold">{pendingAction.category}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-400">To'lov:</span> <span className="font-bold px-2 bg-white/10 rounded">{pendingAction.paymentMethod}</span></div>
                          {pendingAction.personName && <div className="flex justify-between text-sm"><span className="text-gray-400">Kimga/Kimdan:</span> <span className="font-bold text-emerald-400">{pendingAction.personName}</span></div>}
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => { onConfirm(pendingAction); setChatLog(prev => [...prev, {sender: 'ai', text: "Muvaffaqiyatli saqlandi! ✅"}]) }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20"
                          >
                            TASDIQLASH
                          </button>
                          <button 
                            onClick={onCancel}
                            className="flex-1 bg-white/5 hover:bg-red-600/20 text-red-400 py-4 rounded-2xl font-black text-sm border border-white/10 transition-all"
                          >
                            BEKOR QILISH
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="max-w-4xl mx-auto flex gap-4 items-center">
                <button 
                  onClick={toggleMic}
                  className={`p-5 rounded-3xl transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Mic size={24} />
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Xarajat yoki qarz haqida yozing..."
                    className="w-full bg-white/5 border border-white/10 rounded-[30px] py-5 px-8 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl text-white shadow-xl shadow-blue-600/30 transition-all active:scale-95"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
