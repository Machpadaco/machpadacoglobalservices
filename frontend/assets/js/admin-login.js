// ========================================
// MACHpadaco Global Services
// Admin Login
// ========================================

// ========================================
// ADMIN LOGIN INITIALIZATION
// ========================================

const loginForm =
    document.getElementById("admin-login-form");

const errorBox =
    document.getElementById("login-error");

const loginBtn =
    document.getElementById("login-btn");


// ========================================
// STOP IF ADMIN LOGIN FORM DOES NOT EXIST
// ========================================

if (!loginForm) {

    console.warn(
        "Admin Login: Login form not found."
    );

} else {

    // ========================================
    // API BASE URL
    // ========================================

    const API_BASE_URL =
        (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        )
            ? "http://localhost:5000"
            : "";


    // ========================================
    // ADMIN LOGIN SUBMIT
    // ========================================

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            // ========================================
            // CLEAR PREVIOUS ERROR
            // ========================================

            if (errorBox) {

                errorBox.style.display = "none";

                errorBox.textContent = "";

            }


            // ========================================
            // DISABLE LOGIN BUTTON
            // ========================================

            if (loginBtn) {

                loginBtn.disabled = true;

                loginBtn.textContent =
                    "Authenticating...";

            }


            // ========================================
            // GET FORM VALUES
            // ========================================

            const emailInput =
                document.getElementById("admin-email");

            const passwordInput =
                document.getElementById("admin-password");


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // ========================================
            // VALIDATE FORM
            // ========================================

            if (!email || !password) {

                showError(
                    "Please enter your email and password."
                );

                return;

            }


            try {

                // ========================================
                // SEND LOGIN REQUEST
                // ========================================

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                // ========================================
                // READ RESPONSE
                // ========================================

                const data =
                    await response.json();


                console.log(
                    "Admin Login Response:",
                    data
                );


                // ========================================
                // LOGIN SUCCESS
                // ========================================

                if (
                    response.ok &&
                    data.token
                ) {

                    const userRole =
                        data.user
                            ? data.user.role
                            : null;


                    console.log(
                        "Logged-in user role:",
                        userRole
                    );


                    // ========================================
                    // ADMIN ROLE CHECK
                    // ========================================

                    if (userRole !== "admin") {

                        showError(
                            "Access Denied: Your account does not have admin permissions."
                        );

                        return;

                    }


                    // ========================================
                    // SAVE ADMIN TOKEN
                    // ========================================

                    localStorage.setItem(
                        "token",
                        data.token
                    );


                    // ========================================
                    // SAVE ADMIN USER
                    // ========================================

                    if (data.user) {

                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                data.user
                            )
                        );

                    }


                    // ========================================
                    // VERIFY TOKEN WAS SAVED
                    // ========================================

                    console.log(
                        "Admin token saved:",
                        !!localStorage.getItem("token")
                    );


                    // ========================================
                    // REDIRECT TO ADMIN DASHBOARD
                    // ========================================

                    window.location.replace(
                        `${API_BASE_URL}/admin`
                    );

                    return;

                }


                // ========================================
                // LOGIN FAILED
                // ========================================

                showError(
                    data.message ||
                    "Invalid email or password."
                );

            } catch (error) {

                console.error(
                    "Admin Login Error:",
                    error
                );


                showError(
                    "Server connection failed. Make sure the backend is running on port 5000."
                );

            }

        }
    );

}


// ========================================
// DISPLAY ERROR
// ========================================

function showError(message) {

    if (errorBox) {

        errorBox.style.display = "block";

        errorBox.textContent = message;

    }


    if (loginBtn) {

        loginBtn.disabled = false;

        loginBtn.textContent =
            "Login to Dashboard";

    }

}