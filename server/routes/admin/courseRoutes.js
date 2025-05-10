const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");
const courseController = require("../../controllers/admin/courseController");

// Rotas para cursos
router.post("/courses", authMiddleware, isAdmin, courseController.createCourse);
router.get("/courses", authMiddleware, courseController.getCourses);
router.get("/courses/:id", authMiddleware, courseController.getCourseById);
router.put("/courses/:id", authMiddleware, isAdmin, courseController.updateCourse);
router.delete("/courses/:id", authMiddleware, isAdmin, courseController.deleteCourse);

module.exports = router;