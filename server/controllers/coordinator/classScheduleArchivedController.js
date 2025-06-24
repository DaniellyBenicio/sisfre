import db from "../../models/index.js";
import { Op } from "sequelize";

export const getArchivedClassSchedules = async (req, res) => {
  try {
    const loggedUserId = req.user?.id;

    if (!loggedUserId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.',
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.',
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
          as: 'calendar',
          attributes: ['id', 'year', 'period'],
        },
        {
          model: db.Class,
          as: 'class',
          attributes: ['id', 'semester'],
        },
        {
          model: db.Course,
          as: 'course',
          attributes: ['name', 'acronym'],
        },
        {
          model: db.ClassScheduleDetail,
          as: 'details',
          attributes: ['id', 'disciplineId', 'userId', 'dayOfWeek'],
          include: [
            {
              model: db.Discipline,
              as: 'discipline',
              attributes: ['id', 'name', 'acronym'],
            },
            {
              model: db.User,
              as: 'professor',
              attributes: ['id', 'username', 'acronym'],
            },
            {
              model: db.Hour,
              as: 'hour',
              attributes: ['id', 'hourStart', 'hourEnd'],
            },
          ],
        },
      ],
      order: [
        ['calendar', 'year', 'DESC'],
        ['calendar', 'period', 'DESC'],
        ['class', 'semester', 'ASC'],
      ],
    });

    if (!classSchedules.length) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma disciplina arquivada encontrada para o coordenador.',
      });
    }

    const scheduleList = classSchedules.map((schedule) => {
      const calendarInfo = `${schedule.calendar.year}.${schedule.calendar.period}`;
      return {
        id: schedule.id,
        calendar: calendarInfo,
        turma: schedule.class.semester,
        turno: schedule.turn,
        nome_curso: schedule.course.name,
        sigla_curso: schedule.course.acronym,
        details: schedule.details.map((detail) => ({
          discipline: detail.discipline.name,
          discipline_acronym: detail.discipline.acronym,
          professor: detail.professor ? detail.professor.username : null,
          dayOfWeek: detail.dayOfWeek,
          hourStart: detail.hour.hourStart,
          hourEnd: detail.hour.hourEnd,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Disciplinas arquivadas recuperadas com sucesso!',
      data: scheduleList,
    });
  } catch (error) {
    console.error('Erro ao listar disciplinas arquivadas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao recuperar disciplinas arquivadas.',
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
        message: 'Usuário não autenticado.',
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.',
      });
    }

    const where = {
      courseId: course.id,
      isActive: false, 
    };

    if (calendar) {
      where['$calendar.year$'] = { [Op.like]: `%${calendar}%` };
      if (calendar.includes('.')) {
        const [year, period] = calendar.split('.');
        if (year && period) {
          where['$calendar.year$'] = { [Op.like]: `%${year}%` };
          where['$calendar.period$'] = { [Op.eq]: parseInt(period) };
        }
      }
    }

    if (turma) {
      where['$class.semester$'] = { [Op.like]: `%${turma}%` };
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const classSchedules = await db.ClassSchedule.findAll({
      where,
      include: [
        {
          model: db.Calendar,
          as: 'calendar',
          attributes: ['id', 'year', 'period'],
        },
        {
          model: db.Class,
          as: 'class',
          attributes: ['id', 'semester'],
        },
        {
          model: db.Course,
          as: 'course',
          attributes: ['name', 'acronym'],
        },
        {
          model: db.ClassScheduleDetail,
          as: 'details',
          attributes: ['id', 'disciplineId', 'userId', 'dayOfWeek'],
          include: [
            {
              model: db.Discipline,
              as: 'discipline',
              attributes: ['id', 'name', 'acronym'],
            },
            {
              model: db.User,
              as: 'professor',
              attributes: ['id', 'username', 'acronym'],
            },
            {
              model: db.Hour,
              as: 'hour',
              attributes: ['id', 'hourStart', 'hourEnd'],
            },
          ],
        },
      ],
      order: [
        ['calendar', 'year', 'DESC'],
        ['calendar', 'period', 'DESC'],
        ['class', 'semester', 'ASC'],
      ],
    });

    if (!classSchedules.length) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma disciplina arquivada encontrada para os filtros fornecidos.',
      });
    }

    const scheduleList = classSchedules.map((schedule) => {
      const calendarInfo = `${schedule.calendar.year}.${schedule.calendar.period}`;
      return {
        id: schedule.id,
        calendar: calendarInfo,
        turma: schedule.class.semester,
        turno: schedule.turn,
        nome_curso: schedule.course.name,
        sigla_curso: schedule.course.acronym,
        details: schedule.details.map((detail) => ({
          discipline: detail.discipline.name,
          discipline_acronym: detail.discipline.acronym,
          professor: detail.professor ? detail.professor.username : null,
          dayOfWeek: detail.dayOfWeek,
          hourStart: detail.hour.hourStart,
          hourEnd: detail.hour.hourEnd,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Disciplinas arquivadas filtradas com sucesso!',
      data: scheduleList,
    });
  } catch (error) {
    console.error('Erro ao filtrar disciplinas arquivadas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao filtrar disciplinas arquivadas.',
      error: error.message,
    });
  }
};