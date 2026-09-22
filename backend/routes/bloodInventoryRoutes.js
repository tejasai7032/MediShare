const express = require("express");

const router = express.Router();

const {
    createBloodInventory,
    getBloodInventory,
    getBloodInventoryById,
    updateBloodInventory,
    deleteBloodInventory
} = require("../controllers/BloodInventoryController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");


// Get blood inventory
router.get(
    "/",
    protect,
    getBloodInventory
);


// Get one blood inventory record
router.get(
    "/:id",
    protect,
    getBloodInventoryById
);


// Create blood inventory
router.post(
    "/",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    createBloodInventory
);


// Update blood inventory
router.put(
    "/:id",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    updateBloodInventory
);


// Delete blood inventory
router.delete(
    "/:id",
    protect,
    authorizeRoles("ORGANIZATION", "ADMIN"),
    deleteBloodInventory
);


module.exports = router;