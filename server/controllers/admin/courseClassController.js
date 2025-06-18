import db from "../../models/index.js";

export const associateClassToCourse = async (req, res) => {
  const { courseId, classId } = req.body;

  if (!courseId || !classId) {
    return res.status(400).json({ error: "courseId e classId são obrigatórios." });
  }

  try {
    const exists = await db.CourseClass.findOne({ where: { courseId, classId } });
    if (exists) {
      return res.status(400).json({ error: "Associação já existe." });
    }

    const course = await db.Course.findByPk(courseId);
    const turma = await db.Class.findByPk(classId);
    if (!course || !turma) {
      return res.status(404).json({ error: "Curso ou turma não encontrados." });
    }

    const association = await db.CourseClass.create({ courseId, classId });
    return res.status(201).json({ message: "Turma associada ao curso com sucesso.", association });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao associar turma ao curso." });
  }
};

export const removeClassFromCourse = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "id da associação é obrigatório." });
  }

  try {
    const association = await db.CourseClass.findByPk(id);
    if (!association) {
      return res.status(404).json({ error: "Associação não encontrada." });
    }
    await association.destroy();
    return res.status(200).json({ message: "Associação removida com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover associação." });
  }
};

export const getAllAssociations = async (req, res) => {
  try {
    const associations = await db.CourseClass.findAll({
      include: [
        { model: db.Course, as: "course" },
        { model: db.Class, as: "class" }
      ]
    });
    return res.status(200).json({ associations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar associações." });
  }
};

export const updateAssociation = async (req, res) => {
  const { id } = req.params;
  const { courseId, classId } = req.body;

  if (!id || (!courseId && !classId)) {
    return res.status(400).json({ error: "id da associação e pelo menos um dos campos courseId ou classId são obrigatórios." });
  }

  try {
    const association = await db.CourseClass.findByPk(id);
    if (!association) {
      return res.status(404).json({ error: "Associação não encontrada." });
    }

    if (courseId) association.courseId = courseId;
    if (classId) association.classId = classId;

    await association.save();

    return res.status(200).json({ message: "Associação atualizada com sucesso.", association });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar associação." });
  }
};