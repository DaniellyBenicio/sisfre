import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { isCoordinator } from '../../middlewares/isCoordinator.js';
import {
  createClassSchedule, archiveClassSchedule, updateClassSchedule
} from '../../controllers/coordinator/classScheduleController.js';

/**
 *   findAllClassSchedule,
  findByIdClassSchedule,
  addScheduleDetail,
  updateScheduleDetail,
  deleteScheduleDetail,
 * */
const router = express.Router();
// Rotas para ClassSchedule
router.post('/class-schedules', autenticarToken, isCoordinator(), createClassSchedule);
router.put('/class-schedule/:id', autenticarToken, isCoordinator(), updateClassSchedule);

//router.get('/class-schedules', autenticarToken, isCoordinator(), findAllClassSchedule);
//router.get('/class-schedules/:id', autenticarToken, isCoordinator(), findByIdClassSchedule);
router.put("/class-schedule/:id/archive", autenticarToken, isCoordinator(), archiveClassSchedule);
//router.delete('/class-schedules/:id', autenticarToken, isCoordinator(), deleteClassSchedule);

// Rotas para ClassScheduleDetail
//router.post('/class-schedule-details', autenticarToken, isCoordinator(), addScheduleDetail);
//router.put('/class-schedule-details/:id', autenticarToken, isCoordinator(), updateScheduleDetail);
//router.delete('/class-schedule-details/:id', autenticarToken, isCoordinator(), deleteScheduleDetail);

export default router;