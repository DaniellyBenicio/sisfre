import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { createSchoolSaturday, updateSchoolSaturday, listAllSchoolSaturdays, filterSchoolSaturdays, getSchoolSaturdayById, deleteSchoolSaturday} from "../../controllers/admin/schoolSaturdayController.js";

const router = express.Router();

router.post('/school-saturdays', autenticarToken, isAdmin, createSchoolSaturday);
router.get('/school-saturdays/all', autenticarToken, isAdmin, listAllSchoolSaturdays);
router.get('/school-saturdays/filter', autenticarToken, isAdmin, filterSchoolSaturdays);
router.get('/school-saturdays/:id', autenticarToken, isAdmin, getSchoolSaturdayById);
router.put('/school-saturdays/:id', autenticarToken, isAdmin, updateSchoolSaturday);
router.delete('/school-saturdays/:id', autenticarToken, isAdmin, deleteSchoolSaturday);

export default router;
