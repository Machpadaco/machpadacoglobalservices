const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    // ==============================
    // PERSON RECEIVING NOTIFICATION
    // ==============================
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // ==============================
    // PERSON WHO TRIGGERED ACTION
    // ==============================
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // ==============================
    // OPTIONAL SENDER DETAILS
    // ==============================
    senderName: {
        type: String,
        default: ""
    },

    senderImage: {
        type: String,
        default: ""
    },

    // ==============================
    // WORKSPACE / ROOM ISOLATION TRACKING
    // ==============================
    topic: {
        type: String,
        default: "general" // Default fallback prevents server errors during testing
    },

    // ==============================
    // NOTIFICATION TYPE
    // ==============================
    type: {
        type: String,
        enum: [
            "like",
            "comment",
            "reply",
            "post",
            "update" // 🔥 Added to seamlessly support edit/update logging tracking safely
        ],
        required: true
    },

    // ==============================
    // RELATED POST
    // ==============================
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },

    // ==============================
    // RELATED COMMENT
    // ==============================
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    // ==============================
    // RELATED REPLIES (FIXES BREAKS ON REPLIES)
    // ==============================
    replyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply", // Maps safely to your app's Reply model if explicitly tracked
        default: null
    },

    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // Handles reply-to-reply context tree nesting targets smoothly
        default: null
    },

    // ==============================
    // NOTIFICATION MESSAGE
    // ==============================
    message: {
        type: String,
        required: true
    },

    // ==============================
    // READ STATUS
    // ==============================
    isRead: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);