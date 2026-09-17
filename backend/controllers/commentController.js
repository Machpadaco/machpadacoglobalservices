// ==============================
// IMPORTS
// ==============================
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Reply = require("../models/Reply");
const Notification = require("../models/Notification");

const { createNotification } = require("./notificationController");

// ==============================
// CREATE A NEW COMMENT
// ==============================
exports.createComment = async (req, res) => {

    try {

        const {
            postId,
            userId,
            author,
            authorImage,
            text
        } = req.body;

        // ==============================
        // VALIDATION
        // ==============================
        if (!postId || !userId || !text) {

            return res.status(400).json({
                message: "Required parameters missing."
            });

        }

        // ==============================
        // FIND TARGET POST
        // ==============================
        const post = await Post.findById(postId);

        if (!post) {

            return res.status(404).json({
                message: "Target post not found."
            });

        }

        // ==============================
        // CREATE COMMENT
        // ==============================
        const comment = await Comment.create({

            postId,
            userId,
            author,
            authorImage,
            text,
            replies: []

        });

        // ==============================
        // PUSH COMMENT TO POST
        // ==============================
        post.comments.push(comment._id);

        await post.save();

        // ==============================
        // CREATE NOTIFICATION
        // ==============================
        // IMPORTANT:
        // Make sure your Post model uses "userId"
        // If your model uses "user" instead,
        // replace ALL post.userId with post.user
        // ==============================

        if (
            post.userId &&
            post.userId.toString() !== userId
        ) {

            await createNotification({

                recipient: post.userId,
                sender: userId,

                type: "comment",

                topic: post.topic || "general",

                postId: post._id,

                commentId: comment._id,

                message: `${author || "Someone"} commented on your post`

            }, req.io);

        }

        // ==============================
        // RESPONSE
        // ==============================
        res.status(201).json({

            message: "Comment posted successfully",
            comment

        });

    } catch (err) {

        console.error("CREATE COMMENT ERROR:", err);

        res.status(500).json({
            message: "Server error"
        });

    }

};

// ==============================
// EDIT COMMENT
// ==============================
exports.editComment = async (req, res) => {

    try {

        const {
            text,
            userId
        } = req.body;

        // ==============================
        // VALIDATION
        // ==============================
        if (!text) {

            return res.status(400).json({
                message: "Comment text is required"
            });

        }

        // ==============================
        // FIND COMMENT
        // ==============================
        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        // ==============================
        // OWNER CHECK
        // ==============================
        if (
            comment.userId.toString() !== userId
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        // ==============================
        // UPDATE COMMENT
        // ==============================
        comment.text = text;

        comment.edited = true;

        await comment.save();

        // ==============================
        // RESPONSE
        // ==============================
        res.status(200).json({

            message: "Comment updated successfully",
            comment

        });

    } catch (err) {

        console.error("EDIT COMMENT ERROR:", err);

        res.status(500).json({
            message: "Server error"
        });

    }

};

// ==============================
// DELETE COMMENT
// ==============================
exports.deleteComment = async (req, res) => {

    try {

        const {
            userId
        } = req.body;

        // ==============================
        // FIND COMMENT
        // ==============================
        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        // ==============================
        // OWNER CHECK
        // ==============================
        if (
            comment.userId.toString() !== userId
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        // ==============================
        // REMOVE COMMENT FROM POST
        // ==============================
        await Post.findByIdAndUpdate(

            comment.postId,

            {
                $pull: {
                    comments: comment._id
                }
            }

        );

        // ==============================
        // DELETE REPLIES
        // ==============================
        await Reply.deleteMany({

            commentId: comment._id

        });

        // ==============================
        // DELETE NOTIFICATIONS
        // ==============================
        await Notification.deleteMany({

            commentId: comment._id

        });

        // ==============================
        // DELETE COMMENT
        // ==============================
        await Comment.findByIdAndDelete(
            req.params.commentId
        );

        // ==============================
        // RESPONSE
        // ==============================
        res.status(200).json({

            message: "Comment and replies deleted successfully"

        });

    } catch (err) {

        console.error("DELETE COMMENT ERROR:", err);

        res.status(500).json({
            message: "Server error"
        });

    }

};

// ==============================
// GET COMMENTS FOR A POST
// ==============================
exports.getCommentsByPost = async (req, res) => {

    try {

        const comments = await Comment.find({

            postId: req.params.postId

        }).sort({

            createdAt: -1

        });

        res.status(200).json(comments);

    } catch (err) {

        console.error("GET COMMENTS ERROR:", err);

        res.status(500).json({
            message: "Server error"
        });

    }

};