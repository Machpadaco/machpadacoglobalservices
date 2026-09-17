// ========================================
// MACHpadaco Global Services
// Protected Premium Course Access
// ========================================


// ========================================
// API
// ========================================

// Local development
// → http://localhost:5000
//
// Live Render website
// → https://machpadacoglobalservices-api.onrender.com

const API_BASE_URL =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";

const API_URL = `${API_BASE_URL}/api/enrollments`;


const token = localStorage.getItem("token");

// Get the course slug from the HTML page
const courseSlug = document.body.dataset.courseSlug;

// Course content area
const courseContent = document.querySelector("main");


// ========================================
// PUBLIC COURSE PAGE
// ========================================

// The public premium/enrollment page uses the same
// course slug as the protected course.
//
// Example:
// property-management-virtual-assistance-premium
// becomes:
// property-management-virtual-assistance-premium.html

const publicCoursePage = courseSlug
    ? `${courseSlug}.html`
    : "community.html";


// ========================================
// HIDE COURSE CONTENT WHILE ACCESS IS CHECKED
// ========================================

if (courseContent) {
    courseContent.style.display = "none";
}


// ========================================
// CHECK LOGIN
// ========================================

if (!token) {

    const nextPage =
        window.location.pathname +
        window.location.search;

    window.location.href =
        `login.html?next=${encodeURIComponent(nextPage)}`;

}


// ========================================
// CHECK PAID COURSE ACCESS
// ========================================

async function checkCourseAccess() {

    if (!courseSlug) {

        console.error("Course slug is missing.");

        alert(
            "Unable to identify this course. Please return to the course page."
        );

        window.location.href =
            "community.html";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/access/${courseSlug}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        // ========================================
        // ACCESS GRANTED
        // ========================================

        if (
            response.ok &&
            data.success &&
            data.hasAccess
        ) {

            if (courseContent) {
                courseContent.style.display = "";
            }

            return;
        }


        // ========================================
        // ACCESS DENIED
        // ========================================

        alert(
            "You do not have verified access to this course. Please complete your enrollment and payment."
        );

        window.location.href =
            publicCoursePage;

    } catch (error) {

        console.error(
            "COURSE ACCESS ERROR:",
            error
        );

        alert(
            "Unable to verify your course access. Please try again."
        );

        window.location.href =
            publicCoursePage;
    }
}


// ========================================
// START ACCESS CHECK
// ========================================

checkCourseAccess();