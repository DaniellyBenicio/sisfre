const { Sequelize } = require("sequelize");
const Course = require("../../models/admin/Course");
const User = require("../../models/admin/User");

exports.createCourse = async (req, res) => {
  const { name, acronym, type, coordinatorId } = req.body;

  if (!name || !acronym || !type) {
    return res
      .status(400)
      .json({ error: "Os campos nome, sigla e tipo são obrigatórios." });
  }

  const validTypes = [
    "GRADUAÇÃO",
    "TÉCNICO",
    "INTEGRADO",
    "PÓS-GRADUAÇÃO",
    "MESTRADO",
    "DOUTORADO",
    "EAD",
    "PROEJA",
    "ESPECIALIZAÇÃO",
    "EXTENSÃO",
    "RESIDÊNCIA",
    "SEQUENCIAL",
    "BACHARELADO",
    "LICENCIATURA",
    "TECNOLOGIA",
    "LATO SENSU",
    "STRICTO SENSU",
  ];

  if (!validTypes.includes(type)) {
    return res
      .status(400)
      .json({ error: `O tipo do curso deve ser um dos seguintes: ${validTypes.join(", ")}.` });
  }

  try {
    const existingCourse = await Course.findOne({
      where: {
        [Sequelize.Op.or]: [{ acronym }, { name }],
      },
    });

    if (existingCourse) {
      const duplicatedField =
        existingCourse.acronym === acronym ? "sigla" : "nome";
      return res
        .status(400)
        .json({
          error: `A ${duplicatedField} já está cadastrada. Tente outra.`,
        });
    }

    if (coordinatorId) {
      const coordinator = await User.findByPk(coordinatorId);
      if (!coordinator) {
        return res.status(404).json({ error: "Coordenador não encontrado" });
      }
    }
    const course = await Course.create({ name, acronym, type, coordinatorId });
    res.status(201).json({ course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar curso" });
  }
};

exports.getCourses = async (req, res) => {
  const { name, type, page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = { [Sequelize.Op.like]: `%${name}%` };
    }

    if (type) {
      where.type = type;
    }

    const { rows, count } = await Course.findAndCountAll({
      where,
      include: [
        {
          model: User,
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

exports.getCourseById = async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
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

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { name, acronym, type, coordinatorId } = req.body;

  try {
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: "Curso não encontrado." });
    }

    // Verificar se o coordenador existe, se fornecido
    if (coordinatorId) {
      const coordinator = await User.findByPk(coordinatorId);
      if (!coordinator) {
        return res.status(404).json({ error: "Coordenador não encontrado." });
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

exports.deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await Course.findByPk(courseId);

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
