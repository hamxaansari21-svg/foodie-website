// =====================================
// FOODIE - DYNAMIC FIREBASE MENU
// =====================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================
// ELEMENTS
// =====================================

const foodGrid =
    document.getElementById("food-grid");

const categoryButtons =
    document.getElementById("category-buttons");

const searchInput =
    document.getElementById("food-search");


// =====================================
// STORE FOODS
// =====================================

let allFoods = [];


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================
// GET REVIEWS
// =====================================

async function getReviews(foodId) {

    const reviewsQuery =
        query(
            collection(db, "reviews"),
            where("foodId", "==", foodId)
        );

    const snapshot =
        await getDocs(reviewsQuery);

    return snapshot.docs.map(
        function(doc) {
            return doc.data();
        }
    );

}


// =====================================
// LOAD REVIEWS IN MODAL
// =====================================

async function loadReviewsInModal(food) {

    const reviewList =
        document.getElementById("review-list");

    reviewList.innerHTML =
        "⏳ Loading reviews...";


    try {

        const reviews =
            await getReviews(food.id);


        if (reviews.length === 0) {

            reviewList.innerHTML = `
                <div class="review-item">
                    <p>
                        ⭐ No reviews yet.
                        Be the first to review!
                    </p>
                </div>
            `;

            return;

        }


        reviewList.innerHTML = "";


        reviews.forEach(
            function(review) {

                const item =
                    document.createElement("div");

                item.className =
                    "review-item";


                const stars =
                    "⭐".repeat(
                        Math.min(
                            5,
                            Math.max(
                                1,
                                Number(review.rating)
                            )
                        )
                    );


                item.innerHTML = `

                    <strong>
                        ${stars}
                        ${Number(review.rating).toFixed(1)}/5
                    </strong>

                    <p>
                        ${escapeHTML(review.comment)}
                    </p>

                `;


                reviewList.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Review Loading Error:",
            error
        );

        reviewList.innerHTML = `
            <div class="review-item">
                ❌ Unable to load reviews.
            </div>
        `;

    }

}


// =====================================
// OPEN REVIEW MODAL
// =====================================

async function openReviewModal(food) {

    const modal =
        document.getElementById(
            "review-modal"
        );

    const foodName =
        document.getElementById(
            "review-food-name"
        );

    const commentBox =
        document.getElementById(
            "review-comment"
        );

    const starButtons =
        document.querySelectorAll(
            "#star-rating button"
        );


    modal.style.display = "flex";


    foodName.textContent =
        "⭐ " + food.name + " Reviews";


    commentBox.value = "";


    starButtons.forEach(
        function(button) {

            button.classList.remove(
                "selected"
            );

        }
    );


    // LOAD EXISTING REVIEWS

    await loadReviewsInModal(food);


    let selectedRating = 0;


    // =====================================
    // STAR RATING
    // =====================================

    starButtons.forEach(
        function(button) {

            button.onclick =
                function() {

                    selectedRating =
                        Number(
                            button.dataset.rating
                        );


                    starButtons.forEach(
                        function(star) {

                            star.classList.toggle(
                                "selected",
                                Number(
                                    star.dataset.rating
                                ) <= selectedRating
                            );

                        }
                    );

                };

        }
    );


    // =====================================
    // SUBMIT REVIEW
    // =====================================

    const submitButton =
        document.getElementById(
            "submit-review"
        );


    submitButton.onclick =
        async function() {

            const comment =
                commentBox.value.trim();


            if (selectedRating === 0) {

                alert(
                    "⭐ Please select a rating."
                );

                return;

            }


            if (!comment) {

                alert(
                    "✍️ Please write a review."
                );

                return;

            }


            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";


            try {

                await addDoc(
                    collection(db, "reviews"),
                    {

                        foodId:
                            food.id,

                        foodName:
                            food.name,

                        rating:
                            selectedRating,

                        comment:
                            comment,

                        createdAt:
                            new Date()
                                .toISOString()

                    }
                );


                commentBox.value = "";


                starButtons.forEach(
                    function(star) {

                        star.classList.remove(
                            "selected"
                        );

                    }
                );


                selectedRating = 0;


                const reviewList =
    document.getElementById("review-list");

reviewList.innerHTML = `
    <div class="review-item">
        <strong>✅ Review Submitted!</strong>
        <p>Thank you for your valuable review.</p>
    </div>
`;

setTimeout(
    async function() {
        await loadReviewsInModal(food);
    },
    1200
);


                // REFRESH REVIEWS

                await loadReviewsInModal(food);


            } catch (error) {

                console.error(
                    "Review Error:",
                    error
                );


                alert(
                    "❌ Unable to submit review."
                );

            }


            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Review ⭐";

        };

}


// =====================================
// CLOSE REVIEW MODAL
// =====================================

function setupReviewModal() {

    const modal =
        document.getElementById(
            "review-modal"
        );


    const closeButton =
        document.getElementById(
            "close-review-modal"
        );


    if (closeButton) {

        closeButton.onclick =
            function() {

                modal.style.display =
                    "none";

            };

    }


    // CLOSE WHEN CLICKING OUTSIDE

    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === modal
                ) {

                    modal.style.display =
                        "none";

                }

            }
        );

    }

}


// =====================================
// LOAD FOODS FROM FIREBASE
// =====================================

async function loadFoods() {

    try {

        foodGrid.innerHTML = `
            <div class="admin-loading">
                🍔 Loading delicious foods...
            </div>
        `;


        const querySnapshot =
            await getDocs(
                collection(db, "foods")
            );


        allFoods = [];


        querySnapshot.forEach(
            function(foodDoc) {

                const food =
                    foodDoc.data();


                allFoods.push({

                    id:
                        foodDoc.id,

                    name:
                        food.name || "Food",

                    price:
                        Number(food.price) || 0,

                    category:
                        food.category || "Other",

                    description:
                        food.description ||
                        "Delicious food.",

                    rating:
                        Number(food.rating) || 5,

                    badge:
                        food.badge || "",

                    image:
                        food.image ||
                        "images/food.jpg"

                });

            }
        );


        console.log(
            "Foods loaded from Firebase:",
            allFoods
        );


        createCategories();

        displayFoods(
            allFoods
        );


    } catch (error) {

        console.error(
            "Error loading foods:",
            error
        );


        foodGrid.innerHTML = `

            <div class="admin-loading">

                ❌ Unable to load food menu.

                <br><br>

                Please check Firebase connection.

            </div>

        `;

    }

}


// =====================================
// CREATE CATEGORY BUTTONS
// =====================================

function createCategories() {

    categoryButtons.innerHTML = "";


    const allButton =
        document.createElement("button");


    allButton.className =
        "category-btn active-category";


    allButton.textContent =
        "🍽️ All";


    allButton.dataset.category =
        "all";


    categoryButtons.appendChild(
        allButton
    );


    const categories =
        [
            ...new Set(

                allFoods.map(
                    food =>
                        food.category
                            .trim()
                            .toLowerCase()
                )

            )
        ];


    categories.forEach(
        function(category) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-btn";


            button.dataset.category =
                category;


            button.textContent =
                getCategoryEmoji(category)
                + " "
                + capitalizeCategory(
                    category
                );


            categoryButtons.appendChild(
                button
            );

        }
    );


    const buttons =
        document.querySelectorAll(
            ".category-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    buttons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active-category"
                            )
                    );


                    button.classList.add(
                        "active-category"
                    );


                    searchInput.value = "";


                    const category =
                        button.dataset.category;


                    if (
                        category === "all"
                    ) {

                        displayFoods(
                            allFoods
                        );

                    } else {

                        const filteredFoods =
                            allFoods.filter(
                                food =>
                                    food.category
                                        .trim()
                                        .toLowerCase()
                                    === category
                            );


                        displayFoods(
                            filteredFoods
                        );

                    }

                }
            );

        }
    );

}


// =====================================
// CATEGORY EMOJI
// =====================================

function getCategoryEmoji(category) {

    const value =
        category.toLowerCase();


    if (
        value.includes("pizza")
    )
        return "🍕";


    if (
        value.includes("burger") ||
        value.includes("hamburger")
    )
        return "🍔";


    if (
        value.includes("noodle") ||
        value.includes("pasta")
    )
        return "🍜";


    if (
        value.includes("biryani") ||
        value.includes("rice")
    )
        return "🍚";


    if (
        value.includes("momo") ||
        value.includes("dumpling")
    )
        return "🥟";


    if (
        value.includes("ice cream") ||
        value.includes("dessert")
    )
        return "🍨";


    if (
        value.includes("bread") ||
        value.includes("toast")
    )
        return "🍞";


    if (
        value.includes("drink") ||
        value.includes("juice")
    )
        return "🥤";


    return "🍽️";

}


// =====================================
// CAPITALIZE CATEGORY
// =====================================

function capitalizeCategory(category) {

    return category
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase()
                + word.slice(1)
        )
        .join(" ");

}


// =====================================
// DISPLAY FOODS
// =====================================

function displayFoods(foods) {

    foodGrid.innerHTML = "";


    if (foods.length === 0) {

        foodGrid.innerHTML = `

            <div class="admin-loading">

                😔 No food found.

            </div>

        `;

        return;

    }


    foods.forEach(
        function(food) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "advanced-food-card";


            card.dataset.category =
                food.category
                    .trim()
                    .toLowerCase();


            card.dataset.name =
                food.name.toLowerCase();


            // =====================================
            // BADGE
            // =====================================

            let badgeClass = "";


            if (
                food.badge
                    .toLowerCase()
                    .includes("popular")
            ) {

                badgeClass =
                    "popular";

            } else if (
                food.badge
                    .toLowerCase()
                    .includes("spicy")
            ) {

                badgeClass =
                    "spicy";

            }


            // =====================================
            // RATING
            // =====================================

            const rating =
                Math.min(
                    5,
                    Math.max(
                        0,
                        food.rating
                    )
                );


            const stars =
                "⭐".repeat(
                    Math.round(rating)
                );


            // =====================================
            // BADGE HTML
            // =====================================

            const badgeHTML =
                food.badge
                ? `
                    <div class="food-badge ${badgeClass}">
                        ${escapeHTML(
                            food.badge
                        )}
                    </div>
                `
                : "";


            // =====================================
            // CARD
            // =====================================

            card.innerHTML = `

                <div class="food-picture">

                    <img
                        src="${escapeHTML(
                            food.image
                        )}"
                        alt="${escapeHTML(
                            food.name
                        )}"
                        onerror="
                            this.src='images/food.jpg'
                        "
                    >

                    ${badgeHTML}

                </div>


                <div class="food-card-content">

                    <div class="food-rating">

                        ${stars}

                        <span>
                            ${rating.toFixed(1)}
                        </span>

                    </div>


                    <h2>
                        ${escapeHTML(
                            food.name
                        )}
                    </h2>


                    <p>
                        ${escapeHTML(
                            food.description
                        )}
                    </p>


                    <div class="food-bottom">

                        <strong>
                            ₹${food.price}
                        </strong>


                        <button
                            class="add-cart-btn"
                        >
                            🛒 Add to Cart
                        </button>

                    </div>


                    <button
                        class="review-btn"
                    >
                        ⭐ Reviews
                    </button>

                </div>

            `;


            // =====================================
            // ADD TO CART
            // =====================================

            const addButton =
                card.querySelector(
                    ".add-cart-btn"
                );


            addButton.addEventListener(
                "click",
                function() {

                    addToCart(
                        food.name,
                        food.price,
                        food.image
                    );

                }
            );


            // =====================================
            // REVIEW BUTTON
            // =====================================

            const reviewButton =
                card.querySelector(
                    ".review-btn"
                );


            reviewButton.addEventListener(
                "click",
                function() {

                    openReviewModal(
                        food
                    );

                }
            );


            foodGrid.appendChild(
                card
            );

        }
    );

}


// =====================================
// SEARCH FOOD
// =====================================

searchInput.addEventListener(
    "input",
    function() {

        const searchValue =
            searchInput.value
                .toLowerCase()
                .trim();


        document
            .querySelectorAll(
                ".category-btn"
            )
            .forEach(
                button =>
                    button.classList.remove(
                        "active-category"
                    )
            );


        if (
            searchValue === ""
        ) {

            const allButton =
                document.querySelector(
                    '[data-category="all"]'
                );


            if (allButton) {

                allButton.classList.add(
                    "active-category"
                );

            }


            displayFoods(
                allFoods
            );

            return;

        }


        const filteredFoods =
            allFoods.filter(
                function(food) {

                    const name =
                        food.name
                            .toLowerCase();

                    const category =
                        food.category
                            .toLowerCase();

                    const description =
                        food.description
                            .toLowerCase();


                    return (

                        name.includes(
                            searchValue
                        )

                        ||

                        category.includes(
                            searchValue
                        )

                        ||

                        description.includes(
                            searchValue
                        )

                    );

                }
            );


        displayFoods(
            filteredFoods
        );

    }
);


// =====================================
// START
// =====================================

setupReviewModal();

loadFoods();