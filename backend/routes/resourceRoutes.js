const express = require("express");

const router = express.Router();

const {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
} = require("../controllers/ResourceController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");


// Get all resources
router.get("/", getResources);

// Get one resource
router.get("/:id", getResourceById);


// Create a resource
router.post(
    "/",
    protect,
    authorizeRoles("ORGANIZATION"),
    createResource
);


// Update a resource
router.put(
    "/:id",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    updateResource
);


// Delete a resource
router.delete(
    "/:id",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    deleteResource
);


module.exports = router;