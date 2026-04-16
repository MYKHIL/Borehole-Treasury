import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { Transaction, BinData } from '../types';

export const saveTransactionsToFirebase = async (transactions: Transaction[]) => {
  try {
    console.log(`Saving ${transactions.length} transactions to shared Firebase document...`);
    const sharedRef = doc(db, 'shared', 'transactions');
    await setDoc(sharedRef, { 
      transactions, 
      updatedAt: new Date().toISOString()
    });
    console.log("Shared Firebase sync successful.");
  } catch (error) {
    console.error("Shared Firebase sync failed:", error);
    handleFirestoreError(error, OperationType.WRITE, 'shared/transactions');
  }
};

export const saveConfigToFirebase = async (passwordHash: string, guestPasswordHash?: string | null) => {
  try {
    const configRef = doc(db, 'shared', 'config');
    await setDoc(configRef, { 
      passwordHash, 
      guestPasswordHash: guestPasswordHash || null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'shared/config');
  }
};
