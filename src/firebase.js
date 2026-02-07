import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-oUfl6Dnl6ZjzXvwPu1nLrqzJdQghSGI",
  authDomain: "fun-quiz-new.firebaseapp.com",
  projectId: "fun-quiz-new",
  storageBucket: "fun-quiz-new.firebasestorage.app",
  messagingSenderId: "693750914800",
  appId: "1:693750914800:web:4d0383306023f477cb6c35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
