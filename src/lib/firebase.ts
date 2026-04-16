import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc, writeBatch, getDocFromServer } from 'firebase/firestore';

// Standard import for the local config
import localConfig from '../../firebase-applet-config.json';

// Helper to get non-empty env or fallback
const getEnv = (key: string, fallback: string) => {
  const val = import.meta.env[key];
  return (val && typeof val === 'string' && val.trim() !== '') ? val : fallback;
};

// Support for environment variables (Vercel/Production) with fallback to local config
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', localConfig.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', localConfig.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', localConfig.projectId),
  appId: getEnv('VITE_FIREBASE_APP_ID', localConfig.appId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', (localConfig as any).storageBucket || ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', (localConfig as any).messagingSenderId || ''),
};

const databaseId = getEnv('VITE_FIREBASE_DATABASE_ID', localConfig.firestoreDatabaseId || '(default)');

// Debugging
console.log('Firebase Initialization:', {
  env: import.meta.env.MODE,
  projectId: firebaseConfig.projectId,
  databaseId: databaseId,
  hasApiKey: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const googleProvider = new GoogleAuthProvider();

// Connection Test
async function testConnection() {
  try {
    // Try to fetch a non-existent doc to test connectivity
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firebase connection test: SUCCESS");
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error("Firebase connection test: FAILED (Client is offline). Check your API Key and Project ID.");
    } else {
      console.log("Firebase connection test: COMPLETED (Connectivity confirmed)");
    }
  }
}
testConnection();

export { signInWithPopup, doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc, writeBatch };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
