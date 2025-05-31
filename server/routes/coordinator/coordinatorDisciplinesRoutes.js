import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import { associateDisciplineToCourse, getDisciplinesByCoordinatorCourse, updateDisciplineOfCourse, removeDisciplineFromCourse, searchDisciplinesByCoordinatorCourse } from '../../controllers/coordinator/coordinatorDisciplinesController.js';

const router = express.Router();

router.post("/course/discipline", autenticarToken, isCoordinator(), associateDisciplineToCourse);
router.get("/course/discipline", autenticarToken, isCoordinator(), getDisciplinesByCoordinatorCourse);
router.put("/course/discipline/:disciplineId", autenticarToken, isCoordinator(), updateDisciplineOfCourse);
router.delete("/course/discipline/:disciplineId", autenticarToken, isCoordinator(), removeDisciplineFromCourse);
router.get("/course/discipline/search", autenticarToken, isCoordinator(), searchDisciplinesByCoordinatorCourse)

export default router;