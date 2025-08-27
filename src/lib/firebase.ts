import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This configuration is automatically generated and HARDCODED
// to solve environment variable loading issues.
const firebaseConfig = {
  apiKey: "AIzaSyBfljlfIo3F3yv9gdimB98QRRwwxpPExkg",
  authDomain: "dev-prototyping-in-web-ide.firebaseapp.com",
  projectId: "dev-prototyping-in-web-ide",
  storageBucket: "dev-prototyping-in-web-ide.appspot.com",
  messagingSenderId: "33342188478",
  appId: "1:33342188478:web:75a7f920d3f545199651e7",
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
