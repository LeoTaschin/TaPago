import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBCaJnrMubayJwuBtS64rBPdXmRsMv2ARw",
  authDomain: "tapago-7c380.firebaseapp.com",
  databaseURL: "https://tapago-7c380-default-rtdb.firebaseio.com",
  projectId: "tapago-7c380",
  storageBucket: "tapago-7c380.firebasestorage.app",
  messagingSenderId: "190072400240",
  appId: "1:190072400240:web:aa93ce0a862c69eec347b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };
export default app; 