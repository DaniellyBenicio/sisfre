import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initializeApp from "./tasks/initTasks.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/admin/userRoutes.js";
import courseRoutes from "./routes/admin/courseRoutes.js";
import disciplineRoutes from "./routes/admin/disciplineRoutes.js";
import passwordRoutes from "./routes/password/passwordRoutes.js";
import classRoutes from "./routes/admin/classRoutes.js";
import coordinatorDisciplinesRoutes from "./routes/coordinator/coordinatorDisciplinesRoutes.js";
import coordinatorTeacherRoutes from "./routes/coordinator/coordinatorTeacherRoutes.js";
import calendarRoutes from "./routes/admin/calendarRoutes.js";
import schoolSaturdayRoutes from "./routes/admin/schoolSaturdayRoutes.js";
import holidayRoutes from "./routes/admin/holidayRoutes.js";
import ClassScheduleRoutes from "./routes/coordinator/ClassScheduleRoutes.js";
import hourRoutes from "./routes/coordinator/hourRoutes.js";
import coordinatorClassesRoutes from "./routes/coordinator/coordinatorClassesRoutes.js";
import classScheduleArchivedRoutes from "./routes/coordinator/classScheduleArchivedRoutes.js";
import teacherRoutes from "./routes/teacher/teacherRoutes.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", disciplineRoutes);
app.use("/api", passwordRoutes);
app.use("/api", classRoutes);
app.use("/api", coordinatorDisciplinesRoutes);
app.use("/api", coordinatorTeacherRoutes);
app.use("/api", calendarRoutes);
app.use("/api", schoolSaturdayRoutes);
app.use("/api", holidayRoutes);
app.use("/api", ClassScheduleRoutes);
app.use("/api", hourRoutes);
app.use("/api", coordinatorClassesRoutes);
app.use("/api", classScheduleArchivedRoutes);
app.use("/api", teacherRoutes);

initializeApp().then(() => {
  app.listen(3000, () => console.log("API rodando na porta 3000"));
});
