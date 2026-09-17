// ========================================
// MACHpadaco Global Services
// Main JavaScript Controller
// ========================================

// 1. TOP-LEVEL STATIC IMPORTS
// Must remain at the top
import "./components.js";
import "./header.js";
import "./footer.js";
import "./auth.js";


// ========================================
// 2. PAGE-SPECIFIC DYNAMIC ROUTING
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const page =
        document.body?.dataset?.page;


    switch (page) {

        // ========================================
        // HOME
        // ========================================

        case "home":
            import("./home.js");
            break;


        // ========================================
        // ABOUT
        // ========================================

        case "about":
            import("./about.js");
            break;


        // ========================================
        // SERVICES
        // ========================================

        case "services":
            import("./services.js");
            break;


        // ========================================
        // SOFTWARE DEVELOPMENT
        // ========================================

        case "software":
            import("./software.js");
            break;


        // ========================================
        // PORTFOLIO
        // ========================================

        case "portfolio":
            import("./portfolio.js");
            break;


        // ========================================
        // COMMUNITY
        // ========================================

        case "community":
            import("./community.js");
            break;


        // ========================================
        // CONTACT
        // ========================================

        case "contact":
            import("./contact-page-handler.js");
            break;


        // ========================================
        // ENVIRONMENTAL
        // ========================================

        case "environmental":
            import("./environmental.js");
            break;


        // ========================================
        // PHONE REPAIRS
        // ========================================

        case "phonerepairs":
            import("./phonerepairs.js");
            break;


        // ========================================
        // AFFILIATE MARKETING
        // ========================================

        case "affiliate":
            import("./affiliate.js");
            break;


        // ========================================
        // VIRTUAL ASSISTANCE
        // ========================================

        case "virtual-assistance":
            import("./virtual-assistance.js");
            break;


        // ========================================
        // PROFILE
        // ========================================

        case "profile":
            import("./profile.js");
            break;


        // ========================================
        // LOGIN
        // ========================================

        case "login":
            import("./login.js");
            break;


        // ========================================
        // SIGNUP
        // ========================================

        case "signup":
            import("./signup.js");
            break;


        // ========================================
        // ADMIN LOGIN
        // ========================================

        case "admin-login":
            import("./admin-login.js");
            break;


        // ========================================
        // ADMIN CONTACTS
        // ========================================

        case "admin-contacts":
            import("./admin-contacts.js");
            break;


        // ========================================
        // PREMIUM ENROLLMENT
        // ========================================

        case "enroll":
            import("./enroll.js");
            break;


        // ========================================
        // ADMIN PREMIUM ENROLLMENTS
        // ========================================

        case "admin-enrollments":
            import("./admin-enrollments.js");
            break;


        // ========================================
        // PROTECTED PREMIUM COURSE
        // ========================================

        case "premium-course":

            // premium-course.js is loaded directly
            // by the protected course HTML page.

            break;


        // ========================================
        // DEFAULT
        // ========================================

        default:

            console.log(
                "No page-specific JavaScript loaded for page:",
                page
            );

            break;
    }

});