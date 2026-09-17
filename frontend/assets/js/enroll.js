// ========================================
// MACHpadaco Premium Enrolment
// ========================================

// ========================================
// BACKEND API
// ========================================

// Use local backend during development
// Use Render backend when the website is live

const API_BASE_URL =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";

const token = localStorage.getItem("token");
const userJson = localStorage.getItem("user");

const form = document.getElementById("enrollment-form");
const courseName = document.getElementById("course-name");
const courseDescription = document.getElementById("course-description");
const coursePrice = document.getElementById("course-price");
const selectedCourse = document.getElementById("course");

const paymentSection =
    document.getElementById("payment-section");

const paymentAmount =
    document.getElementById("payment-amount");

const paymentReference =
    document.getElementById("payment-reference");

const paymentForm =
    document.getElementById("payment-form");

const enrollmentStatus =
    document.getElementById("enrollment-status");

const bankName =
    document.getElementById("bank-name");

const accountName =
    document.getElementById("account-name");

const accountNumber =
    document.getElementById("account-number");

const whatsappLink =
    document.getElementById("whatsapp-payment-link");


// ========================================
// STEP 4 — COURSE ACCESS LINK
// ========================================

const courseAccessLink =
    document.getElementById("courseAccessLink");


// ========================================
// GET SELECTED COURSE FROM URL
// ========================================

const courseSlug =
    new URLSearchParams(
        window.location.search
    ).get("course");

let currentCourse = null;


// ========================================
// SHOW STATUS MESSAGE
// ========================================

function showStatus(message, type = "info") {

    if (!enrollmentStatus) return;

    enrollmentStatus.textContent = message;

    enrollmentStatus.className =
        `enrollment-status ${type}`;

    enrollmentStatus.hidden = false;
}


// ========================================
// FORMAT NIGERIAN CURRENCY
// ========================================

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(amount);

}


// ========================================
// REDIRECT USER TO ACCOUNT
// ========================================

function redirectToAccount() {

    if (!token) {

        const next =
            `enroll.html?course=${encodeURIComponent(
                courseSlug || ""
            )}`;

        window.location.href =
            `signup.html?next=${encodeURIComponent(next)}`;

        return false;
    }

    return true;
}


// ========================================
// STEP 4 — SET COURSE ACCESS LINK
// ========================================

function setCourseAccessLink() {

    if (!courseAccessLink) {
        return;
    }


    // Protected learning pages
    const protectedCoursePages = {

        "software-development-premium":
            "software-development-course.html",

        "phone-engineering-premium":
            "phone-engineering-course.html",

        "digital-marketing-premium":
            "digital-marketing-course.html",

        "property-management-virtual-assistance-premium":
            "property-management-virtual-assistance-course.html"

    };


    // Check whether the selected course
    // has a protected learning page
    if (
        courseSlug &&
        protectedCoursePages[courseSlug]
    ) {

        courseAccessLink.href =
            protectedCoursePages[courseSlug];

    } else {

        // No valid course selected
        courseAccessLink.href =
            "community.html";

    }

}


// ========================================
// LOAD COURSE INFORMATION
// ========================================

