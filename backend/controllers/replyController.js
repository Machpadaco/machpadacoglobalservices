const Reply = require("../models/Reply");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { createNotification } = require("./notificationController");

// ==============================
// CREATE REPLY
// ==============================
exports.createReply = async (req, res) => {
try {

    const {
        commentId,
        userId,
        author,
        authorImage,
        text,
        parentReplyId
    } = req.body;

    if (!commentId || !userId || !text) {
        return res.status(400).json({
            message: "Required parameters missing."
        });
    }

    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
        return res.status(404).json({
            message: "Parent comment not found."
        });
    }

    const rootPost = await Post.findById(parentComment.postId);

    const topic =
        rootPost?.topic || "general";

    const reply = await Reply.create({
        commentId,
        userId,
        author,
        authorImage,
        text,
        parentReplyId: parentReplyId || null
    });

    parentComment.replies.push(reply._id);

    await parentComment.save();

    // ==============================
    // REPLY TO ANOTHER REPLY
    // ==============================
    if (parentReplyId) {

        const originalReply =
            await Reply.findById(parentReplyId);

        if (
            originalReply &&
            originalReply.userId.toString() !==
            userId.toString()
        ) {

            await createNotification({
                recipient:
                    originalReply.userId,

                sender:
                    userId,

                type:
                    "reply",

                topic,

                postId:
                    rootPost?._id || null,

                commentId:
                    parentComment._id,

                replyId:
                    reply._id,

                parentCommentId:
                    parentComment._id,

                message:
                    `${author || "Someone"} replied to your reply`
            }, req.io);

        }

    }

    // ==============================
    // REPLY TO COMMENT
    // ==============================
    else if (
        parentComment.userId &&
        parentComment.userId.toString() !==
        userId.toString()
    ) {

        await createNotification({
            recipient:
                parentComment.userId,

            sender:
                userId,

            type:
                "reply",

            topic,

            postId:
                rootPost?._id || null,

            commentId:
                parentComment._id,

            replyId:
                reply._id,

            message:
                `${author || "Someone"} replied to your comment`
        }, req.io);

    }

    if (req.io) {

        req.io.emit("replyAdded");

    }

    return res.status(201).json({
        message: "Reply added successfully",
        reply
    });

} catch (err) {

    console.error(
        "CREATE REPLY ERROR:",
        err
    );

    return res.status(500).json({
        message: "Server error"
    });

}


};

// ==============================
// EDIT REPLY
// ==============================
exports.editReply = async (req, res) => {
try {

    const {
        text,
        userId
    } = req.body;

    const reply =
        await Reply.findById(
            req.params.replyId
        );

    if (!reply) {

        return res.status(404).json({
            message: "Reply not found."
        });

    }

    if (
        reply.userId.toString() !==
        userId.toString()
    ) {

        return res.status(403).json({
            message: "Unauthorized."
        });

    }

    reply.text = text;

    await reply.save();

    if (req.io) {

        req.io.emit("replyUpdated");

    }

    return res.status(200).json({
        message:
            "Reply updated successfully",
        reply
    });

} catch (err) {

    console.error(
        "EDIT REPLY ERROR:",
        err
    );

    return res.status(500).json({
        message: "Server error"
    });

}

};

// ==============================
// DELETE REPLY
// ==============================
exports.deleteReply = async (req, res) => {
try {
    
    const {
        userId
    } = req.body;

    const replyId =
        req.params.replyId;

    const reply =
        await Reply.findById(replyId);

    if (!reply) {

        return res.status(404).json({
            message: "Reply not found."
        });

    }

    if (
        userId &&
        reply.userId.toString() !==
        userId.toString()
    ) {

        return res.status(403).json({
            message: "Unauthorized."
        });

    }

    await Comment.findByIdAndUpdate(
        reply.commentId,
        {
            $pull: {
                replies: reply._id
            }
        }
    );

    await Notification.deleteMany({
        replyId: reply._id
    });

    await Reply.findByIdAndDelete(
        reply._id
    );

    if (req.io) {

        req.io.emit("replyDeleted");

    }

    return res.status(200).json({
        message:
            "Reply deleted successfully"
    });

} catch (err) {

    console.error(
        "DELETE REPLY ERROR:",
        err
    );

    return res.status(500).json({
        message: "Server error"
    });

}

};
