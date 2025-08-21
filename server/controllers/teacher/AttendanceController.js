import { Op } from "sequelize";
import db from "../../models/index.js";
import { isInCampus } from "../../utils/locationUtils.js";

const dayOfWeekMap = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
};

export const turnIntervals = {
  MATUTINO: { start: "07:00:00", end: "11:59:59" },
  VESPERTINO: { start: "12:59:59", end: "17:39:59" },
  NOTURNO: { start: "18:20:00", end: "23:59:59" },
};

export function getDayOfWeek(date) {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return days[date.getDay()];
}

function getTurnFromTime(currentTime) {
  const [hours, minutes, seconds] = currentTime
    .toTimeString()
    .split(" ")[0]
    .split(":");
  const totalCurrentSeconds =
    parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

  for (const [turn, interval] of Object.entries(turnIntervals)) {
    const [startHours, startMinutes, startSeconds] = interval.start.split(":");
    const [endHours, endMinutes, endSeconds] = interval.end.split(":");
    const totalStartSeconds =
      parseInt(startHours) * 3600 +
      parseInt(startMinutes) * 60 +
      parseInt(startSeconds);
    const totalEndSeconds =
      parseInt(endHours) * 3600 +
      parseInt(endMinutes) * 60 +
      parseInt(endSeconds);

    if (
      totalCurrentSeconds >= totalStartSeconds &&
      totalCurrentSeconds <= totalEndSeconds
    ) {
      return turn;
    }
  }

  return null;
}

