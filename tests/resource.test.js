require("dotenv").config({
    path: ".env.test"
});

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../backend/app");

const User = require("../backend/models/User");
const Organization = require("../backend/models/Organization");
const Resource = require("../backend/models/Resource");


describe("MediShare Resource API", () => {

    const testEmail =
        `resource_test_${Date.now()}@medishare.com`;

    const testPassword =
        "Test@123456";

    const registrationNumber =
        `RESOURCE-TEST-${Date.now()}`;

    let authToken;
    let organizationId;
    let resourceId;


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


        const registerResponse =
            await request(app)
                .post("/api/auth/register")
                .send({
                    name:
                        "Resource Test User",

                    email:
                        testEmail,

                    password:
                        testPassword,

                    organizationName:
                        "Resource Test Hospital",

                    organizationType:
                        "Hospital",

                    registrationNumber:
                        registrationNumber,

                    contactPerson:
                        "Resource Test Contact",

                    contactNumber:
                        "9876543210",

                    address:
                        "Vijayawada, Andhra Pradesh",

                    city:
                        "Vijayawada"
                });


        authToken =
            registerResponse.body.token;

        organizationId =
            registerResponse.body.organization.id;

    });


    // =========================================
    // CLEANUP
    // =========================================

    afterAll(async () => {

        if (resourceId) {

            await Resource.findByIdAndDelete(
                resourceId
            );

        }


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
        "Unauthenticated users should not create resources",
        async () => {

            const response =
                await request(app)
                    .post("/api/resources")
                    .send({
                        name:
                            "Operating Table",

                        category:
                            "OT Equipment",

                        description:
                            "Electric operating table",

                        quantity:
                            2,

                        availableQuantity:
                            2,

                        location:
                            "Vijayawada",

                        contactNumber:
                            "9876543210",

                        rentalAvailable:
                            true,

                        pricePerDay:
                            2500,

                        emergencyAvailable:
                            true
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
    // TEST 2
    // =========================================

    test(
        "Authenticated organization should create a resource",
        async () => {

            const response =
                await request(app)
                    .post("/api/resources")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        name:
                            "Electric Operating Table",

                        category:
                            "OT Equipment",

                        description:
                            "Electric operating table for surgical procedures",

                        quantity:
                            2,

                        availableQuantity:
                            2,

                        location:
                            "Vijayawada",

                        contactNumber:
                            "9876543210",

                        rentalAvailable:
                            true,

                        pricePerDay:
                            2500,

                        emergencyAvailable:
                            true
                    });


            expect(
                response.statusCode
            ).toBe(201);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.resource
            ).toBeDefined();


            expect(
                response.body.resource.name
            ).toBe(
                "Electric Operating Table"
            );


            expect(
                response.body.resource.category
            ).toBe(
                "OT Equipment"
            );


            expect(
                response.body.resource.quantity
            ).toBe(2);


            expect(
                response.body.resource.availableQuantity
            ).toBe(2);


            expect(
                response.body.resource.organization
            ).toBeDefined();


            resourceId =
                response.body.resource._id ||
                response.body.resource.id;

        }
    );


    // =========================================
    // TEST 3
    // =========================================

    test(
        "Created resource should belong to the organization",
        async () => {

            const resource =
                await Resource.findById(
                    resourceId
                );


            expect(
                resource
            ).not.toBeNull();


            expect(
                resource.organization.toString()
            ).toBe(
                organizationId.toString()
            );

        }
    );


    // =========================================
    // TEST 4
    // =========================================

    test(
        "GET /api/resources should return resources",
        async () => {

            const response =
                await request(app)
                    .get(
                        "/api/resources"
                    );


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                Array.isArray(
                    response.body.resources
                )
            ).toBe(true);

        }
    );


    // =========================================
    // TEST 5
    // =========================================

    test(
        "GET /api/resources/:id should return the created resource",
        async () => {

            const response =
                await request(app)
                    .get(
                        `/api/resources/${resourceId}`
                    );


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.resource
            ).toBeDefined();


            expect(
                response.body.resource._id
            ).toBe(
                resourceId.toString()
            );

        }
    );


    // =========================================
    // TEST 6
    // =========================================

    test(
        "Resource creation should reject invalid category",
        async () => {

            const response =
                await request(app)
                    .post("/api/resources")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        name:
                            "Invalid Resource",

                        category:
                            "Invalid Category",

                        quantity:
                            1,

                        availableQuantity:
                            1,

                        location:
                            "Vijayawada",

                        contactNumber:
                            "9876543210"
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.success
            ).toBe(false);

        }
    );


    // =========================================
    // TEST 7
    // =========================================

    test(
        "Resource creation should reject zero quantity",
        async () => {

            const response =
                await request(app)
                    .post("/api/resources")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        name:
                            "Invalid Quantity Resource",

                        category:
                            "Medical Equipment",

                        quantity:
                            0,

                        availableQuantity:
                            0,

                        location:
                            "Vijayawada",

                        contactNumber:
                            "9876543210"
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.success
            ).toBe(false);

        }
    );

});