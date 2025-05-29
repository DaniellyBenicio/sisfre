import express from 'express';
   import autenticarToken from '../../middlewares/authMiddleware.js';
   import isAdmin from '../../middlewares/isAdmin.js';
   import { createDiscipline, deleteDiscipline, updateDiscipline, getDisciplines, getAllDisciplines, getDisciplineById } from '../../controllers/admin/disciplineController.js';

   const router = express.Router();

   router.post('/disciplines', autenticarToken, isAdmin, createDiscipline);
   router.delete('/discipline/:id', autenticarToken, isAdmin, deleteDiscipline);
   router.put('/discipline/:id', autenticarToken, isAdmin, updateDiscipline);
   router.get('/disciplines', autenticarToken, getDisciplines);
   router.get('/disciplines/all', autenticarToken, getAllDisciplines);
   router.get('/discipline/:id', autenticarToken, getDisciplineById);

   export default router;