import db from "../../models/index.js";
import { Op } from "sequelize";

export const getDisciplinesCountByCourse = async (req, res) => {
  try {
    const result = await db.Course.findAll({
      attributes: [
        "id",
        "name",
        "acronym",
        [
          db.Sequelize.fn(
            "COUNT",
            db.Sequelize.col("CourseDisciplines.disciplineId")
          ),
          "totalDisciplines",
        ],
      ],
      include: [
        {
          model: db.CourseDiscipline,
          as: "CourseDisciplines",
          attributes: [],
        },
      ],
      group: ["Course.id"],
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro em getDisciplinesCountByCourse:", error);
    res.status(500).json({
      message: "Erro ao buscar relatório de disciplinas por curso",
      error: error.message,
    });
  }
};

export const getAdminTeacherAbsences = async (req, res) => {
  try {
    const allAbsences = await db.Attendance.findAll({
      where: { status: "falta" },
      attributes: ["classScheduleDetailId"],
      raw: true,
    });

    if (!allAbsences.length) {
      return res
        .status(200)
        .json({ message: "Nenhuma falta encontrada no sistema." });
    }

    const detailIdsWithAbsences = [
      ...new Set(allAbsences.map((absence) => absence.classScheduleDetailId)),
    ];

    const relevantDetails = await db.ClassScheduleDetail.findAll({
      where: { id: { [Op.in]: detailIdsWithAbsences } },
      attributes: ["userId"],
      include: [
        {
          model: db.User,
          as: "professor",
          attributes: ["id", "username"],
          where: { accessType: "Professor" },
          required: true,
        },
      ],
      raw: true,
    });

    const teacherAbsenceCount = relevantDetails.reduce((acc, detail) => {
      const teacherId = detail["professor.id"];
      const teacherName = detail["professor.username"];
      if (teacherId) {
        acc[teacherId] = {
          name: teacherName,
          count: (acc[teacherId]?.count || 0) + 1,
        };
      }
      return acc;
    }, {});

    const result = Object.values(teacherAbsenceCount).sort(
      (a, b) => b.count - a.count
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao gerar relatório de faltas por professor:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor.", details: error.message });
  }
};

export const getAbsencesCountByCourse = async (req, res) => {
  try {
    const result = await db.Course.findAll({
      attributes: [
        "id",
        "name",
        "acronym",
        [
          db.Sequelize.fn(
            "COUNT",
            db.Sequelize.col("classSchedules.details.attendances.id")
          ),
          "totalAbsences",
        ],
      ],
      include: [
        {
          model: db.ClassSchedule,
          as: "classSchedules",
          attributes: [],
          required: true,
          include: [
            {
              model: db.ClassScheduleDetail,
              as: "details",
              attributes: [],
              required: true,
              include: [
                {
                  model: db.Attendance,
                  as: "attendances",
                  attributes: [],
                  where: {
                    status: "falta",
                  },
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      group: ["Course.id"],
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro em getAbsencesCountByCourse:", error);
    res.status(500).json({
      message: "Erro ao buscar relatório de faltas por curso",
      error: error.message,
    });
  }
};

export const getRepositionAntepositionCounts = async (req, res) => {
  try {
    const repositionsCount = await db.ClassChangeRequest.sum("quantity", {
      where: {
        type: "reposicao",
      },
    });

    const antepositionsCount = await db.ClassChangeRequest.sum("quantity", {
      where: {
        type: "anteposicao",
      },
    });

    const finalRepCount = repositionsCount || 0;
    const finalAntCount = antepositionsCount || 0;

    return res.status(200).json({
      repositions: finalRepCount,
      antepositions: finalAntCount,
    });
  } catch (error) {
    console.error(
      "Erro ao obter contagem de reposições e anteposições:",
      error
    );
    return res.status(500).json({
      error: "Erro ao obter a contagem de reposições e anteposições.",
      details: error.message,
    });
  }
};

export const getResolutionRate = async (req, res) => {
  try {
    const totalRequests = await db.ClassChangeRequest.count();
    const approvedRequests = await db.ClassChangeRequest.count({
      where: {
        validated: 1,
      },
    });

    let resolutionRate = 0;
    if (totalRequests > 0) {
      resolutionRate = (approvedRequests / totalRequests) * 100;
    }
    return res.status(200).json({ resolutionRate: resolutionRate });
  } catch (error) {
    console.error("Erro ao obter a taxa de resolução:", error);
    return res.status(500).json({
      error: "Erro ao obter a taxa de resolução.",
      details: error.message,
    });
  }
};

export const getMonthlyAbsencesHistory = async (req, res) => {
  const { year } = req.query;

  try {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
      return res.status(400).json({
        error: "Ano inválido. Por favor, forneça um ano entre 2000 e 2100.",
      });
    }

    const monthlyData = await db.Attendance.findAll({
      where: {
        status: "falta",
        date: {
          [Op.between]: [`${targetYear}-01-01`, `${targetYear}-12-31`],
        },
      },
      attributes: [
        [
          db.Sequelize.fn("DATE_FORMAT", db.Sequelize.col("date"), "%m"),
          "month",
        ],
        [db.Sequelize.fn("count", "*"), "totalAbsences"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    });

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const finalData = Array.from({ length: 12 }, (_, i) => {
      const monthNumber = (i + 1).toString().padStart(2, "0");
      const found = monthlyData.find((d) => d.month === monthNumber);
      return {
        month: monthNumber,
        monthName: monthNames[i],
        totalAbsences: found ? parseInt(found.totalAbsences) : 0,
      };
    });

    return res.status(200).json({
      status: "success",
      data: finalData,
    });
  } catch (error) {
    console.error("Erro ao gerar histórico mensal de faltas:", error);
    return res.status(500).json({
      error: "Erro interno do servidor.",
      details: error.message,
    });
  }
};

export const getAbsencesByShift = async (req, res) => {
  try {
    const absencesByShift = await db.Attendance.findAll({
      attributes: [
        [db.sequelize.col("detail.turn"), "turno"],
        [
          db.sequelize.fn("COUNT", db.sequelize.col("Attendance.id")),
          "total_faltas",
        ],
      ],
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "detail",
          attributes: [], 
        },
      ],
      where: {
        status: "falta",
      },
      group: [
        "detail.turn", 
      ],
      raw: true,
    });

    res.status(200).json(absencesByShift);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erro ao buscar faltas por turno.",
        error: error.message,
      });
  }
};

export const getRequestsStatus = async (req, res) => {
  try {
    const requestsStatus = await db.ClassChangeRequest.findAll({
      attributes: [
        'validated',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total'],
      ],
      group: ['validated'],
      raw: true,
    });

    const formattedData = requestsStatus.map((item) => {
      let statusName = 'desconhecido';
      switch (item.validated) {
        case 0:
          statusName = 'pendente';
          break;
        case 1:
          statusName = 'aprovada';
          break;
        case 2:
          statusName = 'rejeitada';
          break;
      }

      return {
        status: statusName,
        count: item.total,
      };
    });

    return res.status(200).json({ requestsStatus: formattedData });
  } catch (error) {
    console.error('Erro ao obter o status das requisições:', error);
    return res.status(500).json({
      error: 'Erro ao obter o status das requisições.',
      details: error.message,
    });
  }
};