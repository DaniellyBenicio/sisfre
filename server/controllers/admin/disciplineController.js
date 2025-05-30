import db from "../../models/index.js";

export const createDiscipline = async (req, res) => {
  const { name, acronym, courses } = req.body;

  if (!name || !acronym) {
    return res.status(400).json({
      mensagem: "Nome e sigla são obrigatórios",
    });
  }

  if (!/^[a-zA-Z0-9]+$/.test(acronym)) {
    return res.status(400).json({
      mensagem:
        "A sigla deve conter apenas letras e números, sem caracteres especiais",
    });
  }

  try {
    const existing = await db.Discipline.findOne({
      where: { [db.Sequelize.Op.or]: { acronym, name } },
    });

    if (existing) {
      return res
        .status(400)
        .json({ mensagem: "Já existe uma disciplina com esta sigla ou nome" });
    }

    const newDiscipline = await db.Discipline.create({
      name,
      acronym,
    });

    if (courses && Array.isArray(courses) && courses.length > 0) {
      const courseDisciplinesData = [];
      for (const course of courses) {
        const { courseId, workload } = course;

        if (!courseId || workload == null) {
          return res.status(400).json({
            mensagem:
              "ID do curso e carga horária são obrigatórios para associação",
          });
        }

        if (typeof workload !== "number" || workload < 1) {
          return res.status(400).json({
            mensagem:
              "A carga horária deve ser um número válido e maior que zero",
          });
        }

        const courseExists = await db.Course.findByPk(courseId);
        if (!courseExists) {
          return res
            .status(404)
            .json({ mensagem: `Curso com ID ${courseId} não encontrado` });
        }

        const existingAssociation = await db.CourseDiscipline.findOne({
          where: { courseId, disciplineId: newDiscipline.id },
        });

        if (existingAssociation) {
          return res.status(400).json({
            mensagem: `Disciplina já associada ao curso com ID ${courseId}`,
          });
        }

        courseDisciplinesData.push({
          courseId,
          disciplineId: newDiscipline.id,
          workload,
        });
      }

      const createdAssociations = await db.CourseDiscipline.bulkCreate(
        courseDisciplinesData
      );
      
    } else {
      console.log("Nenhum curso fornecido para associação");
    }

    res.status(201).json({
      mensagem: "Disciplina cadastrada com sucesso",
      discipline: newDiscipline,
    });
  } catch (error) {
    console.error("Erro em createDiscipline:", error.stack);
    res
      .status(500)
      .json({ mensagem: "Erro ao cadastrar disciplina", error: error.message });
  }
};

