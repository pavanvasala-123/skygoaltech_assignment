const express = require("express");
const router = express.Router();
const verifyToken = require("../AuthMiddleware/Authentication");
const { signUp, users, login, user,deleteUserById,deleteAllUsers } = require("../Controllers/controllers");

router.post("/signup", signUp).post("/login", login);
router.get("/", verifyToken, users);
router.get("/:id",verifyToken, user);
router.delete('/:id',verifyToken,deleteUserById)
router.delete('/',verifyToken,deleteAllUsers)

module.exports = router;
