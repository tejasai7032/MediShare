const express = require("express");

const router = express.Router();

const {
    createRentalRequest,
    getRentalRequests,
    getRentalRequestById,
    updateRentalRequest,
    approveRentalRequest,
    rejectRentalRequest,
    dispatchRentalRequest,
    markRentalInUse,
    returnRentalRequest,
    deleteRentalRequest
} = require("../controllers/RentalRequestController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");


/* =========================================================
   GET ALL RENTAL REQUESTS
========================================================= */

router.get(
    "/",
    protect,
    getRentalRequests
);


/* =========================================================
   GET SINGLE RENTAL REQUEST
========================================================= */

router.get(
    "/:id",
    protect,
    getRentalRequestById
);


/* =========================================================
   CREATE RENTAL REQUEST
========================================================= */

router.post(
    "/",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    createRentalRequest
);


/* =========================================================
   APPROVE RENTAL REQUEST
   PENDING → APPROVED
========================================================= */

router.put(
    "/:id/approve",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    approveRentalRequest
);


/* =========================================================
   REJECT RENTAL REQUEST
   PENDING → REJECTED
========================================================= */

router.put(
    "/:id/reject",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    rejectRentalRequest
);


/* =========================================================
   DISPATCH RENTAL
   APPROVED → DISPATCHED
========================================================= */

router.put(
    "/:id/dispatch",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    dispatchRentalRequest
);


/* =========================================================
   MARK RENTAL IN USE
   DISPATCHED → IN_USE
========================================================= */

router.put(
    "/:id/in-use",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    markRentalInUse
);


/* =========================================================
   RETURN RENTAL
   IN_USE → RETURNED
========================================================= */

router.put(
    "/:id/return",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    returnRentalRequest
);


/* =========================================================
   UPDATE RENTAL REQUEST
========================================================= */

router.put(
    "/:id",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    updateRentalRequest
);


/* =========================================================
   DELETE RENTAL REQUEST
========================================================= */

router.delete(
    "/:id",
    protect,
    authorizeRoles(
        "ORGANIZATION",
        "ADMIN"
    ),
    deleteRentalRequest
);


/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;