import { initializeApp, getApps } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// 🔧 REPLACE these values with your Firebase web config.
// Firebase Console → Project Settings → Your apps → Web app → Config.
// These are publishable values and safe to ship in client code.
export const firebaseConfig = {
  apiKey: "AIzaSyABPzlHOWvhm-tgxi8yQtxwoCFB5QuAk8c",
  authDomain: "dear-little-one-app.firebaseapp.com",
  projectId: "dear-little-one-app",
  storageBucket: "dear-little-one-app.firebasestorage.app",
  messagingSenderId: "569903138172",
  appId: "1:569903138172:web:24b8de655676a1742110f9"
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("REPLACE");

const app = getApps()[0] ?? initializeApp(firebaseConfig);

// Firestore with offline persistence (multi-tab safe).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  ignoreUndefinedProperties: true,
});
