import { Op } from "sequelize";
import db from "../../models/index.js";

const dayOfWeekMap = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
};

export const registerAttendanceByTurn = async (req, res) => {
  const { turno, latitude, longitude } = req.body;
  const loggedUserId = req.user?.id;
  const currentDate = new Date().toISOString().split("T")[0];
  const currentTime = new Date(); // Hora atual: 21:40 -03 em 16/08/2025

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
    const campusLat = -6.603;
    const campusLng = -39.059;
    const radius = 0.5;
    const distance = haversineDistance(
      latitude,
      longitude,
      campusLat,
      campusLng
    );
    if (distance > radius) {
      return res
        .status(403)
        .json({ error: "Você não está no campus IFCE Cedro." });
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (!validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const holiday = await db.Holiday.findOne({ where: { date: currentDate } });
    if (holiday) {
      return res.status(200).json({
        message: `Hoje é feriado (${holiday.name} - ${holiday.type}). Nenhuma frequência registrada.`,
      });
    }

    let dayOfWeek = new Date(currentDate).toDayOfWeek();
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
      turn: turno.toUpperCase(),
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

    const registrations = [];
    for (const detail of details) {
      const hourStart = new Date(
        `${currentDate}T${detail.hour.hourStart}-03:00`
      );
      const hourEnd = new Date(`${currentDate}T${detail.hour.hourEnd}-03:00`);
      const isAfterClass = currentTime > hourEnd; // Verifica se o horário atual passou o fim da aula

      let attended = true; // Presença padrão se a requisição for feita
      let notes = "Registrado automaticamente por turno via geolocalização.";

      // Se o horário da aula já passou e não há registro, registrar falta
      if (isAfterClass && !existingAttendances) {
        attended = false;
        notes = "Falta registrada automaticamente por ausência de registro.";
      }

      const [attendance, created] = await db.Attendance.upsert({
        classScheduleDetailId: detail.id,
        date: currentDate,
        attended,
        reason: null,
        notes,
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

    const message =
      existingAttendances === details.length
        ? `Frequência já registrada para o turno ${turno} hoje.`
        : `Frequência registrada com sucesso para ${details.length} aulas no turno ${turno}!`;

    return res.status(200).json({
      message,
      registrations,
    });
  } catch (error) {
    console.error("Erro ao registrar frequência por turno:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

Date.prototype.toDayOfWeek = function () {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return days[this.getDay()];
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km

  // Diferença das coordenadas em radianos
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const getAttendanceByTurn = async (req, res) => {
  const { turno, date, attended } = req.query;
  const loggedUserId = req.user?.id;
  const currentDate = new Date().toISOString().split("T")[0]; // 2025-08-16

  try {
    // Validar autenticação e tipo de usuário
    if (!loggedUserId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    if (req.user.accessType !== "Professor") {
      return res.status(403).json({
        error: "Acesso negado. Apenas Professores podem consultar frequência.",
      });
    }

    // Validar turno, se fornecido
    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    if (turno && !validTurns.includes(turno.toUpperCase())) {
      return res.status(400).json({
        error: "Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    // Validar attended, se fornecido
    const validAttended = [true, false, "true", "false"];
    const attendedValue = attended
      ? ["true", "false"].includes(attended)
        ? attended === "true"
        : Boolean(attended)
      : undefined;
    if (
      attended &&
      !validAttended.includes(attended) &&
      attended !== undefined
    ) {
      return res.status(400).json({
        error: "Valor inválido para attended. Use true ou false.",
      });
    }

    // Determinar data de filtro
    const filterDate = date || currentDate;

    // Encontrar calendário ativo para a data
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

    // Buscar todas as frequências registradas pelo professor com filtros
    const attendances = await db.Attendance.findAll({
      where: {
        registeredBy: loggedUserId,
        date: date ? filterDate : { [Op.gte]: currentDate },
        ...(attendedValue !== undefined && { attended: attendedValue }),
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
    });

    if (!attendances.length) {
      return res
        .status(404)
        .json({ error: "Nenhuma frequência encontrada para o professor." });
    }

    // Formatando a resposta para o front-end
    const formattedAttendances = attendances.map((attendance) => ({
      attendance: {
        id: attendance.id,
        date: attendance.date,
        attended: attendance.attended,
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
