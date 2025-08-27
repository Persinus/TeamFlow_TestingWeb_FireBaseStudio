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
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(), // Cho phép nhiều tab
    }),
  });
} else {
  db = initializeFirestore(app, {}); // server-side không cần cache
}

/**
 * Example service function: getTask by id
 */
export const getTask = async (taskId: string) => {
  const taskRef = doc(db, "tasks", taskId);

  // Thử cache trước
  try {
    const cachedSnap = await getDocFromCache(taskRef);
    if (cachedSnap.exists()) {
      console.log("✅ Lấy từ cache");
      return { id: cachedSnap.id, ...cachedSnap.data() };
    }
  } catch (err) {
    console.warn("⚠️ Không có trong cache:", err);
  }

  // Nếu không có thì fallback server
  try {
    const serverSnap = await getDocFromServer(taskRef);
    if (serverSnap.exists()) {
      console.log("🌐 Lấy từ server");
      return { id: serverSnap.id, ...serverSnap.data() };
    }
  } catch (err) {
    console.error("❌ Không thể lấy từ server:", err);
    throw err;
  }

  return null;
};

export { app, auth, db };
