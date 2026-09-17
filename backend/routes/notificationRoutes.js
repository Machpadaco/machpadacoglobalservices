const express = require("express");
const router = express.Router();

// ==============================
// IMPORT CONTROLLER
// ==============================
const {
getNotifications,
markAsRead,
deleteNotification
} = require("../controllers/notificationController");

// ==============================
// GET USER NOTIFICATIONS
// Example:
// /api/notification/:userId
// /api/notification/:userId?topic=general
// ==============================
router.get("/:userId", getNotifications);

// ==============================
// MARK NOTIFICATION AS READ
// ==============================
router.put("/read/:notificationId", markAsRead);

// ==============================
// DELETE NOTIFICATION
// ==============================
router.delete("/delete/:notificationId", deleteNotification);

module.exports = router;