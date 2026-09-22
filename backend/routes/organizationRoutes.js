const express = require("express");

const router = express.Router();

const {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    getPendingOrganizations,
    verifyOrganization,
    rejectOrganization
} = require("../controllers/OrganizationController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");


// --------------------------------------------------
// Public organization lookup
// --------------------------------------------------

router.get(
    "/",
    getOrganizations
);


// --------------------------------------------------
// ADMIN verification workflow
// IMPORTANT: These routes must come before /:id
// --------------------------------------------------

router.get(
    "/verification/pending",
    protect,
    authorizeRoles("ADMIN"),
    getPendingOrganizations
);

router.patch(
    "/:id/verify",
    protect,
    authorizeRoles("ADMIN"),
    verifyOrganization
);

router.patch(
    "/:id/reject",
    protect,
    authorizeRoles("ADMIN"),
    rejectOrganization
);


// --------------------------------------------------
// Get one organization
// --------------------------------------------------

router.get(
    "/:id",
    getOrganizationById
);


// --------------------------------------------------
// ADMIN organization management
// --------------------------------------------------

router.post(
    "/",
    protect,
    authorizeRoles("ADMIN"),
    createOrganization
);

router.put(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    updateOrganization
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    deleteOrganization
);


module.exports = router;