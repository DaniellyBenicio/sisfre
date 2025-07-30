import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import { isTeacherOrCoordinator } from '../../middlewares/isTeacherOrCoordinator.js';
import upload from "../../middlewares/uploadClassChangeRequest.js";

import {
  createRequest,
  updateRequest,
  getRequest,
  getRequestById,
  deleteRequest,
} from "../../controllers/coordinator/classChangeRequestController.js";

const router = express.Router();

router.post("/request", autenticarToken, isTeacherOrCoordinator(), upload.single("annex"), createRequest);
router.put("/request/:id", autenticarToken, isTeacherOrCoordinator(), upload.single("annex"), updateRequest);
router.get("/request", autenticarToken, isTeacherOrCoordinator(), getRequest);
router.get("/request/:id", autenticarToken, isTeacherOrCoordinator(), getRequestById);
router.delete("/request/:id", autenticarToken, isTeacherOrCoordinator(), deleteRequest);

export default router;
