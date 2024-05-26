const express = require("express");
const router = express.Router();
const verifyToken = require("../AuthMiddleware/Authentication");
const { signUp, users, login, user } = require("../Controllers/controllers");

router.post("/signup", signUp).post("/login", login);
router.get("/", verifyToken, users);
router.get("/:id", user);

module.exports = router;
