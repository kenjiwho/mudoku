// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBMFw0rnrh-9YJLlRPqCjdxvkK8Oe-ce7o',
  authDomain: 'mudoku-c4f0f.firebaseapp.com',
  databaseURL: 'https://mudoku-c4f0f-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'mudoku-c4f0f',
  storageBucket: 'mudoku-c4f0f.firebasestorage.app',
  messagingSenderId: '835390771395',
  appId: '1:835390771395:web:fa8e2cebf1bf528cbed276',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
