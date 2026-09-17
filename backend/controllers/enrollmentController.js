const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Course = require("../models/Course");
const { courses } = require("../config/courseCatalog");


// ========================================
// GET OR CREATE COURSE IN DATABASE
// ========================================
// Course names/descriptions come from courseCatalog.js.
// The price is only taken from the environment variables
// when the course is created for the first time.
//
// After that, the price stored in MongoDB is used.
// This allows the Admin Panel to change prices without
// changing Render environment variables.

async function getStoredCourse(courseSlug) {
    const catalogCourse = courses[courseSlug];

    if (!catalogCourse) {
        return null;
    }

    const course = await Course.findOneAndUpdate(
        { slug: courseSlug },
        {
            $setOnInsert: {
                slug: courseSlug,
                name: catalogCourse.name,
                description: catalogCourse.description,
                price: catalogCourse.price
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    ).lean();

    return course;
}


// ========================================
// PUBLIC ENROLLMENT DATA
// ========================================

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


// ========================================
// GET /api/enrollments/courses
// ========================================
// Public endpoint used by enroll.html.

exports.listCourses = async (req, res) => {
    try {
        const courseEntries = Object.entries(courses);

        const data = await Promise.all(
            courseEntries.map(async ([slug]) => {
                const course = await getStoredCourse(slug);

                return {
                    slug,
                    name: course.name,
                    price: course.price,
                    description: course.description
                };
            })
        );

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("LIST COURSES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve courses."
        });
    }
};


// ========================================
// GET /api/enrollments/payment-details
// ========================================

exports.getPaymentDetails = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            bankName: process.env.PAYMENT_BANK_NAME || "",
            accountName:
                process.env.PAYMENT_ACCOUNT_NAME ||
                "Machpadaco Global Services",
            accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || "",
            whatsappNumber: process.env.PAYMENT_WHATSAPP_NUMBER || ""
        }
    });
};


// ========================================
// POST /api/enrollments
// ========================================
// Creates a pending enrollment.
// It NEVER grants premium access.

exports.createEnrollment = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            courseSlug,
            paymentReference
        } = req.body;

        if (!courseSlug || !paymentReference) {
            return res.status(400).json({
                success: false,
                message: "Course and payment reference are required."
            });
        }

        // Get the LIVE course from MongoDB.
        const course = await getStoredCourse(courseSlug);

        if (!course) {
            return res.status(400).json({
                success: false,
                message: "Invalid course selected."
            });
        }

        if (!course.price || course.price <= 0) {
            return res.status(503).json({
                success: false,
                message:
                    "The fee for this course has not been configured yet. Please contact Machpadaco."
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
                message:
                    "You already have verified access to this course.",
                data: publicEnrollment(existing)
            });
        }

        if (existing && existing.status === "pending") {
            return res.status(409).json({
                success: false,
                message:
                    "A payment verification request for this course is already pending.",
                data: publicEnrollment(existing)
            });
        }

        const enrollment =
            existing ||
            new Enrollment({
                user: userId,
                courseSlug,
                courseName: course.name,
                amount: course.price
            });

        // Always use the current MongoDB course price
        // for new/re-submitted enrollment requests.
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
            message:
                "Enrollment submitted. Your payment is awaiting verification.",
            data: publicEnrollment(enrollment)
        });

    } catch (error) {
        console.error("CREATE ENROLLMENT ERROR:", error);

        res.status(500).json({
            success: false,
            message:
                "Unable to submit enrollment. Please try again."
        });
    }
};


// ========================================
// GET /api/enrollments/access/:courseSlug
// ========================================

exports.checkCourseAccess = async (req, res) => {
    try {
        const course = await getStoredCourse(
            req.params.courseSlug
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
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
        console.error(
            "CHECK COURSE ACCESS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to check course access."
        });
    }
};


// ========================================
// GET /api/enrollments/my
// ========================================

exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            data: enrollments.map(publicEnrollment)
        });

    } catch (error) {
        console.error(
            "GET MY ENROLLMENTS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to retrieve your enrollments."
        });
    }
};


