import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAvcdK_tyWwMzxThQTX5I_eVde4N-ZS_EI',
  authDomain: 'hospora-c1173.firebaseapp.com',
  projectId: 'hospora-c1173',
  storageBucket: 'hospora-c1173.firebasestorage.app',
  messagingSenderId: '928752158309',
  appId: '1:928752158309:web:2d7c0ed9db6bee2acda88c'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export function withFirebaseTimeout(promise, message = 'Firebase request timed out. Please check your Firestore setup and internet connection.') {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 12000))]);
}
