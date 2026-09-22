require("dotenv").config({
    path: ".env.test"
});

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../backend/app");

const User = require("../backend/models/User");
const Organization = require("../backend/models/Organization");


describe("MediShare Authentication API", () => {

    const testEmail =
        `test_${Date.now()}@medishare.com`;

    const testPassword =
        "Test@123456";

    const registrationNumber =
        `TEST-${Date.now()}`;

    let organizationId;


    // =========================================
    // SETUP
    // =========================================

    beforeAll(async () => {

        if (
            mongoose.connection.readyState === 0
        ) {
            await mongoose.connect(
                process.env.MONGODB_URI
            );
        }

    });


    // =========================================
    // CLEANUP
    // =========================================

    afterAll(async () => {

        if (organizationId) {

            await User.deleteMany({
                organization:
                    organizationId
            });

            await Organization.findByIdAndDelete(
                organizationId
            );

        }

        await mongoose.connection.close();

    });


    // =========================================
    // TEST 1
    // =========================================

    test(
        "POST /api/auth/register should create an account",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/register")
                    .send({
                        name:
                            "MediShare Test User",

                        email:
                            testEmail,

                        password:
                            testPassword,

                        organizationName:
                            "MediShare Test Hospital",

                        organizationType:
                            "Hospital",

                        registrationNumber:
                            registrationNumber,

                        contactPerson:
                            "Test Contact",

                        contactNumber:
                            "9876543210",

                        address:
                            "Vijayawada, Andhra Pradesh",

                        city:
                            "Vijayawada"
                    });


            expect(
                response.statusCode
            ).toBe(201);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.token
            ).toBeDefined();


            expect(
                response.body.user
            ).toBeDefined();


            expect(
                response.body.user.role
            ).toBe("ORGANIZATION");


            expect(
                response.body.organization
            ).toBeDefined();


            expect(
                response.body.organization.verified
            ).toBe(true);


            organizationId =
                response.body.organization.id;

        }
    );


    // =========================================
    // TEST 2
    // =========================================

    test(
        "Organization should be verified immediately",
        async () => {

            const organization =
                await Organization.findById(
                    organizationId
                );


            expect(
                organization
            ).not.toBeNull();


            expect(
                organization.verified
            ).toBe(true);

        }
    );


    // =========================================
    // TEST 3
    // =========================================

    test(
        "POST /api/auth/login should login successfully",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/login")
                    .send({
                        email:
                            testEmail,

                        password:
                            testPassword
                    });


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.token
            ).toBeDefined();


            expect(
                response.body.user
            ).toBeDefined();


            expect(
                response.body.user.email
            ).toBe(testEmail);


            expect(
                response.body.user.role
            ).toBe("ORGANIZATION");

        }
    );


    // =========================================
    // TEST 4
    // =========================================

    test(
        "Login should reject an incorrect password",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/login")
                    .send({
                        email:
                            testEmail,

                        password:
                            "WrongPassword123"
                    });


            expect(
                response.statusCode
            ).toBe(401);


            expect(
                response.body.success
            ).toBe(false);

        }
    );


    // =========================================
    // TEST 5
    // =========================================

    test(
        "Registration should reject duplicate email",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/register")
                    .send({
                        name:
                            "Duplicate Test User",

                        email:
                            testEmail,

                        password:
                            testPassword,

                        organizationName:
                            "Duplicate Test Hospital",

                        organizationType:
                            "Hospital",

                        registrationNumber:
                            `DUP-${Date.now()}`,

                        contactPerson:
                            "Duplicate Contact",

                        contactNumber:
                            "9876543211",

                        address:
                            "Vijayawada",

                        city:
                            "Vijayawada"
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.success
            ).toBe(false);


            expect(
                response.body.message
            ).toMatch(
                /email already exists/i
            );

        }
    );


    // =========================================
    // TEST 6
    // =========================================

    test(
        "Registration should reject duplicate organization registration number",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/register")
                    .send({
                        name:
                            "Another Test User",

                        email:
                            `another_${Date.now()}@medishare.com`,

                        password:
                            testPassword,

                        organizationName:
                            "Another Test Hospital",

                        organizationType:
                            "Hospital",

                        registrationNumber:
                            registrationNumber,

                        contactPerson:
                            "Another Contact",

                        contactNumber:
                            "9876543212",

                        address:
                            "Vijayawada",

                        city:
                            "Vijayawada"
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.success
            ).toBe(false);


            expect(
                response.body.message
            ).toMatch(
                /registration number already exists/i
            );

        }
    );


    // =========================================
    // TEST 7
    // =========================================

    test(
        "Registration should reject a short password",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/register")
                    .send({
                        name:
                            "Short Password User",

                        email:
                            `short_${Date.now()}@medishare.com`,

                        password:
                            "123",

                        organizationName:
                            "Short Password Hospital",

                        organizationType:
                            "Hospital",

                        registrationNumber:
                            `SHORT-${Date.now()}`,

                        contactPerson:
                            "Test Contact",

                        contactNumber:
                            "9876543213",

                        address:
                            "Vijayawada",

                        city:
                            "Vijayawada"
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.success
            ).toBe(false);


            expect(
                response.body.message
            ).toMatch(
                /6 characters/i
            );

        }
    );


    // =========================================
    // TEST 8
    // =========================================

    test(
        "Login should reject an unknown email",
        async () => {

            const response =
                await request(app)
                    .post("/api/auth/login")
                    .send({
                        email:
                            "doesnotexist@medishare.com",

                        password:
                            testPassword
                    });


            expect(
                response.statusCode
            ).toBe(401);


            expect(
                response.body.success
            ).toBe(false);

        }
    );

});