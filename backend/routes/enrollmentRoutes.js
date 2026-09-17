const express = require("express");
const router = express.Router();

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");

const {
    listCourses,
    getPaymentDetails,
    createEnrollment,
    getMyEnrollments,
    checkCourseAccess,
    getAllEnrollments,
    updateEnrollmentStatus,
    listAdminCourses,
    updateCoursePrice
} = require("../controllers/enrollmentController");


// ========================================
// PUBLIC COURSE ROUTES
// ========================================

// Get all premium courses and their current prices
router.get("/courses", listCourses);

// Get payment/bank details
router.get("/payment-details", getPaymentDetails);


// ========================================
// STUDENT ROUTES
// ========================================

// Submit an enrollment/payment verification request
router.post(
    "/",
    authMiddleware,
    createEnrollment
);

// Get the logged-in student's enrollments
router.get(
    "/my",
    authMiddleware,
    getMyEnrollments
);

// Check whether the logged-in student has
// verified access to a particular course
router.get(
    "/access/:courseSlug",
    authMiddleware,
    checkCourseAccess
);


// ========================================
// ADMIN COURSE PRICING ROUTES
// ========================================

// Get all courses and their current prices
router.get(
    "/admin/courses",
    authMiddleware,
    adminMiddleware,
    listAdminCourses
);

// Update a course price
router.patch(
    "/admin/courses/:slug",
    authMiddleware,
    adminMiddleware,
    updateCoursePrice
);


// ========================================
// ADMIN ENROLLMENT ROUTES
// ========================================

// Get all student enrollments
router.get(
    "/admin",
    authMiddleware,
    adminMiddleware,
    getAllEnrollments
);

// Verify or reject an enrollment
router.patch(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    updateEnrollmentStatus
);


module.exports = router;