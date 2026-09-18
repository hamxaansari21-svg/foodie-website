import { db } from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


async function testFirebase() {

    try {

        const docRef = await addDoc(
            collection(db, "foods"),
            {
                name: "Test Burger",
                price: 149,
                category: "burger",
                description: "Firebase test food",
                rating: 4.8,
                badge: "TEST"
            }
        );

        console.log(
            "Firebase Connected Successfully! Document ID:",
            docRef.id
        );

    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );

    }
}

testFirebase();