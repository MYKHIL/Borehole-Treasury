import React, { useState, useEffect } from 'react';
import { Transaction, CATEGORIES } from '../types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Partial<Transaction>) => void;
  editTx?: Transaction | null;
  initialType?: 'income' | 'expense';
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  editTx,
  initialType = 'income',
}: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [otherCategory, setOtherCategory] = useState('');

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setName(editTx.name);
      setAmount(editTx.amount.toString());
      setDate(editTx.date);
      const isStandard = CATEGORIES[editTx.type].includes(editTx.category);
      setCategory(isStandard ? editTx.category : 'Other');
      setOtherCategory(isStandard ? '' : editTx.category);
    } else {
      setType(initialType);
      setName('');
      setAmount('');
      setCategory(CATEGORIES[initialType][0]);
      setDate(new Date().toISOString().split('T')[0]);
      setOtherCategory('');
    }
  }, [editTx, initialType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      amount: Math.abs(parseFloat(amount)),
      category: category === 'Other' ? otherCategory : category,
      type,
      date,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card w-full max-w-md border border-border p-6 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 sm:mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-text-primary">
                {editTx ? 'Edit Entry' : 'New Entry'}
              </h2>
              <div className="border border-border p-1 flex gap-1">
                {(['income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setCategory(CATEGORIES[t][0]);
                    }}
                    className={cn(
                      'px-4 py-1.5 text-[10px] font-black uppercase tracking-[1px] transition-all',
                      type === t
                        ? 'bg-accent text-bg'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2">
                  Payer / Payee Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-border focus:border-accent p-3 outline-none font-medium text-text-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2">
                    Amount (₵)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    required
                    className="w-full bg-transparent border-b border-border focus:border-accent p-3 outline-none font-serif text-xl text-text-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border-b border-border focus:border-accent p-3 outline-none font-medium text-text-primary transition-all appearance-none"
                  >
                    {CATEGORIES[type].map((c) => (
                      <option key={c} value={c} className="bg-card">
                        {c}
                      </option>
                    ))}
                    <option value="Other" className="bg-card">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-border focus:border-accent p-3 outline-none font-medium text-text-primary transition-all"
                />
              </div>
              {category === 'Other' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-2">
                    Specify Category
                  </label>
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-border focus:border-accent p-3 outline-none font-medium text-text-primary transition-all"
                    placeholder="e.g. Tank Refill"
                  />
                </motion.div>
              )}

              <div className="flex flex-col gap-4 mt-12">
                <button
                  type="submit"
                  className="w-full py-4 bg-accent text-bg uppercase tracking-[2px] text-xs font-bold hover:opacity-90 transition-all"
                >
                  Confirm Entry
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-text-secondary text-[10px] uppercase tracking-[2px] hover:text-text-primary transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
