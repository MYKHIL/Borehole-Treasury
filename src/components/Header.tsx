import React, { useState } from 'react';
import { FileUp, Download, RefreshCw, Database, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  binId: string;
  syncStatus: 'syncing' | 'success' | 'error' | 'warning';
  dataSource: 'firebase' | 'jsonbin' | 'local' | 'syncing';
  lastSyncTime?: Date;
  onUploadExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadExcel: () => void;
  onSyncCloud?: () => void;
  onMigrateToCloud?: () => void;
  onSwitchBin: () => void;
}

export default function Header({
  balance,
  totalIncome,
  totalExpense,
  binId,
  syncStatus,
  dataSource,
  lastSyncTime,
  onUploadExcel,
  onDownloadExcel,
  onSyncCloud,
  onMigrateToCloud,
  onSwitchBin,
}: HeaderProps) {
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  return (
    <header className="px-12 py-10 flex justify-between items-end border-b border-border bg-bg">
      <div className="welcome-text">
        <p className="text-text-secondary text-[10px] uppercase tracking-[2px] mb-2">
          {format(new Date(), 'EEEE, MMMM dd').toUpperCase()}
        </p>
        <h1 className="font-serif text-5xl font-light text-text-primary leading-none">
          Borehole Treasury
        </h1>
      </div>

      <div className="flex flex-col items-end gap-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onMouseEnter={() => setShowSyncInfo(true)}
              onMouseLeave={() => setShowSyncInfo(false)}
              onClick={() => setShowSyncInfo(!showSyncInfo)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[1.5px] font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  syncStatus === 'syncing' && 'bg-blue-400 animate-pulse',
                  syncStatus === 'success' && 'bg-green-400',
                  syncStatus === 'error' && 'bg-red-400',
                  syncStatus === 'warning' && 'bg-accent'
                )}
              />
              {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'success' ? 'Protected' : 'Error'}
              <span className="ml-1 opacity-40">({dataSource})</span>
              <Info className="h-3 w-3 opacity-50" />
            </button>

            <AnimatePresence>
              {showSyncInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 z-50 w-64 bg-card border border-border p-6 shadow-2xl"
                >
                  <h4 className="text-[10px] uppercase tracking-[2px] text-accent mb-4 font-bold">Cloud Synchronization</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[1px]">
                      <span className="text-text-secondary">Status</span>
                      <span className={cn(
                        "font-bold",
                        syncStatus === 'success' ? "text-green-400" : "text-accent"
                      )}>{syncStatus.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[1px]">
                      <span className="text-text-secondary">Source</span>
                      <span className="text-text-primary font-bold">{dataSource.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[1px]">
                      <span className="text-text-secondary">Last Sync</span>
                      <span className="text-text-primary">
                        {lastSyncTime ? format(lastSyncTime, 'HH:mm:ss') : 'NEVER'}
                      </span>
                    </div>
                  </div>
                  {syncStatus === 'error' && (
                    <p className="mt-4 text-[9px] text-red-400 leading-relaxed italic">
                      Connection interrupted. Check network or master password.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex gap-2">
            {onSyncCloud && (
              <button 
                onClick={onSyncCloud}
                className="p-2 border border-border rounded-sm hover:border-accent transition-all cursor-pointer text-text-secondary hover:text-accent"
                title="Sync to Cloud"
              >
                <RefreshCw className={cn("h-4 w-4", syncStatus === 'syncing' && "animate-spin")} />
              </button>
            )}

            {onMigrateToCloud && (
              <button 
                onClick={onMigrateToCloud}
                className="p-2 border border-border rounded-sm hover:border-accent transition-all cursor-pointer text-text-secondary hover:text-accent"
                title="Migrate JSONBin to Firebase"
              >
                <Database className="h-4 w-4" />
              </button>
            )}

            <label className="p-2 border border-border rounded-sm hover:border-accent transition-all cursor-pointer text-text-secondary hover:text-accent" title="Upload Excel">
              <FileUp className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={onUploadExcel}
              />
            </label>

            <button 
              onClick={onDownloadExcel}
              className="p-2 border border-border rounded-sm hover:border-accent transition-all cursor-pointer text-text-secondary hover:text-accent"
              title="Download Excel"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          <button 
            onClick={onSwitchBin}
            className="text-[10px] uppercase tracking-[1.5px] border border-accent text-accent px-4 py-2 hover:bg-accent hover:text-bg transition-all"
          >
            Switch Bin
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] uppercase tracking-[2px] text-text-secondary block mb-1">Available Funds</span>
          <div className="font-serif text-4xl text-text-primary">
            ₵{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex gap-4 mt-2 justify-end">
            <span className="text-[10px] uppercase tracking-[1px] text-green-400">
              IN: ₵{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] uppercase tracking-[1px] text-red-400">
              OUT: ₵{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 1 })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
