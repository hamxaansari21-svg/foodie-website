import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

/* =========================================
   FOOD FORM
========================================= */

const foodForm = document.getElementById("food-form");
const imageInput = document.getElementById("food-image");
const imagePreview = document.getElementById("image-preview");
const imagePreviewContainer =
    document.getElementById("image-preview-container");

let editingFoodId = null;


/* =========================================
   IMAGE PREVIEW
========================================= */

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        imagePreviewContainer.style.display = "none";
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        imageInput.value = "";
        imagePreviewContainer.style.display = "none";

        return;
    }

    imagePreview.src =
        URL.createObjectURL(file);

    imagePreviewContainer.style.display =
        "block";

});


/* =========================================
   COMPRESS IMAGE
========================================= */

function compressImage(file) {

    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                const canvas =
                    document.createElement("canvas");

                const maxWidth = 800;
                const maxHeight = 600;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {

                    height =
                        height * (maxWidth / width);

                    width = maxWidth;

                }

                if (height > maxHeight) {

                    width =
                        width * (maxHeight / height);

                    height = maxHeight;

                }

                canvas.width =
                    Math.round(width);

                canvas.height =
                    Math.round(height);

                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const compressedImage =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.7
                    );

                resolve(compressedImage);

            };

            img.onerror = function () {

                reject(
                    new Error(
                        "Image could not be loaded."
                    )
                );

            };

            img.src = event.target.result;

        };

        reader.onerror = function () {

            reject(
                new Error(
                    "Image could not be read."
                )
            );

        };

        reader.readAsDataURL(file);

    });

}


/* =========================================
   ADD / UPDATE FOOD
========================================= */

foodForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("food-name").value.trim();

        const price =
            Number(
                document.getElementById("food-price").value
            );

        const category =
            document.getElementById("food-category").value.trim();

        const description =
            document.getElementById("food-description").value.trim();

        const rating =
            Number(
                document.getElementById("food-rating").value
            );

        const badge =
            document.getElementById("food-badge").value;

        const imageFile =
            imageInput.files[0];


        try {

            const submitButton =
                foodForm.querySelector(
                    'button[type="submit"]'
                );

            submitButton.disabled = true;

            submitButton.textContent =
                editingFoodId
                    ? "⏳ Updating Food..."
                    : "⏳ Adding Food...";


            let image = null;


            if (imageFile) {

                image =
                    await compressImage(imageFile);

                const imageSize =
                    new Blob([image]).size;

                if (imageSize > 900000) {

                    alert(
                        "Image is too large. Please choose a smaller image."
                    );

                    submitButton.disabled = false;

                    submitButton.textContent =
                        editingFoodId
                            ? "✏️ Update Food"
                            : "➕ Add Food";

                    return;
                }

            }


            /* UPDATE */

            if (editingFoodId) {

                const updateData = {

                    name: name,
                    price: price,
                    category: category,
                    description: description,
                    rating: rating,
                    badge: badge

                };

                if (image) {
                    updateData.image = image;
                }

                await updateDoc(
                    doc(
                        db,
                        "foods",
                        editingFoodId
                    ),
                    updateData
                );

                alert(
                    "Food updated successfully! ✅"
                );

                editingFoodId = null;

            }


            /* ADD */

            else {

                if (!imageFile) {

                    alert(
                        "Please choose a food image first. 📷"
                    );

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "➕ Add Food";

                    return;
                }

                await addDoc(
                    collection(db, "foods"),
                    {
                        name: name,
                        price: price,
                        category: category,
                        description: description,
                        rating: rating,
                        badge: badge,
                        image: image,
                        createdAt:
                            new Date().toISOString()
                    }
                );

                alert(
                    "Food added successfully! 🍔🔥"
                );

            }


            foodForm.reset();

            imagePreviewContainer.style.display =
                "none";

            imagePreview.src = "";

            submitButton.disabled = false;

            submitButton.textContent =
                "➕ Add Food";

            loadFoods();

        }


        catch (error) {

            console.error(
                "Food operation error:",
                error
            );

            alert(
                "Food save/update nahi hua."
            );

            const submitButton =
                foodForm.querySelector(
                    'button[type="submit"]'
                );

            submitButton.disabled = false;

            submitButton.textContent =
                editingFoodId
                    ? "✏️ Update Food"
                    : "➕ Add Food";

        }

    }
);


/* =========================================
   LOAD FOODS
========================================= */

