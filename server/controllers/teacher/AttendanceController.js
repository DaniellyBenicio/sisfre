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
        [{ model: db.ClassScheduleDetail, as: "detail" }, "turn", "ASC"],
        [
          { model: db.ClassScheduleDetail, as: "detail" },
          { model: db.Hour, as: "hour" },
          "hourStart",
          "ASC",
        ],
      ],
    });

    

    const groupedAttendances = attendances.reduce((acc, attendance) => {
      const date = new Date(attendance.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const turn = attendance.detail.turn.toLowerCase();
      const key = `${date}_${turn}`;

      if (!acc[key]) {
        acc[key] = {
          date,
          turn: turn.charAt(0).toUpperCase() + turn.slice(1),
          status: attendance.status,
        };
      }

      return acc;
    }, {});

    const formattedAttendances = Object.values(groupedAttendances).sort(
      (a, b) => {
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        if (dateA !== dateB) return dateB - dateA;
        const turnOrder = ["Matutino", "Vespertino", "Noturno"];
        return turnOrder.indexOf(a.turn) - turnOrder.indexOf(b.turn);
      }
    );

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
export const getTeacherAbsences = async (req, res) => {
  const { courseAcronym, disciplineName } = req.query;

  if (req.user && req.user.dataValues) {
    delete req.user.dataValues.password;
  }
  const loggedUserId = req.user?.id;
  const accessType = req.user?.accessType;

  try {
    if (!req.user || !loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (accessType !== "Professor") {
      return res.status(403).json({
        error: "Acesso negado. Apenas Professores podem consultar faltas.",
      });
    }

    const courseFilter =
      courseAcronym && courseAcronym !== "all"
        ? { acronym: courseAcronym }
        : {};
    const disciplineFilter =
      disciplineName && disciplineName !== "all"
        ? { name: disciplineName }
        : {};

    const relevantDetails = await db.ClassScheduleDetail.findAll({
      attributes: [
        "id",
        "dayOfWeek",
        "classScheduleId",
        "disciplineId",
        "hourId",
      ],
      where: { userId: loggedUserId },
      required: true,
      include: [
        {
          model: db.ClassSchedule,
          as: "schedule",
          attributes: ["classId", "courseId"],
          where: { isActive: true },
          required: true,
          include: [
            {
              model: db.Course,
              as: "course",
              attributes: ["acronym"],
              where: courseFilter,
              required: true,
            },
            {
              model: db.Class,
              as: "class",
              attributes: ["semester"],
              required: true,
            },
          ],
        },
        {
          model: db.Discipline,
          as: "discipline",
          attributes: ["name"],
          where: disciplineFilter,
          required: true,
        },
        {
          model: db.Hour,
          as: "hour",
          attributes: ["hourStart", "hourEnd"],
          required: true,
        },
      ],
      order: [
        [
          { model: db.ClassSchedule, as: "schedule" },
          { model: db.Course, as: "course" },
          "acronym",
          "ASC",
        ],
        [
          { model: db.ClassSchedule, as: "schedule" },
          { model: db.Class, as: "class" },
          "semester",
          "ASC",
        ],
        [{ model: db.Discipline, as: "discipline" }, "name", "ASC"],
        [{ model: db.Hour, as: "hour" }, "hourStart", "ASC"],
      ],
      raw: true,
    });

    if (!relevantDetails.length) {
      return res
        .status(404)
        .json({
          error:
            "Nenhum agendamento encontrado para o professor com os filtros fornecidos.",
        });
    }

    const detailIds = relevantDetails.map((detail) => detail.id);

    const absences = await db.Attendance.findAll({
      where: {
        status: "falta",
        classScheduleDetailId: { [Op.in]: detailIds },
      },
      attributes: ["date", "classScheduleDetailId"],
      order: [["date", "ASC"]],
      raw: true,
    });

    if (!absences.length) {
      return res
        .status(404)
        .json({ error: "Nenhuma falta encontrada para o professor." });
    }

    const absencesByDate = {};
    absences.forEach((absence) => {
      const date = absence.date;
      if (!absencesByDate[date]) {
        absencesByDate[date] = [];
      }
      absencesByDate[date].push(absence.classScheduleDetailId);
    });

    const result = Object.entries(absencesByDate).map(([date, details]) => {
      const uniqueDetails = [...new Set(details)];
      const formattedAbsences = uniqueDetails.map((detailId) => {
        const detailInfo = relevantDetails.find((d) => d.id === detailId);
        return {
          dayOfWeek: detailInfo["dayOfWeek"],
          course: detailInfo["schedule.course.acronym"],
          semester: detailInfo["schedule.class.semester"],
          discipline: detailInfo["discipline.name"],
          hourStart: detailInfo["hour.hourStart"],
          hourEnd: detailInfo["hour.hourEnd"],
        };
      });
      return {
        date,
        details: formattedAbsences,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao consultar faltas do professor:", error);
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

    if (
      accessType === "Professor" &&
      professorId &&
      professorId !== loggedUserId
    ) {
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

export const getAbsencesAndDisciplinesByTeacher = async (req, res) => {
  const { userId } = req.query;
  const coordinatorId = req.user?.id;

  if (!userId || !coordinatorId) {
    return res.status(400).json({
      error:
        "O userId do professor e o ID do coordenador logado são obrigatórios.",
    });
  }

  try {
    const course = await db.Course.findOne({
      where: { coordinatorId },
    });

    if (!course) {
      return res
        .status(404)
        .json({ error: "Curso não encontrado para o coordenador logado." });
    }

    const courseId = course.id;

    const scheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { userId },
      include: [
        {
          model: db.Discipline,
          as: "discipline",
          attributes: ["id", "name"],
        },
        {
          model: db.ClassSchedule,
          as: "schedule",
          attributes: [],
          where: { courseId },
        },
      ],
    });

    const disciplines = [
      ...new Map(
        scheduleDetails.map((detail) => [
          detail.discipline?.id,
          detail.discipline,
        ])
      ).values(),
    ].filter(Boolean);

    const absences = await db.Attendance.findAll({
      where: {
        status: "falta",
        "$detail.schedule.courseId$": courseId,
      },
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          attributes: [],
          include: [
            {
              model: db.Discipline,
              as: "discipline",
              attributes: [],
            },
            {
              model: db.ClassSchedule,
              as: "schedule",
              attributes: [],
            },
          ],
        },
      ],
      attributes: [
        [db.Sequelize.col("detail.discipline.id"), "disciplineId"],
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("detail.discipline.id")),
          "absenceCount",
        ],
      ],
      group: [db.Sequelize.col("detail.discipline.id")],
      raw: true,
    });

    const result = disciplines.map((discipline) => {
      const absence = absences.find((a) => a.disciplineId === discipline.id);
      return {
        disciplineId: discipline.id,
        disciplineName: discipline.name,
        absenceCount: absence ? parseInt(absence.absenceCount) : 0,
      };
    });

    return res.status(200).json({ disciplines: result });
  } catch (error) {
    console.error("Erro ao buscar disciplinas e faltas:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar dados.", details: error.message });
  }
};
