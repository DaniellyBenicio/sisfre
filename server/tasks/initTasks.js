import cron from "node-cron";
import db from "../models/index.js";
import { autoArchiveClassSchedules } from "./autoArchiveClassSchedules.js";
import "../tasks/holidaySeedTask.js";
import { exec } from "child_process";
import { autoAbsenceAttendance } from "./autoAbsenceAttendance.js";
import { getDayOfWeek } from "../controllers/teacher/AttendanceController.js";

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

const isSchoolDay = async (date) => {
  const dateStr = date.toISOString().split("T")[0];

  const isHoliday = await db.Holiday.findOne({ where: { date: dateStr } });
  if (isHoliday) {
    console.log(
      `Hoje é feriado (${isHoliday.name} - ${isHoliday.type}). Não é um dia letivo.`
    );
    return false;
  }

  const dayOfWeek = getDayOfWeek(date);

  if (["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].includes(dayOfWeek)) {
    return true;
  }

  if (dayOfWeek === "Sábado") {
    const schoolSaturday = await db.SchoolSaturday.findOne({
      where: { date: dateStr },
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          through: { attributes: [] },
        },
      ],
    });
    return !!schoolSaturday;
  }

  return false;
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

  cron.schedule(
    "0 1 * * *",
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

  cron.schedule(
    "30 12 * * *",
    async () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
      });
      const today = new Date(now);
      if (await isSchoolDay(today)) {
        console.log("Executando faltas automáticas MATUTINO às 12:30!");
        try {
          const result = await autoAbsenceAttendance("MATUTINO");
          console.log("Resultado da execução:", result);
          if (result && result.message) {
            console.log(result.message);
          } else {
            console.log("Nenhum resultado ou mensagem retornada.");
          }
        } catch (error) {
          console.error(
            "Erro ao executar autoAbsenceAttendance (MATUTINO):",
            error.message
          );
        }
      } else {
        console.log(
          "Hoje não é um dia letivo ou é feriado. Job de faltas automáticas MATUTINO não executado."
        );
      }
    },
    { timezone: "America/Sao_Paulo" }
  );
  cron.schedule(
    "50 17 * * *",
    async () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
      });
      const today = new Date(now);
      if (await isSchoolDay(today)) {
        console.log("Executando faltas automáticas VESPERTINO às 17:50!");
        const result = await autoAbsenceAttendance("VESPERTINO");
        console.log(result.message);
      } else {
        console.log(
          "Hoje não é um dia letivo ou é feriado. Job de faltas automáticas VESPERTINO não executado."
        );
      }
    },
    { timezone: "America/Sao_Paulo" }
  );

  cron.schedule(
    "30 23 * * *",
    async () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
      });
      const today = new Date(now);
      if (await isSchoolDay(today)) {
        console.log("Executando faltas automáticas NOTURNO às 23:30!");
        const result = await autoAbsenceAttendance("NOTURNO");
        console.log(result.message);
      } else {
        console.log(
          "Hoje não é um dia letivo ou é feriado. Job de faltas automáticas NOTURNO não executado."
        );
      }
    },
    { timezone: "America/Sao_Paulo" }
  );
};

const runSeeds = () => {
  return new Promise((resolve, reject) => {
    exec("npx sequelize-cli db:seed:all", (error, stdout, stderr) => {
      if (error) {
        console.error("Erro ao rodar seeds:", stderr);
        return reject(error);
      }
      console.log("Seeds executadas com sucesso!");
      resolve(stdout);
    });
  });
};

const checkAndRunMissedTasks = async (now) => {
  const today = new Date(now);
  const todayStr = today.toISOString().split("T")[0];
  const dayOfWeek = getDayOfWeek(today);

  if (!(await isSchoolDay(today))) {
    return;
  }

  const tasks = [
    { time: "12:30", turn: "MATUTINO" },
    { time: "17:50", turn: "VESPERTINO" },
    { time: "23:30", turn: "NOTURNO" },
  ];

  for (const task of tasks) {
    const [taskHour, taskMinute] = task.time.split(":").map(Number);

    const taskTimeToday = new Date(today);
    taskTimeToday.setHours(taskHour, taskMinute, 0, 0);

    if (today > taskTimeToday) {
      console.log(
        `Verificando tarefa perdida: ${task.turn} de ${task.time} em ${todayStr}...`
      );

      const hasExistingAttendances = await db.Attendance.findOne({
        where: {
          date: todayStr,
        },
        include: [
          {
            model: db.ClassScheduleDetail,
            as: "detail",
            where: { turn: task.turn },
          },
        ],
      });

      if (!hasExistingAttendances) {
        console.log(
          `Tarefa perdida encontrada! Executando faltas automáticas para o turno ${task.turn}.`
        );
        try {
          const result = await autoAbsenceAttendance(task.turn);
          console.log("Resultado da execução da tarefa perdida:", result);
        } catch (error) {
          console.error(
            `Erro ao executar tarefa perdida para ${task.turn}:`,
            error.message
          );
        }
      } else {
        console.log(
          `Faltas para o turno ${task.turn} já foram registradas hoje. Nenhuma ação necessária.`
        );
      }
    }
  }
};

const initializeApp = async () => {
  try {
    await db.sequelize.sync({ force: false, logging: false });
    console.log("Banco de dados sincronizado.");

    const courseCount = await db.Course.count();
    if (courseCount === 0) {
      await runSeeds();
    }

    await createAdminIfNotExists();

    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo",
    });
    await checkAndRunMissedTasks(now);

    await initializeTasks(); 
  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);
    process.exit(1);
  }
};

export default initializeApp;
