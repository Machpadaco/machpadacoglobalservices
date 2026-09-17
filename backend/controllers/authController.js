const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==============================
// SIGNUP
// ==============================
exports.signup = async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            password
        } = req.body;

        // Basic validation
        if (!fullName || !email || !phone || !password) {

            return res.status(400).json({
                message: "Please provide full name, email, phone and password"
            });

        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({

            fullName: fullName.trim(),

            email: normalizedEmail,

            phone: phone.trim(),

            password: hashedPassword,

            // All normal registrations are students
            role: "student",

            // New users have no premium access
            isPaidStudent: false,

            enrolledCourses: []

        });

        await newUser.save();

        res.status(201).json({

            message: "User registered successfully"

        });

    } catch (error) {

        console.error("SIGNUP ERROR:", error);

        res.status(500).json({

            message: "Server error during registration"

        });

    }

};


// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // Basic validation
        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });

        }

        // Make sure JWT secret exists
        if (!process.env.JWT_SECRET) {

            console.error("JWT_SECRET is missing from .env");

            return res.status(500).json({
                message: "Server authentication configuration error"
            });

        }

        // Normalize email
        const normalizedEmail =
            email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {

            return res.status(400).json({

                message: "Invalid credentials"

            });

        }

        // Compare password
        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(400).json({

                message: "Invalid credentials"

            });

        }


        // ==============================
        // CREATE JWT TOKEN
        // ==============================
        // The token contains:
        // 1. User ID
        // 2. User role
        //
        // authMiddleware.js uses the ID.
        // adminMiddleware.js uses the role.
        // ==============================

        const token = jwt.sign(

            {
                id: user._id.toString(),
                role: user.role || "student"
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        // ==============================
        // LOGIN RESPONSE
        // ==============================

        res.status(200).json({

            token,

            user: {

                id: user._id.toString(),

                _id: user._id.toString(),

                fullName:
                    user.fullName,

                email:
                    user.email,

                phone:
                    user.phone,

                profileImage:
                    user.profileImage || "",

                role:
                    user.role || "student",

                isPaidStudent:
                    user.isPaidStudent || false,

                enrolledCourses:
                    user.enrolledCourses || []

            }

        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({

            message: "Server error during login"

        });

    }

};