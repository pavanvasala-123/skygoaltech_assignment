const express = require("express");
const router = express.Router();
const verifyToken = require("../AuthMiddleware/Authentication");
const {
  signUp,
  users,
  login,
  user,
  deleteUserById,
  deleteAllUsers,
  RequestpasswordReset,
  ResetPassword
} = require("../Controllers/controllers");

router.post("/signup", signUp).post("/login", login);
router.post("/forgot-password",RequestpasswordReset)
router.post('/reset-password/:token',ResetPassword)
router.get("/", verifyToken, users);
router.get("/:id", verifyToken, user);
router.delete("/:id", verifyToken, deleteUserById);
router.delete("/", verifyToken, deleteAllUsers);

module.exports = router;
