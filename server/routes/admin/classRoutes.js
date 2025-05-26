const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");
const classController = require("../../controllers/admin/classController");

// Rotas para classes
router.post("/classes", authMiddleware, isAdmin, classController.createClass);
router.get("/classes", authMiddleware, classController.getClasses);
router.get("/classes/:id", authMiddleware, classController.getClassById);
router.put("/classes/:id", authMiddleware, isAdmin, classController.updateClass);
router.delete("/classes/:id", authMiddleware, isAdmin, classController.deleteClass);
router.patch("/classes/:id/archive", authMiddleware, isAdmin, classController.archiveClass);

module.exports = router;