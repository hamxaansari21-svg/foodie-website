// =====================================
// FOODIE - CHECKOUT + FIREBASE ORDERS
// =====================================

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================
// GET CART
// =====================================

function getCart() {

    return JSON.parse(
        localStorage.getItem("foodieCart")
    ) || [];

}


// =====================================
// ELEMENTS
// =====================================

const checkoutItems =
    document.getElementById(
        "checkout-items"
    );

const checkoutTotal =
    document.getElementById(
        "checkout-total"
    );

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );

const checkoutContainer =
    document.getElementById(
        "checkout-container"
    );

const successSection =
    document.getElementById(
        "order-success"
    );

const orderIdElement =
    document.getElementById(
        "order-id"
    );


// =====================================
// DISPLAY ORDER SUMMARY
// =====================================

function displayCheckout() {

    const cart = getCart();


    checkoutItems.innerHTML = "";


    if (cart.length === 0) {

        checkoutContainer.innerHTML = `

            <div
                class="checkout-card"
                style="grid-column: 1 / -1;"
            >

                <div class="empty-checkout">

                    <div class="empty-checkout-icon">
                        🛒
                    </div>

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Add some delicious food before checkout.
                    </p>

                    <a href="menu.html">
                        Browse Menu →
                    </a>

                </div>

            </div>

        `;

        return;

    }


    let total = 0;


    cart.forEach(
        function (item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            total += itemTotal;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "checkout-item";


            itemElement.innerHTML = `

                <img
                    src="${item.image}"
                    alt="${item.name}"
                    onerror="this.src='images/food.jpg'"
                >

                <div class="checkout-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ₹${item.price}
                        ×
                        ${item.quantity}
                    </p>

                </div>

                <div class="checkout-item-price">

                    ₹${itemTotal}

                </div>

            `;


            checkoutItems.appendChild(
                itemElement
            );

        }
    );


    checkoutTotal.textContent =
        "₹" + total;

}


// =====================================
// PLACE ORDER
// =====================================

checkoutForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const cart =
            getCart();


        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        // =================================
        // CUSTOMER DETAILS
        // =================================

        const name =
            document
                .getElementById(
                    "customer-name"
                )
                .value
                .trim();


        const phone =
            document
                .getElementById(
                    "customer-phone"
                )
                .value
                .trim();


        const address =
            document
                .getElementById(
                    "customer-address"
                )
                .value
                .trim();


        // =================================
        // PHONE VALIDATION
        // =================================

        if (!/^[0-9]{10}$/.test(phone)) {

            alert(
                "Please enter a valid 10-digit phone number."
            );

            return;

        }


        // =================================
        // CALCULATE TOTAL
        // =================================

        let total = 0;


        cart.forEach(
            function (item) {

                total +=
                    Number(item.price) *
                    Number(item.quantity);

            }
        );


        // =================================
        // BUTTON
        // =================================

        const placeOrderButton =
            document.getElementById(
                "place-order-btn"
            );


        placeOrderButton.disabled =
            true;


        placeOrderButton.textContent =
            "⏳ Placing Order...";


        try {

            // =================================
            // PREPARE ORDER
            // =================================

            const orderData = {

                customerName:
                    name,

                customerPhone:
                    phone,

                deliveryAddress:
                    address,

                items:
                    cart.map(
                        function (item) {

                            return {

                                name:
                                    item.name,

                                price:
                                    Number(
                                        item.price
                                    ),

                                quantity:
                                    Number(
                                        item.quantity
                                    ),

                                image:
                                    item.image

                            };

                        }
                    ),

                totalAmount:
                    total,

                status:
                    "Pending",

                paymentMethod:
                    "Cash on Delivery",

                createdAt:
                    new Date().toISOString()

            };


            // =================================
            // SAVE TO FIREBASE
            // =================================

            const orderRef =
                await addDoc(
                    collection(
                        db,
                        "orders"
                    ),
                    orderData
                );


            console.log(
                "Order saved:",
                orderRef.id
            );


            // =================================
            // CLEAR CART
            // =================================

            localStorage.removeItem(
                "foodieCart"
            );


            // =================================
            // SHOW SUCCESS
            // =================================

            checkoutContainer.style.display =
                "none";


            successSection.style.display =
                "block";


            orderIdElement.textContent =
                orderRef.id;


            window.scrollTo(
                0,
                0
            );


        } catch (error) {

            console.error(
                "Order error:",
                error
            );


            alert(
                "Order place nahi hua. Please try again."
            );


            placeOrderButton.disabled =
                false;


            placeOrderButton.textContent =
                "🛍️ Place Order";

        }

    }
);


// =====================================
// START
// =====================================

displayCheckout();