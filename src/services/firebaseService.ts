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
    console.log(`Saving ${transactions.length} transactions to Firebase for user ${userId}...`);
    const batch = writeBatch(db);
    
    for (const tx of transactions) {
      const txRef = doc(db, `users/${userId}/transactions`, tx.id);
      batch.set(txRef, { ...tx, userId });
    }
    
    await batch.commit();
    console.log("Firebase sync successful.");
  } catch (error) {
    console.error("Firebase sync failed:", error);
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/transactions`);
  }
};

export const saveConfigToFirebase = async (userId: string, passwordHash: string) => {
  try {
    const configRef = doc(db, `users/${userId}/config/main`);
    await setDoc(configRef, { passwordHash, userId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/config/main`);
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
