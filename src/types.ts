export interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export interface BinData {
  transactions: Transaction[];
  passwordHash: string | null;
  guestPasswordHash?: string | null;
}

export type FilterType = 'all' | 'income' | 'expense';
export type PageType = 'journal' | 'accounting' | 'settings';

export const CATEGORIES = {
  income: ["Water Sales", "Contributions", "Donations", "Gov Grant", "Refunds", "Other Income"],
  expense: ["Maintenance", "Pump Repair", "Electricity", "Operator Wages", "Admin Fees", "Cleaning Supplies", "Other Expense"]
};
