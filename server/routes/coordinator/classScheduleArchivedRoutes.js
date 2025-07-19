import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import { isAdminOrCoordinator } from '../../middlewares/isAdminOrCoordinator.js';
import {
  getArchivedClassSchedules, getArchivedClassSchedulesFilter} from '../../controllers/coordinator/classScheduleArchivedController.js';

const router = express.Router();

router.get('/archived-class-schedules', autenticarToken, isAdminOrCoordinator(), getArchivedClassSchedules);
router.get('/archived-class-schedules/filter', autenticarToken, isCoordinator(), getArchivedClassSchedulesFilter);

export default router;
