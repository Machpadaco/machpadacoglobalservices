const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();

// ==============================
// FORCE HTTP TO HTTPS REDIRECT
// ==============================
app.use((req, res, next) => {
    // Detect unencrypted HTTP requests from reverse proxies/load balancers
    const isHttp =
        req.headers["x-forwarded-proto"] === "http" ||
        req.protocol === "http";

    if (
        isHttp &&
        process.env.NODE_ENV === "production"
    ) {
        return res.redirect(
            301,
            `https://${req.headers.host}${req.url}`
        );
    }

    next();
});

// ==============================
// CREATE HTTP SERVER
// ==============================
const server = http.createServer(app);

// ==============================
// SOCKET.IO INITIALIZATION
// ==============================
const io = new Server(server, {
    cors: {
        origin: [
            "https://machpadaco.com",
            "https://www.machpadaco.com"
        ],
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ]
    }
});

// ==============================
// MAKE IO AVAILABLE GLOBALLY
// ==============================
app.set("io", io);

// ==============================
// GLOBAL MIDDLEWARE
// ==============================

const allowedOrigins = [
    // Production
    "https://machpadaco.com",
    "https://www.machpadaco.com",

    // Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header
            // e.g. Postman or server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log(
                "❌ CORS blocked origin:",
                origin
            );

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: true
    })
);

// ==============================
// HANDLE CORS PREFLIGHT REQUESTS
// ==============================
app.options("*", cors());

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

// ==============================
// STATIC FRONTEND FOLDER
// ==============================
// Absolute path resolution for static assets
// (CSS, JS, Images, HTML)
app.use(
    express.static(
        path.resolve(
            __dirname,
            "..",
            "frontend"
        )
    )
);

// ==============================
// INJECT SOCKET.IO INTO REQUEST
// ==============================
app.use((req, res, next) => {
    req.io = io;
    next();
});

// ==============================
// SOCKET CONNECTIONS
// ==============================
io.on("connection", (socket) => {

    console.log(
        "⚡ User Connected:",
        socket.id
    );

    // ==============================
    // REGISTER USER PRIVATE ROOM
    // ==============================
    socket.on("registerUser", (userId) => {

        if (!userId) return;

        const roomId =
            userId.toString();

        socket.join(roomId);

        socket.userIdString =
            roomId;

        console.log(
            `👤 User joined private room: ${roomId}`
        );
    });

    // ==============================
    // JOIN COMMUNITY CHANNEL
    // ==============================
    socket.on(
        "joinChannelTopic",
        (topicName) => {

            if (!topicName) return;

            const existingRooms =
                Array.from(socket.rooms);

            existingRooms.forEach(
                (room) => {

                    if (
                        room !== socket.id &&
                        room !== socket.userIdString
                    ) {
                        socket.leave(room);
                    }

                }
            );

            socket.join(topicName);

            console.log(
                `📡 ${socket.id} joined channel: ${topicName}`
            );
        }
    );

    // ==============================
    // POST EVENTS
    // ==============================
    socket.on(
        "postCreated",
        (topic = "general") => {
            io.to(topic).emit(
                "postCreated"
            );
        }
    );

    socket.on(
        "postUpdated",
        (topic = "general") => {
            io.to(topic).emit(
                "postUpdated"
            );
        }
    );

    socket.on(
        "postDeleted",
        (topic = "general") => {
            io.to(topic).emit(
                "postDeleted"
            );
        }
    );

    // ==============================
    // LIKE EVENTS
    // ==============================
    socket.on(
        "likeUpdated",
        (topic = "general") => {
            io.to(topic).emit(
                "likeUpdated"
            );
        }
    );

    // ==============================
    // COMMENT EVENTS
    // ==============================
    socket.on(
        "commentAdded",
        (topic = "general") => {
            io.to(topic).emit(
                "commentAdded"
            );
        }
    );

    socket.on(
        "commentUpdated",
        (topic = "general") => {
            io.to(topic).emit(
                "commentUpdated"
            );
        }
    );

    socket.on(
        "commentDeleted",
        (topic = "general") => {
            io.to(topic).emit(
                "commentDeleted"
            );
        }
    );

    // ==============================
    // REPLY EVENTS
    // ==============================
    socket.on(
        "replyAdded",
        (topic = "general") => {
            io.to(topic).emit(
                "replyAdded"
            );
        }
    );

    socket.on(
        "replyUpdated",
        (topic = "general") => {
            io.to(topic).emit(
                "replyUpdated"
            );
        }
    );

    socket.on(
        "replyDeleted",
        (topic = "general") => {
            io.to(topic).emit(
                "replyDeleted"
            );
        }
    );

    // ==============================
    // NOTIFICATION EVENTS
    // ==============================
    socket.on(
        "sendNotification",
        (payload) => {

            if (
                !payload ||
                !payload.recipient
            ) return;

            const recipientRoom =
                payload.recipient.toString();

            io.to(recipientRoom).emit(
                "notificationReceived",
                payload
            );

            console.log(
                `🔔 Notification sent to ${recipientRoom}`
            );
        }
    );

    socket.on(
        "notificationUpdated",
        (recipientId) => {

            if (!recipientId) {
                io.emit(
                    "notificationUpdated"
                );
                return;
            }

            io.to(
                recipientId.toString()
            ).emit(
                "notificationUpdated"
            );
        }
    );

    socket.on(
        "notificationRead",
        (recipientId) => {

            if (!recipientId) {
                io.emit(
                    "notificationUpdated"
                );
                return;
            }

            io.to(
                recipientId.toString()
            ).emit(
                "notificationUpdated"
            );
        }
    );

    socket.on(
        "notificationDeleted",
        (recipientId) => {

            if (!recipientId) {
                io.emit(
                    "notificationUpdated"
                );
                return;
            }

            io.to(
                recipientId.toString()
            ).emit(
                "notificationUpdated"
            );
        }
    );

    // ==============================
    // DISCONNECT
    // ==============================
    socket.on("disconnect", () => {

        console.log(
            "❌ User Disconnected:",
            socket.id
        );

    });

});

