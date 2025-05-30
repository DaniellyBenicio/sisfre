import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import { getProfessorsByCourse, searchProfessorsByCourse } from '../../controllers/coordinator/coordinatorController.js';

const router = express.Router();

router.get('/professors', autenticarToken, isCoordinator(), getProfessorsByCourse);
router.get('/professors/search', autenticarToken, isCoordinator(), searchProfessorsByCourse);

export default router;