const { Sequelize } = require("sequelize");
const Class = require("../../models/admin/Class");
const Course = require("../../models/admin/Course");

exports.createClass = async (req, res) => {
  const { courseId, semester, year, period, type } = req.body;

  if (!courseId || !semester || !year || !period || !type) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const existing = await Class.findOne({
      where: { courseId, semester, year, period, type },
    });
    if (existing) {
      return res.status(400).json({ error: "Já existe uma turma com esses dados." });
    }

    const newClass = await Class.create({ courseId, semester, year, period, type });
    res.status(201).json({ message: "Turma cadastrada com sucesso.", class: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar turma." });
  }
};

exports.updateClass = async (req, res) => {
  const classId = req.params.id;
  const { courseId, semester, year, period, type } = req.body;

  if (!courseId || !semester || !year || !period || !type) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const turma = await Class.findByPk(classId);
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }

    const duplicate = await Class.findOne({
      where: {
        courseId,
        semester,
        year,
        period,
        type,
        id: { [Sequelize.Op.ne]: classId },
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

exports.getClasses = async (req, res) => {
  const { courseId, type, page = 1, limit = 10 } = req.query;
  try {
    const offset = (page - 1) * limit;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;

    const { rows, count } = await Class.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["year", "DESC"]],
      include: [{ model: Course, as: "course" }],
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

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      order: [["year", "DESC"]],
      include: [{ model: Course, as: "course" }],
    });
    res.json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar turmas." });
  }
};

exports.getClassById = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await Class.findByPk(classId, {
      include: [{ model: Course, as: "course" }],
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

exports.deleteClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await Class.findByPk(classId);
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

exports.archiveClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await Class.findByPk(classId);
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