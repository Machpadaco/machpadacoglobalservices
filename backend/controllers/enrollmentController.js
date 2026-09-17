const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { getCourse } = require("../config/courseCatalog");

function publicEnrollment(enrollment) {
    return {
        id: enrollment._id.toString(),
        user: enrollment.user,
        courseSlug: enrollment.courseSlug,
        courseName: enrollment.courseName,
        amount: enrollment.amount,
        paymentReference: enrollment.paymentReference,
        status: enrollment.status,
        adminNote: enrollment.adminNote || "",
        verifiedAt: enrollment.verifiedAt,
        rejectedAt: enrollment.rejectedAt,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt
    };
}

// GET /api/enrollments/courses
exports.listCourses = async (req, res) => {
    const { courses } = require("../config/courseCatalog");

    res.status(200).json({
        success: true,
        data: Object.entries(courses).map(([slug, course]) => ({
            slug,
            name: course.name,
            price: course.price,
            description: course.description
        }))
    });
};

// GET /api/enrollments/payment-details
exports.getPaymentDetails = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            bankName: process.env.PAYMENT_BANK_NAME || "",
            accountName: process.env.PAYMENT_ACCOUNT_NAME || "Machpadaco Global Services",
            accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || "",
            whatsappNumber: process.env.PAYMENT_WHATSAPP_NUMBER || ""
        }
    });
};

// POST /api/enrollments
// Creates a pending enrollment. It NEVER grants premium access.
exports.createEnrollment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseSlug, paymentReference } = req.body;

        if (!courseSlug || !paymentReference) {
            return res.status(400).json({
                success: false,
                message: "Course and payment reference are required."
            });
        }

        const course = getCourse(courseSlug);
        if (!course) {
            return res.status(400).json({
                success: false,
                message: "Invalid course selected."
            });
        }

        if (!course.price || course.price <= 0) {
            return res.status(503).json({
                success: false,
                message: "The fee for this course has not been configured yet. Please contact Machpadaco."
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const reference = String(paymentReference).trim();
        if (reference.length < 3 || reference.length > 120) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid payment reference."
            });
        }

        const existing = await Enrollment.findOne({
            user: userId,
            courseSlug
        });

        if (existing && existing.status === "verified") {
            return res.status(409).json({
                success: false,
                message: "You already have verified access to this course.",
                data: publicEnrollment(existing)
            });
        }

        if (existing && existing.status === "pending") {
            return res.status(409).json({
                success: false,
                message: "A payment verification request for this course is already pending.",
                data: publicEnrollment(existing)
            });
        }

        // A rejected record can be submitted again by updating it.
        const enrollment = existing || new Enrollment({
            user: userId,
            courseSlug,
            courseName: course.name,
            amount: course.price
        });

        enrollment.courseName = course.name;
        enrollment.amount = course.price;
        enrollment.paymentReference = reference;
        enrollment.status = "pending";
        enrollment.adminNote = "";
        enrollment.verifiedAt = null;
        enrollment.rejectedAt = null;

        await enrollment.save();

        res.status(201).json({
            success: true,
            message: "Enrollment submitted. Your payment is awaiting verification.",
            data: publicEnrollment(enrollment)
        });
    } catch (error) {
        console.error("CREATE ENROLLMENT ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Unable to submit enrollment. Please try again."
        });
    }
};

// GET /api/enrollments/access/:courseSlug
exports.checkCourseAccess = async (req, res) => {
    try {
        const course = getCourse(req.params.courseSlug);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found." });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            courseSlug: req.params.courseSlug,
            status: "verified"
        });

        res.status(200).json({
            success: true,
            hasAccess: Boolean(enrollment),
            course: {
                slug: req.params.courseSlug,
                name: course.name
            }
        });
    } catch (error) {
        console.error("CHECK COURSE ACCESS ERROR:", error);
        res.status(500).json({ success: false, message: "Unable to check course access." });
    }
};

// GET /api/enrollments/my
exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: enrollments.map(publicEnrollment)
        });
    } catch (error) {
        console.error("GET MY ENROLLMENTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve your enrollments."
        });
    }
};

// GET /api/enrollments/admin
exports.getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate("user", "fullName email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments.map(publicEnrollment)
        });
    } catch (error) {
        console.error("GET ENROLLMENTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve enrollments."
        });
    }
};

// PATCH /api/enrollments/admin/:id
exports.updateEnrollmentStatus = async (req, res) => {
    try {
        const { status, adminNote = "" } = req.body;

        if (!["verified", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be verified or rejected."
            });
        }

        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });
        }

        const user = await User.findById(enrollment.user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student account not found."
            });
        }

        enrollment.status = status;
        enrollment.adminNote = String(adminNote).trim().slice(0, 500);

        if (status === "verified") {
            enrollment.verifiedAt = new Date();
            enrollment.rejectedAt = null;

            if (!user.enrolledCourses.includes(enrollment.courseSlug)) {
                user.enrolledCourses.push(enrollment.courseSlug);
            }
            user.isPaidStudent = true;
        } else {
            enrollment.rejectedAt = new Date();
            enrollment.verifiedAt = null;

            // Remove access to this course if it had previously been verified.
            user.enrolledCourses = user.enrolledCourses.filter(
                courseSlug => courseSlug !== enrollment.courseSlug
            );

            // Keep paid status when another verified course still exists.
            const verifiedCount = await Enrollment.countDocuments({
                user: user._id,
                status: "verified",
                _id: { $ne: enrollment._id }
            });

            user.isPaidStudent = verifiedCount > 0;
        }

        await enrollment.save();
        await user.save();

        res.status(200).json({
            success: true,
            message: status === "verified"
                ? "Payment verified and course access granted."
                : "Enrollment rejected.",
            data: publicEnrollment(enrollment)
        });
    } catch (error) {
        console.error("UPDATE ENROLLMENT ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update enrollment."
        });
    }
};
