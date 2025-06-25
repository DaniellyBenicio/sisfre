import db from "../../models/index.js";
import { Op } from "sequelize";

export const getProfessorDisciplines = async (req, res) => {
  const loggedUserId = req.user?.id;
  const searchTerm = req.query.search?.trim(); 

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const classScheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { userId: loggedUserId },
      include: [
        {
          model: db.Discipline,
          as: "discipline",
          attributes: ["id", "name", "acronym"],
          where: searchTerm
            ? {
                [Op.or]: [
                  { name: { [Op.like]: `%${searchTerm}%` } },
                  { acronym: { [Op.like]: `%${searchTerm}%` } },
                ],
              }
            : {}, 
          include: [
            {
              model: db.Course,
              as: "courses",
              through: {
                model: db.CourseDiscipline,
                attributes: ["workload"],
              },
              attributes: ["id", "name", "acronym"],
            },
          ],
        },
        {
          model: db.ClassSchedule,
          as: "schedule",
          include: [
            {
              model: db.Class,
              as: "class",
              attributes: ["id"],
            },
          ],
          attributes: [],
        },
      ],
      attributes: ["disciplineId"],
      distinct: true,
    });

    if (!classScheduleDetails.length) {
      return res.status(404).json({
        message: "Nenhuma disciplina encontrada para o professor.",
      });
    }

    const disciplineList = classScheduleDetails.reduce((acc, detail) => {
      const discipline = detail.discipline;
      const courses = discipline?.courses || [];

      if (!acc.some((d) => d.id === discipline.id)) {
        acc.push({
          id: discipline.id,
          name: discipline.name,
          acronym: discipline.acronym,
          courses:
            courses.map((course) => {
              const workload =
                course.CourseDiscipline?.workload ||
                course.courseDiscipline?.workload ||
                course.courseDisciplines?.workload ||
                null;

              return {
                name: course.name,
                acronym: course.acronym,
                workload,
              };
            }) || null,
        });
      }
      return acc;
    }, []);

    return res.status(200).json({
      message: "Disciplinas recuperadas com sucesso!",
      disciplines: disciplineList,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: "Erro de validação nos dados fornecidos.",
        errors,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor ao recuperar as disciplinas.",
      error: error.message,
    });
  }
};
