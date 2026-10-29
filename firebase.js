import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDR-Z5gWkWEwI-x-w04vbNHDvt5mZzPzuM",
    authDomain: "ai-chatbot-93b9e.firebaseapp.com",
    projectId: "ai-chatbot-93b9e",
    storageBucket: "ai-chatbot-93b9e.firebasestorage.app",
    messagingSenderId: "831444018668",
    appId: "1:831444018668:web:1c7a924bae7d7a3dec8cc9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
};
