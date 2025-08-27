import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromCache,
  getDocFromServer,
  Firestore
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCwVsMeLVj1ThpPomLxP5FmQovZtIXjID0",
  authDomain: "teamflow-82414.firebaseapp.com",
  projectId: "teamflow-82414",
  storageBucket: "teamflow-82414.appspot.com",
  messagingSenderId: "1042024713505",
  appId: "1:1042024713505:web:b84afd310f30cfc8290260",
  measurementId: "G-XJBD9JGRY7",
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

// ✅ Firestore with new persistence API
let db: Firestore;
if (typeof window !== "undefined") {
   try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (e) {
    // This can happen if the code is hot-reloaded, we can ignore it.
    if ((e as any).code !== 'failed-precondition') {
        console.error("Firebase initialization error", e);
    }
  }
} else {
  db = initializeFirestore(app, {}); // server-side does not need cache
}


export { app, auth, db };