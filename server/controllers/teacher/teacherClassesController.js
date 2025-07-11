import db from "../../models/index.js";

export const getProfessorClasses = async (req, res) => {
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }
    const professor = await db.User.findByPk(loggedUserId, {
      attributes: ["id", "username", "acronym"],
    });

    if (!professor) {
      return res.status(404).json({
        message: "Professor não encontrado.",
      });
    }

    const schedules = await db.ClassSchedule.findAll({
      include: [
        {
          model: db.Class,
          as: "class",
          attributes: ["id", "semester"],
        },
        {
          model: db.Course,
          as: "course",
          attributes: ["id", "name", "acronym"],
        },
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "type", "year", "period"],
        },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          where: { userId: loggedUserId },
          attributes: ["id", "dayOfWeek", "turn"],
          include: [
            {
              model: db.Discipline,
              as: "discipline",
              attributes: ["id", "name", "acronym"],
            },
            {
              model: db.Hour,
              as: "hour",
              attributes: ["id", "hourStart", "hourEnd"],
            },
          ],
        },
      ],
    });

    if (!schedules.length) {
      return res.status(404).json({
        message: "Nenhuma turma encontrada para o professor.",
      });
    }

    const classList = [];

    schedules.forEach((schedule) => {
      const classData = schedule.class;
      const courseData = schedule.course;
      const calendarData = schedule.calendar;

      schedule.details.forEach((detail) => {
        classList.push({
          course: {
            name: courseData ? courseData.name : null,
            acronym: courseData ? courseData.acronym : null,
          },
          calendar: calendarData
            ? `${calendarData.type} - ${calendarData.year}.${calendarData.period}`
            : null,
          classId: classData.id,
          semester: classData.semester,
          dayOfWeek: detail.dayOfWeek,
          turn: detail.turn,
          discipline: detail.discipline
            ? {
                id: detail.discipline.id,
                name: detail.discipline.name,
                acronym: detail.discipline.acronym,
              }
            : null,
          hour: detail.hour
            ? {
                start: detail.hour.hourStart,
                end: detail.hour.hourEnd,
              }
            : null,
          professor: {
            id: professor.id,
            name: professor.username,
            acronym: professor.acronym,
          },
        });
      });
    });

    return res.status(200).json({
      message: "Turmas recuperadas com sucesso!",
      classes: classList,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: "Erro de validação nos dados fornecidos.",
        errors,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao recuperar as turmas.",
      error: error.message,
    });
  }
};
