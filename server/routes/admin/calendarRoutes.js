import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/isAdmin.js';
import { createCalendar, updateCalendar, getCalendarTypes } from '../../controllers/admin/calendarController.js';

const router = express.Router();

router.post('/calendar', autenticarToken, isAdmin, createCalendar);
router.get('/calendar-types', autenticarToken, getCalendarTypes);
router.put('/calendar/:id', autenticarToken, isAdmin, updateCalendar);


export default router;