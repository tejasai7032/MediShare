const express = require("express");

const router = express.Router();

const {
    createEmergencyRequest,
    getEmergencyRequests,
    getEmergencyRequestById,
    updateEmergencyRequest,
    deleteEmergencyRequest
} = require("../controllers/EmergencyRequestController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");


// Get all emergency requests
router.get("/", protect, getEmergencyRequests);

// Get one emergency request
router.get("/:id", protect, getEmergencyRequestById);


// Create emergency request
router.post(
    "/",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    createEmergencyRequest
);


// Update emergency request
router.put(
    "/:id",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    updateEmergencyRequest
);


// Delete emergency request
router.delete(
    "/:id",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    deleteEmergencyRequest
);


module.exports = router;