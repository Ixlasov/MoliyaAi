
export type PaymentMethod = 'Karta' | 'Naqd';
export type TransactionType = 'Xarajat' | 'Daromad' | 'Qarz Berdim' | 'Qarz Oldim';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  personName?: string;
  note?: string;
}

export interface Person {
  id: string;
  name: string;
  balance: number; // Positive means they owe user, negative user owes them
}

export interface AIResponse {
  intent: 'transaction' | 'debt' | 'query' | 'clarification';
  amount?: number;
  type?: TransactionType;
  category?: string;
  paymentMethod?: PaymentMethod;
  personName?: string;
  isConfirmed?: boolean;
  message: string;
  needsClarification?: 'paymentMethod' | 'person' | 'confirm';
}

export interface Balance {
  card: number;
  cash: number;
}