async function loadFoods() {

    const foodList =
        document.getElementById(
            "admin-food-list"
        );

    const foodCount =
        document.getElementById(
            "food-count"
        );

    try {

        const querySnapshot =
            await getDocs(
                collection(db, "foods")
            );

        foodList.innerHTML = "";

        let count = 0;

        querySnapshot.forEach(
            function (foodDoc) {

                count++;

                const food =
                    foodDoc.data();

                const foodItem =
                    document.createElement("div");

                foodItem.className =
                    "admin-food-item";

                foodItem.innerHTML = `

                    <div class="admin-food-info">

                        ${
                            food.image
                            ?
                            `
                            <img
                                src="${food.image}"
                                alt="${food.name}"
                                style="
                                    width:70px;
                                    height:70px;
                                    object-fit:cover;
                                    border-radius:10px;
                                    margin-bottom:8px;
                                "
                            >
                            `
                            :
                            ""
                        }

                        <h3>
                            ${food.name}
                        </h3>

                        <p>
                            ₹${food.price}
                        </p>

                        <small>
                            ${food.category}
                        </small>

                    </div>

                    <div style="
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                    ">

                        <button
                            class="edit-food-btn"
                            onclick="editFood('${foodDoc.id}')"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-food-btn"
                            onclick="deleteFood('${foodDoc.id}')"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;

                foodList.appendChild(foodItem);

            }
        );

        foodCount.textContent =
            count +
            (count === 1 ? " Item" : " Items");


        if (count === 0) {

            foodList.innerHTML = `
                <div class="admin-loading">
                    No food items found.
                </div>
            `;

        }

    }

    catch (error) {

        console.error(
            "Error loading foods:",
            error
        );

        foodList.innerHTML = `
            <div class="admin-loading">
                Unable to load foods.
            </div>
        `;

    }

}


/* =========================================
   EDIT FOOD
========================================= */

window.editFood = async function (id) {

    try {

        const querySnapshot =
            await getDocs(
                collection(db, "foods")
            );

        let selectedFood = null;

        querySnapshot.forEach(
            function (foodDoc) {

                if (foodDoc.id === id) {
                    selectedFood =
                        foodDoc.data();
                }

            }
        );

        if (!selectedFood) {

            alert("Food not found.");

            return;

        }

        document.getElementById(
            "food-name"
        ).value =
            selectedFood.name || "";

        document.getElementById(
            "food-price"
        ).value =
            selectedFood.price || "";

        document.getElementById(
            "food-category"
        ).value =
            selectedFood.category || "";

        document.getElementById(
            "food-description"
        ).value =
            selectedFood.description || "";

        document.getElementById(
            "food-rating"
        ).value =
            selectedFood.rating || "";

        document.getElementById(
            "food-badge"
        ).value =
            selectedFood.badge || "";

        if (selectedFood.image) {

            imagePreview.src =
                selectedFood.image;

            imagePreviewContainer.style.display =
                "block";

        }

        editingFoodId = id;

        const submitButton =
            foodForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.textContent =
            "✏️ Update Food";

        foodForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    catch (error) {

        console.error(
            "Error editing food:",
            error
        );

        alert(
            "Food details load nahi hue."
        );

    }

};


/* =========================================
   DELETE FOOD
========================================= */

window.deleteFood = async function (id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this food?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "foods",
                id
            )
        );

        alert(
            "Food deleted successfully! 🗑️"
        );

        loadFoods();

    }

    catch (error) {

        console.error(
            "Error deleting food:",
            error
        );

        alert(
            "Food delete nahi hua."
        );

    }

};


/* =========================================
   ALL ORDERS DATA
========================================= */

let allOrders = [];


/* =========================================
   LOAD ORDERS
========================================= */

async function loadOrders() {

    const orderList =
        document.getElementById(
            "admin-order-list"
        );

    const orderCount =
        document.getElementById(
            "order-count"
        );

    try {

        const querySnapshot =
            await getDocs(
                collection(db, "orders")
            );

        allOrders = [];


        querySnapshot.forEach(
            function (orderDoc) {

                allOrders.push({

                    id: orderDoc.id,

                    data: orderDoc.data()

                });

            }
        );


        displayOrders(allOrders);

    }

    catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        orderList.innerHTML = `
            <div class="admin-loading">
                ❌ Unable to load orders.
            </div>
        `;

    }

}


/* =========================================
   DISPLAY ORDERS
========================================= */

function displayOrders(orders) {

    const orderList =
        document.getElementById(
            "admin-order-list"
        );

    const orderCount =
        document.getElementById(
            "order-count"
        );


    orderList.innerHTML = "";


    orderCount.textContent =
        orders.length +
        (orders.length === 1
            ? " Order"
            : " Orders");


    if (orders.length === 0) {

        orderList.innerHTML = `
            <div class="admin-loading">
                😔 No matching orders found.
            </div>
        `;

        return;

    }


    orders.forEach(
        function (orderInfo) {

            const orderDocId =
                orderInfo.id;

            const order =
                orderInfo.data;

            const currentStatus =
                order.status || "Pending";


            let itemsHTML = "";


            if (
                order.items &&
                Array.isArray(order.items)
            ) {

                order.items.forEach(
                    function (item) {

                        itemsHTML += `

                            <div>
                                🍴 ${item.name}
                                × ${item.quantity}
                                — ₹${item.price}
                            </div>

                        `;

                    }
                );

            }


            const orderItem =
                document.createElement(
                    "div"
                );


            orderItem.className =
                "admin-food-item";


            orderItem.innerHTML = `

                <div class="admin-food-info">

                    <h3>
                        📦 Order #${orderDocId.slice(0, 6)}
                    </h3>


                    <p>
                        👤 ${order.customerName || "Unknown"}
                    </p>


                    <small>
                        📱 ${order.customerPhone || "-"}
                    </small>


                    <br>


                    <small>
                        📍 ${order.address || "-"},
                        ${order.city || ""}
                        - ${order.pincode || ""}
                    </small>


                    <div style="
                        margin-top:12px;
                        color:#555;
                        font-size:13px;
                        line-height:1.7;
                    ">

                        <strong>
                            🛒 Order Items
                        </strong>

                        ${itemsHTML}

                    </div>


                    <p style="
                        margin-top:10px;
                        margin-bottom:8px;
                    ">

                        💰 Total:
                        <strong>
                            ₹${order.total || 0}
                        </strong>

                    </p>


                    <div style="
                        margin-top:12px;
                        padding:10px;
                        background:#fff7f2;
                        border-radius:10px;
                    ">

                        📊 Current Status:

                        <strong>
                            ${currentStatus}
                        </strong>

                    </div>


                    <!-- STATUS BUTTONS -->

                    <div style="
                        margin-top:12px;
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                    ">

                        <button
                            class="edit-food-btn"
                            onclick="updateOrderStatus('${orderDocId}', 'Confirmed')"
                        >
                            ✅ Confirm
                        </button>


                        <button
                            class="edit-food-btn"
                            onclick="updateOrderStatus('${orderDocId}', 'Preparing')"
                        >
                            👨‍🍳 Preparing
                        </button>


                        <button
                            class="edit-food-btn"
                            onclick="updateOrderStatus('${orderDocId}', 'Out for Delivery')"
                        >
                            🛵 Out for Delivery
                        </button>


                        <button
                            class="edit-food-btn"
                            onclick="updateOrderStatus('${orderDocId}', 'Delivered')"
                        >
                            🎉 Delivered
                        </button>

                    </div>

                </div>

            `;


            orderList.appendChild(
                orderItem
            );

        }
    );

}


/* =========================================
   UPDATE ORDER STATUS
========================================= */

window.updateOrderStatus =
    async function (
        orderId,
        newStatus
    ) {

        try {

            await updateDoc(

                doc(
                    db,
                    "orders",
                    orderId
                ),

                {
                    status: newStatus
                }

            );


            alert(
                "Order status changed to " +
                newStatus +
                " ✅"
            );


            await loadOrders();

        }

        catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                "Status update nahi hua ❌"
            );

        }

    };


/* =========================================
   ORDER SEARCH
========================================= */

const orderSearch =
    document.getElementById(
        "order-search"
    );


if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        function () {

            const searchValue =
                orderSearch.value
                    .toLowerCase()
                    .trim();


            if (searchValue === "") {

                displayOrders(
                    allOrders
                );

                return;

            }


            const filteredOrders =
                allOrders.filter(
                    function (orderInfo) {

                        const order =
                            orderInfo.data;

                        const orderId =
                            orderInfo.id
                                .toLowerCase();

                        const name =
                            (
                                order.customerName ||
                                ""
                            )
                            .toLowerCase();

                        const phone =
                            (
                                order.customerPhone ||
                                ""
                            )
                            .toLowerCase();


                        return (

                            name.includes(
                                searchValue
                            )

                            ||

                            phone.includes(
                                searchValue
                            )

                            ||

                            orderId.includes(
                                searchValue
                            )

                        );

                    }
                );


            displayOrders(
                filteredOrders
            );

        }
    );

}


/* =========================================
   START ADMIN PANEL
========================================= */

onAuthStateChanged(auth, function(user) {

    if (user) {

        loadFoods();
        loadOrders();

    } else {

        window.location.href = "admin-login.html";

    }

});
const logoutBtn =
    document.getElementById("logout-btn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function() {

        try {

            await signOut(auth);

            window.location.href =
                "admin-login.html";

        } catch (error) {

            console.error("Logout Error:", error);

        }

    });

}