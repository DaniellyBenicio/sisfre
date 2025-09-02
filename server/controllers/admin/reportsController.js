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
