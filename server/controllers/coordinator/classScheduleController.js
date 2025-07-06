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
          "Dados incompletos ou inválidos. Calendário, turma e detalhes são obrigatórios.",
      });
    }

    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
      attributes: ["id", "name"],
    });

    if (!course) {
      return res.status(403).json({
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const courseId = course.id;
    const courseName = course.name;

    if (!db.sequelize.models.CourseClass) {
      throw new Error(
        "Modelo 'CourseClass' não está definido."
      );
    }

    const [calendar, classRecord, courseClass] = await Promise.all([
      db.Calendar.findByPk(calendarId, {
        attributes: ["id", "year", "period", "startDate", "endDate"],
      }),
      db.Class.findByPk(classId, { attributes: ["id", "semester"] }),
      db.sequelize.models.CourseClass.findOne({
        where: {
          classId,
          courseId,
          isActive: true,
        },
      }),
    ]);

    if (!calendar) {
      return res.status(404).json({
        message: `Calendário com ID ${calendarId} não encontrado.`,
      });
    }

    if (!classRecord) {
      return res.status(404).json({
        message: `Turma com ID ${classId} não encontrada.`,
      });
    }

    if (!courseClass) {
      return res.status(400).json({
        message: `A turma ${classRecord.semester} está arquivada ou não está associada ao curso ${courseName}.`,
      });
    }

    const currentDate = new Date();

    if (!calendar.startDate || !calendar.endDate) {
      return res.status(400).json({
        message: `O calendário ${calendar.year}/${calendar.period} possui datas ausentes (início: ${calendar.startDate}, fim: ${calendar.endDate}).`,
      });
    }

    const startDate = new Date(calendar.startDate);
    const endDate = new Date(calendar.endDate);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        message: `As datas do calendário ${calendar.year}/${calendar.period} são inválidas (início: ${calendar.startDate}, fim: ${calendar.endDate}).`,
      });
    }

    if (startDate > currentDate) {
      return res.status(400).json({
        message: `O calendário ${calendar.year}/${
          calendar.period
        } é inválido. A data de início (${
          startDate.toISOString().split("T")[0]
        }) é posterior à data atual (${
          currentDate.toISOString().split("T")[0]
        }).`,
      });
    }
    if (endDate < currentDate) {
      return res.status(400).json({
        message: `O calendário ${calendar.year}/${
          calendar.period
        } é inválido. A data de fim (${
          endDate.toISOString().split("T")[0]
        }) é anterior à data atual (${
          currentDate.toISOString().split("T")[0]
        }).`,
      });
    }

    const existingClassSchedule = await db.ClassSchedule.findOne({
      where: { classId, calendarId },
    });

    if (existingClassSchedule) {
      return res.status(409).json({
        message: `Já existe uma grade de horário para a turma ${classRecord.semester} no calendário ${calendar.year}/${calendar.period}.`,
      });
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
      NOTURNO: { start: "18:20:00", end: "22:00:00" },
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
            "Por favor, preencha todos os campos (disciplina, horário, dia da semana e turno).",
        });
      }

      if (!validDays.includes(detail.dayOfWeek)) {
        return res.status(400).json({
          message: `Dia da semana inválido: '${
            detail.dayOfWeek
          }'. Use um dos seguintes: ${validDays.join(", ")}.`,
        });
      }

      if (!validTurns.includes(detail.turn)) {
        return res.status(400).json({
          message: `Turno inválido: '${
            detail.turn
          }'. Use um dos seguintes: ${validTurns.join(", ")}.`,
        });
      }

      const slotKey = `${detail.dayOfWeek}-${detail.hourId}`;
      if (scheduleSlots.has(slotKey)) {
        return res.status(400).json({
          message: `Apenas uma disciplina é permitida por bloco de horário (${detail.dayOfWeek}).`,
        });
      }
      scheduleSlots.add(slotKey);

      const allHours = await db.Hour.findAll({
        attributes: ["id", "hourStart", "hourEnd"],
      });
      const hourMap = allHours.reduce((map, hour) => {
        map[hour.id] = { start: hour.hourStart, end: hour.hourEnd };
        return map;
      }, {});
      const hour = hourMap[detail.hourId];
      if (!hour) {
        return res.status(404).json({
          message: `Horário com ID ${detail.hourId} não encontrado.`,
        });
      }
      const turnInterval = turnIntervals[detail.turn];
      if (hour.start < turnInterval.start || hour.end > turnInterval.end) {
        return res.status(400).json({
          message: `O horário ${hour.hourStart} não é compatível com o turno ${detail.turn}.`,
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

    let professorMap = new Map();
    if (userIds.size > 0) {
      const users = await db.User.findAll({
        where: {
          id: { [Op.in]: Array.from(userIds) },
          accessType: "Professor",
          isActive: true,
        },
        attributes: ["id", "username"],
      });

      professorMap = new Map(users.map((u) => [u.id, u.username]));
      for (const userId of userIds) {
        const username = professorMap.get(userId);
        if (!username) {
          const user = await db.User.findByPk(userId, {
            attributes: ["username"],
          });
          return res.status(400).json({
            message: `O usuário ${
              user ? user.username : `com ID ${userId}`
            } está inativo.`,
          });
        }
      }
    }

    const [existingDisciplines, existingHours, existingUsers] =
      await Promise.all([
        db.Discipline.findAll({
          where: { id: { [Op.in]: Array.from(disciplineIds) } },
          attributes: ["id", "name"],
        }),
        db.Hour.findAll({
          where: { id: { [Op.in]: Array.from(hourIds) } },
          attributes: ["id", "hourStart"],
        }),
        userIds.size > 0
          ? db.User.findAll({
              where: {
                id: { [Op.in]: Array.from(userIds) },
                isActive: true,
              },
              attributes: ["id", "username"],
            })
          : Promise.resolve([]),
      ]);

    const disciplineMap = new Map(
      existingDisciplines.map((d) => [d.id, d.name])
    );
    const hourMap = new Map(existingHours.map((h) => [h.id, h.hourStart]));
    const userMap = new Map(existingUsers.map((u) => [u.id, u.username]));

    for (const id of disciplineIds) {
      if (!disciplineMap.has(id)) {
        return res.status(404).json({
          message: `Disciplina com ID ${id} não encontrada.`,
        });
      }
    }
    for (const id of hourIds) {
      if (!hourMap.has(id)) {
        return res.status(404).json({
          message: `Horário com ID ${id} não encontrado.`,
        });
      }
    }
    for (const id of userIds) {
      if (!userMap.has(id)) {
        const user = await db.User.findByPk(id, {
          attributes: ["username"],
        });
        return res.status(404).json({
          message: `Professor ${
            user ? user.username : `com ID ${id}`
          } não encontrado.`,
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
          message: `A disciplina ${disciplineMap.get(
            disciplineId
          )} não está associada ao curso ${courseName}.`,
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
              include: [
                { model: db.Class, as: "class", attributes: ["semester"] },
                { model: db.Course, as: "course", attributes: ["name"] },
              ],
            },
          ],
          transaction: t,
        });

        if (conflictingDetails.length > 0) {
          const conflict = conflictingDetails[0];
          const errorMessage =
            `Conflito de horário! O professor ${
              conflict.professor ? conflict.professor.username : conflict.userId
            } ` +
            `já está alocado na ${conflict.dayOfWeek} às ${
              conflict.hour ? conflict.hour.hourStart : conflict.hourId
            } ` +
            `com a disciplina ${
              conflict.discipline
                ? conflict.discipline.name
                : conflict.disciplineId
            } ` +
            `para a turma ${
              conflict.schedule && conflict.schedule.class
                ? conflict.schedule.class.semester
                : "desconhecida"
            } do curso ${
              conflict.schedule && conflict.schedule.course
                ? conflict.schedule.course.name
                : "desconhecido"
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
              {
                model: db.User,
                as: "professor",
                attributes: { exclude: ["password"] },
              },
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
    console.error("Erro ao criar horário de aula:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
    });

    if (error.message.includes("Modelo 'CourseClass' não está definido")) {
      return res.status(500).json({
        message: "Erro de configuração: Modelo 'CourseClass' não encontrado.",
        error: error.message,
      });
    }
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
      error.message.includes("O usuário") ||
      error.message.includes("A turma está arquivada")
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
      stack: error.stack,
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
          "Dados incompletos ou inválidos. ID do horário de aula e detalhes são obrigatórios.",
      });
    }

    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
      attributes: ["id", "name"],
    });

    if (!course) {
      return res.status(403).json({
        message:
          "Acesso negado: Usuário não é coordenador ou não está associado a nenhum curso.",
      });
    }

    const courseId = course.id;
    const courseName = course.name;

    const classSchedule = await db.ClassSchedule.findByPk(classScheduleId, {
      include: [
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "year", "period", "startDate", "endDate"],
        },
        { model: db.Class, as: "class", attributes: ["id", "semester"] },
        { model: db.Course, as: "course", attributes: ["id", "name"] },
      ],
    });

    if (!classSchedule) {
      return res.status(404).json({
        message: `Horário de aula com ID ${classScheduleId} não encontrado.`,
      });
    }

    if (classSchedule.courseId !== courseId) {
      return res.status(403).json({
        message: `Acesso negado: O horário de aula não pertence ao curso ${courseName} coordenado pelo usuário.`,
      });
    }

    const currentDate = new Date();

    console.log("Dados do calendário:", {
      id: classSchedule.calendar.id,
      year: classSchedule.calendar.year,
      period: classSchedule.calendar.period,
      startDate: classSchedule.calendar.startDate,
      endDate: classSchedule.calendar.endDate,
    });

    if (!classSchedule.calendar.startDate || !classSchedule.calendar.endDate) {
      return res.status(400).json({
        message: `O calendário ${classSchedule.calendar.year}/${classSchedule.calendar.period} possui datas ausentes (início: ${classSchedule.calendar.startDate}, fim: ${classSchedule.calendar.endDate}).`,
      });
    }

    const startDate = new Date(classSchedule.calendar.startDate);
    const endDate = new Date(classSchedule.calendar.endDate);

    if (isNaN(startDate)) {
      return res.status(400).json({
        message: `A data de início do calendário ${classSchedule.calendar.year}/${classSchedule.calendar.period} é inválida (valor: ${classSchedule.calendar.startDate}).`,
      });
    }
    if (isNaN(endDate)) {
      return res.status(400).json({
        message: `A data de fim do calendário ${classSchedule.calendar.year}/${classSchedule.calendar.period} é inválida (valor: ${classSchedule.calendar.endDate}).`,
      });
    }

    if (startDate > currentDate) {
      return res.status(400).json({
        message: `O calendário ${classSchedule.calendar.year}/${classSchedule.calendar.period} é inválido. A data de início (${startDate.toISOString().split('T')[0]}) é posterior à data atual (${currentDate.toISOString().split('T')[0]}).`,
      });
    }
    if (endDate < currentDate) {
      return res.status(400).json({
        message: `O calendário ${classSchedule.calendar.year}/${classSchedule.calendar.period} é inválido. A data de fim (${endDate.toISOString().split('T')[0]}) é anterior à data atual (${currentDate.toISOString().split('T')[0]}).`,
      });
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
      NOTURNO: { start: "18:20:00", end: "22:00:00" },
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
            "Por favor, preencha todos os campos (disciplina, horário, dia da semana e turno).",
        });
      }

      if (!validDays.includes(detail.dayOfWeek)) {
        return res.status(400).json({
          message: `Dia da semana inválido: '${
            detail.dayOfWeek
          }'. Use um dos seguintes: ${validDays.join(", ")}.`,
        });
      }

      if (!validTurns.includes(detail.turn)) {
        return res.status(400).json({
          message: `Turno inválido: '${
            detail.turn
          }'. Use um dos seguintes: ${validTurns.join(", ")}.`,
        });
      }

      const slotKey = `${detail.dayOfWeek}-${detail.hourId}`;
      if (scheduleSlots.has(slotKey)) {
        return res.status(400).json({
          message: `Apenas uma disciplina é permitida por bloco de horário (${detail.dayOfWeek}).`,
        });
      }
      scheduleSlots.add(slotKey);

      const allHours = await db.Hour.findAll({
        attributes: ["id", "hourStart", "hourEnd"],
      });
      const hourMap = allHours.reduce((map, hour) => {
        map[hour.id] = { start: hour.hourStart, end: hour.hourEnd };
        return map;
      }, {});
      const hour = hourMap[detail.hourId];
      if (!hour) {
        return res.status(404).json({
          message: `Horário com ID ${detail.hourId} não encontrado.`,
        });
      }
      const turnInterval = turnIntervals[detail.turn];
      if (hour.start < turnInterval.start || hour.end > turnInterval.end) {
        return res.status(400).json({
          message: `O horário ${hour.hourStart} não é compatível com o turno ${detail.turn}.`,
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

    let professorMap = new Map();
    if (userIds.size > 0) {
      const users = await db.User.findAll({
        where: {
          id: { [Op.in]: Array.from(userIds) },
          accessType: "Professor",
          isActive: true,
        },
        attributes: ["id", "username"],
      });

      professorMap = new Map(users.map((u) => [u.id, u.username]));
      for (const userId of userIds) {
        const username = professorMap.get(userId);
        if (!username) {
          const user = await db.User.findByPk(userId, {
            attributes: ["username"],
          });
          return res.status(400).json({
            message: `O usuário ${
              user ? user.username : `com ID ${userId}`
            } está inativo.`,
          });
        }
      }
    }

    const [existingDisciplines, existingHours, existingUsers] =
      await Promise.all([
        db.Discipline.findAll({
          where: { id: { [Op.in]: Array.from(disciplineIds) } },
          attributes: ["id", "name"],
        }),
        db.Hour.findAll({
          where: { id: { [Op.in]: Array.from(hourIds) } },
          attributes: ["id", "hourStart"],
        }),
        userIds.size > 0
          ? db.User.findAll({
              where: {
                id: { [Op.in]: Array.from(userIds) },
                isActive: true,
              },
              attributes: ["id", "username"],
            })
          : Promise.resolve([]),
      ]);

    const disciplineMap = new Map(
      existingDisciplines.map((d) => [d.id, d.name])
    );
    const hourMap = new Map(existingHours.map((h) => [h.id, h.hourStart]));
    const userMap = new Map(existingUsers.map((u) => [u.id, u.username]));

    for (const id of disciplineIds) {
      if (!disciplineMap.has(id)) {
        return res.status(404).json({
          message: `Disciplina com ID ${id} não encontrada.`,
        });
      }
    }
    for (const id of hourIds) {
      if (!hourMap.has(id)) {
        return res.status(404).json({
          message: `Horário com ID ${id} não encontrado.`,
        });
      }
    }
    for (const id of userIds) {
      if (!userMap.has(id)) {
        const user = await db.User.findByPk(id, {
          attributes: ["username"],
        });
        return res.status(404).json({
          message: `Professor ${
            user ? user.username : `com ID ${id}`
          } não encontrado.`,
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
          message: `A disciplina ${disciplineMap.get(
            disciplineId
          )} não está associada ao curso ${courseName}.`,
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
              include: [
                { model: db.Class, as: "class", attributes: ["semester"] },
                { model: db.Course, as: "course", attributes: ["name"] },
              ],
            },
          ],
          transaction: t,
        });

        if (conflictingDetails.length > 0) {
          const conflict = conflictingDetails[0];
          const errorMessage =
            `Conflito de horário! O professor ${
              conflict.professor ? conflict.professor.username : conflict.userId
            } ` +
            `já está alocado na ${conflict.dayOfWeek} às ${
              conflict.hour ? conflict.hour.hourStart : conflict.hourId
            } ` +
            `com a disciplina ${
              conflict.discipline
                ? conflict.discipline.name
                : conflict.disciplineId
            } ` +
            `para a turma ${
              conflict.schedule && conflict.schedule.class
                ? conflict.schedule.class.semester
                : "desconhecida"
            } do curso ${
              conflict.schedule && conflict.schedule.course
                ? conflict.schedule.course.name
                : "desconhecido"
            }.`;
          throw new Error(errorMessage);
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
              {
                model: db.User,
                as: "professor",
                attributes: { exclude: ["password"] },
              },
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
    console.error("Erro ao atualizar horário de aula:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
    });

    if (error.message.includes("Modelo 'CourseClass' não está definido")) {
      return res.status(500).json({
        message: "Erro de configuração: Modelo 'CourseClass' não encontrado.",
        error: error.message,
      });
    }
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
      error.message.includes("Apenas uma disciplina") ||
      error.message.includes("O usuário") ||
      error.message.includes("A disciplina")
    ) {
      const statusCode =
        error.message.includes("Conflito de horário!") ||
        error.message.includes("Apenas uma disciplina")
          ? 409
          : error.message.includes("Acesso negado")
          ? 403
          : 400;
      return res.status(statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao atualizar o horário de aula.",
      error: error.message,
      stack: error.stack,
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
      where: { courseId, isActive: true },
      include: [
        {
          model: db.Calendar,
          as: "calendar",
          attributes: ["id", "year", "period", "type"],
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
      const calendarInfo = `${schedule.calendar.year}.${schedule.calendar.period} - ${schedule.calendar.type}`;
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
          attributes: ["id", "startDate", "endDate", "type"],
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

    const where = { courseId, isActive: true };
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
          attributes: ["id", "year", "period", "type"],
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
      details.forEach((detail) => {
        if (counts.hasOwnProperty(detail.turn)) {
          counts[detail.turn]++;
        }
      });
      return counts;
    };

    const scheduleList = classSchedules.map((schedule) => {
      const calendarInfo = `${schedule.calendar.year}.${schedule.calendar.period} - ${schedule.calendar.type}`;
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
