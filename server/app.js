import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./models/index.js";
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

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// Rotas
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

// Função para criar o usuário administrador, se não existir
const createAdminIfNotExists = async () => {
  try {
    const adminExists = await db.User.findOne({
      where: { accessType: "Admin" },
    });

    if (!adminExists) {
      console.log("Nenhum administrador encontrado. Criando um...");
      await db.User.create({
        username: "admin",
        email: "diren.cedro@ifce.edu.br",
        password: "123456", // A senha será hasheada pelo hook beforeCreate
        accessType: "Admin",
      });
      console.log("Administrador criado com sucesso!");
    } else {
      console.log("Administrador já existe.");
    }
  } catch (error) {
    console.error("Erro ao verificar/criar administrador:", error);
  }
};

db.sequelize
  .sync({ force: false }) // force: false para não apagar os dados existentes
  .then(async () => {
    console.log("Banco de dados sincronizado.");
    await createAdminIfNotExists();
    app.listen(3000, () => console.log("API rodando na porta 3000"));
  })
  .catch((error) => {
    console.error(
      "Erro ao sincronizar o banco de dados ou iniciar o servidor:",
      error
    );
    process.exit(1); // Encerra o processo se houver um erro crítico
  });
