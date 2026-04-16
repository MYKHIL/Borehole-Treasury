import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type,
}: NotificationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card w-full max-w-sm border border-border p-10 shadow-2xl relative text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex justify-center mb-6">
              {type === 'success' ? (
                <div className="p-4 rounded-full border border-green-400/20 bg-green-400/5">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
              ) : type === 'error' ? (
                <div className="p-4 rounded-full border border-red-400/20 bg-red-400/5">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              ) : (
                <div className="p-4 rounded-full border border-accent/20 bg-accent/5">
                  <AlertCircle className="h-8 w-8 text-accent" />
                </div>
              )}
            </div>

            <h2 className="font-serif text-2xl font-light text-text-primary mb-2">
              {title}
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className={cn(
                "w-full py-4 uppercase tracking-[2px] text-xs font-bold transition-all border",
                type === 'success' ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-bg" :
                type === 'error' ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-bg" :
                "border-accent text-accent hover:bg-accent hover:text-bg"
              )}
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