// ==============================
// PAGE ROUTES
// ==============================
app.get(
    "/pricing.html",
    (req, res) => {

        res.sendFile(
            path.resolve(
                __dirname,
                "..",
                "frontend",
                "pricing.html"
            )
        );

    }
);

app.get(
    "/community.html",
    (req, res) => {

        res.sendFile(
            path.resolve(
                __dirname,
                "..",
                "frontend",
                "community.html"
            )
        );

    }
);

// ==============================
// ADMIN PAGE ROUTES
// ==============================
app.get(
    "/admin-login",
    (req, res) => {

        res.sendFile(
            path.resolve(
                __dirname,
                "..",
                "frontend",
                "admin-login.html"
            )
        );

    }
);

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            path.resolve(
                __dirname,
                "..",
                "frontend",
                "admin-contacts.html"
            )
        );

    }
);

// ==============================
// TEST / ROOT ROUTE
// ==============================
app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.resolve(
                __dirname,
                "..",
                "frontend",
                "index.html"
            )
        );

    }
);

// ==============================
// ROUTES IMPORTS
// ==============================
const authRoutes =
    require("./routes/authRoutes");

const userRoutes =
    require("./routes/user");

const postRoutes =
    require("./routes/post");

const commentRoutes =
    require("./routes/comment");

const replyRoutes =
    require("./routes/reply");

const notificationRoutes =
    require("./routes/notificationRoutes");

const contactRoutes =
    require("./routes/contactRoutes");

// ==============================
// PREMIUM ENROLLMENT ROUTES
// ==============================
const enrollmentRoutes =
    require("./routes/enrollmentRoutes");

// ==============================
// API ROUTES
// ==============================
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/user",
    userRoutes
);

app.use(
    "/api/posts",
    postRoutes
);

app.use(
    "/api/comment",
    commentRoutes
);

app.use(
    "/api/reply",
    replyRoutes
);

app.use(
    "/api/notification",
    notificationRoutes
);

app.use(
    "/api/contact",
    contactRoutes
);

// ==============================
// PREMIUM ENROLLMENT API
// ==============================
app.use(
    "/api/enrollments",
    enrollmentRoutes
);

// ==============================
// DATABASE CONNECTION
// ==============================
mongoose.connect(
    process.env.MONGO_URI
)

    .then(() => {

        console.log(
            "✅ MongoDB Connected"
        );

        const PORT =
            process.env.PORT || 5000;

        server.listen(
            PORT,
            () => {

                console.log(
                    `🚀 Server running on port ${PORT}`
                );

            }
        );

    })

    .catch((err) => {

        console.log(
            "❌ MongoDB Connection Error:",
            err
        );

    });