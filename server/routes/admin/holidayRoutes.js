import express from "express";
import autenticarToken from "../../middlewares/authMiddleware.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { createHoliday, getHolidays, getHolidayById, updateHoliday, deleteHoliday } from "../../controllers/admin/holidayController.js";

const router = express.Router();

router.post("/holidays", autenticarToken, isAdmin, createHoliday);
router.get("/holidays", autenticarToken, getHolidays);
router.get("/holidays/:id", autenticarToken, getHolidayById);
router.put("/holidays/:id", autenticarToken, isAdmin, updateHoliday);
router.delete("/holidays/:id", autenticarToken, isAdmin, deleteHoliday);

export default router;