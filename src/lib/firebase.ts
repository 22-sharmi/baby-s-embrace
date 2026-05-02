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
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE.firebaseapp.com",
  projectId: "REPLACE_PROJECT_ID",
  storageBucket: "REPLACE.appspot.com",
  messagingSenderId: "REPLACE_SENDER_ID",
  appId: "REPLACE_APP_ID",
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
