import db from "../../models/index.js";
import { Op } from "sequelize";

export const getArchivedClassSchedules = async (req, res) => {
  try {
    const loggedUserId = req.user?.id;

    if (!loggedUserId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const classSchedules = await db.ClassSchedule.findAll({
      where: {
        courseId: course.id,
        isActive: false,
      },
      include: [
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "year", "period"],
        },
        {
          model: db.Class,
          as: "class",
          attributes: ["id", "semester"],
        },
        {
          model: db.Course,
          as: "course",
          attributes: ["name", "acronym"],
        },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          attributes: [
            "id",
            "disciplineId",
            "userId",
            "dayOfWeek",
            "turn",
            "hourId",
          ],
          include: [
            {
              model: db.Discipline,
              as: "discipline",
              attributes: ["id", "name", "acronym"],
            },
            {
              model: db.User,
              as: "professor",
              attributes: ["id", "username", "acronym"],
            },
            {
              model: db.Hour,
              as: "hour",
              attributes: ["id", "hourStart", "hourEnd"],
            },
          ],
        },
      ],
      order: [
        ["calendar", "year", "DESC"],
        ["calendar", "period", "DESC"],
        ["class", "semester", "ASC"],
      ],
    });

    if (!classSchedules.length) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma grade arquivada encontrada para o coordenador.",
      });
    }

    const countTurns = (details) => {
      const counts = {
        MATUTINO: 0,
        VESPERTINO: 0,
        NOTURNO: 0,
        INTEGRADO: 0,
      };
      details.forEach((detail) => {
        if (counts.hasOwnProperty(detail.turn)) {
          counts[detail.turn]++;
        }
      });
      return counts;
    };

    const scheduleList = classSchedules.map((schedule) => {
      const calendarInfo = `${schedule.calendar.year}.${schedule.calendar.period}`;
      const turnCounts = countTurns(schedule.details);

      return {
        id: schedule.id,
        calendar: calendarInfo,
        turma: schedule.class.semester,
        nome_curso: schedule.course.name,
        sigla_curso: schedule.course.acronym,
        details: schedule.details.map((detail) => ({
          id: detail.id,
          discipline: detail.discipline ? detail.discipline.name : null,
          discipline_acronym: detail.discipline
            ? detail.discipline.acronym
            : null,
          professor: detail.professor ? detail.professor.username : null,
          dayOfWeek: detail.dayOfWeek,
          turn: detail.turn,
          hour: detail.hour
            ? `${detail.hour.hourStart} - ${detail.hour.hourEnd}`
            : null,
        })),
        turnCounts,
      };
    });

    return res.status(200).json({
      message: "Grades arquivadas recuperadas com sucesso!",
      schedules: scheduleList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao recuperar grades arquivadas.",
      error: error.message,
    });
  }
};

export const getArchivedClassSchedulesFilter = async (req, res) => {
  try {
    const loggedUserId = req.user?.id;
    const { calendar, turma, courseId } = req.query;

    if (!loggedUserId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const where = {
      courseId: course.id,
      isActive: false,
    };

    if (calendar) {
      where["$calendar.year$"] = { [Op.like]: `%${calendar}%` };
      if (calendar.includes(".")) {
        const [year, period] = calendar.split(".");
        if (year && period) {
          where["$calendar.year$"] = { [Op.like]: `%${year}%` };
          where["$calendar.period$"] = { [Op.eq]: parseInt(period) };
        }
      }
    }

    if (turma) {
      where["$class.semester$"] = { [Op.like]: `%${turma}%` };
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const classSchedules = await db.ClassSchedule.findAll({
      where,
      include: [
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "year", "period"],
        },
        {
          model: db.Class,
          as: "class",
          attributes: ["id", "semester"],
        },
        {
          model: db.Course,
          as: "course",
          attributes: ["name", "acronym"],
        },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          attributes: [
            "id",
            "disciplineId",
            "userId",
            "dayOfWeek",
            "turn",
            "hourId",
          ],
          include: [
            {
              model: db.Discipline,
              as: "discipline",
              attributes: ["id", "name", "acronym"],
            },
            {
              model: db.User,
              as: "professor",
              attributes: ["id", "username", "acronym"],
            },
            {
              model: db.Hour,
              as: "hour",
              attributes: ["id", "hourStart", "hourEnd"],
            },
          ],
        },
      ],
      order: [
        ["calendar", "year", "DESC"],
        ["calendar", "period", "DESC"],
        ["class", "semester", "ASC"],
      ],
    });

    if (!classSchedules.length) {
      return res.status(404).json({
        success: false,
        message:
          "Nenhuma grade arquivada encontrada para os filtros fornecidos.",
      });
    }

    const countTurns = (details) => {
      const counts = {
        MATUTINO: 0,
        VESPERTINO: 0,
        NOTURNO: 0,
        INTEGRADO: 0,
      };
      details.forEach((detail) => {
        if (counts.hasOwnProperty(detail.turn)) {
          counts[detail.turn]++;
        }
      });
      return counts;
    };

    const scheduleList = classSchedules.map((schedule) => {
      const calendarInfo = `${schedule.calendar.year}.${schedule.calendar.period}`;
      const turnCounts = countTurns(schedule.details);

      return {
        id: schedule.id,
        calendar: calendarInfo,
        turma: schedule.class.semester,
        nome_curso: schedule.course.name,
        sigla_curso: schedule.course.acronym,
        details: schedule.details.map((detail) => ({
          id: detail.id,
          discipline: detail.discipline ? detail.discipline.name : null,
          discipline_acronym: detail.discipline
            ? detail.discipline.acronym
            : null,
          professor: detail.professor ? detail.professor.username : null,
          dayOfWeek: detail.dayOfWeek,
          turn: detail.turn,
          hour: detail.hour
            ? `${detail.hour.hourStart} - ${detail.hour.hourEnd}`
            : null,
        })),
        turnCounts,
      };
    });

    return res.status(200).json({
      message: "Grades arquivadas filtradas com sucesso!",
      schedules: scheduleList,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno do servidor ao filtrar grades arquivadas.",
      error: error.message,
    });
  }
};
