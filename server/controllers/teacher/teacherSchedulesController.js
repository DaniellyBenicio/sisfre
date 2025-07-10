import db from "../../models/index.js";

export const getTeacherSchedules = async (req, res) => {
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
        message: "Nenhum horário encontrado para o professor.",
      });
    }

    const scheduleList = [];

    schedules.forEach((schedule) => {
      const classData = schedule.class;
      const courseData = schedule.course;
      const calendarData = schedule.calendar;

      schedule.details.forEach((detail) => {
        scheduleList.push({
          course: {
            id: courseData ? courseData.id : null,
            name: courseData ? courseData.name : null,
            acronym: courseData ? courseData.acronym : null,
          },
          calendar: calendarData
            ? {
                id: calendarData.id,
                type: calendarData.type,
                year: calendarData.year,
                period: calendarData.period,
                formatted: `${calendarData.type} - ${calendarData.year}.${calendarData.period}`,
              }
            : null,
          class: {
            id: classData.id,
            semester: classData.semester,
          },
          schedule: {
            dayOfWeek: detail.dayOfWeek,
            turn: detail.turn,
            hour: detail.hour
              ? {
                  id: detail.hour.id,
                  start: detail.hour.hourStart,
                  end: detail.hour.hourEnd,
                }
              : null,
          },
          discipline: detail.discipline
            ? {
                id: detail.discipline.id,
                name: detail.discipline.name,
                acronym: detail.discipline.acronym,
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
      message: "Horários do professor recuperados com sucesso!",
      schedules: scheduleList,
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
      message: "Erro interno do servidor ao recuperar os horários.",
      error: error.message,
    });
  }
};