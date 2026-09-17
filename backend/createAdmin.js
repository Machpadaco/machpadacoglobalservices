require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

// ==============================
// LOAD USER MODEL
// ==============================

const User = require(
    path.join(__dirname, "models/User")
);


// ==============================
// CREATE / UPDATE ADMIN
// ==============================

async function createAdmin() {

    try {

        // ==============================
        // CONNECT TO DATABASE
        // ==============================

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Database connected...");


        // ==============================
        // GET ADMIN CREDENTIALS
        // ==============================

        const adminEmail =
            process.env.ADMIN_EMAIL;

        const rawPassword =
            process.env.ADMIN_PASSWORD;

        const adminFullName =
            process.env.ADMIN_FULL_NAME || "Admin";

        const adminPhone =
            process.env.ADMIN_PHONE || "0000000000";


        // ==============================
        // CHECK ENVIRONMENT VARIABLES
        // ==============================

        if (!adminEmail || !rawPassword) {

            console.error(
                "❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD is missing in your .env file."
            );

            process.exit(1);

        }


        // ==============================
        // CHECK FOR EXISTING USER
        // ==============================

        const existingUser =
            await User.findOne({
                email: adminEmail
            });


        // ==============================
        // EXISTING USER
        // ==============================

        if (existingUser) {

            // Promote existing account to admin
            existingUser.role = "admin";

            // Make sure required profile fields exist
            if (!existingUser.fullName) {
                existingUser.fullName = adminFullName;
            }

            if (!existingUser.phone) {
                existingUser.phone = adminPhone;
            }

            // Update password to ADMIN_PASSWORD
            const hashedPassword =
                await bcrypt.hash(
                    rawPassword,
                    10
                );

            existingUser.password =
                hashedPassword;

            await existingUser.save();

            console.log(
                "✅ Existing account has been promoted to admin."
            );

            console.log(
                `Admin Email: ${adminEmail}`
            );

            process.exit(0);

        }


        // ==============================
        // HASH ADMIN PASSWORD
        // ==============================

        const hashedPassword =
            await bcrypt.hash(
                rawPassword,
                10
            );


        // ==============================
        // CREATE NEW ADMIN
        // ==============================

        const admin = new User({

            fullName:
                adminFullName,

            email:
                adminEmail,

            phone:
                adminPhone,

            password:
                hashedPassword,

            role:
                "admin",

            isPaidStudent:
                false,

            enrolledCourses:
                []

        });


        // ==============================
        // SAVE ADMIN
        // ==============================

        await admin.save();


        console.log(
            "✅ Admin account created successfully!"
        );

        console.log(
            `Admin Email: ${adminEmail}`
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "❌ Error creating admin:",
            error
        );

        process.exit(1);

    }

}


// ==============================
// RUN
// ==============================

createAdmin();