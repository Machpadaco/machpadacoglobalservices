// ========================================
// MACHpadaco Global Services
// Contact Page Handler
// ========================================


// ========================================
// CONTACT FORM
// ========================================

const contactForm =
    document.getElementById(
        "contactForm"
    );

const contactStatus =
    document.getElementById(
        "contactStatus"
    );


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
            : "https://machpadacoglobalservices-api.onrender.com";


    // ========================================
    // FORM SUBMISSION
    // ========================================

    contactForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // ========================================
            // FORM ELEMENTS
            // ========================================

            const submitButton =
                contactForm.querySelector(
                    ".contact-submit-btn"
                );


            const name =
                document.getElementById(
                    "name"
                );

            const email =
                document.getElementById(
                    "email"
                );

            const phone =
                document.getElementById(
                    "phone"
                );

            const service =
                document.getElementById(
                    "service"
                );

            const subject =
                document.getElementById(
                    "subject"
                );

            const message =
                document.getElementById(
                    "message"
                );


            // ========================================
            // CHECK FORM ELEMENTS
            // ========================================

            if (
                !name ||
                !email ||
                !phone ||
                !service ||
                !subject ||
                !message
            ) {

                console.error(
                    "One or more contact form fields are missing."
                );

                return;
            }


            // ========================================
            // CLEAR PREVIOUS STATUS
            // ========================================

            if (contactStatus) {

                contactStatus.textContent =
                    "";

                contactStatus.className =
                    "contact-status";

            }


            // ========================================
            // LOADING STATE
            // ========================================

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    "Sending...";

            }


            try {

                // ========================================
                // PREPARE FORM DATA
                // ========================================

                const formData = {

                    name:
                        name.value.trim(),

                    email:
                        email.value.trim(),

                    phone:
                        phone.value.trim(),

                    service:
                        service.value.trim(),

                    subject:
                        subject.value.trim(),

                    message:
                        message.value.trim(),

                    formType:
                        "website-contact"

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
                                JSON.stringify(
                                    formData
                                )
                        }
                    );


                // ========================================
                // READ SERVER RESPONSE
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
                    // SCROLL TO STATUS
                    // ========================================

                    if (contactStatus) {

                        contactStatus.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                        });

                    }

                }


                // ========================================
                // SERVER VALIDATION ERROR
                // ========================================

                else {

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

            }


            // ========================================
            // RESTORE BUTTON
            // ========================================

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        'Send Message <span>→</span>';

                }

            }

        }
    );

}