import db from "../../models/index.js";

export const createDiscipline = async (req, res) => {
  const { name, acronym } = req.body;

  if (!name || !acronym) {
    return res.status(400).json({
      error: "Nome e sigla são obrigatórios.",
    });
  }

  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({
      error: "O nome deve ter entre 3 e 50 caracteres.",
    });
  }

  if (!/^[A-Za-zÀ-ÿ0-9\s]+$/.test(name)) {
    return res.status(400).json({
      error: "O nome deve conter apenas letras, números, acentos e espaços.",
    });
  }

  if (acronym.length < 2 || acronym.length > 10) {
    return res.status(400).json({
      error: "A sigla deve ter entre 2 e 10 caracteres.",
    });
  }

  if (!/^[a-zA-Z0-9]+$/.test(acronym)) {
    return res.status(400).json({
      error:
        "A sigla deve conter apenas letras e números, sem espaços ou acentos.",
    });
  }

  try {
    const existing = await db.Discipline.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ name }, { acronym }],
      },
    });

    if (existing) {
      const duplicatedFields = [];
      if (existing.name === name) duplicatedFields.push("nome");
      if (existing.acronym === acronym) duplicatedFields.push("sigla");

      const mensagem = buildDuplicatedMessage(duplicatedFields);
      return res.status(400).json({ error: mensagem });
    }

    const discipline = await db.Discipline.create({ name, acronym });
    return res.status(201).json({ discipline });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao cadastrar a disciplina." });
  }
};

function buildDuplicatedMessage(fields) {
  if (fields.length === 1) {
    if (fields[0] === "nome")
      return "Já existe uma disciplina com o nome informado.";
    if (fields[0] === "sigla")
      return "Já existe uma disciplina com a sigla informada.";
  }
  if (fields.length === 2) {
    return "Já existe uma disciplina com o nome e a sigla informados.";
  }
  return "Campos duplicados.";
}

export const updateDiscipline = async (req, res) => {
  const disciplineId = req.params.id;
  const { name, acronym } = req.body;

  try {
    const discipline = await db.Discipline.findByPk(disciplineId);
    if (!discipline) {
      return res.status(404).json({ error: "Disciplina não encontrada." });
    }

    if (name) {
      if (name.length < 3 || name.length > 50) {
        return res.status(400).json({
          error: "O nome deve ter entre 3 e 50 caracteres.",
        });
      }
      if (!/^[A-Za-zÀ-ÿ0-9\s]+$/.test(name)) {
        return res.status(400).json({
          error:
            "O nome deve conter apenas letras, números, acentos e espaços.",
        });
      }
    }

    if (acronym) {
      if (acronym.length < 2 || acronym.length > 10) {
        return res.status(400).json({
          error: "A sigla deve ter entre 2 e 10 caracteres.",
        });
      }
      if (!/^[a-zA-Z0-9]+$/.test(acronym)) {
        return res.status(400).json({
          error:
            "A sigla deve conter apenas letras e números, sem espaços ou acentos.",
        });
      }
    }

    if (name || acronym) {
      const existing = await db.Discipline.findOne({
        where: {
          id: { [db.Sequelize.Op.ne]: disciplineId },
          [db.Sequelize.Op.or]: [
            name ? { name } : null,
            acronym ? { acronym } : null,
          ].filter(Boolean),
        },
      });

      if (existing) {
        const duplicatedFields = [];
        if (name && existing.name === name) duplicatedFields.push("nome");
        if (acronym && existing.acronym === acronym)
          duplicatedFields.push("sigla");

        const mensagem = buildDuplicatedMessage(duplicatedFields);
        return res.status(400).json({ error: mensagem });
      }
    }

    if (name) discipline.name = name;
    if (acronym) discipline.acronym = acronym;

    await discipline.save();
    return res
      .status(200)
      .json({ message: "Disciplina atualizada com sucesso.", discipline });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar a disciplina." });
  }
};

export const getDisciplines = async (req, res) => {
  const { name, acronym, page = 1, limit = 10, order = "asc" } = req.query;

  try {
    const offset = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = {
        [db.Sequelize.Op.iLike]: `%${name}%`,
      };
    }

    if (acronym) {
      where.acronym = {
        [db.Sequelize.Op.iLike]: `%${acronym}%`,
      };
    }

    const { rows, count } = await db.Discipline.findAndCountAll({
      where,
      attributes: ["id", "name", "acronym"],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", order === "asc" ? "ASC" : "DESC"]],
    });

    res.json({
      disciplines: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Erro em getDisciplines:", error);
    res
      .status(500)
      .json({ message: "Erro ao listar disciplinas", error: error.message });
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
      order: [["name", "ASC"]],
    });

    res.json({ disciplines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar disciplinas" });
  }
};

export const getDisciplineById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: "O ID deve ser um número válido" });
    }

    const discipline = await db.Discipline.findByPk(id, {
      attributes: ["id", "name", "acronym"],
    });

    if (!discipline) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    res.json({
      message: "Disciplina recuperada com sucesso",
      discipline,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar disciplina", error: error.message });
  }
};

export const deleteDiscipline = async (req, res) => {
  const disciplineId = req.params.id;

  try {
    const discipline = await db.Discipline.findByPk(disciplineId);

    if (!discipline) {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }
    await discipline.destroy();
    res.status(200).json({ message: "Disciplina excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir a disciplina." });
  }
};
