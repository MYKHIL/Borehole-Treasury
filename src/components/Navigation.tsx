import React from 'react';
import { cn } from '../lib/utils';
import { PageType } from '../types';

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="w-20 h-screen bg-black border-r border-border flex flex-col items-center py-10 gap-10 sticky top-0 z-40">
      <div className="font-serif text-2xl font-bold text-accent mb-4">B</div>
      
      <button
        onClick={() => onPageChange('journal')}
        className={cn(
          'nav-item text-[10px] uppercase tracking-[2px] cursor-pointer transition-all duration-300',
          'writing-vertical-rl rotate-180',
          currentPage === 'journal' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        Journal
      </button>
      
      <button
        onClick={() => onPageChange('accounting')}
        className={cn(
          'nav-item text-[10px] uppercase tracking-[2px] cursor-pointer transition-all duration-300',
          'writing-vertical-rl rotate-180',
          currentPage === 'accounting' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        Accounting
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
      `}} />
    </nav>
  );
}
