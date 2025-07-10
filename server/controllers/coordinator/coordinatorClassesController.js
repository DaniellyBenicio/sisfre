import db from "../../models/index.js";
import { Op } from "sequelize";

export const getClassesByCoordinatorCourse = async (req, res) => {
  const loggedUserId = req.user?.id;

  try {
    if (!loggedUserId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
      attributes: ["id", "name", "acronym"],
    });

    if (!course) {
      return res.status(404).json({
        message: "Nenhum curso encontrado para o coordenador logado.",
      });
    }

    const classes = await db.Class.findAll({
      attributes: ["id", "semester"],
      include: [
        {
          model: db.Course,
          as: "course", 
          where: { id: course.id },
          attributes: [],
          through: {
            model: db.CourseClass, 
            where: { isActive: true },
            attributes: [],
          },
          required: true, 
        },
      ],
      where: {
        id: {
          [Op.notIn]: db.sequelize.literal(
            `(select classId from class_schedules where courseId = :courseId and isActive = true)`
          ),
        },
      },
      replacements: { courseId: course.id }, 
      order: [["semester", "ASC"]],
    });

    if (!classes.length) {
      return res.status(404).json({
        message:
          "Nenhuma turma sem grade ativa encontrada para o curso do coordenador.",
      });
    }

    const classList = classes.map((classRecord) => ({
      id: classRecord.id,
      semester: classRecord.semester,
      course: {
        id: course.id,
        name: course.name,
        acronym: course.acronym,
      },
    }));

    return res.status(200).json({
      message: "Turmas sem grades ativas recuperadas com sucesso!",
      classes: classList,
    });
  } catch (error) {
    console.error("Erro ao recuperar turmas sem grades ativas:", {
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        message: "Erro de validação nos dados fornecidos.",
        errors,
      });
    }

    if (error.name === "SequelizeEagerLoadingError") {
      return res.status(500).json({
        message: "Erro na configuração das associações entre modelos.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Erro interno do servidor ao recuperar as turmas sem grades ativas.",
      error: error.message,
    });
  }
};
