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
    updateEnrollmentStatus
} = require("../controllers/enrollmentController");

// Course catalog is public so the enrollment page can display server-controlled fees.
router.get("/courses", listCourses);

router.get("/payment-details", getPaymentDetails);

// Student enrollment endpoints.
router.post("/", authMiddleware, createEnrollment);
router.get("/my", authMiddleware, getMyEnrollments);
router.get("/access/:courseSlug", authMiddleware, checkCourseAccess);

// Admin payment/enrollment management.
router.get("/admin", authMiddleware, adminMiddleware, getAllEnrollments);
router.patch("/admin/:id", authMiddleware, adminMiddleware, updateEnrollmentStatus);

module.exports = router;
