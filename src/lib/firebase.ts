import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
