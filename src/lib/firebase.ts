
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';

// This configuration is automatically generated and HARDCODED
// to solve environment variable loading issues.
const firebaseConfig = {
  apiKey: "AIzaSyCwVsMeLVj1ThpPomLxP5FmQovZtIXjID0",
  authDomain: "teamflow-82414.firebaseapp.com",
  projectId: "teamflow-82414",
  storageBucket: "teamflow-82414.firebasestorage.app",
  messagingSenderId: "1042024713505",
  appId: "1:1042024713505:web:b84afd310f30cfc8290260",
  measurementId: "G-XJBD9JGRY7"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
    // Client-side execution
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        try {
            // Use initializeFirestore to enable persistence, but only once.
            db = getFirestore(app);
   enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Persistence failed-precondition:", err);
  } else if (err.code === 'unimplemented') {
    console.warn("Persistence unimplemented:", err);
  }
});
        } catch (error) {
            // Firestore with persistence might already be initialized in a race condition
            // If so, we can ignore the error and get the existing instance.
            if ((error as any).code !== 'failed-precondition') {
                 console.error("Firebase client initialization failed:", error);
            }
            db = getFirestore(app);
        }
    } else {
        // Re-use existing app instance
        app = getApp();
        auth = getAuth(app);
        // Get existing Firestore instance without re-initializing persistence
        db = getFirestore(app);
    }
} else {
    // Server-side execution
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

export { app, auth, db };
