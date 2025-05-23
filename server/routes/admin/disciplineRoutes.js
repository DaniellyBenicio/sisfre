const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");
const disciplineController = require("../../controllers/admin/disciplineController");

router.post("/disciplines", authMiddleware, isAdmin, disciplineController.createDiscipline);
router.delete("/discipline/:id", authMiddleware, isAdmin, disciplineController.deleteDiscipline);
router.put("/discipline/:id", authMiddleware, isAdmin, disciplineController.updateDiscipline);
router.get("/disciplines", authMiddleware, isAdmin, disciplineController.getDisciplines);
router.get("/disciplines/all", authMiddleware, isAdmin, disciplineController.getAllDisciplines);
router.get("/discipline/:id", authMiddleware, isAdmin, disciplineController.getDisciplineById);

module.exports = router;