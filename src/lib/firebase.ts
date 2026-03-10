import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log config status (without exposing keys)
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('Missing Firebase Environment Variables:', missingVars.join(', '));
  console.warn('Make sure you have set these in the AI Studio Settings menu.');
} else {
  console.log('Firebase Project ID being used:', firebaseConfig.projectId);
}

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

if (!app) {
  console.error('Firebase App failed to initialize. Check your API Key.');
}

export const db = app ? getFirestore(app) : null;

if (app && !db) {
  console.error('Firestore failed to initialize. Check if Firestore is enabled in your Firebase Console.');
}
