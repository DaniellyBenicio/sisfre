import db from "../../models/index.js";

export const createCourse = async (req, res) => {
  const { name, acronym, type, coordinatorId } = req.body;

  if (!name || !acronym || !type) {
    return res
      .status(400)
      .json({ error: "Os campos nome, sigla e tipo são obrigatórios." });
  }

  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({
      error: "O nome deve ter entre 3 e 100 caracteres.",
    });
  }

  if (acronym.length < 2 || acronym.length > 10) {
    return res.status(400).json({
      error: "A sigla deve ter entre 2 e 10 caracteres.",
    });
  }

  if (coordinatorId) {
    const coordinator = await db.User.findByPk(coordinatorId);
    if (!coordinator) {
      return res.status(400).json({ error: "Coordenador não encontrado." });
    }
  }

  const validNameRegex = /^[A-Za-zÀ-ÿ\s]*$/;
  if (!validNameRegex.test(name)) {
    return res
      .status(400)
      .json({ error: "O nome deve conter apenas letras, acentos e espaços." });
  }

  const validAcronymRegex = /^[A-Za-z\s]*$/;
  if (!validAcronymRegex.test(acronym)) {
    return res.status(400).json({
      error:
        "A sigla deve conter apenas letras (sem acentos ou caracteres especiais).",
    });
  }

  const validTypes = [
    "GRADUAÇÃO",
    "TÉCNICO",
    "INTEGRADO",
    "MESTRADO",
    "DOUTORADO",
    "EAD",
    "PROEJA",
    "ESPECIALIZAÇÃO",
    "EXTENSÃO",
    "RESIDÊNCIA",
    "SEQUENCIAL",
    "PÓS-DOUTORADO",
    "CURSO LIVRE",
  ];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: `O tipo do curso deve ser um dos seguintes: ${validTypes.join(
        ", "
      )}.`,
    });
  }

  try {
    const existingCourse = await db.Course.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ acronym }, { name }],
      },
    });

    if (existingCourse) {
      const duplicatedField =
        existingCourse.acronym === acronym ? "acronym" : "nome";
      return res.status(400).json({
        error: `A ${duplicatedField} informada já está cadastrada. Por favor, verifique os dados e tente novamente.`,
      });
    }

    if (coordinatorId) {
      const coordinator = await db.User.findByPk(coordinatorId);
      if (!coordinator) {
        return res.status(400).json({ error: "Coordenador não encontrado." });
      }

      const existingCourseWithCoordinator = await db.Course.findOne({
        where: { coordinatorId },
      });
      if (existingCourseWithCoordinator) {
        return res.status(400).json({
          error: "Este coordenador já está associado a outro curso.",
        });
      }
    }

    const course = await db.Course.create({
      name,
      acronym,
      type,
      coordinatorId,
    });
    res.status(201).json({ course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar curso" });
  }
};

export const getCourses = async (req, res) => {
  const { name, type, page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    if (type) {
      where.type = type;
    }

    const { rows, count } = await db.Course.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: "coordinator",
          attributes: ["id", "username", "email"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["name", "ASC"]],
    });

    res.json({
      courses: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar os cursos." });
  }
};

export const getCourseById = async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await db.Course.findByPk(courseId, {
      include: [
        {
          model: db.User,
          as: "coordinator",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ error: "Curso não encontrado." });
    }

    res.json({ course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar o curso." });
  }
};

export const updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { name, acronym, type, coordinatorId } = req.body;

  try {
    const course = await db.Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: "Curso não encontrado." });
    }

    if (name && !/^[A-Za-zÀ-ÿ\s]*$/.test(name)) {
      return res.status(400).json({
        error: "O nome deve conter apenas letras, acentos e espaços.",
      });
    }

    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({
        error: "O nome deve ter entre 3 e 100 caracteres.",
      });
    }

    if (acronym.length < 2 || acronym.length > 10) {
      return res.status(400).json({
        error: "A sigla deve ter entre 2 e 10 caracteres.",
      });
    }

    if (acronym && !/^[A-Za-z0-9]*$/.test(acronym)) {
      return res.status(400).json({
        error:
          "A sigla deve conter apenas letras e números (sem acentos ou caracteres especiais).",
      });
    }

    if (coordinatorId) {
      const coordinator = await db.User.findByPk(coordinatorId);
      if (!coordinator) {
        return res.status(400).json({ error: "Coordenador não encontrado." });
      }

      const existingCourseWithCoordinator = await db.Course.findOne({
        where: {
          coordinatorId,
          id: { [db.Sequelize.Op.ne]: courseId },
        },
      });
      if (existingCourseWithCoordinator) {
        return res.status(400).json({
          error: "Este coordenador já está associado a outro curso.",
        });
      }
    }

    if (name) course.name = name;
    if (acronym) course.acronym = acronym;
    if (type) course.type = type;
    if (coordinatorId) course.coordinatorId = coordinatorId;

    await course.save();
    res.status(200).json({ message: "Curso atualizado com sucesso.", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar o curso." });
  }
};

export const deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await db.Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: "Curso não encontrado." });
    }

    await course.destroy();
    res.status(200).json({ message: "Curso deletado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar o curso." });
  }
};
