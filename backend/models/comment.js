const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },

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

    // ✅ ADD THIS (CRITICAL FIX)
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply"
    }]

}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);