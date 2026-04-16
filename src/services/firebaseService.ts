import { 
  db, 
  auth, 
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

export const saveTransactionsToFirebase = async (userId: string, transactions: Transaction[]) => {
  try {
    console.log(`Saving ${transactions.length} transactions to shared Firebase document...`);
    const sharedRef = doc(db, 'shared', 'transactions');
    await setDoc(sharedRef, { 
      transactions, 
      lastUpdatedBy: userId,
      updatedAt: new Date().toISOString()
    });
    console.log("Shared Firebase sync successful.");
  } catch (error) {
    console.error("Shared Firebase sync failed:", error);
    handleFirestoreError(error, OperationType.WRITE, 'shared/transactions');
  }
};

export const saveConfigToFirebase = async (userId: string, passwordHash: string, guestPasswordHash?: string | null) => {
  try {
    const configRef = doc(db, 'shared', 'config');
    await setDoc(configRef, { 
      passwordHash, 
      guestPasswordHash: guestPasswordHash || null,
      lastUpdatedBy: userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'shared/config');
  }
};

export const getTreasuryDataFromFirebase = async (userId: string): Promise<BinData | null> => {
  try {
    const configRef = doc(db, `users/${userId}/config/main`);
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) return null;
    
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    // Note: This is a one-time get. App.tsx will use onSnapshot for real-time.
    return null; // We'll rely on onSnapshot in App.tsx
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return null;
  }
};
