const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    author: {
        type: String,
        required: true
    },

    authorImage: {
        type: String,
        default: ""
    },

    text: {
        type: String,
        required: true
    },

    // ==============================
    // LIKES
    // ==============================
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    // ==============================
    // COMMENTS
    // ==============================
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],

    // ==============================
    // 🚀 LEARNING COMMUNITY SCoping
    // ==============================
    scope: {
        type: String,
        enum: ["free", "paid"],
        default: "free"
    },

    topic: {
        type: String,
        // 🚀 FIX: Expanded enum options to fully recognize your new tracks
        enum: ["general", "software-dev", "affiliate-marketing", "phone-repairs", "graphic-design"],
        default: "general"
    }

}, { timestamps: true });

module.exports = mongoose.model(
    "Post",
    postSchema
);