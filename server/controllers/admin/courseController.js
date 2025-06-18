import db from "../../models/index.js";

export const createCourse = async (req, res) => {
  const { name, acronym, type, coordinatorId } = req.body;

  if (!name || !acronym || !type) {
    return res
      .status(400)
      .json({ error: "Os campos nome, sigla e tipo são obrigatórios." });
  }

  if (name.length < 3 || name.length > 100) {
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
    "TÉCNICO INTEGRADO",
    "MESTRADO",
    "DOUTORADO",
    "EAD",
    "PROEJA",
    "ESPECIALIZAÇÃO",
    "EXTENSÃO",
    "RESIDÊNCIA",
    "SEQUENCIAL",
    "PÓS-DOUTORADO",
    "PÓS-GRADUAÇÃO",
    "CURSO LIVRE"
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
      const duplicatedFields = [];

      if (existingCourse.acronym === acronym) {
        duplicatedFields.push("sigla");
      }

      if (existingCourse.name === name) {
        duplicatedFields.push("nome");
      }

      const mensagem = buildDuplicatedMessage(duplicatedFields);
      return res.status(400).json({ error: mensagem });
    }

    if (coordinatorId) {
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

function buildDuplicatedMessage(fields) {
  if (fields.length === 1) {
    if (fields[0] === "nome") return "Já existe um curso com o nome informado.";
    if (fields[0] === "sigla")
      return "Já existe um curso com a sigla informada.";
  }
  if (fields.length === 2) {
    return "Já existe um curso com o nome e a sigla informados.";
  }
  return "Campos duplicados.";
}

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

    if (name) {
      if (!/^[A-Za-zÀ-ÿ\s]*$/.test(name)) {
        return res.status(400).json({
          error: "O nome deve conter apenas letras, acentos e espaços.",
        });
      }
      if (name.length < 3 || name.length > 100) {
        return res.status(400).json({
          error: "O nome deve ter entre 3 e 100 caracteres.",
        });
      }
    }

    if (acronym) {
      if (acronym.length < 2 || acronym.length > 10) {
        return res.status(400).json({
          error: "A sigla deve ter entre 2 e 10 caracteres.",
        });
      }
      if (!/^[A-Za-z\s]*$/.test(acronym)) {
        return res.status(400).json({
          error:
            "A sigla deve conter apenas letras (sem acentos ou caracteres especiais).",
        });
      }
    }

    if (coordinatorId !== undefined) {
      if (coordinatorId !== null) {
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
      course.coordinatorId = coordinatorId;
    }

    if (name || acronym) {
      const existingCourse = await db.Course.findOne({
        where: {
          id: { [db.Sequelize.Op.ne]: courseId },
          [db.Sequelize.Op.or]: [
            name ? { name } : null,
            acronym ? { acronym } : null,
          ].filter(Boolean),
        },
      });

      if (existingCourse) {
        const duplicatedFields = [];
        if (name && existingCourse.name === name) duplicatedFields.push("nome");
        if (acronym && existingCourse.acronym === acronym)
          duplicatedFields.push("sigla");

        const mensagem = buildDuplicatedMessage(duplicatedFields);
        return res.status(400).json({ error: mensagem });
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
