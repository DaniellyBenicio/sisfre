import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import {
  createClassSchedule, archiveClassSchedule, updateClassSchedule, getClassSchedule, getClassScheduleDetails, getClassSchedulesFilter
} from '../../controllers/coordinator/classScheduleController.js';

const router = express.Router();
router.post('/class-schedules', autenticarToken, isCoordinator(), createClassSchedule);
router.put('/class-schedule/:id', autenticarToken, isCoordinator(), updateClassSchedule);
router.put("/class-schedule/:id/archive", autenticarToken, isCoordinator(), archiveClassSchedule);
router.get("/class-schedules/:classScheduleId/details", autenticarToken, isCoordinator(), getClassScheduleDetails);
router.get("/class-schedules", autenticarToken, isCoordinator(), getClassSchedule);
router.get('/class-schedules/filter', autenticarToken, isCoordinator(), getClassSchedulesFilter);

export default router;