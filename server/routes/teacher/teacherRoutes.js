import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isTeacher } from '../../middlewares/isTeacher.js';
import { getProfessorDisciplines } from '../../controllers/teacher/teacherDisciplinesController.js';
import { getProfessorClasses } from '../../controllers/teacher/teacherClassesController.js';
import { getTeacherSchedules } from '../../controllers/teacher/teacherSchedulesController.js';
import { registerAttendanceByTurn, getAttendanceByTurn } from '../../controllers/teacher/AttendanceController.js';
import { autoAbsenceAttendance } from "../../tasks/autoAbsenceAttendance.js";

const router = express.Router();
router.get("/teacher-disciplines", autenticarToken, isTeacher(), getProfessorDisciplines);
router.get("/teacher-classes", autenticarToken, isTeacher(), getProfessorClasses);



router.get("/teacher-schedules", autenticarToken, isTeacher(), getTeacherSchedules);
router.post("/register-by-turn", autenticarToken, isTeacher(), registerAttendanceByTurn);
router.get("/register-by-turn", autenticarToken, isTeacher(), getAttendanceByTurn);
router.post("/attendance/auto-absence", autenticarToken, async (req, res) => {
  try {
    await autoAbsenceAttendance(); // Não passa mais o turno
    res.status(200).json({ message: "Task de falta automática executada para o turno atual." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao executar task automática.", details: error.message });
  }
});
export default router;
