import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This configuration is automatically generated and HARDCODED
// to solve environment variable loading issues.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE",
};


// Initialize Firebase
const app = 
    !getApps().length && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE"
    ? initializeApp(firebaseConfig) 
    : getApps().length > 0 
    ? getApp()
    : null;


const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { app, auth, db };
