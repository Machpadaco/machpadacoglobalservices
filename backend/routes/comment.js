const express = require("express");

const router = express.Router();

// ==============================
// IMPORT CONTROLLERS
// ==============================
const {

    createComment,
    editComment,
    deleteComment,
    getCommentsByPost

} = require("../controllers/commentController");

const {

    createReply,
    editReply,
    deleteReply

} = require("../controllers/replyController");

// ==============================
// COMMENT ROUTES
// ==============================

// CREATE COMMENT
router.post("/create", createComment);

// GET COMMENTS BY POST
router.get("/post/:postId", getCommentsByPost);

// EDIT COMMENT
router.put("/edit/:commentId", editComment);

// DELETE COMMENT
router.delete("/delete/:commentId", deleteComment);

// ==============================
// REPLY ROUTES
// ==============================

// CREATE REPLY
router.post("/reply/create", createReply);

// EDIT REPLY
router.put("/reply/edit/:replyId", editReply);

// DELETE REPLY
router.delete("/reply/delete/:replyId", deleteReply);

module.exports = router;