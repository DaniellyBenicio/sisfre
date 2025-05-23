const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
//Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/admin/userRoutes");
const courseRoutes = require("./routes/admin/courseRoutes"); // Importar as rotas de Course
const disciplineRoutes = require("./routes/admin/disciplineRoutes");

//Models
const User = require("./models/admin/User");

const app = express();

dotenv.config();

app.use(cors()); // Usa o middleware CORS

app.use(express.json());

app.use("/api/auth", authRoutes);

//Rotas do ADMIN
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", disciplineRoutes);

// Função para criar o usuário administrador, se não existir
const createAdminIfNotExists = async () => {
  const adminExists = await User.findOne({ where: { accessType: "admin" } });

  if (!adminExists) {
    // Criar o usuário administrador com dados pré-definidos
    await User.create({
      username: "admin",
      email: "diren.cedro@ifce.edu.br",
      password: "123456", // A senha será automaticamente hasheada
      accessType: "admin",
    });
    console.log("Administrador criado com sucesso!");
  }
};

sequelize
  .sync({ force: false }) // force: false para não apagar os dados existentes
  .then(async () => {
    await createAdminIfNotExists(); // Verifica e cria o admin se necessário
    app.listen(3000, () => console.log("API rodando na porta 3000"));
  })
  .catch((error) =>
    console.error("Erro ao sincronizar o banco de dados:", error)
  );
