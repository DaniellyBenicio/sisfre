import express from 'express';
import autenticarToken from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/isAdmin.js';
import isAdminOrCoordinator from '../../middlewares/isAdminOrCoordinator.js';
import { registerUser, updateUser, getUsers, getAllUsers, getUserById, deleteUser } from '../../controllers/admin/userController.js';

const router = express.Router();

router.post('/users', autenticarToken, isAdmin, registerUser);
router.put('/users/:id', autenticarToken, isAdmin, updateUser);
router.get('/users', autenticarToken, isAdminOrCoordinator(), getUsers);
router.get('/users/all', autenticarToken, isAdminOrCoordinator(), getAllUsers);
router.get('/users/:id', autenticarToken,  isAdminOrCoordinator(), getUserById);
router.delete('/users/:id', autenticarToken, isAdmin, deleteUser);

export default router;