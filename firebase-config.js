import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAl-GXhBr8_mzvU73qI0V7ZopPAPTMFry4",
    authDomain: "foodie-2c118.firebaseapp.com",
    projectId: "foodie-2c118",
    storageBucket: "foodie-2c118.firebasestorage.app",
    messagingSenderId: "1043847614433",
    appId: "1:1043847614433:web:eb4a388cbadd98f9d84ca0",
    measurementId: "G-5TR7VERSM6"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


export { app, db, auth };