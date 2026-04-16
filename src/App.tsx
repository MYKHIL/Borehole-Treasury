import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { Transaction, BinData, FilterType, PageType } from './types';
import { fetchBin, updateBin } from './lib/api';
import { cn } from './lib/utils';
import { auth, db, googleProvider, signInWithPopup, collection, onSnapshot, query, doc } from './lib/firebase';
import { saveTransactionsToFirebase, saveConfigToFirebase } from './services/firebaseService';
import Header from './components/Header';
import JournalPage from './components/JournalPage';
import AccountingPage from './components/AccountingPage';
import Navigation from './components/Navigation';
import AuthOverlay from './components/AuthOverlay';
import TransactionModal from './components/TransactionModal';
import ActionModal from './components/ActionModal';
import ReceiptTemplate from './components/ReceiptTemplate';
import NotificationModal from './components/NotificationModal';

const DEFAULT_BIN_ID = '69ad987d43b1c97be9c15dd3';

export default function App() {
  const [binId, setBinId] = useState(localStorage.getItem('borehole_active_bin') || DEFAULT_BIN_ID);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [passwordHash, setPasswordHash] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'success' | 'error' | 'warning'>('syncing');
  const [currentPage, setCurrentPage] = useState<PageType>('journal');
  const [filter, setFilter] = useState<FilterType>('all');
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Data Listener
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/transactions`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => doc.data() as Transaction);
      if (txs.length > 0) {
        setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      setIsAuthReady(true);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsAuthReady(true);
    });

    const configUnsubscribe = onSnapshot(doc(db, `users/${user.uid}/config/main`), (docSnap) => {
      if (docSnap.exists()) {
        setPasswordHash(docSnap.data().passwordHash);
      }
    });

    return () => {
      unsubscribe();
      configUnsubscribe();
    };
  }, [user]);

  // JSONBin Fallback / Initial Load
  useEffect(() => {
    if (isAuthReady && user && transactions.length === 0) {
      loadData();
    } else if (isAuthReady && !user) {
      loadData();
    }
  }, [isAuthReady, user, binId]);

  // Auto-sync to Firebase when user logs in for the first time
  useEffect(() => {
    if (user && isAuthenticated && transactions.length > 0) {
      // Check if we need to push to Firebase
      const checkAndSync = async () => {
        try {
          const q = query(collection(db, `users/${user.uid}/transactions`));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
              console.log("Firebase is empty, performing initial sync...");
              saveData(transactions);
            }
            unsubscribe();
          });
        } catch (e) {
          console.error("Auto-sync check failed", e);
        }
      };
      checkAndSync();
    }
  }, [user, isAuthenticated]);

  const loadData = async () => {
    setSyncStatus('syncing');
    try {
      const data = await fetchBin(binId);
      if (data) {
        setTransactions(data.transactions || []);
        setPasswordHash(data.passwordHash || null);
      }
      setSyncStatus('success');
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
    }
  };

  const saveData = async (newTransactions: Transaction[], newHash: string | null = passwordHash) => {
    setSyncStatus('syncing');
    try {
      // 1. Save to Firebase (Primary)
      if (user) {
        await saveTransactionsToFirebase(user.uid, newTransactions);
        if (newHash) await saveConfigToFirebase(user.uid, newHash);
      }

      // 2. Save to JSONBin (Secondary)
      await updateBin(binId, { transactions: newTransactions, passwordHash: newHash });
      setSyncStatus('success');
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      setNotification({
        isOpen: true,
        title: 'Login Failed',
        message: 'Could not authenticate with Google. Please try again.',
        type: 'error',
      });
    }
  };

  const handleMigrate = async () => {
    if (!user) {
      setNotification({
        isOpen: true,
        title: 'Authentication Required',
        message: 'Please sign in with Google before migrating your data.',
        type: 'info',
      });
      return;
    }

    if (!confirm('This will migrate all data from the current JSONBin to your private Firebase storage. Continue?')) {
      return;
    }

    setSyncStatus('syncing');
    try {
      // 1. Fetch fresh data from JSONBin
      const data = await fetchBin(binId);
      if (!data || !data.transactions) {
        throw new Error('No data found in JSONBin to migrate.');
      }

      // 2. Save to Firebase
      await saveTransactionsToFirebase(user.uid, data.transactions);
      if (data.passwordHash) {
        await saveConfigToFirebase(user.uid, data.passwordHash);
      }

      setSyncStatus('success');
      setNotification({
        isOpen: true,
        title: 'Migration Successful',
        message: `Successfully migrated ${data.transactions.length} records to your private cloud storage.`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Migration failed', error);
      setSyncStatus('error');
      setNotification({
        isOpen: true,
        title: 'Migration Failed',
        message: error.message || 'An unexpected error occurred during migration.',
        type: 'error',
      });
    }
  };

  const handleAuthenticated = (hash: string) => {
    if (!passwordHash) {
      setPasswordHash(hash);
      saveData(transactions, hash);
      setIsAuthenticated(true);
    } else if (hash === passwordHash) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleAddTransaction = (txData: Partial<Transaction>) => {
    let newTransactions: Transaction[];
    if (selectedTx) {
      newTransactions = transactions.map((t) =>
        t.id === selectedTx.id ? ({ ...t, ...txData } as Transaction) : t
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'BHL-' + Date.now().toString(36).toUpperCase(),
      } as Transaction;
      newTransactions = [...transactions, newTx];
    }
    setTransactions(newTransactions);
    saveData(newTransactions);
    setIsTxModalOpen(false);
    setSelectedTx(null);
  };

  const handleAction = async (action: 'receipt' | 'edit' | 'delete') => {
    if (!selectedTx) return;

    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this record?')) {
        const newTransactions = transactions.filter((t) => t.id !== selectedTx.id);
        setTransactions(newTransactions);
        saveData(newTransactions);
      }
    } else if (action === 'edit') {
      setModalType(selectedTx.type);
      setIsTxModalOpen(true);
    } else if (action === 'receipt') {
      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.download = `Receipt_${selectedTx.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
    setIsActionModalOpen(false);
  };

  const handleBulkDelete = () => {
    const count = transactions.filter((t) => filter === 'all' || t.type === filter).length;
    if (count === 0) return;

    if (confirm(`Delete ${count} items? This will clear records permanently.`)) {
      const newTransactions = filter === 'all' ? [] : transactions.filter((t) => t.type !== filter);
      setTransactions(newTransactions);
      saveData(newTransactions);
    }
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);

      const newEntries: Transaction[] = [];
      rows.forEach((row) => {
        const item = row['Item'] || row['item'];
        const amount = parseFloat(row['Amount'] || row['amount'] || 0);
        const description = row['Description'] || row['description'] || 'Imported Entry';
        const rawDate = row['Date'] || row['date'];
        if (!item || isNaN(amount)) return;

        let finalDate = new Date().toISOString().split('T')[0];
        if (rawDate) {
          let d = new Date(rawDate);
          if (!isNaN(d.getTime())) finalDate = d.toISOString().split('T')[0];
        }

        newEntries.push({
          id: 'BHL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          name: item,
          amount: Math.abs(amount),
          category: description,
          type: amount >= 0 ? 'income' : 'expense',
          date: finalDate,
        });
      });

      const updatedTransactions = [...transactions, ...newEntries];
      setTransactions(updatedTransactions);
      saveData(updatedTransactions);
      alert(`Imported ${newEntries.length} records.`);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Borehole_Treasury_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSwitchBin = () => {
    const newId = prompt('Enter the new Bin ID to connect to:', binId);
    if (newId && newId.length > 10) {
      setBinId(newId);
      localStorage.setItem('borehole_active_bin', newId);
    }
  };

  const totalIncome = transactions.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc), 0);
  const totalExpense = transactions.reduce((acc, t) => (t.type === 'expense' ? acc + t.amount : acc), 0);
  const balance = totalIncome - totalExpense;

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans text-text-primary flex">
      {!isAuthenticated && (
        <AuthOverlay onAuthenticated={handleAuthenticated} isSetup={!passwordHash} />
      )}

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className={cn(
        "flex-1 flex flex-col min-h-screen",
        !isAuthenticated ? 'blur-xl pointer-events-none' : ''
      )}>
        <Header
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          binId={binId}
          syncStatus={syncStatus}
          onUploadExcel={handleExcelUpload}
          onDownloadExcel={handleExcelDownload}
          onSyncCloud={user ? () => saveData(transactions) : undefined}
          onMigrateToCloud={handleMigrate}
          onSwitchBin={handleSwitchBin}
        />

        <main className="flex-1">
          {currentPage === 'journal' ? (
            <JournalPage
              transactions={transactions}
              filter={filter}
              onSetFilter={setFilter}
              onAddIncome={() => {
                setModalType('income');
                setSelectedTx(null);
                setIsTxModalOpen(true);
              }}
              onAddExpense={() => {
                setModalType('expense');
                setSelectedTx(null);
                setIsTxModalOpen(true);
              }}
              onSelectTransaction={(tx) => {
                setSelectedTx(tx);
                setIsActionModalOpen(true);
              }}
              onBulkDelete={handleBulkDelete}
            />
          ) : (
            <AccountingPage transactions={transactions} />
          )}
        </main>

        {/* Firebase Login Prompt */}
        {!user && isAuthenticated && (
          <div className="fixed bottom-8 right-8 z-40">
            <button 
              onClick={handleLogin}
              className="bg-accent text-bg px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[1.5px] shadow-2xl hover:scale-105 transition-all border border-accent/20"
            >
              Cloud Sync with Google
            </button>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleAddTransaction}
        editTx={selectedTx}
        initialType={modalType}
      />

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onAction={handleAction}
      />

      <ReceiptTemplate ref={receiptRef} transaction={selectedTx} />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
