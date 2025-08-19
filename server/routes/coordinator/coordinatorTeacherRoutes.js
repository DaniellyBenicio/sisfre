import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import { isAdminOrCoordinator } from '../../middlewares/isAdminOrCoordinator.js';
import { getCourseTeachersSchedules } from '../../controllers/coordinator/coordinatorTeacherController.js';
import { getAbsencesByDiscipline } from "../../controllers/coordinator/coordinatorAttendanceController.js";


const router = express.Router();

router.get('/teachers-by-course', autenticarToken, isCoordinator(), getCourseTeachersSchedules);
router.get("/absences-by-discipline", autenticarToken, isAdminOrCoordinator(), getAbsencesByDiscipline);

export default router;
