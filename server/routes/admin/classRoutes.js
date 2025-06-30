import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/isAdmin.js';
import { createClass, getClasses, getAllClasses, getClassById, updateClass, deleteClass } from '../../controllers/admin/classController.js';

const router = express.Router();

// Rotas para classes
router.post('/classes', autenticarToken, isAdmin, createClass);
router.get('/classes', autenticarToken, getClasses);
router.get('/classes-all', autenticarToken, getAllClasses);
router.delete('/classes/:courseClassId', autenticarToken, isAdmin, deleteClass);
router.get('/classes/:courseClassId', autenticarToken, getClassById);
router.put('/classes/:courseClassId', autenticarToken, isAdmin, updateClass);

export default router;