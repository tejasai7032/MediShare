const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/AuthController");


// ------------------------------------------
// Public organization registration
// ------------------------------------------

router.post(
    "/register",
    registerUser
);


// ------------------------------------------
// Public login
// ------------------------------------------

router.post(
    "/login",
    loginUser
);


module.exports = router;