// ========================================
// ADMIN — GET ALL ENROLLMENTS
// ========================================

exports.getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate(
                "user",
                "fullName email phone"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments.map(publicEnrollment)
        });

    } catch (error) {
        console.error(
            "GET ENROLLMENTS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to retrieve enrollments."
        });
    }
};


// ========================================
// ADMIN — UPDATE ENROLLMENT STATUS
// ========================================
// PATCH /api/enrollments/admin/:id

exports.updateEnrollmentStatus = async (req, res) => {
    try {
        const {
            status,
            adminNote = ""
        } = req.body;

        if (!["verified", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be verified or rejected."
            });
        }

        const enrollment =
            await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message:
                    "Enrollment not found."
            });
        }

        const user =
            await User.findById(enrollment.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "Student account not found."
            });
        }

        enrollment.status = status;

        enrollment.adminNote =
            String(adminNote)
                .trim()
                .slice(0, 500);

        if (status === "verified") {
            enrollment.verifiedAt = new Date();
            enrollment.rejectedAt = null;

            if (
                !user.enrolledCourses.includes(
                    enrollment.courseSlug
                )
            ) {
                user.enrolledCourses.push(
                    enrollment.courseSlug
                );
            }

            user.isPaidStudent = true;

        } else {
            enrollment.rejectedAt = new Date();
            enrollment.verifiedAt = null;

            user.enrolledCourses =
                user.enrolledCourses.filter(
                    courseSlug =>
                        courseSlug !==
                        enrollment.courseSlug
                );

            const verifiedCount =
                await Enrollment.countDocuments({
                    user: user._id,
                    status: "verified",
                    _id: {
                        $ne: enrollment._id
                    }
                });

            user.isPaidStudent =
                verifiedCount > 0;
        }

        await enrollment.save();
        await user.save();

        res.status(200).json({
            success: true,
            message:
                status === "verified"
                    ? "Payment verified and course access granted."
                    : "Enrollment rejected.",
            data: publicEnrollment(enrollment)
        });

    } catch (error) {
        console.error(
            "UPDATE ENROLLMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update enrollment."
        });
    }
};


// ========================================
// ADMIN — GET COURSE PRICES
// ========================================
// GET /api/enrollments/admin/courses

exports.listAdminCourses = async (req, res) => {
    try {
        const courseEntries =
            Object.entries(courses);

        const data = await Promise.all(
            courseEntries.map(async ([slug]) => {
                const course =
                    await getStoredCourse(slug);

                return {
                    slug,
                    name: course.name,
                    description: course.description,
                    price: course.price
                };
            })
        );

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error(
            "LIST ADMIN COURSES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to retrieve course pricing."
        });
    }
};


// ========================================
// ADMIN — UPDATE COURSE PRICE
// ========================================
// PATCH /api/enrollments/admin/courses/:slug

exports.updateCoursePrice = async (req, res) => {
    try {
        const {
            price
        } = req.body;

        const slug =
            String(req.params.slug || "").trim();

        // Make sure the course exists in our
        // official catalog.
        const catalogCourse =
            courses[slug];

        if (!catalogCourse) {
            return res.status(404).json({
                success: false,
                message:
                    "Course not found."
            });
        }

        const numericPrice =
            Number(price);

        if (
            !Number.isFinite(numericPrice) ||
            !Number.isInteger(numericPrice) ||
            numericPrice <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Course price must be a positive whole number."
            });
        }

        const updatedCourse =
            await Course.findOneAndUpdate(
                { slug },
                {
                    $set: {
                        price: numericPrice
                    },
                    $setOnInsert: {
                        slug,
                        name: catalogCourse.name,
                        description:
                            catalogCourse.description
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            ).lean();

        res.status(200).json({
            success: true,
            message:
                "Course price updated successfully.",
            data: {
                slug: updatedCourse.slug,
                name: updatedCourse.name,
                description:
                    updatedCourse.description,
                price: updatedCourse.price
            }
        });

    } catch (error) {
        console.error(
            "UPDATE COURSE PRICE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update course price."
        });
    }
};