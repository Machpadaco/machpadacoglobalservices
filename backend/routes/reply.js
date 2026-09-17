const express = require("express");
const router = express.Router();

// ==============================
// IMPORT CONTROLLERS
// ==============================
const {
createReply,
editReply,
deleteReply
} = require("../controllers/replyController");

// ==============================
// CREATE REPLY
// ==============================
router.post("/create", createReply);

// ==============================
// EDIT REPLY
// ==============================
router.put("/edit/:replyId", editReply);

// ==============================
// DELETE REPLY
// ==============================
router.delete("/delete/:replyId", deleteReply);

module.exports = router;