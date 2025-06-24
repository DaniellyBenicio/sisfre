import db from '../../models/index.js';

export const createClass = async (req, res) => {
  const { courseId, semester } = req.body;

  if (!courseId || !semester) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const existing = await db.Class.findOne({
      include: [{
        model: db.Course,
        as: "course",
        where: { id: courseId }
      }],
      where: { semester }
    });
    if (existing) {
      return res.status(400).json({ error: "Já existe uma turma com esses dados." });
    }

    const newClass = await db.Class.create({ semester });

    await newClass.addCourse(courseId);

    const turmaComCurso = await db.Class.findByPk(newClass.id, {
      include: [{ model: db.Course, as: "course" }]
    });

    const course = Array.isArray(turmaComCurso.course) && turmaComCurso.course.length > 0
      ? turmaComCurso.course[0]
      : null;

    res.status(201).json({
      message: "Turma cadastrada com sucesso.",
      class: {
        id: turmaComCurso.id,
        semester: turmaComCurso.semester,
        createdAt: turmaComCurso.createdAt,
        updatedAt: turmaComCurso.updatedAt,
        courseId: course ? course.id : null,
        course: course
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar turma." });
  }
};

export const updateClass = async (req, res) => {
  const classId = req.params.id;
  const { courseId, semester } = req.body;

  if (!courseId || !semester) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const turma = await db.Class.findByPk(classId, {
      include: [{ model: db.Course, as: "course" }]
    });
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }

    const duplicate = await db.Class.findOne({
      include: [{
        model: db.Course,
        as: "course",
        where: { id: courseId }
      }],
      where: {
        semester,
        id: { [db.Sequelize.Op.ne]: classId }
      }
    });
    if (duplicate) {
      return res.status(400).json({ error: "Já existe uma turma com esses dados." });
    }

    turma.semester = semester;
    await turma.save();

    await turma.setCourse([courseId]);

    const turmaComCurso = await db.Class.findByPk(classId, {
      include: [{ model: db.Course, as: "course" }]
    });

    const course = Array.isArray(turmaComCurso.course) && turmaComCurso.course.length > 0
      ? turmaComCurso.course[0]
      : null;

    res.status(200).json({
      message: "Turma atualizada com sucesso.",
      class: {
        id: turmaComCurso.id,
        semester: turmaComCurso.semester,
        createdAt: turmaComCurso.createdAt,
        updatedAt: turmaComCurso.updatedAt,
        courseId: course ? course.id : null,
        course: course
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar turma." });
  }
};

export const getClasses = async (req, res) => {
  const { courseId, page = 1, limit = 10 } = req.query;
  try {
    const offset = (page - 1) * limit;
    const where = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const { count, rows } = await db.CourseClass.findAndCountAll({
      where,
      include: [
        { model: db.Course, as: "course" },
        { model: db.Class, as: "class" }
      ],
      limit: parseInt(limit),
      offset,
      order: [
        [{ model: db.Course, as: "course" }, "id", "ASC"],
        [{ model: db.Class, as: "class" }, "semester", "ASC"]
      ]
    });

    const classes = rows.map(row => ({
      id: row.class.id,
      semester: row.class.semester,
      createdAt: row.class.createdAt,
      updatedAt: row.class.updatedAt,
      courseId: row.course.id,
      course: row.course
    }));

    res.json({
      classes,
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
      order: [["createdAt", "DESC"]],
      include: [{ model: db.Course, as: "course" }]
    });

    const result = classes.map(cls => {
      const course = Array.isArray(cls.course) && cls.course.length > 0 ? cls.course[0] : null;
      return {
        id: cls.id,
        semester: cls.semester,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        courseId: course ? course.id : null,
        course: course
      };
    });

    res.json({ classes: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar turmas." });
  }
};

export const getClassById = async (req, res) => {
  const classId = req.params.id;
  try {
    const turma = await db.Class.findByPk(classId, {
      include: [{ model: db.Course, as: "course" }]
    });
    if (!turma) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }
    const course = Array.isArray(turma.course) && turma.course.length > 0 ? turma.course[0] : null;
    res.json({
      class: {
        id: turma.id,
        semester: turma.semester,
        createdAt: turma.createdAt,
        updatedAt: turma.updatedAt,
        courseId: course ? course.id : null,
        course: course
      }
    });
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
    await turma.setCourse([]);
    await turma.destroy();
    res.status(200).json({ message: "Turma excluída com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir turma." });
  }
};