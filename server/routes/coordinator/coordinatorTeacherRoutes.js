import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import { getCourseTeachersSchedules } from '../../controllers/coordinator/coordinatorTeacherController.js';

const router = express.Router();

router.get('/teachers-by-course', autenticarToken, isCoordinator(), getCourseTeachersSchedules);


export default router;