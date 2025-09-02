import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import isAdmin from "../../middlewares/isAdmin.js";
import {
  createDiscipline,
  deleteDiscipline,
  updateDiscipline,
  getDisciplines,
  getAllDisciplines,
  getDisciplineById,
} from "../../controllers/admin/disciplineController.js";
import {
  getDisciplinesCountByCourse,
  getAdminTeacherAbsences,
  getAbsencesCountByCourse,
  getRepositionAntepositionCounts,
  getResolutionRate,
  getMonthlyAbsencesHistory,
  getAbsencesByShift,
  getRequestsStatus
  
} from "../../controllers/admin/reportsController.js";

const router = express.Router();

router.post("/disciplines", autenticarToken, isAdmin, createDiscipline);
router.delete("/discipline/:id", autenticarToken, isAdmin, deleteDiscipline);
router.put("/discipline/:id", autenticarToken, isAdmin, updateDiscipline);
router.get("/disciplines", autenticarToken, getDisciplines);
router.get("/disciplines/all", autenticarToken, getAllDisciplines);
router.get("/discipline/:id", autenticarToken, getDisciplineById);

//admin reports
router.get("/reports/courses/disciplines-count", autenticarToken, isAdmin, getDisciplinesCountByCourse);
router.get("/reports/absences/teacher-count", autenticarToken, isAdmin, getAdminTeacherAbsences);
router.get("/reports/absences/course-count", autenticarToken, isAdmin, getAbsencesCountByCourse);
router.get( "/reports/reposition-anteposition-counts", autenticarToken, isAdmin, getRepositionAntepositionCounts);
router.get("/reports/resolution-rate", autenticarToken, isAdmin, getResolutionRate);
router.get("/reports/monthly-absences",autenticarToken, isAdmin, getMonthlyAbsencesHistory);
router.get('/reports/absences-by-shift', autenticarToken, isAdmin, getAbsencesByShift);
router.get("/reports/requests/status", autenticarToken, isAdmin, getRequestsStatus);




export default router;

