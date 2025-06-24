import db from "../../models/index.js";
import { Op } from "sequelize";

export const createClassSchedule = async (req, res) => {
  const { calendarId, classId, isActive, details } = req.body;
  const loggedUserId = req.user?.id;

  try {
    if (
      !calendarId ||
      !classId ||
      !details ||
      !Array.isArray(details) ||
      details.length === 0
    ) {
      return res.status(400).json({
        message:
          "Dados incompletos ou inválidos. Os campos (calendarId, classId, details) são obrigatórios e 'details' deve ser um array não vazio.",
      });
    }

    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const courseId = course.id;

    const [calendar, classRecord] = await Promise.all([
      db.Calendar.findByPk(calendarId),
      db.Class.findByPk(classId),
    ]);

    if (!calendar) {
      return res
        .status(404)
        .json({ message: `Calendário com ID ${calendarId} não encontrado.` });
    }
    if (!classRecord) {
      return res
        .status(404)
        .json({ message: `Turma com ID ${classId} não encontrada.` });
    }

    const disciplineIds = new Set();
    const userIds = new Set();
    const hourIds = new Set();
    const validDays = [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    const proposedTeacherScheduleSlots = [];
    const scheduleSlots = new Set();
    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRADO"];
    const turnIntervals = {
      MATUTINO: { start: "07:00:00", end: "11:59:59" },
      VESPERTINO: { start: "12:00:00", end: "17:59:59" },
      NOTURNO: { start: "18:00:00", end: "23:59:59" },
      INTEGRADO: { start: "07:00:00", end: "17:59:59" },
    };

    for (const detail of details) {
      if (
        !detail.disciplineId ||
        !detail.hourId ||
        !detail.dayOfWeek ||
        !detail.turn
      ) {
        return res.status(400).json({
          message:
            "Cada detalhe de horário deve ter disciplina, hora, dia da semana e turno.",
        });
      }

      if (!validDays.includes(detail.dayOfWeek)) {
        return res.status(400).json({
          message: `Dia da semana inválido em um detalhe: '${
            detail.dayOfWeek
          }'. Use um dos seguintes: ${validDays.join(", ")}.`,
        });
      }

      if (!validTurns.includes(detail.turn)) {
        return res.status(400).json({
          message: `Turno inválido em um detalhe: '${
            detail.turn
          }'. Use um dos seguintes: ${validTurns.join(", ")}.`,
        });
      }

      const slotKey = `${detail.dayOfWeek}-${detail.hourId}`;
      if (scheduleSlots.has(slotKey)) {
        return res.status(400).json({
          message: `Apenas uma disciplina é permitida por bloco de horário (${detail.dayOfWeek} - ${detail.hourId}).`,
        });
      }
      scheduleSlots.add(slotKey);

      const allHours = await db.Hour.findAll();
      const hourMap = allHours.reduce((map, hour) => {
        map[hour.id] = { start: hour.hourStart, end: hour.hourEnd };
        return map;
      }, {});
      const hour = hourMap[detail.hourId];
      if (!hour) {
        return res
          .status(404)
          .json({ message: `Horário com ID ${detail.hourId} não encontrado.` });
      }
      const turnInterval = turnIntervals[detail.turn];
      if (hour.start < turnInterval.start || hour.end > turnInterval.end) {
        return res.status(400).json({
          message: `O horário com ID ${detail.hourId} (${hour.start} - ${hour.end}) não é compatível com o turno ${detail.turn}.`,
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

    if (userIds.size > 0) {
      const users = await db.User.findAll({
        where: { id: { [Op.in]: Array.from(userIds) } },
      });
      const professorUserIds = new Set(
        users.filter((u) => u.accessType === "Professor").map((u) => u.id)
      );
      for (const userId of userIds) {
        if (!professorUserIds.has(userId)) {
          return res.status(400).json({
            message: `O usuário não é professor.`,
          });
        }
      }
    }

    const [existingDisciplines, existingHours, existingUsers] =
      await Promise.all([
        db.Discipline.findAll({
          where: { id: { [Op.in]: Array.from(disciplineIds) } },
        }),
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
        return res
          .status(404)
          .json({ message: `Disciplina com ID ${id} não encontrada.` });
      }
    }
    for (const id of hourIds) {
      if (!foundHourIds.has(id)) {
        return res.status(404).json({ message: `Horário não encontrado.` });
      }
    }
    for (const id of userIds) {
      if (!foundUserIds.has(id)) {
        return res.status(404).json({ message: `Professor não encontrado.` });
      }
    }

    const courseDisciplineAssociations =
      await db.sequelize.models.CourseDisciplines.findAll({
        where: {
          courseId,
          disciplineId: { [Op.in]: Array.from(disciplineIds) },
        },
      });

    const associatedDisciplineIds = new Set(
      courseDisciplineAssociations.map((assoc) => assoc.disciplineId)
    );

    for (const disciplineId of disciplineIds) {
      if (!associatedDisciplineIds.has(disciplineId)) {
        return res.status(400).json({
          message: `A disciplina não está associada ao curso.`,
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
            {
              model: db.Hour,
              as: "hour",
              attributes: ["hourStart", "hourEnd"],
            },
            { model: db.Discipline, as: "discipline", attributes: ["name"] },
            {
              model: db.ClassSchedule,
              as: "schedule",
              attributes: ["classId", "courseId"],
            },
          ],
          transaction: t,
        });

        if (conflictingDetails.length > 0) {
          const conflict = conflictingDetails[0];
          const errorMessage =
            `Conflito de horário! O professor '${
              conflict.professor ? conflict.professor.username : conflict.userId
            }' ` +
            `já está alocado no(a) '${conflict.dayOfWeek}' às '${
              conflict.hour ? conflict.hour.hourStart : conflict.hourId
            }' ` +
            `com a disciplina '${
              conflict.discipline
                ? conflict.discipline.name
                : conflict.disciplineId
            }'. ` +
            `Para a turma ${
              conflict.schedule ? conflict.schedule.classId : "N/A"
            } e curso ${
              conflict.schedule ? conflict.schedule.courseId : "N/A"
            }.`;
          throw new Error(errorMessage);
        }
      }

      const newClassSchedule = await db.ClassSchedule.create(
        {
          calendarId,
          classId,
          courseId,
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
      message: "Horário de aula criado com sucesso!",
      classSchedule: createdScheduleWithDetails,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Erro de validação nos dados fornecidos.", errors });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "Conflito: Um horário de aula com a mesma combinação já existe.",
        field: error.fields,
      });
    }
    if (
      error.message.includes("não encontrado") ||
      error.message.includes("inválido") ||
      error.message.includes("Conflito de horário!") ||
      error.message.includes("Acesso negado") ||
      error.message.includes("Múltiplas disciplinas alocadas") ||
      error.message.includes("professor (accessType deve ser 'Professor')")
    ) {
      const statusCode =
        error.message.includes("Conflito de horário!") ||
        error.message.includes("Múltiplas disciplinas alocadas")
          ? 409
          : error.message.includes("Acesso negado")
          ? 403
          : 400;
      return res.status(statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao criar o horário de aula.",
      error: error.message,
    });
  }
};

export const updateClassSchedule = async (req, res) => {
  const { classScheduleId, details } = req.body;
  const loggedUserId = req.user?.id;

  try {
    if (
      !classScheduleId ||
      !details ||
      !Array.isArray(details) ||
      details.length === 0
    ) {
      return res.status(400).json({
        message:
          "Dados incompletos ou inválidos. Os campos (classScheduleId, details) são obrigatórios e 'details' deve ser um array não vazio.",
      });
    }

    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const courseId = course.id;

    const classSchedule = await db.ClassSchedule.findByPk(classScheduleId, {
      include: [
        { model: db.Calendar, as: "calendar" },
        { model: db.Class, as: "class" },
        { model: db.Course, as: "course" },
      ],
    });

    if (!classSchedule) {
      return res.status(404).json({
        message: `Horário de aula com ID ${classScheduleId} não encontrado.`,
      });
    }

    if (classSchedule.courseId !== courseId) {
      return res.status(403).json({
        message:
          "Acesso negado: Este horário de aula não pertence ao curso coordenado pelo usuário.",
      });
    }

    const validDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
    const disciplineIds = new Set();
    const userIds = new Set();
    const hourIds = new Set();
    const proposedTeacherScheduleSlots = [];
    const scheduleSlots = new Set();
    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRADO"];
    const turnIntervals = {
      MATUTINO: { start: "07:00:00", end: "11:59:59" },
      VESPERTINO: { start: "12:00:00", end: "17:59:59" },
      NOTURNO: { start: "18:00:00", end: "23:59:59" },
      INTEGRADO: { start: "07:00:00", end: "17:59:59" },
    };

    for (const detail of details) {
      if (
        !detail.disciplineId ||
        !detail.hourId ||
        !detail.dayOfWeek ||
        !detail.turn
      ) {
        return res.status(400).json({
          message:
            "Cada detalhe de horário deve ter 'disciplineId', 'hourId', 'dayOfWeek' e 'turn'.",
        });
      }

      if (!validDays.includes(detail.dayOfWeek)) {
        return res.status(400).json({
          message: `Dia da semana inválido em um detalhe: '${
            detail.dayOfWeek
          }'. Use um dos seguintes: ${validDays.join(", ")}.`,
        });
      }

      if (!validTurns.includes(detail.turn)) {
        return res.status(400).json({
          message: `Turno inválido em um detalhe: '${
            detail.turn
          }'. Use um dos seguintes: ${validTurns.join(", ")}.`,
        });
      }

      const slotKey = `${detail.dayOfWeek}-${detail.hourId}`;
      if (scheduleSlots.has(slotKey)) {
        return res.status(400).json({
          message: `Apenas uma disciplina é permitida por bloco de horário (${detail.dayOfWeek} - ${detail.hourId}).`,
        });
      }
      scheduleSlots.add(slotKey);

      const allHours = await db.Hour.findAll();
      const hourMap = allHours.reduce((map, hour) => {
        map[hour.id] = { start: hour.hourStart, end: hour.hourEnd };
        return map;
      }, {});
      const hour = hourMap[detail.hourId];
      if (!hour) {
        return res
          .status(404)
          .json({ message: `Horário com ID ${detail.hourId} não encontrado.` });
      }
      const turnInterval = turnIntervals[detail.turn];
      if (hour.start < turnInterval.start || hour.end > turnInterval.end) {
        return res.status(400).json({
          message: `O horário com ID ${detail.hourId} (${hour.start} - ${hour.end}) não é compatível com o turno ${detail.turn}.`,
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

    if (userIds.size > 0) {
      const users = await db.User.findAll({
        where: { id: { [Op.in]: Array.from(userIds) } },
      });
      const professorUserIds = new Set(
        users.filter((u) => u.accessType === "Professor").map((u) => u.id)
      );
      for (const userId of userIds) {
        if (!professorUserIds.has(userId)) {
          return res.status(400).json({
            message: `O usuário com ID ${userId} não tem permissão para ser professor (accessType deve ser 'PROFESSOR').`,
          });
        }
      }
    }

    const [existingDisciplines, existingHours, existingUsers] =
      await Promise.all([
        db.Discipline.findAll({
          where: { id: { [Op.in]: Array.from(disciplineIds) } },
        }),
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
          message: `Disciplina com ID ${id} não encontrada.`,
        });
      }
    }
    for (const id of hourIds) {
      if (!foundHourIds.has(id)) {
        return res.status(404).json({
          message: `Horário com ID ${id} não encontrado.`,
        });
      }
    }
    for (const id of userIds) {
      if (!foundUserIds.has(id)) {
        return res.status(404).json({
          message: `Professor com ID ${id} não encontrado.`,
        });
      }
    }

    const courseDisciplineAssociations =
      await db.sequelize.models.CourseDisciplines.findAll({
        where: {
          courseId,
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

    const updatedResult = await db.sequelize.transaction(async (t) => {
      if (proposedTeacherScheduleSlots.length > 0) {
        const conflictingDetails = await db.ClassScheduleDetail.findAll({
          where: {
            [Op.or]: proposedTeacherScheduleSlots.map((slot) => ({
              userId: slot.userId,
              dayOfWeek: slot.dayOfWeek,
              hourId: slot.hourId,
            })),
            classScheduleId: { [Op.ne]: classScheduleId },
          },
          include: [
            { model: db.User, as: "professor", attributes: ["username", "id"] },
            {
              model: db.Hour,
              as: "hour",
              attributes: ["hourStart", "hourEnd"],
            },
            { model: db.Discipline, as: "discipline", attributes: ["name"] },
            {
              model: db.ClassSchedule,
              as: "schedule",
              attributes: ["classId", "courseId"],
            },
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
                conflict.discipline
                  ? conflict.discipline.name
                  : conflict.disciplineId
              }'. ` +
              `Para a turma ${
                conflict.schedule ? conflict.schedule.classId : "N/A"
              } e curso ${
                conflict.schedule ? conflict.schedule.courseId : "N/A"
              }.`
          );
        }
      }

      await db.ClassScheduleDetail.destroy({
        where: { classScheduleId },
        transaction: t,
      });

      const detailsToCreate = details.map((detail) => ({
        ...detail,
        classScheduleId,
      }));

      await db.ClassScheduleDetail.bulkCreate(detailsToCreate, {
        transaction: t,
      });

      return classSchedule;
    });

    const updatedScheduleWithDetails = await db.ClassSchedule.findByPk(
      updatedResult.id,
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

    return res.status(200).json({
      message: "Horário de aula atualizado com sucesso!",
      classSchedule: updatedScheduleWithDetails,
    });
  } catch (error) {
    console.error("Erro ao atualizar horário de aula:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: "Erro de validação nos dados fornecidos.",
        errors,
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Conflito: Dados fornecidos violam restrições únicas.",
        field: error.fields,
      });
    }
    if (
      error.message.includes("não encontrado") ||
      error.message.includes("inválido") ||
      error.message.includes("Conflito de horário!") ||
      error.message.includes("Acesso negado")
    ) {
      const statusCode = error.message.includes("Conflito de horário!")
        ? 409
        : error.message.includes("Acesso negado")
        ? 403
        : 404;
      return res.status(statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao atualizar o horário de aula.",
      error: error.message,
    });
  }
};

export const getClassSchedule = async (req, res) => {
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const courseId = course.id;

    const classSchedules = await db.ClassSchedule.findAll({
      where: { courseId },
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
          include: [
            {
              model: db.Discipline,
              as: "discipline",
              attributes: ["id", "name"],
            },
            { model: db.User, as: "professor", attributes: ["id", "username"] },
            {
              model: db.Hour,
              as: "hour",
              attributes: ["id", "hourStart", "hourEnd"],
            },
          ],
          attributes: [
            "id",
            "disciplineId",
            "userId",
            "hourId",
            "dayOfWeek",
            "turn",
          ],
        },
      ],
      attributes: ["id", "calendarId", "classId"],
      order: [["id", "ASC"]],
    });

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
          professor: detail.professor ? detail.professor.username : null,
          hour: detail.hour
            ? `${detail.hour.hourStart} - ${detail.hour.hourEnd}`
            : null,
          dayOfWeek: detail.dayOfWeek,
          turn: detail.turn,
        })),
        turnCounts: turnCounts,
      };
    });

    if (!scheduleList.length) {
      return res.status(404).json({
        message: "Nenhum horário de aula encontrado para o coordenador.",
      });
    }

    return res.status(200).json({
      message: "Horários de aula recuperados com sucesso!",
      schedules: scheduleList,
    });
  } catch (error) {
    console.error("Erro ao recuperar horários de aula:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: "Erro de validação nos dados fornecidos.",
        errors,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao recuperar os horários de aula.",
      error: error.message,
    });
  }
};

