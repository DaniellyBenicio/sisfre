import db from "../../models/index.js";
import { Op } from "sequelize";

export const getAbsencesByDiscipline = async (req, res) => {
  const { turno, date } = req.query;
  const loggedUserId = req.user?.id;
  const currentDateTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const currentDate = currentDateTime.toISOString().split("T")[0];

  try {
    if (!loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (!["Coordenador", "Admin"].includes(req.user.accessType)) {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas Coordenadores ou Admins podem consultar faltas por disciplina.",
      });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (turno && !validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const filterDate = date || null;

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: filterDate || currentDate },
        endDate: { [Op.gte]: filterDate || currentDate },
      },
    });
    if (!calendar) {
      return res
        .status(404)
        .json({ error: "Nenhum calendário ativo encontrado para o período." });
    }

    const dateWhere = filterDate
      ? { date: filterDate }
      : {
          date: {
            [Op.gte]: calendar.startDate,
            [Op.lte]: currentDate,
          },
        };

    const attendances = await db.Attendance.findAll({
      where: {
        ...dateWhere,
        status: "Falta",
      },
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          where: turno ? { turn: turno.toUpperCase() } : {},
          include: [
            {
              model: db.ClassSchedule,
              as: "schedule",
              where: { calendarId: calendar.id, isActive: true },
              include: [
                { model: db.Class, as: "class" },
                {
                  model: db.Course,
                  as: "course",
                  where:
                    req.user.accessType === "Coordenador"
                      ? { coordinatorId: loggedUserId }
                      : {},
                },
              ],
            },
            { model: db.Discipline, as: "discipline" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
    });

    if (!attendances.length) {
      return res
        .status(404)
        .json({ error: "Nenhuma falta encontrada para as disciplinas." });
    }

    const absencesMap = new Map();
    for (const attendance of attendances) {
      const course = attendance.detail.schedule.course;
      const discipline = attendance.detail.discipline;
      const turn = attendance.detail.turn;
      const semester = attendance.detail.schedule.class.semester;
      const key = `${course.id}-${discipline.id}-${turn}-${semester}`;
      if (!absencesMap.has(key)) {
        absencesMap.set(key, {
          discipline: discipline.name,
          discipline_acronym: discipline.acronym,
          course_name: course.name,
          course_acronym: course.acronym,
          turn: turn,
          semester: semester,
          count: 0,
        });
      }
      const entry = absencesMap.get(key);
      entry.count += 1;
    }

    const formattedAbsences = Array.from(absencesMap.values());

    return res.status(200).json({
      message: "Faltas por disciplina recuperadas com sucesso.",
      absences: formattedAbsences,
    });
  } catch (error) {
    console.error("Erro ao consultar faltas por disciplina:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

export const getTotalAbsencesByTeacher = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId);
    const searchTerm = req.query.search || "";

    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (user.accessType !== "Admin") {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas administradores podem visualizar estes dados.",
      });
    }

    const currentDateTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const currentDate = currentDateTime.toISOString().split("T")[0];

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate },
      },
    });
    if (!calendar) {
      return res
        .status(404)
        .json({ error: "Nenhum calendário ativo encontrado para o período." });
    }

    const professorWhere = { accessType: "Professor" };
    if (searchTerm) {
      professorWhere.username = { [Op.like]: `%${searchTerm}%` };
    }

    const attendances = await db.Attendance.findAll({
      where: {
        status: "Falta",
      },
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          required: true,
          include: [
            {
              model: db.User,
              as: "professor",
              where: professorWhere,
            },
            {
              model: db.ClassSchedule,
              as: "schedule",
              where: { calendarId: calendar.id, isActive: true },
            },
          ],
        },
      ],
    });

    if (!attendances.length) {
      return res
        .status(404)
        .json({ error: "Nenhuma falta encontrada para o professor." });
    }

    const professorAbsencesMap = new Map();
    for (const attendance of attendances) {
      const professor = attendance.detail.professor;
      if (!professor) continue;

      const key = professor.id;
      if (!professorAbsencesMap.has(key)) {
        professorAbsencesMap.set(key, {
          professor_name: professor.username,
          count: 0,
        });
      }
      const entry = professorAbsencesMap.get(key);
      entry.count += 1;
    }

    const formattedAbsences = Array.from(professorAbsencesMap.values());

    return res.status(200).json({
      message: "Total de faltas por professor recuperado com sucesso.",
      total_absences: formattedAbsences,
    });
  } catch (error) {
    console.error("Erro ao consultar total de faltas por professor:", error);
    return res.status(500).json({
      error: "Erro interno do servidor.",
      details: error.message,
    });
  }
};

