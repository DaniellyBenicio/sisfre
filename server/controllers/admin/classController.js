import db from '../../models/index.js';

export const createClass = async (req, res) => {
  const { courseId, semester, year, period, type, shift, archived } = req.body;

  if (!courseId || !semester || !year || !period || !type || !shift) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const existing = await db.Class.findOne({
      where: { courseId, semester, year, period, type, shift },
    });
    if (existing) {
      return res.status(400).json({ error: "Já existe uma turma com esses dados." });
    }

    const newClass = await db.Class.create({ courseId, semester, year, period, type, shift, archived });
    res.status(201).json({ message: "Turma cadastrada com sucesso.", class: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar turma." });
  }
};

export const updateClass = async (req, res) => {
  const classId = req.params.id;
  const { courseId, semester, year, period, type } = req.body;

  if (!courseId || !semester || !year || !period || !type) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const turma = await db.Class.findByPk(classId);
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }

    const duplicate = await db.Class.findOne({
      where: {
        courseId,
        semester,
        year,
        period,
        type,
        id: { [db.Sequelize.Op.ne]: classId },
      },
    });
    if (duplicate) {
      return res.status(400).json({ error: "Já existe uma turma com esses dados." });
    }

    turma.courseId = courseId;
    turma.semester = semester;
    turma.year = year;
    turma.period = period;
    turma.type = type;
    await turma.save();

    res.status(200).json({ message: "Turma atualizada com sucesso.", class: turma });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar turma." });
  }
};

export const getClasses = async (req, res) => {
  const { courseId, type, page = 1, limit = 10 } = req.query;
  try {
    const offset = (page - 1) * limit;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;

    const { rows, count } = await db.Class.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["year", "DESC"]],
      include: [{ model: db.Course, as: "course" }],
    });

    res.json({
      classes: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar turmas." });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await db.Class.findAll({
      order: [["year", "DESC"]],
      include: [{ model: db.Course, as: "course" }],
    });
    res.json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar turmas." });
  }
};

export const getClassById = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await db.Class.findByPk(classId, {
      include: [{ model: db.Course, as: "course" }],
    });
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }
    res.json({ class: turma });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar turma." });
  }
};

export const deleteClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await db.Class.findByPk(classId);
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }
    await turma.destroy();
    res.status(200).json({ message: "Turma excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir turma." });
  }
};

export const archiveClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await db.Class.findByPk(classId);
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }
    turma.archived = true;
    await turma.save();
    res.status(200).json({ message: "Turma arquivada com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao arquivar turma." });
  }
};