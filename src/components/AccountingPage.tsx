import React from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface AccountingPageProps {
  transactions: Transaction[];
}

export default function AccountingPage({ transactions }: AccountingPageProps) {
  let totalIncome = 0;
  let totalExpense = 0;
  const incomeBreakdown: Record<string, number> = {};
  const expenseBreakdown: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeBreakdown[tx.category] = (incomeBreakdown[tx.category] || 0) + tx.amount;
    } else {
      totalExpense += tx.amount;
      expenseBreakdown[tx.category] = (expenseBreakdown[tx.category] || 0) + tx.amount;
    }
  });

  const netPosition = totalIncome - totalExpense;

  const renderBreakdown = (
    data: Record<string, number>,
    total: number,
    colorClass: string
  ) => {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      return <p className="text-center py-12 text-text-secondary text-xs italic font-light">No data available for analysis.</p>;
    }

    return entries.map(([cat, val]) => {
      const percentage = total > 0 ? (val / total) * 100 : 0;
      return (
        <div key={cat} className="space-y-3 py-4 border-b border-border last:border-0">
          <div className="flex justify-between text-[11px] uppercase tracking-[1px] font-medium">
            <span className="text-text-primary">{cat}</span>
            <span className="text-text-secondary">
              ₵{val.toLocaleString()} ({percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-border h-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={`${colorClass} h-full`}
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="px-6 sm:px-12 py-8 sm:py-10 max-w-6xl mx-auto">
      <h3 className="font-serif text-3xl sm:text-4xl font-light text-text-primary mb-10">Accounting Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        <div className="bg-card border border-border p-6 sm:p-8 rounded-sm">
          <span className="text-[11px] uppercase tracking-[2px] text-text-secondary block mb-4">Total Income</span>
          <p className="font-serif text-3xl sm:text-4xl text-accent">₵{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border p-6 sm:p-8 rounded-sm">
          <span className="text-[11px] uppercase tracking-[2px] text-text-secondary block mb-4">Total Expenses</span>
          <p className="font-serif text-3xl sm:text-4xl text-text-primary">₵{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border p-6 sm:p-8 rounded-sm flex justify-between items-center md:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[11px] uppercase tracking-[2px] text-text-secondary block mb-4">Net Cash Position</span>
            <p className="font-serif text-3xl sm:text-4xl text-text-primary">₵{netPosition.toLocaleString()}</p>
          </div>
          <div className="p-4 border border-border rounded-full">
            {netPosition >= 0 ? <TrendingUp className="h-6 w-6 text-accent" /> : <TrendingDown className="h-6 w-6 text-red-400" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20 sm:pb-0">
        <div>
          <h4 className="text-[11px] uppercase tracking-[2px] text-text-secondary mb-6 border-b border-border pb-2">
            Income Sources
          </h4>
          <div className="bg-card border border-border p-6 sm:p-8 rounded-sm">
            {renderBreakdown(incomeBreakdown, totalIncome, 'bg-accent')}
          </div>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-[2px] text-text-secondary mb-6 border-b border-border pb-2">
            Expense Categories
          </h4>
          <div className="bg-card border border-border p-6 sm:p-8 rounded-sm">
            {renderBreakdown(expenseBreakdown, totalExpense, 'bg-text-secondary')}
          </div>
        </div>
      </div>
    </div>
  );
}
