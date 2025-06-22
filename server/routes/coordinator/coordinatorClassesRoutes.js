import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import { getClassesByCoordinatorCourse } from '../../controllers/coordinator/coordinatorClassesController.js'; 

const router = express.Router();

router.get("/classes-coordinator", autenticarToken, isCoordinator(), getClassesByCoordinatorCourse);

export default router;