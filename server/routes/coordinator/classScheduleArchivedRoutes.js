import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import {
  getArchivedClassSchedules, getArchivedClassSchedulesFilter} from '../../controllers/coordinator/classScheduleArchivedController.js';

const router = express.Router();

router.get('/archived-class-schedules', autenticarToken, isCoordinator(), getArchivedClassSchedules);
router.get('/archived-class-schedules/filter', autenticarToken, isCoordinator(), getArchivedClassSchedulesFilter);

export default router;
