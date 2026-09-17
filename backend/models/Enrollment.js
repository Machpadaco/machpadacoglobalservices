const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    courseSlug: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    courseName: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    paymentReference: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
        index: true
    },

    adminNote: {
        type: String,
        default: ""
    },

    verifiedAt: {
        type: Date,
        default: null
    },

    rejectedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// One student should not have two active enrollment records for the same course.
enrollmentSchema.index(
    { user: 1, courseSlug: 1 },
    { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
