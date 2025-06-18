import express from "express";
import autenticarToken from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/isAdmin.js';

import { associateClassToCourse, removeClassFromCourse, getAllAssociations, updateAssociation } from "../../controllers/admin/courseClassController.js";

const router = express.Router();

router.post("/courseclass", autenticarToken, isAdmin, associateClassToCourse);
router.delete("/courseclass/:id", autenticarToken, isAdmin, removeClassFromCourse);
router.get("/courseclass", autenticarToken, isAdmin, getAllAssociations);
router.put("/courseclass/:id", autenticarToken, isAdmin, updateAssociation);

export default router;