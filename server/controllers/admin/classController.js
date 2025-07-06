import db from '../../models/index.js';
import { Op } from 'sequelize';

export const deleteClass = async (req, res) => {
  const courseClassId = req.params.courseClassId;

  try {
    const courseClass = await db.CourseClass.findByPk(courseClassId);
    if (!courseClass) {
      return res.status(404).json({ error: "Vínculo não encontrado." });
    }

    courseClass.isActive = !courseClass.isActive;
    await courseClass.save();

    const message = courseClass.isActive 
      ? "Turma desarquivada com sucesso." 
      : "Turma arquivada com sucesso.";

    res.status(200).json({ 
      message, 
      class: {
        courseClassId: courseClass.id,
        isActive: courseClass.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao arquivar/desarquivar turma." });
  }
};

export const getClasses = async (req, res) => {
  const { courseId, page = 1, limit = 10 } = req.query;
  try {
    const offset = (page - 1) * limit;
    const where = { isActive: true };
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
      id: row.id,
      courseClassId: row.id,
      classId: row.class.id,
      semester: row.class.semester,
      isActive: row.isActive,
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
    const rows = await db.CourseClass.findAll({
      where: { isActive: true },
      include: [
        { model: db.Course, as: "course" },
        { model: db.Class, as: "class" }
      ],
      order: [
        [{ model: db.Course, as: "course" }, "id", "ASC"],
        [{ model: db.Class, as: "class" }, "semester", "ASC"]
      ]
    });

    const classes = rows.map(row => ({
      id: row.id,
      courseClassId: row.id,
      classId: row.class.id,
      semester: row.class.semester,
      isActive: row.isActive,
      createdAt: row.class.createdAt,
      updatedAt: row.class.updatedAt,
      courseId: row.course.id,
      course: row.course
    }));

    res.json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar turmas." });
  }
};

export const createClass = async (req, res) => {
  const { courseId, semester } = req.body;

  if (!courseId || !semester) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    let classInstance = await db.Class.findOne({ where: { semester } });

    if (!classInstance) {
      classInstance = await db.Class.create({ semester });
    }

    const existing = await db.CourseClass.findOne({
      where: { courseId, classId: classInstance.id, isActive: true }
    });
    if (existing) {
      return res.status(400).json({ error: "Já existe uma turma ativa com esses dados." });
    }

    const courseClass = await db.CourseClass.create({ 
      courseId, 
      classId: classInstance.id,
      isActive: true
    });

    const turmaComCurso = await db.CourseClass.findOne({
      where: { courseId, classId: classInstance.id },
      include: [
        { model: db.Course, as: "course" },
        { model: db.Class, as: "class" }
      ]
    });

    res.status(201).json({
      message: "Turma cadastrada com sucesso.",
      class: {
        id: turmaComCurso.id,
        courseClassId: turmaComCurso.id,
        classId: turmaComCurso.class.id,
        semester: turmaComCurso.class.semester,
        isActive: turmaComCurso.isActive,
        createdAt: turmaComCurso.class.createdAt,
        updatedAt: turmaComCurso.class.updatedAt,
        courseId: turmaComCurso.course.id,
        course: turmaComCurso.course
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar turma." });
  }
};

export const updateClass = async (req, res) => {
  const courseClassId = req.params.courseClassId;
  const { courseId, semester } = req.body;

  if (!courseId || !semester) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const courseClass = await db.CourseClass.findByPk(courseClassId, {
      include: [{ model: db.Class, as: "class" }]
    });
    if (!courseClass) {
      return res.status(404).json({ error: "Vínculo não encontrado." });
    }

    let classInstance = await db.Class.findOne({ where: { semester } });
    if (!classInstance) {
      classInstance = await db.Class.create({ semester });
    }

    const existing = await db.CourseClass.findOne({
      where: {
        courseId,
        classId: classInstance.id,
        isActive: true,
        id: { [db.Sequelize.Op.ne]: courseClassId }
      }
    });
    if (existing) {
      return res.status(400).json({ error: "Já existe uma turma ativa com esses dados." });
    }

    courseClass.classId = classInstance.id;
    courseClass.courseId = courseId;
    courseClass.isActive = true;
    await courseClass.save();

    if (courseClass.class.semester !== semester) {
      courseClass.class.semester = semester;
      await courseClass.class.save();
    }

    const turmaComCurso = await db.CourseClass.findByPk(courseClassId, {
      include: [
        { model: db.Course, as: "course" },
        { model: db.Class, as: "class" }
      ]
    });

    res.status(200).json({
      message: "Turma atualizada com sucesso.",
      class: {
        courseClassId: turmaComCurso.id,
        id: turmaComCurso.class.id,
        semester: turmaComCurso.class.semester,
        isActive: turmaComCurso.isActive,
        createdAt: turmaComCurso.class.createdAt,
        updatedAt: turmaComCurso.class.updatedAt,
        courseId: turmaComCurso.course.id,
        course: turmaComCurso.course
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar turma." });
  }
};

export const getClassById = async (req, res) => {
  const courseClassId = req.params.courseClassId;
  try {
    const row = await db.CourseClass.findByPk(courseClassId, {
      include: [
        { model: db.Course, as: "course" },
        { model: db.Class, as: "class" }
      ]
    });
    if (!row) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }
    res.json({
      class: {
        id: row.id,
        courseClassId: row.id,
        classId: row.class.id,
        semester: row.class.semester,
        isActive: row.isActive,
        createdAt: row.class.createdAt,
        updatedAt: row.class.updatedAt,
        courseId: row.course.id,
        course: row.course
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar turma." });
  }
};