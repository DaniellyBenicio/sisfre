import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isTeacher } from '../../middlewares/isTeacher.js';
import { getProfessorDisciplines } from '../../controllers/teacher/teacherDisciplinesController.js';
import { getProfessorClasses } from '../../controllers/teacher/teacherClassesController.js';

const router = express.Router();
router.get("/teacher-disciplines", autenticarToken, isTeacher(), getProfessorDisciplines);
router.get("/teacher-classes", autenticarToken, isTeacher(), getProfessorClasses);

export default router;
