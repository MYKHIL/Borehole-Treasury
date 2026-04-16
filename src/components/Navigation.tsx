import React from 'react';
import { cn } from '../lib/utils';
import { PageType } from '../types';

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isGuest: boolean;
}

export default function Navigation({ currentPage, onPageChange, isGuest }: NavigationProps) {
  return (
    <nav className={cn(
      "bg-black border-border z-40 transition-all duration-300",
      // Desktop: Sidebar
      "sm:w-20 sm:h-screen sm:border-r sm:flex sm:flex-col sm:items-center sm:py-10 sm:gap-10 sm:sticky sm:top-0",
      // Mobile: Bottom Bar
      "fixed bottom-0 left-0 right-0 h-16 border-t flex flex-row items-center justify-around px-6 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:h-auto sm:border-t-0"
    )}>
      <div className="font-serif text-2xl font-bold text-accent mb-4 hidden sm:block">B</div>
      
      <button
        onClick={() => onPageChange('journal')}
        className={cn(
          'nav-item text-[10px] uppercase tracking-[2px] cursor-pointer transition-all duration-300',
          'sm:writing-vertical-rl sm:rotate-180',
          currentPage === 'journal' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        Journal
      </button>
      
      <button
        onClick={() => onPageChange('accounting')}
        className={cn(
          'nav-item text-[10px] uppercase tracking-[2px] cursor-pointer transition-all duration-300',
          'sm:writing-vertical-rl sm:rotate-180',
          currentPage === 'accounting' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        Accounting
      </button>

      {!isGuest && (
        <button
          onClick={() => onPageChange('settings')}
          className={cn(
            'nav-item text-[10px] uppercase tracking-[2px] cursor-pointer transition-all duration-300',
            'sm:writing-vertical-rl sm:rotate-180',
            currentPage === 'settings' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          Settings
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 640px) {
          .sm\\:writing-vertical-rl {
            writing-mode: vertical-rl;
          }
        }
      `}} />
    </nav>
  );
}
