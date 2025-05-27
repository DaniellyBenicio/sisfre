import db from "../../models/index.js";

export const createDiscipline = async (req, res) => {
  const { name, acronym, workload } = req.body;

  if (!name || !acronym || workload == null) {
    return res.status(400).json({
      error: "Nome, sigla e carga horária são obrigatórios",
    });
  }

  if (!/^[a-zA-Z0-9]+$/.test(acronym)) {
    return res.status(400).json({
      error:
        "A sigla deve conter apenas letras e números, sem caracteres especiais",
    });
  }

  if (typeof workload !== "number" || workload < 1) {
    return res.status(400).json({
      error: "A carga horária deve ser um número válido e maior que zero",
    });
  }

  try {
    const existing = await db.Discipline.findOne({
      where: { acronym, name },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Já existe uma disciplina com esta sigla/nome" });
    }

    const newDiscipline = await db.Discipline.create({
      name,
      acronym,
      workload,
    });

    res.status(201).json({
      message: "Disciplina cadastrada com sucesso",
      discipline: newDiscipline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar disciplina" });
  }
};

export const updateDiscipline = async (req, res) => {
  const { id } = req.params;
  const { name, acronym, workload } = req.body;

  if (!name && !acronym && workload == null) {
    return res.status(400).json({
      error:
        "Pelo menos um campo (nome, sigla ou carga horária) deve ser fornecido para atualização",
    });
  }

  if (isNaN(id)) {
    return res.status(400).json({ error: "O ID deve ser um número válido" });
  }

  try {
    const discipline = await db.Discipline.findByPk(id);
    if (!discipline) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
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
        return res
          .status(400)
          .json({ error: "Já existe outra disciplina com esta sigla ou nome" });
      }
    }

    if (acronym && !/^[a-zA-Z0-9]+$/.test(acronym)) {
      return res.status(400).json({
        error:
          "A sigla deve conter apenas letras e números, sem caracteres especiais",
      });
    }

    if (workload != null && (typeof workload !== "number" || workload < 1)) {
      return res.status(400).json({
        error: "A carga horária deve ser um número válido e maior que zero",
      });
    }

    if (name) discipline.name = name;
    if (acronym) discipline.acronym = acronym;
    if (workload != null) discipline.workload = workload;

    await discipline.save();

    res.status(200).json({
      message: "Disciplina atualizada com sucesso",
      discipline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar disciplina" });
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
      attributes: ["id", "name", "acronym", "workload"],
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
    res.status(500).json({ error: "Erro ao listar disciplinas" });
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
      attributes: ["id", "name", "acronym", "workload"],
      order: [["name", "ASC"]],
    });

    res.json({ disciplines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar disciplinas" });
  }
};

export const getDisciplineById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (isNaN(id)) {
      return res.status(400).json({ error: "O ID deve ser um número válido" });
    }

    const discipline = await db.Discipline.findByPk(id, {
      attributes: ["id", "name", "acronym", "workload"],
    });

    if (!discipline) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    res.json({
      message: "Disciplina recuperada com sucesso",
      discipline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar disciplina" });
  }
};

export const deleteDiscipline = async (req, res) => {
  const disciplineId = req.params.id;

  try {
    const discipline = await db.Discipline.findByPk(disciplineId);

    if (!discipline) {
      return res.status(404).json({ error: "Disciplina não encontrada." });
    }

    await discipline.destroy();
    res.status(200).json({ message: "Disciplina excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir a disciplina." });
  }
};
