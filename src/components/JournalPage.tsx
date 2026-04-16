import React from 'react';
import { Transaction, FilterType } from '../types';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface JournalPageProps {
  transactions: Transaction[];
  filter: FilterType;
  onSetFilter: (filter: FilterType) => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onBulkDelete: () => void;
}

export default function JournalPage({
  transactions,
  filter,
  onSetFilter,
  onAddIncome,
  onAddExpense,
  onSelectTransaction,
  onBulkDelete,
}: JournalPageProps) {
  const filtered = transactions
    .filter((tx) => filter === 'all' || tx.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="px-12 py-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4">
          <button
            onClick={onAddIncome}
            className="border border-accent text-accent px-6 py-3 text-[12px] uppercase tracking-[2px] hover:bg-accent hover:text-bg transition-all"
          >
            Add Income
          </button>
          <button
            onClick={onAddExpense}
            className="border border-white/20 text-text-primary px-6 py-3 text-[12px] uppercase tracking-[2px] hover:border-white transition-all"
          >
            Add Expense
          </button>
        </div>

        <div className="flex gap-8 border-b border-border pb-2">
          {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => onSetFilter(f)}
              className={cn(
                'text-[11px] uppercase tracking-[1.5px] transition-all relative pb-2',
                filter === f ? 'text-accent font-bold' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {f}
              {filter === f && (
                <motion.div layoutId="activeFilter" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-2xl font-light">Recent Transactions</h3>
            <button
              onClick={onBulkDelete}
              className="text-[10px] uppercase tracking-[1.5px] text-text-secondary hover:text-red-400 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear {filter === 'all' ? 'History' : filter}
            </button>
          </div>

          <div className="space-y-px border-t border-border">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-text-secondary text-sm italic font-light"
                >
                  No records found in this category.
                </motion.div>
              ) : (
                filtered.map((tx) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onSelectTransaction(tx)}
                    className="group flex justify-between items-center py-6 border-b border-border cursor-pointer hover:bg-card/50 transition-all px-4 -mx-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-[1.5px] text-text-secondary">
                        {format(new Date(tx.date), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                        {tx.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-[1px] text-text-secondary/60">
                        {tx.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "font-serif text-xl",
                        tx.type === 'income' ? 'text-accent' : 'text-text-primary'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}₵{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border p-8 rounded-sm">
            <span className="text-[11px] uppercase tracking-[2px] text-text-secondary block mb-6">Summary</span>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-xs text-text-secondary uppercase tracking-[1px]">Total Entries</span>
                <span className="font-serif text-2xl">{filtered.length}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-text-secondary uppercase tracking-[1px]">Volume</span>
                <span className="font-serif text-2xl text-accent">
                  ₵{filtered.reduce((acc, t) => acc + t.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
