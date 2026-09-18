// ========================================
// MACHpadaco Global Services
// Protected Premium Course Controller
// ========================================


// ========================================
// API CONFIGURATION
// ========================================

const API_BASE_URL =
    (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    )
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";


const API_BASE =
    `${API_BASE_URL}/api/enrollments`;


// ========================================
// PAGE ELEMENTS
// ========================================

const app =
    document.getElementById(
        "premiumCourseApp"
    );

const loading =
    document.getElementById(
        "premiumCourseLoading"
    );

const courseTitle =
    document.getElementById(
        "courseTitle"
    );

const courseIntro =
    document.getElementById(
        "courseIntro"
    );


// ========================================
// GET COURSE SLUG
// ========================================
//
// IMPORTANT:
// The protected course pages use:
// data-course-slug="..."
//
// We also keep the URL ?course=... option
// as a fallback.
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );


const courseSlug =
    document.body?.dataset?.courseSlug ||
    params.get("course");


// ========================================
// CURRENT PAGE URL
// ========================================

function currentPageUrl() {

    return (
        `${window.location.pathname}` +
        `${window.location.search}`
    );
}


// ========================================
// REDIRECT TO LOGIN
// ========================================

function redirectToLogin() {

    const next =
        encodeURIComponent(
            currentPageUrl()
        );


    window.location.href =
        `login.html?next=${next}`;
}


// ========================================
// REDIRECT TO ENROLLMENT
// ========================================

function redirectToEnrollment() {

    const next =
        encodeURIComponent(
            courseSlug || ""
        );


    window.location.href =
        `enroll.html?course=${next}`;
}


// ========================================
// REDIRECT TO COMMUNITY
// ========================================

function redirectToCommunity() {

    window.location.href =
        "join-community.html#premium-training";
}


// ========================================
// SHOW LOADING
// ========================================

function showLoading() {

    if (loading) {

        loading.hidden =
            false;
    }


    if (app) {

        app.hidden =
            true;
    }
}


// ========================================
// SHOW COURSE
// ========================================

function showCourse() {

    if (loading) {

        loading.hidden =
            true;
    }


    if (app) {

        app.hidden =
            false;
    }
}


// ========================================
// CLEAR SESSION
// ========================================

function clearSession() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );
}


// ========================================
// CHECK COURSE ACCESS
// ========================================

async function checkCourseAccess() {

    showLoading();


    // ========================================
    // VERIFY COURSE SLUG
    // ========================================

    if (!courseSlug) {

        console.error(
            "PREMIUM COURSE ERROR: No course slug found."
        );


        redirectToCommunity();

        return;
    }


    console.log(
        "Protected course slug:",
        courseSlug
    );


    // ========================================
    // VERIFY LOGIN
    // ========================================

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        redirectToLogin();

        return;
    }


    try {

        // ========================================
        // CHECK ACCESS WITH BACKEND
        // ========================================

        const response =
            await fetch(
                `${API_BASE}/access/${encodeURIComponent(courseSlug)}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        // ========================================
        // READ RESPONSE
        // ========================================

        let data = {};


        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.warn(
                "Course access response was not valid JSON.",
                jsonError
            );

        }


        // ========================================
        // AUTHENTICATION FAILURE
        // ========================================

        if (
            response.status === 401
        ) {

            clearSession();

            redirectToLogin();

            return;
        }


        // ========================================
        // COURSE NOT FOUND
        // ========================================

        if (
            response.status === 404
        ) {

            console.error(
                "Course not found:",
                courseSlug,
                data.message
            );


            if (courseIntro) {

                courseIntro.textContent =
                    data.message ||
                    "The selected course could not be found.";
            }


            if (loading) {

                loading.hidden =
                    true;
            }


            if (app) {

                app.hidden =
                    false;
            }


            return;
        }


        // ========================================
        // OTHER SERVER ERROR
        // ========================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to verify course access."
            );
        }


        // ========================================
        // ACCESS NOT GRANTED
        // ========================================

        if (!data.hasAccess) {

            redirectToEnrollment();

            return;
        }


        // ========================================
        // VERIFIED ACCESS
        // ========================================

        if (courseTitle) {

            courseTitle.textContent =
                data.course?.name ||
                "Premium Course";
        }


        if (courseIntro) {

            courseIntro.textContent =
                "You have verified access to this premium learning area. Continue your structured training from here.";
        }


        // ========================================
        // DISPLAY COURSE
        // ========================================

        showCourse();


    } catch (error) {

        console.error(
            "PREMIUM COURSE ACCESS ERROR:",
            error
        );


        if (courseIntro) {

            courseIntro.textContent =
                "We could not verify your course access. Please try again.";
        }


        if (loading) {

            loading.hidden =
                true;
        }


        if (app) {

            app.hidden =
                false;
        }


        // ========================================
        // RETRY BUTTON
        // ========================================

        const retryButton =
            document.createElement(
                "button"
            );


        retryButton.type =
            "button";


        retryButton.className =
            "community-btn community-btn-primary";


        retryButton.textContent =
            "Try Again";


        retryButton.addEventListener(
            "click",
            checkCourseAccess
        );


        const actionArea =
            document.querySelector(
                ".premium-course-actions"
            );


        if (
            actionArea &&
            !actionArea.querySelector(
                ".access-retry-button"
            )
        ) {

            retryButton.classList.add(
                "access-retry-button"
            );


            actionArea.prepend(
                retryButton
            );
        }
    }
}


// ========================================
// START
// ========================================

checkCourseAccess();