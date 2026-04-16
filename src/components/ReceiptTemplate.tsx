import React, { forwardRef } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';

interface ReceiptTemplateProps {
  transaction: Transaction | null;
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ transaction }, ref) => {
    if (!transaction) return null;

    return (
      <div className="fixed -left-[9999px] -top-[9999px]">
        <div
          ref={ref}
          className="w-[380px] bg-white p-10 text-slate-900 border border-slate-200"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-light text-slate-900 tracking-tight uppercase">Borehole Treasury</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mt-2">
              Official Private Record
            </p>
          </div>

          <div className="border-t border-b border-slate-100 py-8 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Account Holder
              </span>
              <span className="font-medium text-slate-800">{transaction.name}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Date of Entry
              </span>
              <span className="font-medium text-slate-800">
                {format(new Date(transaction.date), 'MMMM dd, yyyy')}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Classification
              </span>
              <span className="font-medium text-slate-800">{transaction.category}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[1.5px]">
                Reference
              </span>
              <span className="font-mono text-[9px] text-slate-400">{transaction.id}</span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[1.5px] mb-2">
              Transaction Value
            </p>
            <p className="text-5xl font-light text-slate-900 tracking-tighter">
              ₵{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed">
              This document serves as a formal acknowledgement of funds managed within the Borehole Treasury system.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default ReceiptTemplate;
