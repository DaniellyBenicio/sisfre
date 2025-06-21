import db from "../../models/index.js";
import { Op } from "sequelize";

export const createClassSchedule = async (req, res) => {
  const { calendarId, classId, courseId, turn, isActive, details } = req.body;
  const loggedUserId = req.user?.id;

  try {
    if (
      !calendarId ||
      !classId ||
      !courseId ||
      !turn ||
      !details ||
      !Array.isArray(details) ||
      details.length === 0
    ) {
      return res.status(400).json({
        message:
          "Dados incompletos ou inválidos. 'calendarId', 'classId', 'courseId', 'turn' e 'details' (como um array não vazio) são obrigatórios.",
      });
    }

    const [calendar, classRecord, course] = await Promise.all([
      db.Calendar.findByPk(calendarId),
      db.Class.findByPk(classId),
      db.Course.findByPk(courseId),
    ]);

    if (!calendar) {
      return res.status(404).json({ message: `Calendário com ID ${calendarId} não encontrado.` });
    }
    if (!classRecord) {
      return res.status(404).json({ message: `Turma com ID ${classId} não encontrada.` });
    }
    if (!course) {
      return res.status(404).json({ message: `Curso com ID ${courseId} não encontrado.` });
    }

    if (!loggedUserId || course.coordinatorId !== loggedUserId) {
      return res.status(403).json({
        message: "Acesso negado: Apenas o coordenador do curso pode criar horários.",
      });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (!validTurns.includes(turn)) {
      return res.status(400).json({
        message: `Turno inválido: '${turn}'. Use um dos seguintes: ${validTurns.join(", ")}.`,
      });
    }

    const existingSchedule = await db.ClassSchedule.findOne({
      where: {
        calendarId,
        classId,
        courseId,
        turn,
      },
    });

    if (existingSchedule) {
      return res.status(409).json({
        message: "Já existe um horário de aula para esta combinação de calendário, turma, curso e turno.",
      });
    }

    const disciplineIds = new Set();
    const userIds = new Set();
    const hourIds = new Set();
    const validDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
    const proposedTeacherScheduleSlots = [];

    for (const detail of details) {
      if (!detail.disciplineId || !detail.hourId || !detail.dayOfWeek) {
        return res.status(400).json({
          message: "Cada detalhe de horário deve ter 'disciplineId', 'hourId' e 'dayOfWeek'.",
        });
      }
      if (!validDays.includes(detail.dayOfWeek)) {
        return res.status(400).json({
          message: `Dia da semana inválido em um detalhe: '${detail.dayOfWeek}'. Use um dos seguintes: ${validDays.join(", ")}.`,
        });
      }

      disciplineIds.add(detail.disciplineId);
      hourIds.add(detail.hourId);
      if (detail.userId) {
        userIds.add(detail.userId);
        proposedTeacherScheduleSlots.push({
          userId: detail.userId,
          dayOfWeek: detail.dayOfWeek,
          hourId: detail.hourId,
        });
      }
    }

    const allHours = await db.Hour.findAll();
    const hourMap = allHours.reduce((map, hour) => {
      map[hour.id] = { start: hour.hourStart, end: hour.hourEnd };
      return map;
    }, {});

    const turnIntervals = {
      MATUTINO: { start: "07:00:00", end: "11:59:59" },
      VESPERTINO: { start: "12:00:00", end: "17:59:59" },
      NOTURNO: { start: "18:00:00", end: "23:59:59" },
    };

    for (const hourId of hourIds) {
      const hour = hourMap[hourId];
      if (!hour) {
        return res.status(404).json({ message: `Horário com ID ${hourId} não encontrado.` });
      }
      const turnInterval = turnIntervals[turn];
      if (hour.start < turnInterval.start || hour.end > turnInterval.end) {
        return res.status(400).json({
          message: `O horário com ID ${hourId} (${hour.start} - ${hour.end}) não é compatível com o turno ${turn}.`,
        });
      }
    }

    const [existingDisciplines, existingHours, existingUsers] = await Promise.all([
      db.Discipline.findAll({ where: { id: { [Op.in]: Array.from(disciplineIds) } } }),
      db.Hour.findAll({ where: { id: { [Op.in]: Array.from(hourIds) } } }),
      userIds.size > 0
        ? db.User.findAll({ where: { id: { [Op.in]: Array.from(userIds) } } })
        : Promise.resolve([]),
    ]);

    const foundDisciplineIds = new Set(existingDisciplines.map((d) => d.id));
    const foundHourIds = new Set(existingHours.map((h) => h.id));
    const foundUserIds = new Set(existingUsers.map((u) => u.id));

    for (const id of disciplineIds) {
      if (!foundDisciplineIds.has(id)) {
        return res.status(404).json({
          message: `Disciplina com ID ${id} em um detalhe não encontrada.`,
        });
      }
    }
    for (const id of hourIds) {
      if (!foundHourIds.has(id)) {
        return res.status(404).json({
          message: `Horário com ID ${id} em um detalhe não encontrado.`,
        });
      }
    }
    for (const id of userIds) {
      if (!foundUserIds.has(id)) {
        return res.status(404).json({
          message: `Professor com ID ${id} em um detalhe não encontrado.`,
        });
      }
    }

    const courseDisciplineAssociations = await db.sequelize.models.CourseDisciplines.findAll({
      where: {
        courseId: courseId,
        disciplineId: { [Op.in]: Array.from(disciplineIds) },
      },
    });

    const associatedDisciplineIds = new Set(
      courseDisciplineAssociations.map((assoc) => assoc.disciplineId)
    );

    for (const disciplineId of disciplineIds) {
      if (!associatedDisciplineIds.has(disciplineId)) {
        return res.status(400).json({
          message: `A disciplina com ID ${disciplineId} não está associada ao curso com ID ${courseId}.`,
        });
      }
    }

    const createdResult = await db.sequelize.transaction(async (t) => {
      if (proposedTeacherScheduleSlots.length > 0) {
        const conflictingDetails = await db.ClassScheduleDetail.findAll({
          where: {
            [Op.or]: proposedTeacherScheduleSlots.map((slot) => ({
              userId: slot.userId,
              dayOfWeek: slot.dayOfWeek,
              hourId: slot.hourId,
            })),
          },
          include: [
            { model: db.User, as: "professor", attributes: ["username", "id"] },
            { model: db.Hour, as: "hour", attributes: ["hourStart", "hourEnd"] },
            { model: db.Discipline, as: "discipline", attributes: ["name"] },
            { model: db.ClassSchedule, as: "schedule", attributes: ["classId", "courseId"] },
          ],
          transaction: t,
        });

        if (conflictingDetails.length > 0) {
          const conflict = conflictingDetails[0];
          throw new Error(
            `Conflito de horário! O professor '${
              conflict.professor ? conflict.professor.username : conflict.userId
            }' ` +
            `já está alocado no(a) '${conflict.dayOfWeek}' às '${
              conflict.hour ? conflict.hour.hourStart : conflict.hourId
            }' ` +
            `com a disciplina '${
              conflict.discipline ? conflict.discipline.name : conflict.disciplineId
            }'. ` +
            `Para a turma ${
              conflict.schedule ? conflict.schedule.classId : "N/A"
            } e curso ${
              conflict.schedule ? conflict.schedule.courseId : "N/A"
            }.`
          );
        }
      }

      const newClassSchedule = await db.ClassSchedule.create(
        {
          calendarId,
          classId,
          courseId,
          turn,
          isActive: isActive !== undefined ? isActive : true,
        },
        { transaction: t }
      );

      const detailsToCreate = details.map((detail) => ({
        ...detail,
        classScheduleId: newClassSchedule.id,
      }));

      await db.ClassScheduleDetail.bulkCreate(detailsToCreate, {
        transaction: t,
      });

      return newClassSchedule;
    });

    const createdScheduleWithDetails = await db.ClassSchedule.findByPk(
      createdResult.id,
      {
        include: [
          { model: db.Calendar, as: "calendar" },
          { model: db.Class, as: "class" },
          { model: db.Course, as: "course" },
          {
            model: db.ClassScheduleDetail,
            as: "details",
            include: [
              { model: db.Discipline, as: "discipline" },
              { model: db.User, as: "professor" },
              { model: db.Hour, as: "hour" },
            ],
          },
        ],
      }
    );

    return res.status(201).json({
      message: "Horário de aula e detalhes criados com sucesso!",
      classSchedule: createdScheduleWithDetails,
    });
  } catch (error) {
    console.error("Erro ao criar horário de aula:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ message: "Erro de validação nos dados fornecidos.", errors });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Conflito: Um horário de aula com a mesma combinação de calendário, turma, curso e turno já existe.",
        field: error.fields,
      });
    }
    if (
      error.message.includes("não encontrado") ||
      error.message.includes("inválido") ||
      error.message.includes("Conflito de horário!") ||
      error.message.includes("Acesso negado")
    ) {
      const statusCode = error.message.includes("Conflito de horário!") ? 409 : error.message.includes("Acesso negado") ? 403 : 404;
      return res.status(statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao criar o horário de aula.",
      error: error.message,
    });
  }
};

