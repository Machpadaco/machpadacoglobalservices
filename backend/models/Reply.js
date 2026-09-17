const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
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

    parentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply",
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Reply", replySchema);