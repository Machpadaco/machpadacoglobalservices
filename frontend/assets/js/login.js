// ========================================
// MACHpadaco Global Services
// Login Page
// ========================================

// ========================================
// API
// ========================================

const API_URL = "http://localhost:5000/api/auth";

// ========================================
// LOGIN FORM
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const inputs = loginForm.querySelectorAll("input");

        const email = inputs[0].value.trim();
        const password = inputs[1].value;

        // ========================================
        // VALIDATION
        // ========================================

        if (!email || !password) {
            return alert("Fill all fields");
        }

        // ========================================
        // LOGIN REQUEST
        // ========================================

        try {

            const res = await fetch(`${API_URL}/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await res.json();

            // ========================================
            // LOGIN SUCCESS
            // ========================================

            if (res.ok && data.token) {

                // Save authentication token
                localStorage.setItem(
                    "token",
                    data.token
                );

                // Save user information
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                // Redirect to homepage
                window.location.href = "index.html";

            } else {

                // ========================================
                // LOGIN FAILED
                // ========================================

                alert(
                    data.message ||
                    "Invalid credentials"
                );
            }

        } catch (err) {

            console.error(
                "Login Error:",
                err
            );

            alert("Server error");
        }
    });
}