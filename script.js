/* =========================================
   FOODIE CART SYSTEM
========================================= */


/* =========================================
   GET CART
========================================= */

function getCart() {

    const cart =
        JSON.parse(
            localStorage.getItem("foodieCart")
        ) || [];

    return cart;

}


/* =========================================
   SAVE CART
========================================= */

function saveCart(cart) {

    localStorage.setItem(
        "foodieCart",
        JSON.stringify(cart)
    );

}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(name, price, image) {

    let cart = getCart();

    const existingItem =
        cart.find(function(item) {

            return item.name === name;

        });


    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity) + 1;

    } else {

        cart.push({

            name: name,

            price: Number(price),

            image: image,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();

}


/* =========================================
   UPDATE CART COUNT
========================================= */

function updateCartCount() {

    const cart = getCart();

    const countElement =
        document.getElementById(
            "cart-count"
        );


    if (!countElement) {

        return;

    }


    let totalItems = 0;


    cart.forEach(function(item) {

        totalItems +=
            Number(item.quantity) || 0;

    });


    countElement.textContent =
        totalItems;

}


/* =========================================
   DISPLAY CART
========================================= */

function displayCart() {

    const cart = getCart();

    const cartContainer =
        document.getElementById(
            "cart-items"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );

    const summaryItems =
        document.getElementById(
            "summary-items"
        );


    if (!cartContainer) {

        return;

    }


    /* EMPTY CART */

    if (cart.length === 0) {

        cartContainer.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add some delicious food
                    to your cart!
                </p>

                <a href="menu.html">
                    Browse Menu →
                </a>

            </div>

        `;


        if (cartTotal) {

            cartTotal.textContent =
                "₹0";

        }


        if (summaryItems) {

            summaryItems.textContent =
                "0";

        }


        return;

    }


    /* CART HAS ITEMS */

    cartContainer.innerHTML = "";


    let total = 0;

    let totalItems = 0;


    cart.forEach(function(item, index) {


        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 1;


        const itemTotal =
            price * quantity;


        total += itemTotal;

        totalItems += quantity;


        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <img
                src="${item.image || "images/food.jpg"}"
                alt="${item.name}"
                onerror="this.src='images/food.jpg'"
            >


            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ₹${price} each
                </p>

            </div>


            <div class="quantity-controls">

                <button
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>


                <span>
                    ${quantity}
                </span>


                <button
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

            </div>


            <div class="item-total">

                ₹${itemTotal}

            </div>


            <button
                class="remove-btn"
                onclick="removeFromCart(${index})"
            >
                🗑️
            </button>

        `;


        cartContainer.appendChild(
            cartItem
        );

    });


    /* TOTAL AMOUNT */

    if (cartTotal) {

        cartTotal.textContent =
            "₹" + total;

    }


    /* TOTAL ITEMS */

    if (summaryItems) {

        summaryItems.textContent =
            totalItems;

    }

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(index) {

    let cart = getCart();


    if (!cart[index]) {

        return;

    }


    cart[index].quantity =
        Number(cart[index].quantity) + 1;


    saveCart(cart);

    displayCart();

    updateCartCount();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(index) {

    let cart = getCart();


    if (!cart[index]) {

        return;

    }


    const quantity =
        Number(cart[index].quantity);


    if (quantity > 1) {

        cart[index].quantity =
            quantity - 1;

    } else {

        cart.splice(index, 1);

    }


    saveCart(cart);

    displayCart();

    updateCartCount();

}


/* =========================================
   REMOVE ITEM
========================================= */

function removeFromCart(index) {

    let cart = getCart();


    if (!cart[index]) {

        return;

    }


    const itemName =
        cart[index].name;


    cart.splice(index, 1);


    saveCart(cart);

    displayCart();

    updateCartCount();


    console.log(
        itemName +
        " removed from cart."
    );

}


/* =========================================
   CLEAR CART
========================================= */

function clearCart() {

    localStorage.removeItem(
        "foodieCart"
    );

    displayCart();

    updateCartCount();

}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateCartCount();

        displayCart();

    }
);