/* Listar todas as grades
export const findAllClassSchedule = async (req, res) => {
  try {
    const { active } = req.query;
    const where = active !== undefined ? { isActive: active === "true" } : {};

    const schedules = await db.ClassSchedule.findAll({
      where,
      include: [
        { model: db.Calendar, as: "calendar" },
        { model: db.Class, as: "class" },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          include: [
            { model: db.Discipline, as: "discipline" },
            { model: db.User, as: "professor" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
    });

    return res.status(200).json(schedules);
  } catch (error) {
    console.error("Erro ao listar grades:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Buscar uma grade por ID
export const findByIdClassSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await db.ClassSchedule.findByPk(id, {
      include: [
        { model: db.Calendar, as: "calendar" },
        { model: db.Class, as: "class" },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          include: [
            { model: db.Discipline, as: "discipline" },
            { model: db.User, as: "professor" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
    });

    if (!schedule) {
      return res.status(404).json({ error: "Grade não encontrada" });
    }

    return res.status(200).json(schedule);
  } catch (error) {
    console.error("Erro ao buscar grade:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateClassSchedule = async (req, res) => {
  const { id } = req.params;
  const { calendarId, classId, turn, isActive, details } = req.body;

  try {
    const schedule = await db.ClassSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Grade não encontrada" });
    }

    if (calendarId) {
      const calendar = await db.Calendar.findByPk(calendarId);
      if (!calendar) {
        return res.status(404).json({ error: "Calendário não encontrado" });
      }
    }

    if (classId) {
      const classRecord = await db.Class.findByPk(classId);
      if (!classRecord) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }
    }

    if (turn && !["MATUTINO", "VESPERTINO", "NOTURNO"].includes(turn)) {
      return res
        .status(400)
        .json({ error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO" });
    }

    const result = await db.sequelize.transaction(async (t) => {
      await schedule.update(
        {
          calendarId: calendarId || schedule.calendarId,
          classId: classId || schedule.classId,
          turn: turn || schedule.turn,
          isActive: isActive !== undefined ? isActive : schedule.isActive,
        },
        { transaction: t }
      );

      if (details && Array.isArray(details)) {
        for (const detail of details) {
          if (!detail.disciplineId || !detail.hourId || !detail.dayOfWeek) {
            throw new Error(
              "disciplineId, hourId e dayOfWeek são obrigatórios em cada detalhe"
            );
          }

          const discipline = await db.Discipline.findByPk(detail.disciplineId);
          if (!discipline) {
            throw new Error(
              `Disciplina com ID ${detail.disciplineId} não encontrada`
            );
          }

          if (detail.userId) {
            const user = await db.User.findByPk(detail.userId);
            if (!user) {
              throw new Error(
                `Professor com ID ${detail.userId} não encontrado`
              );
            }
          }

          const hour = await db.Hour.findByPk(detail.hourId);
          if (!hour) {
            throw new Error(`Horário com ID ${detail.hourId} não encontrado`);
          }

          if (
            !["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].includes(
              detail.dayOfWeek
            )
          ) {
            throw new Error(`Dia da semana inválido: ${detail.dayOfWeek}`);
          }
        }

        await db.ClassScheduleDetail.destroy({
          where: { classScheduleId: id },
          transaction: t,
        });

        const detailsWithScheduleId = details.map((detail) => ({
          ...detail,
          classScheduleId: id,
        }));
        await db.ClassScheduleDetail.bulkCreate(detailsWithScheduleId, {
          transaction: t,
        });
      }

      return schedule;
    });

    const updatedSchedule = await db.ClassSchedule.findByPk(id, {
      include: [
        { model: db.Calendar, as: "calendar" },
        { model: db.Class, as: "class" },
        {
          model: db.ClassScheduleDetail,
          as: "details",
          include: [
            { model: db.Discipline, as: "discipline" },
            { model: db.User, as: "professor" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
    });

    return res.status(200).json(updatedSchedule);
  } catch (error) {
    console.error("Erro ao atualizar grade:", error);
    return res
      .status(500)
      .json({ error: error.message || "Erro interno do servidor" });
  }
};

export const deleteClassSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await db.ClassSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Grade não encontrada" });
    }

    await schedule.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar grade:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const addScheduleDetail = async (req, res) => {
  const { classScheduleId, disciplineId, userId, hourId, dayOfWeek } = req.body;

  try {
    if (!classScheduleId || !disciplineId || !hourId || !dayOfWeek) {
      return res
        .status(400)
        .json({
          error:
            "classScheduleId, disciplineId, hourId e dayOfWeek são obrigatórios",
        });
    }

    const schedule = await db.ClassSchedule.findByPk(classScheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Grade não encontrada" });
    }

    const discipline = await db.Discipline.findByPk(disciplineId);
    if (!discipline) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    if (userId) {
      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
    }

    const hour = await db.Hour.findByPk(hourId);
    if (!hour) {
      return res.status(404).json({ error: "Horário não encontrado" });
    }

    if (
      !["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].includes(dayOfWeek)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Dia da semana inválido. Use Segunda, Terça, Quarta, Quinta ou Sexta",
        });
    }

    const detail = await db.ClassScheduleDetail.create({
      classScheduleId,
      disciplineId,
      userId,
      hourId,
      dayOfWeek,
    });

    const createdDetail = await db.ClassScheduleDetail.findByPk(detail.id, {
      include: [
        { model: db.ClassSchedule, as: "schedule" },
        { model: db.Discipline, as: "discipline" },
        { model: db.User, as: "professor" },
        { model: db.Hour, as: "hour" },
      ],
    });

    return res.status(201).json(createdDetail);
  } catch (error) {
    console.error("Erro ao adicionar detalhe:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateScheduleDetail = async (req, res) => {
  const { id } = req.params;
  const { disciplineId, userId, hourId, dayOfWeek } = req.body;

  try {
    const detail = await db.ClassScheduleDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({ error: "Detalhe não encontrado" });
    }

    if (disciplineId) {
      const discipline = await db.Discipline.findByPk(disciplineId);
      if (!discipline) {
        return res.status(404).json({ error: "Disciplina não encontrada" });
      }
    }

    if (userId) {
      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
    }

    if (hourId) {
      const hour = await db.Hour.findByPk(hourId);
      if (!hour) {
        return res.status(404).json({ error: "Horário não encontrado" });
      }
    }

    if (
      dayOfWeek &&
      !["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].includes(dayOfWeek)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Dia da semana inválido. Use Segunda, Terça, Quarta, Quinta ou Sexta",
        });
    }

    await detail.update({
      disciplineId: disciplineId || detail.disciplineId,
      userId: userId !== undefined ? userId : detail.userId,
      hourId: hourId || detail.hourId,
      dayOfWeek: dayOfWeek || detail.dayOfWeek,
    });

    const updatedDetail = await db.ClassScheduleDetail.findByPk(id, {
      include: [
        { model: db.ClassSchedule, as: "schedule" },
        { model: db.Discipline, as: "discipline" },
        { model: db.User, as: "professor" },
        { model: db.Hour, as: "hour" },
      ],
    });

    return res.status(200).json(updatedDetail);
  } catch (error) {
    console.error("Erro ao atualizar detalhe:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteScheduleDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const detail = await db.ClassScheduleDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({ error: "Detalhe não encontrado" });
    }

    await detail.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar detalhe:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

*/