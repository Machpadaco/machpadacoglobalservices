const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// ==============================
// CREATE POST (WITH COMMUNITY SCOPING)
// ==============================
exports.createPost = async (req, res) => {
    try {
        const {
            userId,
            author,
            authorImage,
            text,
            scope,
            topic
        } = req.body;

        if (!userId || !author || !text) {
            return res.status(400).json({
                message: "All required fields must be filled"
            });
        }

        const newPost = new Post({
            userId,
            author,
            authorImage,
            text,
            likes: [],
            comments: [],
            scope: scope || "free",
            topic: topic || "general"
        });

        await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (err) {
        console.error("CREATE POST ERROR:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// GET ALL POSTS (DYNAMIC SCOPE & TOPIC ROUTE GUARD)
// ==============================
exports.getAllPosts = async (req, res) => {
    try {
        const { currentTopic, userId } = req.query;
        const targetTopic = currentTopic || "general";

        const premiumTracks = ["software-dev", "affiliate-marketing", "phone-repairs", "graphic-design"];
        
        let queryConditions = { topic: "general" };

        if (premiumTracks.includes(targetTopic)) {
            if (!userId) {
                return res.status(403).json({ 
                    message: "🔒 Access Locked. Please log in to view premium tracking streams." 
                });
            }

            const userDoc = await User.findById(userId);

            if (!userDoc) {
                return res.status(403).json({ message: "User account verification failed." });
            }

            if (userDoc.role === "admin" || userDoc.role === "instructor") {
                queryConditions = { topic: targetTopic };
            } else {
                const isPaid = userDoc.isPaidStudent || false;
                const enrolled = userDoc.enrolledCourses || [];

                if (!isPaid || !enrolled.includes(targetTopic)) {
                    return res.status(403).json({ 
                        message: "🔒 Access Locked. Please enroll in this premium community track." 
                    });
                }
                
                queryConditions = { scope: "paid", topic: targetTopic };
            }
        } else {
            queryConditions = { topic: "general" };
        }

        const posts = await Post.find(queryConditions)
            .sort({ createdAt: -1 })
            .populate({
                path: "comments",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "replies",
                    options: { sort: { createdAt: 1 } }
                }
            });

        res.status(200).json(posts);

    } catch (err) {
        console.error("GET POSTS ERROR:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// LIKE / UNLIKE POST
// ==============================
exports.likePost = async (req, res) => {
    try {
        const { userId, author } = req.body; 
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (!post.likes) post.likes = [];

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                id => id.toString() !== userId
            );
        } else {
            post.likes.push(userId);

            if (post.userId) {
                const isSelfAction = post.userId.toString() === userId;
                const displayName = author || "Someone";

                // 🚀 FIX: Passed post.topic explicitly into data payload
                await createNotification({
                    recipient: post.userId,
                    sender: userId,
                    type: "like",
                    topic: post.topic || "general", 
                    postId: post._id,
                    message: isSelfAction
                        ? `🧪 Test alert: You liked your own post!`
                        : `${displayName} liked your post`
                }, req.io);
            }
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likesCount: post.likes.length,
            likes: post.likes
        });

    } catch (err) {
        console.error("LIKE POST ERROR:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// UPDATE POST
// ==============================
exports.updatePost = async (req, res) => {
    try {
        const { text } = req.body;

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            { text },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json({
            message: "Post updated",
            post: updatedPost
        });

    } catch (err) {
        console.error("UPDATE POST ERROR:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// DELETE POST (SAFE CASCADE CLEANUP)
// ==============================
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await Comment.find({ postId: post._id });

        for (const comment of comments) {
            await Reply.deleteMany({ commentId: comment._id });
            await Notification.deleteMany({ commentId: comment._id });
        }

        await Comment.deleteMany({ postId: post._id });
        await Notification.deleteMany({ postId: post._id });
        await Post.findByIdAndDelete(req.params.postId);

        // 🚀 FIX: Dispatches unified event channel hook to refresh local UI safely
        if (req.io && post.userId) {
            const recipientRoom = post.userId.toString();
            req.io.to(recipientRoom).emit("notificationDeleted");
        }

        res.status(200).json({
            message: "Post and all related comments, replies, and notifications purged successfully"
        });

    } catch (err) {
        console.error("DELETE POST ERROR:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// UPDATE POST TEXT (EDIT ACTION)
// ==============================
exports.editPostText = async (req, res) => {
    try {
        const { userId, text } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: "Not allowed" });
        }

        post.text = text;
        await post.save();

        res.status(200).json({
            message: "Post updated",
            post
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};