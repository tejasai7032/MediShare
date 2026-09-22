const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN_EMAIL = "admin@medishare.com";
const ADMIN_PASSWORD = "Admin@123456";

const resetAdmin = async () => {

    try {

        await connectDB();

        const hashedPassword =
            await bcrypt.hash(
                ADMIN_PASSWORD,
                10
            );


        let admin =
            await User.findOne({
                email: ADMIN_EMAIL
            });


        if (admin) {

            admin.name = "MediShare Admin";

            admin.password =
                hashedPassword;

            admin.role = "ADMIN";

            admin.organization = null;

            admin.isActive = true;

            await admin.save();

            console.log(
                "✅ Existing admin account reset successfully."
            );

        } else {

            admin =
                await User.create({
                    name: "MediShare Admin",

                    email: ADMIN_EMAIL,

                    password:
                        hashedPassword,

                    role: "ADMIN",

                    organization: null,

                    isActive: true
                });

            console.log(
                "✅ New admin account created successfully."
            );

        }


        console.log(
            "----------------------------------------"
        );

        console.log(
            "Admin Email:",
            ADMIN_EMAIL
        );

        console.log(
            "Admin Password:",
            ADMIN_PASSWORD
        );

        console.log(
            "Role:",
            admin.role
        );

        console.log(
            "----------------------------------------"
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "❌ Admin reset failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);

    }

};


resetAdmin();