import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/isAdmin.js';
import { createClass, getClasses, getClassById, updateClass, deleteClass, archiveClass } from '../../controllers/admin/classController.js';

const router = express.Router();

// Rotas para classes
router.post('/classes', autenticarToken, isAdmin, createClass);
router.get('/classes', autenticarToken, getClasses);
router.get('/classes/:id', autenticarToken, getClassById);
router.put('/classes/:id', autenticarToken, isAdmin, updateClass);
router.delete('/classes/:id', autenticarToken, isAdmin, deleteClass);
router.patch('/classes/:id/archive', autenticarToken, isAdmin, archiveClass);

export default router;