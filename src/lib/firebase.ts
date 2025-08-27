import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwVsMeLVj1ThpPomLxP5FmQovZtIXjID0",
  authDomain: "teamflow-82414.firebaseapp.com",
  projectId: "teamflow-82414",
  storageBucket: "teamflow-82414.appspot.com", // ✅ đúng chuẩn
  messagingSenderId: "1042024713505",
  appId: "1:1042024713505:web:b84afd310f30cfc8290260",
  measurementId: "G-XJBD9JGRY7",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// 👉 Bật persistence nhưng chỉ chạy trên client
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("⚠️ Persistence failed-precondition:", err);
    } else if (err.code === "unimplemented") {
      console.warn("⚠️ Persistence unimplemented:", err);
    }
  });
}

export { app, auth, db };
