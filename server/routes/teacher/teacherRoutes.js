import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isTeacher } from '../../middlewares/isTeacher.js';
import { getProfessorDisciplines } from '../../controllers/teacher/teacherDisciplinesController.js';
import { getProfessorClasses } from '../../controllers/teacher/teacherClassesController.js';
import { getTeacherSchedules } from '../../controllers/teacher/teacherSchedulesController.js';
import { registerAttendanceByTurn, getAttendanceByTurn } from '../../controllers/teacher/AttendanceController.js';

const router = express.Router();
router.get("/teacher-disciplines", autenticarToken, isTeacher(), getProfessorDisciplines);
router.get("/teacher-classes", autenticarToken, isTeacher(), getProfessorClasses);



router.get("/teacher-schedules", autenticarToken, isTeacher(), getTeacherSchedules);
router.post("/register-by-turn", autenticarToken, isTeacher(), registerAttendanceByTurn);
router.get("/register-by-turn", autenticarToken, isTeacher(), getAttendanceByTurn);
export default router;
