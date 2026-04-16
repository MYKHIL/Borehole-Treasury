import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { sha256 } from '../lib/api';

interface AuthOverlayProps {
  onAuthenticated: (hash: string, isGuest?: boolean) => void;
  isSetup: boolean;
  hasGuestAccess?: boolean;
}

export default function AuthOverlay({ onAuthenticated, isSetup, hasGuestAccess }: AuthOverlayProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(password);
    onAuthenticated(hash);
  };

  const handleGuestLogin = async () => {
    if (!hasGuestAccess) return;
    const hash = await sha256(password);
    onAuthenticated(hash, true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-bg flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card w-full max-w-sm border border-border p-12 text-center"
      >
        <div className="font-serif text-4xl font-bold text-accent mb-8">B</div>
        <h2 className="font-serif text-2xl font-light text-text-primary mb-2">
          {isSetup ? 'Initialize Treasury' : 'Private Access'}
        </h2>
        <p className="text-[11px] uppercase tracking-[2px] text-text-secondary mb-10">
          {isSetup
            ? 'Set your master credentials'
            : 'Authentication Required'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            required
            placeholder="PASSWORD"
            className="w-full bg-transparent border-b border-border focus:border-accent p-4 outline-none font-serif text-center text-xl transition-all text-text-primary placeholder:text-text-secondary/30"
          />
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-accent text-bg uppercase tracking-[2px] text-xs font-bold hover:scale-[1.02] transition-all"
            >
              {isSetup ? 'Set & Enter' : 'Unlock Master'}
            </button>
            
            {!isSetup && hasGuestAccess && (
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-4 border border-border text-text-secondary uppercase tracking-[2px] text-[10px] font-bold hover:border-text-primary hover:text-text-primary transition-all"
              >
                Enter as Guest
              </button>
            )}
          </div>
        </form>
        {error && (
          <p className="text-red-400 text-[10px] uppercase tracking-[1px] font-bold mt-6">
            Access Denied
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
