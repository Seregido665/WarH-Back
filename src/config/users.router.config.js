const express = require("express");
const router = express.Router();

const usersController = require("../controllers/user.controller");
/* USERS ROUTES */

router.post("/register", usersController.registerUser);
router.get("", usersController.getUsers);

module.exports = router;
