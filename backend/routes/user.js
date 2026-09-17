const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

// ==========================================
// 🚀 IMPORT CLEAN DECOUPLED CONTROLLER LOGIC
// ==========================================
const { 
    uploadProfileImage, 
    updateProfile, 
    enrollInTrack 
} = require("../controllers/userController");

// ==========================================
// 🛣️ USER PROFILE ENDPOINT LAYERS
// ==========================================

// 🖼️ Upload profile image + save to DB (uses Multer middleware)
router.post("/upload-profile", upload.single("image"), uploadProfileImage);

// 📝 Update core profile fields (Name + Phone)
router.put("/update-profile", updateProfile);

// 🎓 Handle premium track student enrollments
router.post("/enroll-track", enrollInTrack);

// ==========================================
// 📤 EXPORT ROUTER
// ==========================================
module.exports = router;