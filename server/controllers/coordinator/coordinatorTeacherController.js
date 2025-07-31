import db from "../../models/index.js";

export const getCourseTeachersSchedules = async (req, res) => {
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const coordinator = await db.User.findOne({
      where: {
        id: loggedUserId,
        accessType: "Coordenador",
      },
      include: [
        {
          model: db.Course,
          as: "coordinatedCourse",
          attributes: ["id", "name", "acronym"],
        },
      ],
    });

    if (!coordinator || !coordinator.coordinatedCourse) {
      return res.status(403).json({
        message: "Usuário não é coordenador de nenhum curso.",
      });
    }

    const courseId = coordinator.coordinatedCourse.id;

    const schedules = await db.ClassSchedule.findAll({
      where: { courseId },
      include: [
        {
          model: db.Class,
          as: "class",
          attributes: ["id", "semester"],
        },
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "type", "year", "period"],
        },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          attributes: ["id", "dayOfWeek", "turn"],
          include: [
            {
              model: db.User,
              as: "professor",
              attributes: ["id", "username", "acronym", "email"],
            },
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
        message: "Nenhum horário encontrado para os professores do curso.",
      });
    }

    const scheduleList = [];

    schedules.forEach((schedule) => {
      const classData = schedule.class;
      const calendarData = schedule.calendar;

      schedule.details.forEach((detail) => {
        scheduleList.push({
          course: {
            id: coordinator.coordinatedCourse.id,
            name: coordinator.coordinatedCourse.name,
            acronym: coordinator.coordinatedCourse.acronym,
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
          professor: detail.professor
            ? {
                id: detail.professor.id,
                name: detail.professor.username,
                acronym: detail.professor.acronym,
                email: detail.professor.email,
              }
            : null,
        });
      });
    });

    const groupedByProfessor = scheduleList.reduce((acc, curr) => {
      const professorId = curr.professor.id;
      if (!acc[professorId]) {
        acc[professorId] = {
          professor: curr.professor,
          schedules: [],
        };
      }
      acc[professorId].schedules.push({
        course: curr.course,
        calendar: curr.calendar,
        class: curr.class,
        schedule: curr.schedule,
        discipline: curr.discipline,
      });
      return acc;
    }, {});

    const result = Object.values(groupedByProfessor);

    return res.status(200).json({
      message: "Horários dos professores do curso recuperados com sucesso!",
      course: coordinator.coordinatedCourse,
      professors: result,
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
