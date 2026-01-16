import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null;
let auth: Auth | null;
let db: Firestore | null;

const isConfigProvided = firebaseConfig.apiKey && firebaseConfig.projectId;

if (isConfigProvided) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.error("Firebase initialization failed. This is likely due to invalid or missing environment variables in .env. Please check your configuration.", e);
        app = null;
        auth = null;
        db = null;
    }
} else {
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Firebase configuration is missing or incomplete. Please check your .env file. The app will run without Firebase functionality.");
    }
    app = null;
    auth = null;
    db = null;
}

export { app, auth, db };
