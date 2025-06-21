import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import { getHours, getScheduleHours } from '../../controllers/admin/hourController.js';

const router = express.Router();

router.get("/hours", autenticarToken,  getHours);
router.get("/hours-schedule/:classScheduleId", autenticarToken, getScheduleHours);


export default router;