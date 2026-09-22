const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

require("dotenv").config();

const User = require("../models/User");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}


async function createAdmin() {
    try {

        // ------------------------------------------
        // Connect to MongoDB
        // ------------------------------------------

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log("✅ Connected to MongoDB");


        // ------------------------------------------
        // Get admin details
        // ------------------------------------------

        const name =
            await askQuestion(
                "Admin name: "
            );

        const email =
            await askQuestion(
                "Admin email: "
            );

        const password =
            await askQuestion(
                "Admin password: "
            );


        const normalizedEmail =
            email.trim().toLowerCase();


        // ------------------------------------------
        // Validate
        // ------------------------------------------

        if (
            !name.trim() ||
            !normalizedEmail ||
            !password
        ) {
            throw new Error(
                "Name, email and password are required."
            );
        }


        if (password.length < 6) {
            throw new Error(
                "Password must contain at least 6 characters."
            );
        }


        // ------------------------------------------
        // Check existing user
        // ------------------------------------------

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            if (existingUser.role === "ADMIN") {

                console.log(
                    "\n⚠️ An ADMIN account already exists with this email."
                );

            } else {

                console.log(
                    "\n⚠️ A user already exists with this email."
                );

                console.log(
                    "Email:",
                    existingUser.email
                );

                console.log(
                    "Current role:",
                    existingUser.role
                );
            }

            return;
        }


        // ------------------------------------------
        // Hash password
        // ------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ------------------------------------------
        // Create ADMIN
        // ------------------------------------------

        const admin =
            await User.create({
                name: name.trim(),

                email: normalizedEmail,

                password: hashedPassword,

                role: "ADMIN",

                organization: null,

                isActive: true
            });


        // ------------------------------------------
        // Success
        // ------------------------------------------

        console.log(
            "\n🎉 ADMIN account created successfully!"
        );

        console.log(
            "-----------------------------------"
        );

        console.log(
            "Name:",
            admin.name
        );

        console.log(
            "Email:",
            admin.email
        );

        console.log(
            "Role:",
            admin.role
        );

        console.log(
            "Active:",
            admin.isActive
        );

        console.log(
            "-----------------------------------"
        );

    } catch (error) {

        console.error(
            "\n❌ Failed to create admin:"
        );

        console.error(
            error.message
        );

    } finally {

        rl.close();

        await mongoose.disconnect();
    }
}


createAdmin();