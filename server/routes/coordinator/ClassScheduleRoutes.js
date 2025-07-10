import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import {
  createClassSchedule, updateClassSchedule, getClassSchedule, getClassScheduleDetails, getClassSchedulesFilter, getActiveClasses
} from '../../controllers/coordinator/classScheduleController.js';

const router = express.Router();
router.post('/class-schedules', autenticarToken, isCoordinator(), createClassSchedule);
router.put('/class-schedule/:id', autenticarToken, isCoordinator(), updateClassSchedule);
router.get("/class-schedules/:classScheduleId/details", autenticarToken, isCoordinator(), getClassScheduleDetails);
router.get("/class-schedules", autenticarToken, isCoordinator(), getClassSchedule);
router.get('/class-schedules/filter', autenticarToken, isCoordinator(), getClassSchedulesFilter);
router.get('/class-schedules-active', autenticarToken, isCoordinator(), getActiveClasses)

export default router;