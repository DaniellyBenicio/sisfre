import express from 'express';
import {forgotPassword, resetPassword} from '../../controllers/password/passwordController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/resetPassword/:token', resetPassword);

export default router;