async function loadCourse() {

    // Check whether a course was selected
    if (!courseSlug) {

        showStatus(
            "No course was selected. Please return to the premium training page.",
            "error"
        );

        if (form) {
            form.hidden = true;
        }

        // Still initialise Step 4
        setCourseAccessLink();

        return;
    }


    // Check login
    if (!redirectToAccount()) {
        return;
    }


    try {

        console.log(
            "Loading course:",
            courseSlug
        );

        console.log(
            "Course API:",
            `${API_BASE_URL}/api/enrollments/courses`
        );


        // Request course catalogue
        const response =
            await fetch(
                `${API_BASE_URL}/api/enrollments/courses`
            );


        // Check HTTP response
        if (!response.ok) {

            throw new Error(
                `Course API returned HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Course API response:",
            result
        );


        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {

            throw new Error(
                result.message ||
                "Unable to load courses."
            );

        }


        // Find selected course
        currentCourse =
            result.data.find(
                course =>
                    course.slug === courseSlug
            );


        if (!currentCourse) {

            throw new Error(
                "The selected course could not be found."
            );

        }


        // ========================================
        // DISPLAY COURSE INFORMATION
        // ========================================

        if (courseName) {

            courseName.textContent =
                currentCourse.name;

        }


        if (courseDescription) {

            courseDescription.textContent =
                currentCourse.description;

        }


        if (coursePrice) {

            coursePrice.textContent =
                currentCourse.price > 0
                    ? formatMoney(currentCourse.price)
                    : "Fee not configured";

        }


        if (selectedCourse) {

            selectedCourse.value =
                currentCourse.name;

        }


        if (paymentAmount) {

            paymentAmount.textContent =
                currentCourse.price > 0
                    ? formatMoney(currentCourse.price)
                    : "Fee not configured";

        }


        // ========================================
        // LOAD LOGGED-IN USER INFORMATION
        // ========================================

        let user = null;

        try {

            user =
                userJson
                    ? JSON.parse(userJson)
                    : null;

        } catch (error) {

            console.warn(
                "Could not read stored user information."
            );

        }


        const fullNameInput =
            document.getElementById("full-name");

        const emailInput =
            document.getElementById("email");

        const phoneInput =
            document.getElementById("phone");


        if (fullNameInput) {

            fullNameInput.value =
                user?.fullName || "";

        }


        if (emailInput) {

            emailInput.value =
                user?.email || "";

        }


        if (phoneInput) {

            phoneInput.value =
                user?.phone || "";

        }


        // ========================================
        // LOAD PAYMENT DETAILS
        // ========================================

        await loadPaymentDetails();


        // ========================================
        // CHECK EXISTING ENROLLMENT
        // ========================================

        await loadExistingEnrollment();


    } catch (error) {

        console.error(
            "Enrollment load error:",
            error
        );


        showStatus(
            error.message ||
            "Unable to load enrollment information.",
            "error"
        );

    }

}


// ========================================
// LOAD PAYMENT DETAILS
// ========================================

async function loadPaymentDetails() {

    try {

        console.log(
            "Loading payment details..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/api/enrollments/payment-details`
            );


        if (!response.ok) {

            console.warn(
                `Payment API returned HTTP ${response.status}`
            );

            return;
        }


        const result =
            await response.json();


        console.log(
            "Payment API response:",
            result
        );


        if (
            !result.success ||
            !result.data
        ) {

            return;

        }


        if (bankName) {

            bankName.textContent =
                result.data.bankName ||
                "Contact Machpadaco";

        }


        if (accountName) {

            accountName.textContent =
                result.data.accountName ||
                "Machpadaco Global Services";

        }


        if (accountNumber) {

            accountNumber.textContent =
                result.data.accountNumber ||
                "Not configured";

        }


        if (
            whatsappLink &&
            result.data.whatsappNumber
        ) {

            whatsappLink.href =
                `https://wa.me/${result.data.whatsappNumber}`;

        }


    } catch (error) {

        console.warn(
            "Payment details could not be loaded.",
            error
        );

    }

}


// ========================================
// LOAD EXISTING ENROLLMENT
// ========================================

async function loadExistingEnrollment() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/enrollments/my`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        // Token expired
        if (response.status === 401) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!response.ok) {

            console.warn(
                `Enrollment API returned HTTP ${response.status}`
            );

            return;

        }


        const result =
            await response.json();


        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {

            return;

        }


        const existing =
            result.data.find(
                item =>
                    item.courseSlug === courseSlug
            );


        if (!existing) {
            return;
        }


        // ========================================
        // VERIFIED
        // ========================================

        if (existing.status === "verified") {

            if (form) {
                form.hidden = true;
            }

            if (paymentSection) {
                paymentSection.hidden = true;
            }

            showStatus(
                "You already have verified access to this course. Please open your student course area.",
                "success"
            );

        }


        // ========================================
        // PENDING
        // ========================================

        else if (existing.status === "pending") {

            if (form) {
                form.hidden = true;
            }

            if (paymentSection) {
                paymentSection.hidden = true;
            }

            showStatus(
                "Your enrollment is pending payment verification. You do not need to submit another enrollment.",
                "info"
            );

        }


        // ========================================
        // REJECTED
        // ========================================

        else if (existing.status === "rejected") {

            showStatus(
                "Your previous enrollment was rejected. You may submit a new payment reference.",
                "error"
            );

        }


    } catch (error) {

        console.warn(
            "Existing enrollment check failed.",
            error
        );

    }

}


// ========================================
// STEP 1 → CONTINUE TO PAYMENT
// ========================================

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (
                !currentCourse ||
                currentCourse.price <= 0
            ) {

                showStatus(
                    "This course fee has not been configured yet. Please contact Machpadaco.",
                    "error"
                );

                return;

            }


            if (paymentSection) {

                paymentSection.hidden = false;

                paymentSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// ========================================
// STEP 2 → SUBMIT PAYMENT REFERENCE
// ========================================

if (paymentForm) {

    paymentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // Check course
            if (
                !currentCourse ||
                currentCourse.price <= 0
            ) {

                showStatus(
                    "This course fee has not been configured yet. Please contact Machpadaco.",
                    "error"
                );

                return;

            }


            // Check login
            if (!token) {

                redirectToAccount();

                return;

            }


            // Get payment reference
            const reference =
                paymentReference?.value.trim();


            if (!reference) {

                showStatus(
                    "Enter the bank transfer payment reference after making your payment.",
                    "error"
                );

                return;

            }


            const button =
                paymentForm.querySelector(
                    "button[type='submit']"
                );


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Submitting...";

            }


            try {

                console.log(
                    "Submitting enrollment..."
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/enrollments`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body: JSON.stringify({

                                courseSlug,

                                paymentReference:
                                    reference

                            })

                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Enrollment submission response:",
                    result
                );


                // Token expired
                if (response.status === 401) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    window.location.href =
                        "login.html";

                    return;

                }


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Enrollment submission failed."
                    );

                }


                // Hide payment form
                paymentForm.hidden = true;


                showStatus(
                    "Enrollment submitted successfully. Your payment is now awaiting verification.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Enrollment submission error:",
                    error
                );


                showStatus(
                    error.message ||
                    "Unable to submit enrollment.",
                    "error"
                );


            } finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Submit Payment for Verification";

                }

            }

        }
    );

}


// ========================================
// START
// ========================================

console.log(
    "Machpadaco Premium Enrolment initialized."
);

console.log(
    "Selected course:",
    courseSlug
);

console.log(
    "Backend API:",
    API_BASE_URL
);


// ========================================
// INITIALIZE STEP 4 LINK
// ========================================

setCourseAccessLink();


// ========================================
// LOAD ENROLLMENT PAGE
// ========================================

loadCourse();