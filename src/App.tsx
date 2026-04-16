import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { Transaction, FilterType, PageType } from './types';
import { cn } from './lib/utils';
import { auth, db, googleProvider, signInWithPopup, onSnapshot, doc } from './lib/firebase';
import { saveTransactionsToFirebase, saveConfigToFirebase } from './services/firebaseService';
import Header from './components/Header';
import JournalPage from './components/JournalPage';
import AccountingPage from './components/AccountingPage';
import SettingsPage from './components/SettingsPage';
import Navigation from './components/Navigation';
import AuthOverlay from './components/AuthOverlay';
import TransactionModal from './components/TransactionModal';
import ActionModal from './components/ActionModal';
import ReceiptTemplate from './components/ReceiptTemplate';
import NotificationModal from './components/NotificationModal';

const DEFAULT_BIN_ID = '69ad987d43b1c97be9c15dd3';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [passwordHash, setPasswordHash] = useState<string | null>(null);
  const [guestPasswordHash, setGuestPasswordHash] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'success' | 'error' | 'warning'>('syncing');
  const [dataSource, setDataSource] = useState<'firebase' | 'local' | 'syncing'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>(undefined);
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

    const unsubscribe = onSnapshot(doc(db, 'shared', 'transactions'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const txs = (data.transactions || []) as Transaction[];
        setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setDataSource('firebase');
      }
      setLastSyncTime(new Date());
      setIsAuthReady(true);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsAuthReady(true);
    });

    const configUnsubscribe = onSnapshot(doc(db, 'shared', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPasswordHash(data.passwordHash);
        setGuestPasswordHash(data.guestPasswordHash || null);
      }
    });

    return () => {
      unsubscribe();
      configUnsubscribe();
    };
  }, [user]);

  // Initial Load (Firebase only)
  useEffect(() => {
    if (isAuthReady && !user) {
      // If not logged in, we still want to show the auth overlay
      // But we don't load data until authenticated
    }
  }, [isAuthReady, user]);

  const saveData = async (newTransactions: Transaction[], newHash: string | null = passwordHash, newGuestHash: string | null = guestPasswordHash) => {
    setSyncStatus('syncing');
    try {
      if (user) {
        await saveTransactionsToFirebase(user.uid, newTransactions);
        if (newHash) await saveConfigToFirebase(user.uid, newHash, newGuestHash);
      }
      setLastSyncTime(new Date());
      setDataSource('firebase');
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

  const handleAuthenticated = (hash: string, asGuest: boolean = false) => {
    if (!passwordHash) {
      setPasswordHash(hash);
      saveData(transactions, hash);
      setIsAuthenticated(true);
      setIsGuest(false);
    } else if (asGuest) {
      if (hash === guestPasswordHash) {
        setIsAuthenticated(true);
        setIsGuest(true);
      } else {
        alert('Incorrect guest password');
      }
    } else if (hash === passwordHash) {
      setIsAuthenticated(true);
      setIsGuest(false);
    } else {
      alert('Incorrect password');
    }
  };

  const handleAddTransaction = (txData: Partial<Transaction>) => {
    if (isGuest) return;
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
      if (isGuest) return;
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
    if (isGuest) return;
    const count = transactions.filter((t) => filter === 'all' || t.type === filter).length;
    if (count === 0) return;

    if (confirm(`Delete ${count} items? This will clear records permanently.`)) {
      const newTransactions = filter === 'all' ? [] : transactions.filter((t) => t.type !== filter);
      setTransactions(newTransactions);
      saveData(newTransactions);
    }
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isGuest) return;
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

  const handleSetGuestPassword = (hash: string) => {
    setGuestPasswordHash(hash);
    saveData(transactions, passwordHash, hash);
  };

  const handleRevokeGuestPassword = () => {
    setGuestPasswordHash(null);
    saveData(transactions, passwordHash, null);
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
    <div className="min-h-screen bg-bg font-sans text-text-primary flex flex-col sm:flex-row">
      {!isAuthenticated && (
        <AuthOverlay 
          onAuthenticated={handleAuthenticated} 
          isSetup={!passwordHash} 
          hasGuestAccess={!!guestPasswordHash}
        />
      )}

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} isGuest={isGuest} />

      <div className={cn(
        "flex-1 flex flex-col min-h-screen pb-16 sm:pb-0",
        !isAuthenticated ? 'blur-xl pointer-events-none' : ''
      )}>
        <Header
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          syncStatus={syncStatus}
          dataSource={dataSource}
          lastSyncTime={lastSyncTime}
          onUploadExcel={isGuest ? () => {} : handleExcelUpload}
          onDownloadExcel={handleExcelDownload}
        />

        <main className="flex-1">
          {currentPage === 'journal' ? (
            <JournalPage
              transactions={transactions}
              filter={filter}
              onSetFilter={setFilter}
              onAddIncome={isGuest ? () => {} : () => {
                setModalType('income');
                setSelectedTx(null);
                setIsTxModalOpen(true);
              }}
              onAddExpense={isGuest ? () => {} : () => {
                setModalType('expense');
                setSelectedTx(null);
                setIsTxModalOpen(true);
              }}
              onSelectTransaction={(tx) => {
                setSelectedTx(tx);
                setIsActionModalOpen(true);
              }}
              onBulkDelete={isGuest ? () => {} : handleBulkDelete}
            />
          ) : currentPage === 'accounting' ? (
            <AccountingPage transactions={transactions} />
          ) : (
            <SettingsPage 
              onSetGuestPassword={handleSetGuestPassword} 
              onRevokeGuestPassword={handleRevokeGuestPassword}
              hasGuestPassword={!!guestPasswordHash}
              isGuest={isGuest}
            />
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
