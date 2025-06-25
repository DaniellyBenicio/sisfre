import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isTeacher } from '../../middlewares/isTeacher.js';
import {
  getProfessorDisciplines
} from '../../controllers/teacher/teacherDisciplinesController.js';

const router = express.Router();
router.get("/teacher-disciplines", autenticarToken, isTeacher(), getProfessorDisciplines);

export default router;