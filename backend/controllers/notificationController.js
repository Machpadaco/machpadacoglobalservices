const Notification = require("../models/Notification");

// ==============================
// GET USER NOTIFICATIONS
// ==============================
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { topic } = req.query;

        const queryFilter = {
            recipient: userId
        };

        if (topic) {
            if (topic === "general") {
                queryFilter.$or = [
                    { topic: "general" },
                    { topic: { $exists: false } }
                ];
            } else {
                queryFilter.topic = topic;
            }
        }

        const notifications = await Notification.find(queryFilter)
            .populate(
                "sender",
                "fullName name email profileImage authorImage"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json(notifications);
    } catch (err) {
        console.error("Get Notifications Error:", err);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// MARK AS READ
// ==============================
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        if (req.io && notification.recipient) {
            req.io
                .to(notification.recipient.toString())
                .emit("notificationUpdated");
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (err) {
        console.error("Mark Notification Error:", err);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// DELETE NOTIFICATION
// ==============================
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        if (req.io && notification.recipient) {
            req.io
                .to(notification.recipient.toString())
                .emit("notificationUpdated");
        }

        return res.status(200).json({
            message: "Notification deleted successfully"
        });
    } catch (err) {
        console.error("Delete Notification Error:", err);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ==============================
// CREATE NOTIFICATION
// ==============================
exports.createNotification = async (data, io = null) => {
    try {
        if (!data || !data.recipient || !data.sender) {
            console.warn(
                "⚠️ Notification skipped - missing sender or recipient"
            );
            return null;
        }

        const allowedTypes = ["like", "comment", "reply", "post", "update"];
        const notificationType = allowedTypes.includes(data.type) ? data.type : "post";

        const notification = await Notification.create({
            recipient: data.recipient,
            sender: data.sender,
            type: notificationType,
            topic: data.topic || "general",
            postId: data.postId || null,
            commentId: data.commentId || null,
            replyId: data.replyId || null,
            parentCommentId: data.parentCommentId || null,
            message: data.message || "",
            isRead: false
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate(
                "sender",
                "fullName name email profileImage authorImage"
            );

        if (io && populatedNotification && data.recipient) {
            const room = data.recipient.toString();
            console.log(`🔔 Sending notification to room ${room}`);

            io.to(room).emit("notificationReceived", populatedNotification);
            io.to(room).emit("notificationUpdated");
        }

        return populatedNotification;
    } catch (err) {
        console.error("Create Notification Error:", err);
        return null;
    }
};