export const getProfessorAbsenceDetails = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId);
    const professorId = req.params.professorId;
    const { status: statusFilter, course: courseFilter } = req.query;

    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (user.accessType !== "Admin") {
      return res.status(403).json({
        error: "Acesso negado. Apenas administradores podem visualizar estes dados.",
      });
    }

    const attendanceWhere = {};
    if (statusFilter && statusFilter.toLowerCase() !== "todos") {
      attendanceWhere.status = statusFilter;
    }

    const courseWhere = {};
    if (courseFilter && courseFilter.toLowerCase() !== "todos") {
      courseWhere.acronym = courseFilter;
    }

    const attendances = await db.Attendance.findAll({
      where: attendanceWhere,
      attributes: ["date", "status"], 
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          required: true,
          include: [
            {
              model: db.User,
              as: "professor",
              required: true,
              where: { id: professorId, accessType: "Professor" },
            },
            {
              model: db.ClassSchedule,
              as: "schedule",
              required: true,
              include: [
                { model: db.Class, as: "class", attributes: ["semester"] },
                {
                  model: db.Course,
                  as: "course",
                  attributes: ["acronym"],
                  where: courseWhere,
                },
              ],
            },
            {
              model: db.Discipline,
              as: "discipline",
              attributes: ["name"],
              required: true,
            },
          ],
        },
      ],
    });

    if (!attendances.length) {
      return res.status(404).json({
        error: "Nenhuma falta encontrada para este professor com os filtros aplicados.",
      });
    }

    const absenceDetails = attendances.map((attendance) => {
      const classSchedule = attendance.detail.schedule;
      const discipline = attendance.detail.discipline;
      return {
        data: attendance.date, 
        disciplina: discipline.name, 
        "curso-turma": `${classSchedule.course.acronym} - ${classSchedule.class.semester}`,
        turno: attendance.detail.turn,
        status: attendance.status,
      };
    });

    return res.status(200).json({
      message: "Detalhes das faltas do professor recuperados com sucesso.",
      absence_details: absenceDetails,
    });
  } catch (error) {
    console.error("Erro ao consultar detalhes de faltas por professor:", error);
    return res.status(500).json({
      error: "Erro interno do servidor.",
      details: error.message,
    });
  }
};

export const updateAbsenceByTurn = async (req, res) => {
  const { date, turno, newStatus, professorId } = req.body;
  const loggedUserId = req.userId;

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        error: "Usuário não autenticado. Verifique o token de autenticação.",
      });
    }

    const user = await db.User.findOne({
      where: { id: loggedUserId },
      attributes: ["accessType"],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const accessType = user.accessType;
    const validAccessTypes = ["Admin"];
    if (!validAccessTypes.includes(accessType)) {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas a Diretoria pode alterar o status das faltas.",
      });
    }

    if (!date || !turno || !newStatus || !professorId) {
      return res.status(400).json({
        error: "Data, turno, novo status e ID do professor são obrigatórios.",
      });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (!validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const validStatuses = ["abonada", "presença"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        error: `Novo status inválido. Use ${validStatuses.join(" ou ")}.`,
      });
    }

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: date },
        endDate: { [Op.gte]: date },
      },
    });

    if (!calendar) {
      return res
        .status(404)
        .json({ error: "Nenhum calendário ativo encontrado para a data." });
    }

    let whereClause = {
      registeredBy: professorId,
      date,
      status: "falta",
    };

    const attendances = await db.Attendance.findAll({
      where: {
        ...whereClause,
      },
      include: [
        {
          model: db.User,
          as: "registrar",
          attributes: ["username"],
        },
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          where: { turn: turno.toUpperCase() },
          required: true,
          include: [
            {
              model: db.ClassSchedule,
              as: "schedule",
              where: { calendarId: calendar.id, isActive: true },
              required: true,
              include: [
                { model: db.Class, as: "class" },
                { model: db.Course, as: "course" },
              ],
            },
            { model: db.Discipline, as: "discipline" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
    });

    if (!attendances.length) {
      return res.status(404).json({
        error:
          "Nenhuma falta encontrada para o professor no turno e data especificados.",
      });
    }

    const isMedicalJustification = (justification) =>
      justification &&
      typeof justification === "string" &&
      /doença|doente|medica|atestado/i.test(justification);
    const allHaveMedicalJustification = attendances.every((att) =>
      isMedicalJustification(att.justification)
    );
    const allHaveNonMedicalJustification = attendances.every(
      (att) => !isMedicalJustification(att.justification)
    );
    if (newStatus === "abonada" && !allHaveMedicalJustification) {
      return res.status(403).json({
        error:
          "A diretoria só pode abonar faltas com justificativa de doença (doença, doente, médica ou atestado).",
      });
    }

    if (newStatus === "presença" && !allHaveNonMedicalJustification) {
      return res.status(403).json({
        error:
          "Não é possível mudar para 'presença' uma falta com justificativa de doença. Use 'abonada' ou verifique a justificativa.",
      });
    }

    await db.Attendance.update(
      { status: newStatus },
      {
        where: {
          id: { [Op.in]: attendances.map((att) => att.id) },
        },
      }
    );

    const formattedJustifications = attendances.map((attendance) => ({
      attendance: {
        id: attendance.id,
        date: attendance.date,
        status: newStatus,
        justification: attendance.justification,
        registeredBy: attendance.registeredBy,
      },
      professor_name: attendance.registrar?.username || "Desconhecido",
      class: attendance.detail.schedule.class.semester,
      course_name: attendance.detail.schedule.course.name,
      course_acronym: attendance.detail.schedule.course.acronym,
      discipline: attendance.detail.discipline?.name || "N/A",
      discipline_acronym: attendance.detail.discipline?.acronym || "N/A",
      hour: attendance.detail.hour
        ? `${attendance.detail.hour.hourStart} - ${attendance.detail.hour.hourEnd}`
        : "N/A",
      turn: attendance.detail.turn,
    }));

    return res.status(200).json({
      message: `Status alterado para ${newStatus} com sucesso para ${attendances.length} faltas no turno ${turno}.`,
      affectedAttendances: formattedJustifications,
    });
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};
