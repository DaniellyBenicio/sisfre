import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import isAdmin from '../../middlewares/isAdmin.js';
import { isAdminOrCoordinator} from '../../middlewares/isAdminOrCoordinator.js';
import { getCourseTeachersSchedules } from '../../controllers/coordinator/coordinatorTeacherController.js';
import { getAbsencesByDiscipline, updateAbsenceByTurn, TotalAbsencesByTeacher } from "../../controllers/coordinator/coordinatorAttendanceController.js";


const router = express.Router();

router.get('/teachers-by-course', autenticarToken, isCoordinator(), getCourseTeachersSchedules);
router.get("/absences-by-discipline", autenticarToken, isAdminOrCoordinator(), getAbsencesByDiscipline);
router.put('/absences/turn', autenticarToken, isAdmin, updateAbsenceByTurn);
router.get("/total-absences-by-teacher", autenticarToken, isAdmin, TotalAbsencesByTeacher);

export default router;
