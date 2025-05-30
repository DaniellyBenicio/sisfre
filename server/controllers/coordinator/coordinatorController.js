import db from "../../models/index.js";

export const getProfessorsByCourse = async (req, res) => {
  try {
    const coordinator = req.user;

    if (!coordinator || coordinator.accessType !== "Coordenador") {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas coordenadores podem visualizar professores.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: coordinator.id },
    });

    if (!course) {
      return res
        .status(404)
        .json({ error: "Nenhum curso encontrado para este coordenador." });
    }

    const professors = await db.User.findAll({
      where: { accessType: "professor" },
      attributes: ["acronym", "username", "email"],
      include: [
        {
          model: db.Course,
          as: "coursesTaught",
          where: { id: course.id },
          attributes: [],
          through: { model: db.TeacherCourseDiscipline, attributes: [] },
        },
      ],
      order: [["username", "ASC"]],
    });

    if (!professors.length) {
      return res.status(200).json({
        error: "Nenhum professor encontrado para o curso.",
        professors: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });
    }

    res.status(200).json({ professors });
  } catch (error) {
    console.error("Erro no getProfessorsByCourse:", error);
    res.status(500).json({ error: "Erro ao listar professores do curso." });
  }
};

export const searchProfessorsByCourse = async (req, res) => {
  try {
    const coordinator = req.user;

    if (!coordinator || coordinator.accessType !== "Coordenador") {
      return res.status(403).json({
        error: "Acesso negado. Apenas coordenadores podem buscar professores.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: coordinator.id },
    });

    if (!course) {
      return res
        .status(404)
        .json({ error: "Nenhum curso encontrado para este coordenador." });
    }

    const { username, page = 1, limit = 10, order = "asc" } = req.query;

    const where = { accessType: "professor" };
    if (username) {
      where.username = { [db.Sequelize.Op.like]: `%${username}%` };
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await db.User.findAndCountAll({
      where,
      attributes: ["acronym", "username", "email"],
      include: [
        {
          model: db.Course,
          as: "coursesTaught",
          where: { id: course.id },
          attributes: [],
          through: { model: db.TeacherCourseDiscipline, attributes: [] },
        },
      ],
      order: [["username", order === "asc" ? "ASC" : "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    if (!rows.length) {
      return res.status(200).json({
        error: "Nenhum professor encontrado para o curso.",
        professors: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
      });
    }

    res.status(200).json({
      professors: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Erro no searchProfessorsByCourse:", error);
    res.status(500).json({ error: "Erro ao buscar professores do curso." });
  }
};
