import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import { isTeacherOrCoordinator } from "../../middlewares/isTeacherOrCoordinator.js";
import {
  generateQrCode,
  registerByQrCode,
  getFrequencies,
  updateFrequency,
  getQrCodeImage
} from "../../controllers/coordinator/frequencyController.js";

const router = express.Router();

router.post("/frequency/qrcode", autenticarToken, isTeacherOrCoordinator(), generateQrCode);
router.post("/frequency/scan", autenticarToken, registerByQrCode);
router.get("/frequency", autenticarToken, getFrequencies);
router.put("/frequency/:id", autenticarToken, isTeacherOrCoordinator(), updateFrequency);
router.get("/frequency/qrcode/:token", getQrCodeImage);

export default router;
