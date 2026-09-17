const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ==============================
        // BASIC USER INFORMATION
        // ==============================
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        // ==============================
        // PROFILE IMAGE
        // ==============================
        profileImage: {
            type: String,
            default: ""
        },

        // ==============================
        // ROLE MANAGEMENT
        // ==============================
        role: {
            type: String,
            enum: ["student", "admin", "instructor"],
            default: "student"
        },

        // ==============================
        // PREMIUM ACCESS
        // ==============================
        isPaidStudent: {
            type: Boolean,
            default: false
        },

        // Stores the course slugs the student
        // has been approved to access.
        enrolledCourses: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);