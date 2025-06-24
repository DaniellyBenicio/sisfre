import cron from "node-cron";
import db from "../models/index.js";
import { autoArchiveClassSchedules } from "./autoArchiveClassSchedules.js";

//Cria o usuário administrador, se não existir
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
        password: "123456",
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

const getCalendarIdToArchive = async () => {
  try {
    const today = new Date();
    const calendar = await db.Calendar.findOne({
      where: {
        endDate: { [db.Sequelize.Op.lte]: today },
      },
      order: [["endDate", "DESC"]],
    });
    return calendar ? calendar.id : null;
  } catch (error) {
    console.error("Erro ao buscar calendarId:", error.message);
    return null;
  }
};

const initializeTasks = async () => {
  const calendarId = await getCalendarIdToArchive();
  if (calendarId) {
    try {
      const result = await autoArchiveClassSchedules(calendarId);
      console.log(result.message);
    } catch (error) {
      console.log("Nenhum horário para arquivar");
    }
  } else {
    console.log("Nenhum horário para arquivar");
  }

  //Arquivamento diário agendado para às 00:00
  cron.schedule(
    "0 0 * * *",
    async () => {
      const calendarId = await getCalendarIdToArchive();
      if (calendarId) {
        try {
          const result = await autoArchiveClassSchedules(calendarId);
          console.log(result.message);
        } catch (error) {
          console.log("Nenhum horário para arquivar");
        }
      } else {
        console.log("Nenhum horário para arquivar");
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );
};

//Inicializa
const initializeApp = async () => {
  try {
    await db.sequelize.sync({ force: false, logging: false });
    console.log("Banco de dados sincronizado.");
    await createAdminIfNotExists();
    await initializeTasks();
  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);
    process.exit(1);
  }
};

export default initializeApp;
