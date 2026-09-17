const User = require("../models/User");

// ==========================================
// 🖼️ UPLOAD PROFILE IMAGE + SAVE TO DB
// ==========================================
exports.uploadProfileImage = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const imageUrl = req.file.path;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profileImage = imageUrl;
        await user.save();

        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role || "student", // 🔥 Added to ensure frontend maintains route guard roles
            profileImage: user.profileImage,
            isPaidStudent: user.isPaidStudent || false,
            enrolledCourses: user.enrolledCourses || []
        };

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: user.profileImage,
            user: userResponse
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ message: "Upload failed" });
    }
};

// ==========================================
// 📝 UPDATE PROFILE (NAME + PHONE)
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const { userId, fullName, phone } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;

        await user.save();

        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role || "student", // 🔥 Added to keep client authorization states in sync
            profileImage: user.profileImage,
            isPaidStudent: user.isPaidStudent || false,
            enrolledCourses: user.enrolledCourses || []
        };

        res.status(200).json({
            message: "Profile updated successfully",
            user: userResponse
        });

    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ message: "Update failed" });
    }
};

// ==========================================
// 🎓 SIMULATED STUDENT PREMIUM ENROLLMENT
// ==========================================
exports.enrollInTrack = async (req, res) => {
    try {
        const { userId, topicTrack } = req.body;

        if (!userId || !topicTrack) {
            return res.status(400).json({ 
                message: "Missing userId or target topic track." 
            });
        }

        // Find the student document and append the premium track access parameters
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: { isPaidStudent: true },
                $addToSet: { enrolledCourses: topicTrack } // $addToSet guarantees no duplicate entries
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User account not found." });
        }

        // Standardized complete user object for frontend consumption
        const userResponse = {
            id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role || "student", // 🔥 Mapped for consistent course-track management
            profileImage: updatedUser.profileImage,
            isPaidStudent: updatedUser.isPaidStudent,
            enrolledCourses: updatedUser.enrolledCourses
        };

        res.status(200).json({
            message: `Successfully enrolled in premium track: ${topicTrack}`,
            user: userResponse
        });
    } catch (err) {
        console.error("ENROLLMENT ERROR:", err);
        res.status(500).json({ message: "Server enrollment processing error." });
    }
};