import React, { useState } from 'react';
import { Shield, User, Key, Save } from 'lucide-react';
import { sha256 } from '../lib/api';
import { motion } from 'motion/react';

interface SettingsPageProps {
  onSetGuestPassword: (hash: string) => void;
  onRevokeGuestPassword: () => void;
  hasGuestPassword: boolean;
  isGuest: boolean;
}

export default function SettingsPage({ 
  onSetGuestPassword, 
  onRevokeGuestPassword,
  hasGuestPassword, 
  isGuest 
}: SettingsPageProps) {
  const [newGuestPassword, setNewGuestPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSetGuestPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    
    setIsSaving(true);
    try {
      const hash = await sha256(newGuestPassword);
      onSetGuestPassword(hash);
      setNewGuestPassword('');
      alert('Guest password updated successfully.');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = () => {
    if (confirm('Are you sure you want to revoke guest access? This will delete the guest password.')) {
      onRevokeGuestPassword();
    }
  };

  if (isGuest) {
    return (
      <div className="px-12 py-20 max-w-2xl mx-auto text-center">
        <Shield className="h-16 w-16 text-accent mx-auto mb-8 opacity-20" />
        <h2 className="font-serif text-3xl font-light mb-4">Restricted Access</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          You are currently logged in as a Guest. Guest accounts are restricted from modifying security settings or managing the treasury data.
        </p>
      </div>
    );
  }

  return (
    <div className="px-12 py-20 max-w-2xl mx-auto">
      <div className="mb-16">
        <h2 className="font-serif text-4xl font-light mb-4">Settings</h2>
        <p className="text-[11px] uppercase tracking-[2px] text-text-secondary">
          Manage treasury access and security
        </p>
      </div>

      <div className="space-y-12">
        <section className="bg-card border border-border p-10 rounded-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent/10 rounded-full">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-serif text-xl">Guest Access</h3>
              <p className="text-[10px] uppercase tracking-[1px] text-text-secondary">
                Create a read-only password for auditors or guests
              </p>
            </div>
          </div>

          <form onSubmit={handleSetGuestPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[1.5px] text-text-secondary font-bold">
                {hasGuestPassword ? 'Update Guest Password' : 'Set Guest Password'}
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="password"
                  value={newGuestPassword}
                  onChange={(e) => setNewGuestPassword(e.target.value)}
                  placeholder="ENTER NEW GUEST PASSWORD"
                  required
                  className="w-full bg-bg border border-border focus:border-accent p-4 pl-12 outline-none text-sm transition-all text-text-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-3 w-full py-4 bg-accent text-bg uppercase tracking-[2px] text-xs font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'SAVING...' : 'SAVE GUEST PASSWORD'}
            </button>
          </form>

          {hasGuestPassword && (
            <div className="mt-8 space-y-6">
              <div className="p-4 border border-green-400/20 bg-green-400/5 rounded-sm flex items-start gap-3">
                <Shield className="h-4 w-4 text-green-400 mt-0.5" />
                <p className="text-[10px] text-green-400/80 leading-relaxed uppercase tracking-[0.5px]">
                  Guest access is currently active. Users with the guest password can view the journal and accounting pages but cannot make changes.
                </p>
              </div>
              
              <button
                onClick={handleRevoke}
                className="w-full py-3 border border-red-400/30 text-red-400/60 hover:text-red-400 hover:border-red-400 text-[10px] uppercase tracking-[2px] font-bold transition-all"
              >
                Revoke Guest Access
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
