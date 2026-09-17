const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

if (contactForm) {

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
    // FORM SUBMISSION
    // ========================================

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // ========================================
        // GET FORM ELEMENTS
        // ========================================

        const submitButton =
            contactForm.querySelector(
                ".contact-submit-btn"
            );

        const name =
            document.getElementById("name");

        const email =
            document.getElementById("email");

        const phone =
            document.getElementById("phone");

        const service =
            document.getElementById("service");

        const subject =
            document.getElementById("subject");

        const message =
            document.getElementById("message");


        // ========================================
        // CLEAR PREVIOUS STATUS
        // ========================================

        if (contactStatus) {

            contactStatus.textContent = "";

            contactStatus.className =
                "contact-status";

        }


        // ========================================
        // LOADING STATE
        // ========================================

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML =
                "Sending...";

        }


        try {

            // ========================================
            // PREPARE FORM DATA
            // ========================================

            const formData = {

                name: name.value.trim(),

                email: email.value.trim(),

                phone: phone.value.trim(),

                service: service.value.trim(),

                subject: subject.value.trim(),

                message: message.value.trim(),

                formType: "website-contact"

            };


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
                            JSON.stringify(formData)
                    }
                );


            // ========================================
            // READ SERVER RESPONSE
            // ========================================

            const result =
                await response.json();


            // ========================================
            // SUCCESS
            // ========================================

            if (
                response.ok &&
                result.success
            ) {

                if (contactStatus) {

                    contactStatus.className =
                        "contact-status success";

                    contactStatus.textContent =
                        result.message ||
                        "Your message has been submitted successfully.";

                }


                contactForm.reset();


                // ========================================
                // SCROLL TO STATUS MESSAGE
                // ========================================

                if (contactStatus) {

                    contactStatus.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });

                }

            } else {

                // ========================================
                // SERVER VALIDATION ERROR
                // ========================================

                if (contactStatus) {

                    contactStatus.className =
                        "contact-status error";

                    contactStatus.textContent =
                        result.message ||
                        "Unable to submit your message. Please try again.";

                }

            }

        } catch (error) {

            // ========================================
            // NETWORK ERROR
            // ========================================

            console.error(
                "Contact page submission error:",
                error
            );


            if (contactStatus) {

                contactStatus.className =
                    "contact-status error";

                contactStatus.textContent =
                    "Unable to connect to the server. Please try again later.";

            }

        } finally {

            // ========================================
            // RESTORE BUTTON
            // ========================================

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    'Send Message <span>→</span>';

            }

        }

    });

}