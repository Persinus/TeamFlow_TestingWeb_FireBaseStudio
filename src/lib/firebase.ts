import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';

// This configuration is automatically generated and HARDCODED
// to solve environment variable loading issues.
const firebaseConfig = {
  "apiKey": "AIzaSyCwVsMeLVj1ThpPomLxP5FmQovZtIXjID0",
  "authDomain": "teamflow-82414.firebaseapp.com",
  "projectId": "teamflow-82414",
  "storageBucket": "teamflow-82414.firebasestorage.app",
  "messagingSenderId": "1042024713505",
  "appId": "1:1042024713505:web:b84afd310f30cfc8290260"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
    // Client-side execution
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        // Use initializeFirestore to enable persistence, but only once.
        db = initializeFirestore(app, {
            localCache: enableIndexedDbPersistence()
        });
    } catch (error) {
        console.error("Firebase client initialization failed:", error);
    }
} else if (getApps().length) {
    // Re-use existing app instance (client or server)
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    // Server-side execution
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}


export { app, auth, db };
