require("dotenv").config({
    path: ".env.test"
});

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../backend/app");

const User = require("../backend/models/User");
const Organization = require("../backend/models/Organization");
const Resource = require("../backend/models/Resource");
const RentalRequest = require("../backend/models/RentalRequest");


describe("MediShare Rental Request API", () => {

    const providerEmail =
        `provider_${Date.now()}@medishare.com`;

    const requesterEmail =
        `requester_${Date.now()}@medishare.com`;

    const password =
        "Test@123456";

    const providerRegistrationNumber =
        `PROVIDER-${Date.now()}`;

    const requesterRegistrationNumber =
        `REQUESTER-${Date.now()}`;

    let providerToken;
    let requesterToken;

    let providerOrganizationId;
    let requesterOrganizationId;

    let resourceId;
    let rentalRequestId;


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


        // =====================================
        // CREATE PROVIDER ORGANIZATION
        // =====================================

        const providerResponse =
            await request(app)
                .post("/api/auth/register")
                .send({
                    name:
                        "Provider Test User",

                    email:
                        providerEmail,

                    password:
                        password,

                    organizationName:
                        "Provider Test Hospital",

                    organizationType:
                        "Hospital",

                    registrationNumber:
                        providerRegistrationNumber,

                    contactPerson:
                        "Provider Contact",

                    contactNumber:
                        "9876543210",

                    address:
                        "Vijayawada, Andhra Pradesh",

                    city:
                        "Vijayawada"
                });


        expect(
            providerResponse.statusCode
        ).toBe(201);


        providerToken =
            providerResponse.body.token;

        providerOrganizationId =
            providerResponse.body.organization.id;


        // =====================================
        // CREATE REQUESTING ORGANIZATION
        // =====================================

        const requesterResponse =
            await request(app)
                .post("/api/auth/register")
                .send({
                    name:
                        "Requester Test User",

                    email:
                        requesterEmail,

                    password:
                        password,

                    organizationName:
                        "Requester Test Clinic",

                    organizationType:
                        "Clinic",

                    registrationNumber:
                        requesterRegistrationNumber,

                    contactPerson:
                        "Requester Contact",

                    contactNumber:
                        "9876543211",

                    address:
                        "Vijayawada, Andhra Pradesh",

                    city:
                        "Vijayawada"
                });


        expect(
            requesterResponse.statusCode
        ).toBe(201);


        requesterToken =
            requesterResponse.body.token;

        requesterOrganizationId =
            requesterResponse.body.organization.id;


        // =====================================
        // CREATE RESOURCE FOR PROVIDER
        // =====================================

        const resourceResponse =
            await request(app)
                .post("/api/resources")
                .set(
                    "Authorization",
                    `Bearer ${providerToken}`
                )
                .send({
                    name:
                        "Rental Test Ventilator",

                    category:
                        "Medical Equipment",

                    description:
                        "Ventilator for automated rental testing",

                    quantity:
                        5,

                    availableQuantity:
                        5,

                    location:
                        "Vijayawada",

                    contactNumber:
                        "9876543210",

                    rentalAvailable:
                        true,

                    pricePerDay:
                        1500,

                    emergencyAvailable:
                        false
                });


        expect(
            resourceResponse.statusCode
        ).toBe(201);


        resourceId =
            resourceResponse.body.resource._id ||
            resourceResponse.body.resource.id;

    });


    // =========================================
    // CLEANUP
    // =========================================

    afterAll(async () => {

        if (rentalRequestId) {

            await RentalRequest.findByIdAndDelete(
                rentalRequestId
            );

        }


        if (resourceId) {

            await Resource.findByIdAndDelete(
                resourceId
            );

        }


        if (providerOrganizationId) {

            await User.deleteMany({
                organization:
                    providerOrganizationId
            });

            await Organization.findByIdAndDelete(
                providerOrganizationId
            );

        }


        if (requesterOrganizationId) {

            await User.deleteMany({
                organization:
                    requesterOrganizationId
            });

            await Organization.findByIdAndDelete(
                requesterOrganizationId
            );

        }


        await mongoose.connection.close();

    });


    // =========================================
    // TEST 1
    // =========================================

    test(
        "Unauthenticated users should not create rental requests",
        async () => {

            const response =
                await request(app)
                    .post(
                        "/api/rental-requests"
                    )
                    .send({
                        resource:
                            resourceId,

                        quantity:
                            1,

                        startDate:
                            "2026-10-01",

                        endDate:
                            "2026-10-03",

                        purpose:
                            "Unauthorized rental test"
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
        "Organization should not be able to rent its own resource",
        async () => {

            const response =
                await request(app)
                    .post(
                        "/api/rental-requests"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${providerToken}`
                    )
                    .send({
                        resource:
                            resourceId,

                        quantity:
                            1,

                        startDate:
                            "2026-10-01",

                        endDate:
                            "2026-10-03",

                        purpose:
                            "Self rental test"
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
                /cannot request its own resource/i
            );

        }
    );


    // =========================================
    // TEST 3
    // =========================================

    test(
        "Different organization should create rental request",
        async () => {

            const response =
                await request(app)
                    .post(
                        "/api/rental-requests"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${requesterToken}`
                    )
                    .send({
                        resource:
                            resourceId,

                        quantity:
                            2,

                        startDate:
                            "2026-10-01",

                        endDate:
                            "2026-10-03",

                        purpose:
                            "Automated rental lifecycle test",

                        notes:
                            "Created by Jest"
                    });


            expect(
                response.statusCode
            ).toBe(201);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.rentalRequest
            ).toBeDefined();


            expect(
                response.body.rentalRequest.quantity
            ).toBe(2);


            expect(
                response.body.rentalRequest.status
            ).toBe("PENDING");


            rentalRequestId =
                response.body.rentalRequest._id ||
                response.body.rentalRequest.id;

        }
    );


    // =========================================
    // TEST 4
    // =========================================

    test(
        "Rental request should belong to requester organization",
        async () => {

            const rentalRequest =
                await RentalRequest.findById(
                    rentalRequestId
                );


            expect(
                rentalRequest
            ).not.toBeNull();


            expect(
                rentalRequest.requestingOrganization
                    .toString()
            ).toBe(
                requesterOrganizationId.toString()
            );

        }
    );


    // =========================================
    // TEST 5
    // =========================================

    test(
        "Rental request should reference the correct resource",
        async () => {

            const rentalRequest =
                await RentalRequest.findById(
                    rentalRequestId
                );


            expect(
                rentalRequest.resource
                    .toString()
            ).toBe(
                resourceId.toString()
            );

        }
    );


    // =========================================
    // TEST 6
    // =========================================

    test(
        "Rental request should reject invalid resource",
        async () => {

            const fakeResourceId =
                new mongoose.Types.ObjectId();


            const response =
                await request(app)
                    .post(
                        "/api/rental-requests"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${requesterToken}`
                    )
                    .send({
                        resource:
                            fakeResourceId,

                        quantity:
                            1,

                        startDate:
                            "2026-10-01",

                        endDate:
                            "2026-10-03",

                        purpose:
                            "Invalid resource test"
                    });


            expect(
                response.statusCode
            ).toBe(404);


            expect(
                response.body.success
            ).toBe(false);

        }
    );


    // =========================================
    // TEST 7
    // =========================================

    test(
        "Rental request should reject invalid dates",
        async () => {

            const response =
                await request(app)
                    .post(
                        "/api/rental-requests"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${requesterToken}`
                    )
                    .send({
                        resource:
                            resourceId,

                        quantity:
                            1,

                        startDate:
                            "2026-10-05",

                        endDate:
                            "2026-10-01",

                        purpose:
                            "Invalid date test"
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
                /End date must be after start date/i
            );

        }
    );


    // =========================================
    // TEST 8
    // =========================================

    test(
        "Resource owner should approve rental request",
        async () => {

            const response =
                await request(app)
                    .put(
                        `/api/rental-requests/${rentalRequestId}/approve`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${providerToken}`
                    );


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.rentalRequest.status
            ).toBe("APPROVED");


            const resource =
                await Resource.findById(
                    resourceId
                );


            expect(
                resource.availableQuantity
            ).toBe(3);


            expect(
                resource.status
            ).toBe("PARTIALLY_AVAILABLE");

        }
    );


    // =========================================
    // TEST 9
    // =========================================

    test(
        "Resource owner should dispatch approved rental",
        async () => {

            const response =
                await request(app)
                    .put(
                        `/api/rental-requests/${rentalRequestId}/dispatch`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${providerToken}`
                    );


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.rentalRequest.status
            ).toBe("DISPATCHED");

        }
    );


    // =========================================
    // TEST 10
    // =========================================

    test(
        "Requesting organization should mark rental in use",
        async () => {

            const response =
                await request(app)
                    .put(
                        `/api/rental-requests/${rentalRequestId}/in-use`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${requesterToken}`
                    );


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.rentalRequest.status
            ).toBe("IN_USE");

        }
    );


    // =========================================
    // TEST 11
    // =========================================

    test(
        "Requesting organization should return the rental",
        async () => {

            const response =
                await request(app)
                    .put(
                        `/api/rental-requests/${rentalRequestId}/return`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${requesterToken}`
                    );


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body.success
            ).toBe(true);


            expect(
                response.body.rentalRequest.status
            ).toBe("RETURNED");


            const resource =
                await Resource.findById(
                    resourceId
                );


            expect(
                resource.availableQuantity
            ).toBe(5);


            expect(
                resource.status
            ).toBe("AVAILABLE");

        }
    );


    // =========================================
    // TEST 12
    // =========================================

    test(
        "Rental request should reject another approval after completion",
        async () => {

            const response =
                await request(app)
                    .put(
                        `/api/rental-requests/${rentalRequestId}/approve`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${providerToken}`
                    );


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.success
            ).toBe(false);

        }
    );

});