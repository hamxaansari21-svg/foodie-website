import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const loginForm =
    document.getElementById("login-form");


loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        if (!email || !password) {

            alert(
                "Please enter email and password ❌"
            );

            return;
        }


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            // Direct Admin Panel
            window.location.href =
                "admin.html";


        } catch (error) {

            console.error(
                "Firebase Login Error:",
                error
            );


            alert(
                "Invalid email or password ❌"
            );

        }

    }
);