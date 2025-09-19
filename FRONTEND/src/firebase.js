// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMrOI0ooippJ4sNAhDe9RRN7eUfp3sbT4",
  authDomain: "auth-otp-e8987.firebaseapp.com",
  projectId: "auth-otp-e8987",
  storageBucket: "auth-otp-e8987.firebasestorage.app",
  messagingSenderId: "545016984373",
  appId: "1:545016984373:web:671231ce09bafcf745527c",
  measurementId: "G-Q5DNJ58DDG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Initialize and export auth