export const updateDiscipline = async (req, res) => {
  const { id } = req.params;
  const { name, acronym, courses } = req.body;

  if (!name && !acronym && (!courses || !Array.isArray(courses))) {
    return res.status(400).json({
      mensagem:
        "Pelo menos um campo (nome, sigla ou cursos) deve ser fornecido para atualização",
    });
  }

  if (isNaN(id)) {
    return res.status(400).json({ mensagem: "O ID deve ser um número válido" });
  }

  try {
    const discipline = await db.Discipline.findByPk(id);
    if (!discipline) {
      return res.status(404).json({ mensagem: "Disciplina não encontrada" });
    }

    const checkDuplicates = {};
    if (name && name !== discipline.name) {
      checkDuplicates.name = name;
    }
    if (acronym && acronym !== discipline.acronym) {
      checkDuplicates.acronym = acronym;
    }

    if (Object.keys(checkDuplicates).length > 0) {
      const existing = await db.Discipline.findOne({
        where: {
          [db.Sequelize.Op.or]: checkDuplicates,
          id: { [db.Sequelize.Op.ne]: id },
        },
      });

      if (existing) {
        return res.status(400).json({
          mensagem: "Já existe outra disciplina com esta sigla ou nome",
        });
      }
    }

    if (acronym && !/^[a-zA-Z0-9]+$/.test(acronym)) {
      return res.status(400).json({
        mensagem:
          "A sigla deve conter apenas letras e números, sem caracteres especiais",
      });
    }

    if (name) discipline.name = name;
    if (acronym) discipline.acronym = acronym;
    await discipline.save();

    if (courses && Array.isArray(courses)) {
      for (const course of courses) {
        const { courseId, workload } = course;

        if (!courseId || workload == null) {
          return res.status(400).json({
            mensagem:
              "ID do curso e carga horária são obrigatórios para associação",
          });
        }

        if (typeof workload !== "number" || workload < 1) {
          return res.status(400).json({
            mensagem:
              "A carga horária deve ser um número válido e maior que zero",
          });
        }

        const courseExists = await db.Course.findByPk(courseId);
        if (!courseExists) {
          return res
            .status(404)
            .json({ mensagem: `Curso com ID ${courseId} não encontrado` });
        }

        const existingAssociation = await db.CourseDiscipline.findOne({
          where: { courseId, disciplineId: id },
        });

        if (existingAssociation) {
          existingAssociation.workload = workload;
          await existingAssociation.save();
        } else {
          await db.CourseDiscipline.create({
            courseId,
            disciplineId: id,
            workload,
          });
        }
      }
    }

    res.status(200).json({
      mensagem: "Disciplina atualizada com sucesso",
      discipline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao atualizar disciplina" });
  }
};

export const getDisciplines = async (req, res) => {
  const { name, acronym, page = 1, limit = 10, order = "asc" } = req.query;

  try {
    const offset = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = {
        [db.Sequelize.Op.like]: `%${name}%`,
      };
    }

    if (acronym) {
      where.acronym = {
        [db.Sequelize.Op.like]: `%${acronym}%`,
      };
    }

    const { rows, count } = await db.Discipline.findAndCountAll({
      where,
      attributes: ["id", "name", "acronym"],
      include: [
        {
          model: db.Course,
          as: "courses",
          through: {
            model: db.CourseDiscipline,
            attributes: ["courseId", "workload"],
          },
          attributes: ["id", "name", "sigla"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["name", order === "asc" ? "ASC" : "DESC"]],
    });

    res.json({
      disciplines: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao listar disciplinas" });
  }
};

export const getAllDisciplines = async (req, res) => {
  const { name, acronym } = req.query;

  try {
    const where = {};

    if (name) {
      where.name = {
        [db.Sequelize.Op.like]: `%${name}%`,
      };
    }

    if (acronym) {
      where.acronym = {
        [db.Sequelize.Op.like]: `%${acronym}%`,
      };
    }

    const disciplines = await db.Discipline.findAll({
      where,
      attributes: ["id", "name", "acronym"],
      include: [
        {
          model: db.Course,
          as: "courses",
          through: {
            model: db.CourseDiscipline,
            attributes: ["courseId", "workload"],
          },
          attributes: ["id", "name", "sigla"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json({ disciplines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao listar disciplinas" });
  }
};

export const getDisciplineById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ mensagem: "O ID deve ser um número válido" });
    }

    const discipline = await db.Discipline.findByPk(id, {
      attributes: ["id", "name", "acronym"],
      include: [
        {
          model: db.Course,
          as: "courses",
          through: {
            model: db.CourseDiscipline,
            attributes: ["courseId", "workload"],
          },
          attributes: ["id", "name", "acronym"],
        },
      ],
    });

    if (!discipline) {
      return res.status(404).json({ mensagem: "Disciplina não encontrada" });
    }

    res.json({
      mensagem: "Disciplina recuperada com sucesso",
      discipline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar disciplina" });
  }
};

export const deleteDiscipline = async (req, res) => {
  const disciplineId = req.params.id;

  try {
    const discipline = await db.Discipline.findByPk(disciplineId);

    if (!discipline) {
      return res.status(404).json({ mensagem: "Disciplina não encontrada." });
    }

    const courseDisciplines = await db.CourseDisciplines.findAll({
      where: { disciplineId },
    });

    if (courseDisciplines.length > 0) {
      return res.status(400).json({
        mensagem:
          "Não é possível excluir a disciplina, pois ela está associada a um ou mais cursos.",
      });
    }

    await discipline.destroy();
    res.status(200).json({ mensagem: "Disciplina excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao excluir a disciplina." });
  }
};
