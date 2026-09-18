// ========================================
// Machpadaco Premium Enrolment
// ========================================

import API_BASE_URL from "./config.js";

const token = localStorage.getItem("token");
const userJson = localStorage.getItem("user");

const form = document.getElementById("enrollment-form");
const courseName = document.getElementById("course-name");
const courseDescription = document.getElementById("course-description");
const coursePrice = document.getElementById("course-price");
const selectedCourse = document.getElementById("course");
const paymentSection = document.getElementById("payment-section");
const paymentAmount = document.getElementById("payment-amount");
const paymentReference = document.getElementById("payment-reference");
const paymentForm = document.getElementById("payment-form");
const enrollmentStatus = document.getElementById("enrollment-status");
const bankName = document.getElementById("bank-name");
const accountName = document.getElementById("account-name");
const accountNumber = document.getElementById("account-number");
const whatsappLink = document.getElementById("whatsapp-payment-link");

const courseSlug =
    new URLSearchParams(window.location.search).get("course");

let currentCourse = null;


// ========================================
// PROTECTED COURSE PAGES
// ========================================

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


// ========================================
// SET COURSE ACCESS LINK
// ========================================

function setCourseAccessLink() {

    const accessLink =
        document.getElementById("courseAccessLink");

    if (!accessLink) {
        return;
    }

    const targetPage =
        protectedCoursePages[courseSlug];

    if (targetPage) {

        accessLink.setAttribute(
            "href",
            targetPage
        );

    } else {

        accessLink.setAttribute(
            "href",
            "join-community.html#premium-training"
        );

    }

}


// ========================================
// STATUS MESSAGE
// ========================================

function showStatus(message, type = "info") {

    if (!enrollmentStatus) {
        return;
    }

    enrollmentStatus.textContent = message;

    enrollmentStatus.className =
        `enrollment-status ${type}`;

    enrollmentStatus.hidden = false;
}


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(amount);

}


// ========================================
// CHECK LOGIN
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
// LOAD SELECTED COURSE
// ========================================

async function loadCourse() {

    if (!courseSlug) {

        showStatus(
            "No course was selected. Please return to the premium training page.",
            "error"
        );

        if (form) {
            form.hidden = true;
        }

        setCourseAccessLink();

        return;
    }


    if (!redirectToAccount()) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/courses`
        );


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load courses."
            );
        }


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
        // COURSE INFORMATION
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
        // SET PROTECTED COURSE LINK
        // ========================================

        setCourseAccessLink();


        // ========================================
        // LOGGED-IN USER INFORMATION
        // ========================================

        let user = null;

        try {

            user =
                userJson
                    ? JSON.parse(userJson)
                    : null;

        } catch (error) {

            console.warn(
                "Stored user information could not be read.",
                error
            );

        }


        const fullName =
            document.getElementById("full-name");

        const email =
            document.getElementById("email");

        const phone =
            document.getElementById("phone");


        if (fullName) {

            fullName.value =
                user?.fullName || "";
        }


        if (email) {

            email.value =
                user?.email || "";
        }


        if (phone) {

            phone.value =
                user?.phone || "";
        }


        // ========================================
        // PAYMENT INFORMATION
        // ========================================

        await loadPaymentDetails();


        // ========================================
        // EXISTING ENROLLMENT
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

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/payment-details`
        );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            console.warn(
                "Payment details request failed:",
                result.message
            );

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

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/my`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok || !result.success) {
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
        // VERIFIED ENROLLMENT
        // ========================================

        if (existing.status === "verified") {

            if (form) {
                form.hidden = true;
            }

            if (paymentSection) {
                paymentSection.hidden = true;
            }

            // Make absolutely sure the protected
            // course link is correctly assigned.
            setCourseAccessLink();

            showStatus(
                "You already have verified access to this course. Please open your student course area.",
                "success"
            );


        } else if (existing.status === "pending") {

            if (form) {
                form.hidden = true;
            }

            if (paymentSection) {
                paymentSection.hidden = false;
            }

            showStatus(
                "Your enrollment is pending payment verification. You do not need to submit another enrollment.",
                "info"
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
// ENROLLMENT FORM
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
// PAYMENT FORM
// ========================================

if (paymentForm) {

    paymentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (
                !currentCourse ||
                currentCourse.price <= 0 ||
                !token
            ) {

                redirectToAccount();

                return;
            }


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


                if (response.status === 401) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

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
// INITIALIZE
// ========================================

console.log(
    "Machpadaco Premium Enrolment initialized."
);

console.log(
    "Backend API:",
    API_BASE_URL
);

console.log(
    "Selected course:",
    courseSlug
);


// Set the link immediately.
setCourseAccessLink();


// Load the selected course.
loadCourse();