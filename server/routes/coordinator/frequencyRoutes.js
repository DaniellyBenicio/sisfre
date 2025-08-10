import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import { isTeacherOrCoordinator } from "../../middlewares/isTeacherOrCoordinator.js";
import {
  generateQrCode,
  registerByQrCode,
  getFrequencies,
  updateFrequency,
  getQrCodeImage,
  registerAbsenceWithCredit,
  getProfessorScheduleCourseDiscipline
} from "../../controllers/coordinator/frequencyController.js";
import { autoAbsenceFrequency } from "../../tasks/autoAbsenceFrequency.js";

const router = express.Router();

router.post("/frequency/qrcode", autenticarToken, isTeacherOrCoordinator(), generateQrCode);
router.post("/frequency/scan", autenticarToken, registerByQrCode);
router.get("/frequency", autenticarToken, getFrequencies);
router.put("/frequency/:id", autenticarToken, isTeacherOrCoordinator(), updateFrequency);
router.get("/frequency/qrcode/:token", getQrCodeImage);
router.post("/frequency/absence-credit", autenticarToken, isTeacherOrCoordinator(), registerAbsenceWithCredit);
router.get("/professor/:professorId/schedule-course-discipline", autenticarToken, getProfessorScheduleCourseDiscipline);
router.post("/frequency/test-auto-absence", async (req, res) => {
  try {
    await autoAbsenceFrequency();
    res.status(200).json({ message: "Job de falta automática executado!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao executar job de falta automática.", details: error.message });
  }
});

export default router;
