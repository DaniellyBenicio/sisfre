import express from 'express';
   import autenticarToken from '../../middlewares/authMiddleware.js';
   import isAdmin from '../../middlewares/isAdmin.js';
   import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } from '../../controllers/admin/courseController.js';

   const router = express.Router();

   // Rotas para cursos
   router.post('/courses', autenticarToken, isAdmin, createCourse);
   router.get('/courses', autenticarToken, getCourses);
   router.get('/courses/:id', autenticarToken, getCourseById);
   router.put('/courses/:id', autenticarToken, isAdmin, updateCourse);
   router.delete('/courses/:id', autenticarToken, isAdmin, deleteCourse);

   export default router;