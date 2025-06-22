import db from "../../models/index.js";

export const getClassesByCoordinatorCourse = async (req, res) => {
  const loggedUserId = req.user?.id;

  if (!loggedUserId) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  try {
    const course = await db.Course.findOne({
      where: { coordinatorId: loggedUserId },
      include: [
        {
          model: db.Class,
          as: "classes",
          through: { attributes: [] }, 
          attributes: ["id", "semester"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        message: "Nenhum curso encontrado para o coordenador logado.",
      });
    }

    const classes = course.classes || [];
    return res.status(200).json({
      message: classes.length
        ? "Turmas encontradas com sucesso."
        : "Nenhuma turma associada ao curso do coordenador.",
      classes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno do servidor ao buscar turmas.",
      error: error.message,
    });
  }
};
