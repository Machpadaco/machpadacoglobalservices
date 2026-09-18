// ========================================
// MACHpadaco Global Services
// Home Contact Form Handler
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const contactForm =
            document.getElementById(
                "home-contact-form"
            );

        const feedbackBox =
            document.getElementById(
                "form-feedback"
            );

        const submitBtn =
            document.getElementById(
                "submit-btn"
            );


        // ========================================
        // STOP IF FORM DOES NOT EXIST
        // ========================================

        if (!contactForm) {
            return;
        }


        // ========================================
        // API BASE URL
        // ========================================

        const API_BASE_URL =
            (
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1"
            )
                ? "http://localhost:5000"
                : "https://machpadacoglobalservices-api.onrender.com";


        // ========================================
        // FORM SUBMISSION
        // ========================================

        contactForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                // ========================================
                // CHECK REQUIRED ELEMENTS
                // ========================================

                if (
                    !feedbackBox ||
                    !submitBtn
                ) {

                    console.error(
                        "Contact form elements are missing."
                    );

                    return;
                }


                // ========================================
                // LOADING STATE
                // ========================================

                submitBtn.disabled = true;

                submitBtn.textContent =
                    "Sending...";

                feedbackBox.style.display =
                    "none";


                // ========================================
                // GET FORM VALUES
                // ========================================

                const name =
                    document
                        .getElementById(
                            "contact-name"
                        )
                        ?.value
                        .trim() || "";

                const email =
                    document
                        .getElementById(
                            "contact-email"
                        )
                        ?.value
                        .trim() || "";

                const service =
                    document
                        .getElementById(
                            "contact-service"
                        )
                        ?.value || "";

                const message =
                    document
                        .getElementById(
                            "contact-message"
                        )
                        ?.value
                        .trim() || "";


                // ========================================
                // FORM DATA
                // ========================================

                const formData = {

                    name,

                    email,

                    service,

                    message

                };


                try {

                    // ========================================
                    // SEND TO BACKEND
                    // ========================================

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/contact`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        formData
                                    )
                            }
                        );


                    // ========================================
                    // READ RESPONSE SAFELY
                    // ========================================

                    let result = {};

                    try {

                        result =
                            await response.json();

                    } catch (jsonError) {

                        console.error(
                            "Invalid server response:",
                            jsonError
                        );

                    }


                    // ========================================
                    // SHOW FEEDBACK
                    // ========================================

                    feedbackBox.style.display =
                        "block";


                    // ========================================
                    // SUCCESS
                    // ========================================

                    if (
                        response.ok &&
                        result.success
                    ) {

                        feedbackBox.className =
                            "form-feedback-box success";

                        feedbackBox.textContent =
                            result.message ||
                            "Thank you! Your message has been sent.";

                        contactForm.reset();

                    }


                    // ========================================
                    // SERVER ERROR
                    // ========================================

                    else {

                        feedbackBox.className =
                            "form-feedback-box error";

                        feedbackBox.textContent =
                            result.message ||
                            "Something went wrong. Please try again.";

                    }


                } catch (error) {

                    // ========================================
                    // NETWORK ERROR
                    // ========================================

                    console.error(
                        "Contact form submission error:",
                        error
                    );


                    feedbackBox.style.display =
                        "block";

                    feedbackBox.className =
                        "form-feedback-box error";

                    feedbackBox.textContent =
                        "Unable to connect to the server. Please check your connection and try again.";

                }


                // ========================================
                // RESTORE BUTTON
                // ========================================

                finally {

                    submitBtn.disabled =
                        false;

                    submitBtn.textContent =
                        "Send Message";

                }

            }
        );

    }
);