import React from 'react';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, Edit2, Trash2, X } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'receipt' | 'edit' | 'delete') => void;
}

export default function ActionModal({ isOpen, onClose, onAction }: ActionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
            className="bg-card w-full max-w-sm border border-border p-10 shadow-2xl relative"
          >
            <h2 className="font-serif text-2xl font-light text-text-primary mb-10 text-center">Entry Options</h2>
            <div className="grid gap-4">
              <button
                onClick={() => onAction('receipt')}
                className="w-full py-4 border border-accent text-accent uppercase tracking-[2px] text-xs font-bold hover:bg-accent hover:text-bg transition-all flex items-center justify-center gap-3"
              >
                <Receipt className="h-4 w-4" />
                Download Receipt
              </button>
              <button
                onClick={() => onAction('edit')}
                className="w-full py-4 border border-border text-text-primary uppercase tracking-[2px] text-xs font-bold hover:border-text-primary transition-all flex items-center justify-center gap-3"
              >
                <Edit2 className="h-4 w-4" />
                Edit Details
              </button>
              <button
                onClick={() => onAction('delete')}
                className="w-full py-4 border border-red-400/20 text-red-400 uppercase tracking-[2px] text-xs font-bold hover:border-red-400 transition-all flex items-center justify-center gap-3"
              >
                <Trash2 className="h-4 w-4" />
                Delete Entry
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-text-secondary text-[10px] uppercase tracking-[2px] hover:text-text-primary transition-all flex items-center justify-center gap-2"
              >
                <X className="h-3 w-3" />
                Close Menu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