export const getClassScheduleDetails = async (req, res) => {
  const { classScheduleId } = req.params;
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });
    if (!course) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const schedule = await db.ClassSchedule.findByPk(classScheduleId, {
      where: { courseId: course.id },
      include: [
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "startDate", "endDate"],
        },
        { model: db.Class, as: "class", attributes: ["id", "semester"] },
        {
          model: db.Course,
          as: "course",
          attributes: ["id", "name", "acronym"],
        },
        {
          model: db.ClassScheduleDetail,
          as: "details",
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
          attributes: [
            "id",
            "disciplineId",
            "userId",
            "hourId",
            "dayOfWeek",
            "turn",
          ],
        },
      ],
    });

    if (!schedule) {
      return res.status(404).json({ message: "Horário não encontrado." });
    }

    return res.status(200).json({
      message: "Detalhes do horário recuperados com sucesso!",
      schedule,
    });
  } catch (error) {
    console.error("Erro ao recuperar detalhes do horário:", error);
    return res
      .status(500)
      .json({ message: "Erro interno do servidor.", error: error.message });
  }
};

export const getClassSchedulesFilter = async (req, res) => {
  const loggedUserId = req.user?.id;
  const { calendar, turma } = req.query;

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
    });

    if (!course) {
      return res.status(403).json({
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const courseId = course.id;

    const where = { courseId };
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
            "hourId",
            "dayOfWeek",
            "turn",
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
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    const countTurns = (details) => {
        const counts = {
            MATUTINO: 0,
            VESPERTINO: 0,
            NOTURNO: 0,
        };
        details.forEach(detail => {
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
        calendar: calendarInfo,
        turma: schedule.class.semester,
        curso: {
          sigla: schedule.course.acronym,
          name: schedule.course.name,
        },
        details: schedule.details.map((detail) => ({
          professor: detail.professor ? detail.professor.username : null,
          disciplina: detail.discipline ? detail.discipline.name : null,
          disciplina_sigla: detail.discipline
            ? detail.discipline.acronym
            : null,
          turn: detail.turn,
        })),
        turnCounts: turnCounts,
      };
    });

    if (!scheduleList.length) {
      return res.status(404).json({
        message:
          "Nenhum horário de aula encontrado para os filtros fornecidos.",
      });
    }

    return res.status(200).json({
      message: "Horários de aula filtrados com sucesso!",
      schedules: scheduleList,
    });
  } catch (error) {
    console.error("Erro ao filtrar horários de aula:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: "Erro de validação nos dados fornecidos.",
        errors,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao filtrar os horários de aula.",
      error: error.message,
    });
  }
};
