import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC09MCrzW7VUKprUF0PIa1BJPuZLCFtnQo",
  authDomain: "flowstate-c298b.firebaseapp.com",
  projectId: "flowstate-c298b",
  storageBucket: "flowstate-c298b.firebasestorage.app",
  messagingSenderId: "978496857334",
  appId: "1:978496857334:web:b329272fecc23c0e82b8d7",
  measurementId: "G-Z5RGMV96WT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };
