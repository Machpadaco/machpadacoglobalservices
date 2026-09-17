// ========================================
// MACHpadaco Global Services
// Shared Authentication Functions
// ========================================


// ========================================
// UPDATE NAVBAR
// ========================================

export function updateNavbar() {

    const token =
        localStorage.getItem("token");

    const userJson =
        localStorage.getItem("user");


    const profileContainer =
        document.getElementById(
            "profileContainer"
        );

    const authGuest =
        document.getElementById(
            "authGuest"
        );

    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );

    const navProfilePic =
        document.getElementById(
            "navProfilePic"
        );


    // ========================================
    // USER LOGGED IN
    // ========================================

    if (token && userJson) {

        let user;

        try {

            user =
                JSON.parse(userJson);

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            localStorage.removeItem(
                "user"
            );

            updateNavbar();

            return;
        }


        // ========================================
        // SHOW PROFILE
        // ========================================

        if (profileContainer) {

            profileContainer.classList.add(
                "active"
            );

        }


        // ========================================
        // HIDE LOGIN / SIGNUP
        // ========================================

        if (authGuest) {

            authGuest.style.display =
                "none";

        }


        // ========================================
        // USERNAME
        // ========================================

        if (usernameDisplay) {

            usernameDisplay.textContent =
                (
                    user.fullName ||
                    "User"
                ).split(" ")[0];

        }


        // ========================================
        // PROFILE IMAGE
        // ========================================

        if (navProfilePic) {

            if (
                user.profileImage &&
                user.profileImage !== "undefined" &&
                user.profileImage !== "null"
            ) {

                navProfilePic.src =
                    user.profileImage;

            } else {

                navProfilePic.src =
                    "assets/img/default-user.png";

            }

        }

    }


    // ========================================
    // USER LOGGED OUT
    // ========================================

    else {

        if (profileContainer) {

            profileContainer.classList.remove(
                "active"
            );

        }


        if (authGuest) {

            authGuest.style.display =
                "flex";

        }

    }

}


// ========================================
// LOGOUT
// ========================================

export function logoutUser() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "index.html";

}


// ========================================
// INITIALIZE AUTHENTICATION
// ========================================

function initializeAuth() {

    // ========================================
    // UPDATE NAVBAR
    // ========================================

    updateNavbar();


    // ========================================
    // NAVBAR LOGOUT BUTTON
    // ========================================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                logoutUser();

            }
        );

    }

}


// ========================================
// HEADER LOADED
// ========================================
//
// The header is loaded asynchronously
// by components.js.
//
// Therefore authentication must wait
// for the headerLoaded event instead of
// relying only on DOMContentLoaded.
// ========================================

document.addEventListener(
    "headerLoaded",
    initializeAuth
);