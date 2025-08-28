import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import { isTeacherOrCoordinator } from '../../middlewares/isTeacherOrCoordinator.js';
import upload from "../../middlewares/uploadClassChangeRequest.js";
import { isCoordinator } from "../../middlewares/isCoordinator.js";
import { isTeacher } from "../../middlewares/isTeacher.js";

import {
  createRequest,
  updateRequest,
  getRequest,
  getRequestById,
  deleteRequest,
  getProfessorScheduleDetails,
  approveAnteposition,
  approveReposition,
  negateAnteposition,
  negateReposition,
  getRequestsByProfessor,
  getOwnRequests,
  getProfessorScheduleDetailsAnteposition
} from "../../controllers/coordinator/classChangeRequestController.js";

const router = express.Router();

router.post(
  "/request",
  autenticarToken,
  isTeacherOrCoordinator(),
  (req, res, next) => {
    upload.array("annex", 10)(req, res, function (err) {
      if (err && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "O arquivo enviado excede o limite de 5MB." });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  createRequest
);
router.put(
  "/request/:id",
  autenticarToken,
  isTeacherOrCoordinator(),
  (req, res, next) => {
    upload.array("annex", 10)(req, res, function (err) {
      if (err && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "O arquivo enviado excede o limite de 5MB." });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  updateRequest
);
router.get("/request", autenticarToken, isTeacherOrCoordinator(), getRequest);
router.get("/request/:id", autenticarToken, isTeacherOrCoordinator(), getRequestById);
router.delete("/request/:id", autenticarToken, isTeacherOrCoordinator(), deleteRequest);
//Retorno para Reposição
router.get("/professor/request", autenticarToken, isTeacherOrCoordinator(), getProfessorScheduleDetails);
//Retorno para Anteposição
router.get("/professor/request/anteposition", autenticarToken, isTeacherOrCoordinator(), getProfessorScheduleDetailsAnteposition);
router.put("/request/anteposition/:id", autenticarToken, isTeacherOrCoordinator(), approveAnteposition);
router.put("/request/reposition/:id", autenticarToken, isTeacherOrCoordinator(), approveReposition);
router.put("/request/negate/reposition/:id", autenticarToken, isTeacherOrCoordinator(), negateReposition);
router.put("/request/negate/anteposition/:id", autenticarToken, isTeacherOrCoordinator(), negateAnteposition);
router.get("/requests/teacher", autenticarToken, isCoordinator(), getRequestsByProfessor);
router.get("/requests/only", autenticarToken, isTeacherOrCoordinator(), getOwnRequests);

export default router;