export const registerAttendanceByTurn = async (req, res) => {
  const { latitude, longitude } = req.body;
  const loggedUserId = req.user?.id;

  const currentDateTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const currentDate = currentDateTime.toISOString().split("T")[0];
  const currentTime = currentDateTime;

  try {
    if (!loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (req.user.accessType !== "Professor") {
      return res.status(403).json({
        error: "Acesso negado. Apenas Professores podem registrar frequência.",
      });
    }

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude e longitude são obrigatórias." });
    }

    const coords = { latitude, longitude };
    if (!isInCampus(coords)) {
      return res
        .status(403)
        .json({ error: "Você não está no campus IFCE Cedro." });
    }

    const turno = getTurnFromTime(currentTime);
    if (!turno) {
      return res.status(400).json({
        error:
          "O período para registrar a frequência deste turno já foi encerrado.",
      });
    }

    const turnEndTime = turnIntervals[turno].end;
    const [endHours, endMinutes, endSeconds] = turnEndTime
      .split(":")
      .map(Number);
    const turnEndMoment = new Date(
      `${currentDate}T${String(endHours).padStart(2, "0")}:${String(
        endMinutes
      ).padStart(2, "0")}:${String(endSeconds).padStart(2, "0")}-03:00`
    );

    const toleranceMinutes = 10;
    const turnEndWithTolerance = new Date(
      turnEndMoment.getTime() + toleranceMinutes * 60000
    );

    if (currentTime > turnEndWithTolerance) {
      return res.status(403).json({
        error: `Não é possível registrar frequência. O tempo para o turno ${turno} já se esgotou.`,
      });
    }

    const holiday = await db.Holiday.findOne({ where: { date: currentDate } });
    if (holiday) {
      return res.status(200).json({
        message: `Hoje é feriado. Nenhuma frequência será registrada.`,
      });
    }

    let dayOfWeek = getDayOfWeek(currentDateTime);
    const schoolSaturday = await db.SchoolSaturday.findOne({
      where: { date: currentDate },
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          through: { attributes: [] },
        },
      ],
    });
    if (schoolSaturday) {
      dayOfWeek = dayOfWeekMap[schoolSaturday.dayOfWeek.toLowerCase()];
      if (!dayOfWeek) {
        return res
          .status(500)
          .json({ error: "Dia da semana inválido no sábado letivo." });
      }
    }

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate },
      },
    });
    if (!calendar) {
      return res
        .status(404)
        .json({ error: "Nenhum calendário ativo encontrado para hoje." });
    }

    const whereClause = {
      userId: loggedUserId,
      dayOfWeek,
      turn: turno,
    };

    const details = await db.ClassScheduleDetail.findAll({
      where: whereClause,
      include: [
        {
          model: db.ClassSchedule,
          as: "schedule",
          where: { calendarId: calendar.id, isActive: true },
          include: [
            { model: db.Class, as: "class" },
            { model: db.Course, as: "course" },
          ],
        },
        { model: db.Discipline, as: "discipline" },
        { model: db.Hour, as: "hour" },
      ],
    });

    if (!details.length) {
      return res
        .status(404)
        .json({ error: `Nenhuma aula encontrada para o turno ${turno} hoje.` });
    }

    const detailIds = details.map((detail) => detail.id);
    const existingAttendances = await db.Attendance.count({
      where: {
        classScheduleDetailId: { [Op.in]: detailIds },
        date: currentDate,
      },
    });

    if (existingAttendances === details.length) {
      return res.status(200).json({
        message: `Frequência já registrada para o turno ${turno} hoje.`,
      });
    }

    const registrations = [];
    for (const detail of details) {
      const [attendance, created] = await db.Attendance.upsert({
        classScheduleDetailId: detail.id,
        date: currentDate,
        status: "presença",
        justification: null,
        registeredBy: loggedUserId,
        latitude,
        longitude,
      });
      registrations.push({
        attendance,
        class: detail.schedule.class.semester,
        course_name: detail.schedule.course.name,
        course_acronym: detail.schedule.course.acronym,
        discipline: detail.discipline.name,
        discipline_acronym: detail.discipline.acronym,
        hour: `${detail.hour.hourStart} - ${detail.hour.hourEnd}`,
      });
    }

    return res.status(200).json({
      message: `Frequência registrada com sucesso para ${details.length} aulas no turno ${turno}!`,
      registrations,
    });
  } catch (error) {
    console.error("Erro ao registrar frequência por turno:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

export const getAttendanceByTurn = async (req, res) => {
  const { turno, date, status } = req.query;
  const loggedUserId = req.user?.id;
  const currentDateTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const currentDate = currentDateTime.toISOString().split("T")[0];

  try {
    if (!loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (req.user.accessType !== "Professor") {
      return res.status(403).json({
        error: "Acesso negado. Apenas Professores podem consultar frequência.",
      });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (turno && !validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const validStatus = ["presença", "falta", "abonada"];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        error: "Status inválido. Use presença, falta ou abonada.",
      });
    }

    const filterDate = date || currentDate;

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: filterDate },
        endDate: { [Op.gte]: filterDate },
      },
    });
    if (!calendar) {
      return res
        .status(404)
        .json({ error: "Nenhum calendário ativo encontrado para a data." });
    }

    const attendances = await db.Attendance.findAll({
      where: {
        registeredBy: loggedUserId,
        date: date ? filterDate : { [Op.gte]: currentDate },
        ...(status !== undefined && { status }),
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
                { model: db.Course, as: "course" },
              ],
            },
            { model: db.Discipline, as: "discipline" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
      order: [
        ["date", "DESC"], 
        [{ model: db.ClassScheduleDetail, as: "detail" }, { model: db.Hour, as: "hour" }, "hourStart", "DESC"],
      ],
    });

    if (!attendances.length) {
      return res
        .status(404)
        .json({ error: "Nenhuma frequência encontrada para o professor." });
    }

    const formattedAttendances = attendances.map((attendance) => ({
      attendance: {
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        justification: attendance.justification,
        registeredBy: attendance.registeredBy,
      },
      class: attendance.detail.schedule.class.semester,
      course_name: attendance.detail.schedule.course.name,
      course_acronym: attendance.detail.schedule.course.acronym,
      discipline: attendance.detail.discipline.name,
      discipline_acronym: attendance.detail.discipline.acronym,
      hour: `${attendance.detail.hour.hourStart} - ${attendance.detail.hour.hourEnd}`,
    }));

    return res.status(200).json({
      message: "Frequências recuperadas com sucesso.",
      attendances: formattedAttendances,
    });
  } catch (error) {
    console.error("Erro ao consultar frequência por turno:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

export const justifyAbsenceByTurn = async (req, res) => {
  const { date, turno, justification } = req.body;
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (req.user.accessType !== "Professor") {
      return res.status(403).json({
        error: "Acesso negado. Apenas Professores podem justificar faltas.",
      });
    }

    if (!date || !turno || !justification) {
      return res.status(400).json({
        error: "Data, turno e justificativa são obrigatórios.",
      });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (!validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
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

    const attendances = await db.Attendance.findAll({
      where: {
        registeredBy: loggedUserId,
        date,
        status: "falta",
      },
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          where: { turn: turno.toUpperCase() },
          include: [
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
      return res.status(404).json({
        error:
          "Nenhuma falta encontrada para o professor no turno e data especificados.",
      });
    }

    await db.Attendance.update(
      { justification },
      {
        where: {
          id: { [Op.in]: attendances.map((att) => att.id) },
        },
      }
    );

    return res.status(200).json({
      message: `Justificativa registrada com sucesso para ${attendances.length} faltas no turno ${turno}.`,
      affectedAttendances: attendances.map((att) => att.id),
    });
  } catch (error) {
    console.error("Erro ao registrar justificativa por turno:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

export const getJustificationByTurn = async (req, res) => {
  const { date, turno, professorId } = req.query;
  const loggedUserId = req.userId; 
  const currentDateTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const currentDate = currentDateTime.toISOString().split("T")[0];

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

    const validAccessTypes = ["Professor", "Coordenador", "Admin"];
    if (!validAccessTypes.includes(accessType)) {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas Professores, Coordenadores ou Admins podem visualizar justificativas.",
      });
    }

    const filterDate = date || currentDate;

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (turno && !validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: filterDate },
        endDate: { [Op.gte]: filterDate },
      },
    });
    if (!calendar) {
      return res
        .status(404)
        .json({ error: "Nenhum calendário ativo encontrado para a data." });
    }

    let whereClause = {
      date: filterDate,
      status: "falta",
    };

    if (accessType !== "Admin" || professorId) {
      whereClause.registeredBy = professorId || loggedUserId;
    }

    let courseFilter = {};
    if (accessType === "Coordenador") {
      const coordinatedCourses = await db.Course.findAll({
        where: { coordinatorId: loggedUserId },
        attributes: ["id"],
      });
      const courseIds = coordinatedCourses.map((course) => course.id);
      if (!courseIds.length) {
        return res
          .status(403)
          .json({ error: "Nenhum curso associado ao coordenador." });
      }
      courseFilter = { "$detail.schedule.course.id$": { [Op.in]: courseIds } };
    }

    if (accessType === "Professor" && professorId && professorId !== loggedUserId) {
      return res.status(403).json({
        error: "Professores só podem visualizar suas próprias justificativas.",
      });
    }

    const attendances = await db.Attendance.findAll({
      where: { ...whereClause, ...courseFilter },
      include: [
        {
          model: db.User,
          as: "registrar",
          attributes: ["username"],
        },
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
                { model: db.Course, as: "course" },
              ],
            },
            { model: db.Discipline, as: "discipline" },
            { model: db.Hour, as: "hour" },
          ],
        },
      ],
      order: [
        ["date", "DESC"], 
        [
          { model: db.ClassScheduleDetail, as: "detail" },
          { model: db.Hour, as: "hour" },
          "hourStart",
          "DESC",
        ], 
      ],
    });

    if (!attendances.length) {
      return res.status(404).json({
        error:
          accessType === "Coordenador"
            ? "Nenhuma falta encontrada para os cursos coordenados nos critérios especificados."
            : "Nenhuma falta encontrada para os critérios especificados.",
      });
    }

    const formattedJustifications = attendances.map((attendance) => ({
      attendance: {
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        justification: attendance.justification,
        registeredBy: attendance.registeredBy,
      },
      professor_name: attendance.registrar?.username || "Desconhecido",
      class: attendance.detail.schedule.class.semester,
      course_name: attendance.detail.schedule.course.name,
      course_acronym: attendance.detail.schedule.course.acronym,
      discipline: attendance.detail.discipline.name,
      discipline_acronym: attendance.detail.discipline.acronym,
      hour: `${attendance.detail.hour.hourStart} - ${attendance.detail.hour.hourEnd}`,
      turn: attendance.detail.turn,
    }));

    return res.status(200).json({
      message: "Justificativas recuperadas com sucesso.",
      justifications: formattedJustifications,
    });
  } catch (error) {
    console.error("Erro ao consultar justificativas por turno:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

export const reviewAbsenceByTurn = async (req, res) => {
  const { date, turno, newStatus, professorId } = req.body;
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const validAccessTypes = ["Coordenador", "Admin"];
    if (!validAccessTypes.includes(req.user.accessType)) {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas Coordenadores ou Diretores podem revisar faltas.",
      });
    }

    if (!date || !turno || !newStatus || !professorId) {
      return res.status(400).json({
        error:
          "Data, turno, novo status e ID do professor são obrigatórios.",
      });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (!validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const validStatuses = ["presença", "abonada"];
    if (!validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({ error: "Novo status inválido. Use presença ou abonada." });
    }

    if (newStatus === "abonada" && req.user.accessType !== "Admin") {
      return res.status(403).json({
        error: "Apenas Diretores podem alterar o status para abonada.",
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

    const attendances = await db.Attendance.findAll({
      where: {
        registeredBy: professorId,
        date,
        status: "falta",
      },
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          where: { turn: turno.toUpperCase() },
          include: [
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
      return res.status(404).json({
        error:
          "Nenhuma falta encontrada para o professor no turno e data especificados.",
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

    return res.status(200).json({
      message: `Status alterado para ${newStatus} com sucesso para ${attendances.length} faltas no turno ${turno}.`,
      affectedAttendances: attendances.map((att) => att.id),
    });
  } catch (error) {
    console.error("Erro ao revisar faltas por turno:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};