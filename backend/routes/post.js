const express = require("express");
const router = express.Router();

// ==========================================
// 🚀 IMPORT CLEAN DECOUPLED CONTROLLER LOGIC
// ==========================================
const {
    createPost,
    getAllPosts,
    likePost,
    updatePost,
    deletePost,
    editPostText
} = require("../controllers/postController");

// ==========================================
// 🛣️ COMMUNITY POST ENDPOINT LAYERS
// ==========================================

// Create a new post (handles track scoping)
router.post("/create", createPost);

// Fetch all posts matching track security rules
router.get("/all", getAllPosts);

// Handle real-time post likes and notifications
router.put("/like/:postId", likePost);

// Core post object updates
router.put("/update/:postId", updatePost);

// Inline text edits by the author
router.put("/edit/:postId", editPostText);

// Deep cascade removal of posts and associated sub-documents
router.delete("/delete/:postId", deletePost);

// ==========================================
// 📤 EXPORT ROUTER
// ==========================================
module.exports = router;