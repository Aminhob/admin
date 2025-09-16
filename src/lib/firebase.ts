import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

// Initialize Firebase only once
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);

  // Use emulators in development
  if (import.meta.env.DEV) {
    // Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    
    // Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    
    // Storage emulator
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    
    // Functions emulator
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
}

// Export initialized services
export { app, auth, db, storage, functions };

// Helper function to get the current user's ID
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Helper function to get the current user's ID token
export const getIdToken = async (): Promise<string | null> => {
  try {
    return await auth.currentUser?.getIdToken() || null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// Helper function to sign out
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Export types
export type { User } from 'firebase/auth';
export type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
export type { StorageReference, UploadTask, UploadTaskSnapshot } from 'firebase/storage';
export type { HttpsCallable, HttpsCallableResult } from 'firebase/functions';
