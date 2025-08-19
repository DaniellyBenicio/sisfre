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
        attended: false,
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
      const key = `${course.id}-${discipline.id}-${turn}`;
      if (!absencesMap.has(key)) {
        absencesMap.set(key, {
          discipline: discipline.name,
          discipline_acronym: discipline.acronym,
          course_name: course.name,
          course_acronym: course.acronym,
          turn: turn,
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
