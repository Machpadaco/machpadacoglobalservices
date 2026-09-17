// ========================================
// MACHpadaco Global Services
// Signup Page
// ========================================

// ========================================
// API
// ========================================

// Use local backend during development
// Use Render backend when the website is live

const API_BASE_URL =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";

const API_URL = `${API_BASE_URL}/api/auth`;

// ========================================
// SIGNUP FORM
// ========================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        // ========================================
        // FORM INPUTS
        // ========================================

        const inputs =
            signupForm.querySelectorAll("input");

        const fullName =
            inputs[0].value.trim();

        const email =
            inputs[1].value.trim();

        const phone =
            inputs[2].value.trim();

        const password =
            inputs[3].value;

        const confirmPassword =
            inputs[4].value;

        // ========================================
        // VALIDATION
        // ========================================

        if (
            !fullName ||
            !email ||
            !phone ||
            !password ||
            !confirmPassword
        ) {

            return alert(
                "Please fill all fields"
            );
        }

        if (password !== confirmPassword) {

            return alert(
                "Passwords do not match"
            );
        }

        // ========================================
        // SIGNUP REQUEST
        // ========================================

        try {

            const res = await fetch(
                `${API_URL}/signup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        fullName,
                        email,
                        phone,
                        password
                    })
                }
            );

            const data =
                await res.json();

            // ========================================
            // SUCCESS
            // ========================================

            if (res.ok) {

                alert(
                    data.message ||
                    "Account created successfully"
                );

                window.location.href =
                    "login.html";

            } else {

                // ========================================
                // SERVER RESPONSE ERROR
                // ========================================

                alert(
                    data.message ||
                    "Signup failed"
                );
            }

        } catch (err) {

            console.error(
                "Signup Error:",
                err
            );

            alert(
                "Unable to connect to the server. Please try again."
            );
        }
    });
}