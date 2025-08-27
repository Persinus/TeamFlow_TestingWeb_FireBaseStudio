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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Use initializeFirestore to enable persistence
  db = initializeFirestore(app, {
    localCache: enableIndexedDbPersistence()
  });

} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Handle the error appropriately in a real app
}

export { app, auth, db };
