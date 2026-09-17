const jwt = require("jsonwebtoken");

// ==========================================
// VERIFY JWT TOKEN
// ==========================================
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No authorization token provided"
            });
        }

        // Expected format:
        // Authorization: Bearer YOUR_JWT_TOKEN
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        const token = authHeader
            .substring(7)
            .trim();

        if (!token) {
            return res.status(401).json({
                message: "Authorization token is missing"
            });
        }

        // Verify the token using the secret in .env
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        /*
         * The decoded token should normally contain:
         * {
         *   id: user._id,
         *   role: user.role,
         *   iat: ...,
         *   exp: ...
         * }
         */

        if (!decoded.id) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }

        // Make authenticated user information
        // available to controllers through req.user
        req.user = decoded;

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired. Please log in again."
            });
        }

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// ==========================================
// ADMIN AUTHORIZATION
// ==========================================
// This middleware must be used after authMiddleware.
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin authorization required."
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware
};