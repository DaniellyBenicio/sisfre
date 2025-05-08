// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");
const userController = require("../../controllers/admin/userController");

router.post("/users", authMiddleware, isAdmin, userController.registerUser);
router.put("/users/:id", authMiddleware, isAdmin, userController.updateUser);
router.get("/users", authMiddleware, isAdmin, userController.getUsers);
router.get("/users/all", authMiddleware, isAdmin, userController.getAllUsers);
router.get("/users/:id", authMiddleware, isAdmin, userController.getUserById);
router.delete("/users/:id", authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
