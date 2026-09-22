const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Organization = require("../models/Organization");


// =====================================================
// GENERATE JWT
// =====================================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            organization: user.organization
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );

};


// =====================================================
// REGISTER USER + ORGANIZATION
// =====================================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            organizationName,
            organizationType,
            registrationNumber,
            contactPerson,
            contactNumber,
            address,
            city
        } = req.body;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !name ||
            !email ||
            !password ||
            !organizationName ||
            !organizationType ||
            !registrationNumber ||
            !contactPerson ||
            !contactNumber ||
            !address ||
            !city
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "All registration fields are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters"
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        const normalizedRegistrationNumber =
            registrationNumber.trim();


        // -------------------------------------------------
        // CHECK EXISTING USER
        // -------------------------------------------------

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message:
                    "User with this email already exists"
            });

        }


        // -------------------------------------------------
        // CHECK EXISTING ORGANIZATION
        // -------------------------------------------------

        const existingOrganization =
            await Organization.findOne({
                registrationNumber:
                    normalizedRegistrationNumber
            });


        if (existingOrganization) {

            return res.status(400).json({
                success: false,
                message:
                    "An organization with this registration number already exists"
            });

        }


        // -------------------------------------------------
        // CREATE ORGANIZATION
        // -------------------------------------------------

        const organization =
            await Organization.create({

                name:
                    organizationName.trim(),

                type:
                    organizationType,

                registrationNumber:
                    normalizedRegistrationNumber,

                contactPerson:
                    contactPerson.trim(),

                contactNumber:
                    contactNumber.trim(),

                email:
                    normalizedEmail,

                address:
                    address.trim(),

                city:
                    city.trim(),

                // No approval required
                verified: true

            });


        try {

            // -------------------------------------------------
            // HASH PASSWORD
            // -------------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // -------------------------------------------------
            // CREATE USER
            // -------------------------------------------------

            const user =
                await User.create({

                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password:
                        hashedPassword,

                    role:
                        "ORGANIZATION",

                    organization:
                        organization._id,

                    isActive:
                        true

                });


            // -------------------------------------------------
            // GENERATE TOKEN
            // -------------------------------------------------

            const token =
                generateToken(user);


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Account created successfully.",

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    organization:
                        user.organization,

                    organizationVerified:
                        true

                },

                organization: {

                    id:
                        organization._id,

                    name:
                        organization.name,

                    type:
                        organization.type,

                    registrationNumber:
                        organization.registrationNumber,

                    verified:
                        true

                }

            });


        } catch (userError) {

            // -------------------------------------------------
            // ROLLBACK ORGANIZATION
            // -------------------------------------------------

            await Organization.findByIdAndDelete(
                organization._id
            );

            throw userError;

        }


    } catch (error) {

        console.error(
            "Registration error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message:
                "Registration failed",

            error:
                error.message

        });

    }

};


// =====================================================
// LOGIN
// =====================================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        const user =
            await User.findOne({
                email: normalizedEmail
            }).populate("organization");


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // -------------------------------------------------
        // CHECK ACTIVE
        // -------------------------------------------------

        if (!user.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "User account is inactive"

            });

        }


        // -------------------------------------------------
        // CHECK PASSWORD
        // -------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // -------------------------------------------------
        // NO ORGANIZATION VERIFICATION BLOCK
        // -------------------------------------------------

        const token =
            generateToken(user);


        // -------------------------------------------------
        // LOGIN SUCCESS
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                organization:
                    user.organization
                        ? user.organization._id
                        : null,

                organizationVerified:
                    user.organization
                        ? user.organization.verified
                        : null

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Login failed",

            error:
                error.message

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    registerUser,

    loginUser

};