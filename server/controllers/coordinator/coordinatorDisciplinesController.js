import db from "../../models/index.js";
import { Op } from 'sequelize';

export const associateDisciplineToCourse = async (req, res) => {
  const { disciplineId, workload } = req.body;
  const coordinatorId = req.user.id;

  if (!disciplineId || workload == null) {
    return res.status(400).json({
      message: "ID da disciplina e carga horária são obrigatórios",
    });
  }

  if (typeof workload !== "number" || workload < 1) {
    return res.status(400).json({
      message: "A carga horária deve ser um número válido e maior que zero",
    });
  }

  try {
    const course = await db.Course.findOne({
      where: { coordinatorId },
    });

    if (!course) {
      return res.status(403).json({
        message: "Curso não encontrado para o coordenador autenticado",
      });
    }

    const courseId = course.id;

    const discipline = await db.Discipline.findByPk(disciplineId);
    if (!discipline) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    const existingAssociation = await db.CourseDiscipline.findOne({
      where: { courseId, disciplineId },
    });
    if (existingAssociation) {
      return res.status(400).json({
        message: "Disciplina já associada a este curso",
      });
    }

    await db.CourseDiscipline.create({
      courseId,
      disciplineId,
      workload,
    });

    res.status(201).json({
      message: "Disciplina associada ao curso com sucesso",
    });
  } catch (error) {
    console.error("Erro em associateDisciplineToCourse:", error);
    res.status(500).json({
      message: "Erro ao associar disciplina ao curso",
      error: error.message,
    });
  }
};

export const getDisciplinesByCoordinatorCourse = async (req, res) => {
  const coordinatorId = req.user.id;

  try {
    const course = await db.Course.findOne({
      where: { coordinatorId },
    });

    if (!course) {
      return res.status(404).json({
        message: "Curso não encontrado para o coordenador",
      });
    }

    const courseId = course.id;

    const associations = await db.CourseDiscipline.findAll({
      where: { courseId },
      include: [
        {
          model: db.Discipline,
          attributes: ["id", "name", "acronym"],
          as: "Discipline",
        },
      ],
    });

    const result = associations.map((assoc) => ({
      disciplineId: assoc.Discipline.id,
      name: assoc.Discipline.name,
      acronym: assoc.Discipline.acronym,
      workload: assoc.workload,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro em getDisciplinesByCoordinatorCourse:", error);
    res.status(500).json({
      message: "Erro ao buscar disciplinas associadas",
      error: error.message,
    });
  }
};

export const updateDisciplineOfCourse = async (req, res) => {
  const coordinatorId = req.user.id;
  const { disciplineId } = req.params;
  const { workload } = req.body;

  if (workload == null) {
    return res.status(400).json({
      message: "Carga horária é obrigatória",
    });
  }

  if (typeof workload !== "number" || workload < 1) {
    return res.status(400).json({
      message: "A carga horária deve ser um número válido e maior que zero",
    });
  }

  try {
    const course = await db.Course.findOne({
      where: { coordinatorId },
    });

    if (!course) {
      return res.status(404).json({
        message: "Curso não encontrado para o coordenador",
      });
    }

    const courseId = course.id;

    const association = await db.CourseDiscipline.findOne({
      where: { courseId, disciplineId },
    });

    if (!association) {
      return res.status(404).json({
        message: "Associação entre curso e disciplina não encontrada",
      });
    }

    association.workload = workload;
    await association.save();

    res.status(200).json({
      message: "Carga horária atualizada com sucesso",
      workload: association.workload,
    });
  } catch (error) {
    console.error("Erro ao atualizar carga horária:", error);
    res.status(500).json({
      message: "Erro ao atualizar carga horária",
      error: error.message,
    });
  }
};

export const removeDisciplineFromCourse = async (req, res) => {
  const coordinatorId = req.user.id;
  const { disciplineId } = req.params;

  if (!disciplineId) {
    return res.status(400).json({ message: "ID da disciplina é obrigatório" });
  }

  try {
    const course = await db.Course.findOne({
      where: { coordinatorId },
    });

    if (!course) {
      return res.status(404).json({
        message: "Curso não encontrado para o coordenador",
      });
    }

    const courseId = course.id;

    const association = await db.CourseDiscipline.findOne({
      where: { courseId, disciplineId },
    });

    if (!association) {
      return res.status(404).json({
        message: "Associação entre curso e disciplina não encontrada",
      });
    }

    await association.destroy();

    res.status(200).json({
      message: "Disciplina desassociada do curso com sucesso",
    });
  } catch (error) {
    console.error("Erro ao desassociar disciplina:", error);
    res.status(500).json({
      message: "Erro ao desassociar disciplina do curso",
      error: error.message,
    });
  }
};
export const searchDisciplinesByCoordinatorCourse = async (req, res) => {
  try {
    const coordinator = req.user;

    if (!coordinator || coordinator.accessType !== "Coordenador") {
      return res.status(403).json({
        error: "Acesso negado. Apenas coordenadores podem buscar disciplinas.",
      });
    }

    const course = await db.Course.findOne({
      where: { coordinatorId: coordinator.id },
    });

    if (!course) {
      return res
        .status(404)
        .json({ error: "Nenhum curso encontrado para este coordenador." });
    }

    const { filter = "", page = 1, limit = 10, order = "asc" } = req.query;
    const offset = (page - 1) * limit;

    const workloadNumber = Number(filter);
    const isWorkloadFilter = !isNaN(workloadNumber) && workloadNumber > 0;

    let disciplineWhere = {};
    if (!isWorkloadFilter) {
      disciplineWhere = {
        [Op.or]: [
          { name: { [Op.like]: `%${filter}%` } },
          { acronym: { [Op.like]: `%${filter}%` } },
        ],
      };
    }

    let courseDisciplineWhere = { courseId: course.id };
    if (isWorkloadFilter) {
      courseDisciplineWhere.workload = workloadNumber;
    }

    const { rows, count } = await db.CourseDiscipline.findAndCountAll({
      where: courseDisciplineWhere,
      include: [
        {
          model: db.Discipline,
          attributes: ["name", "acronym"],
          where: disciplineWhere,
          as: "Discipline",
          required: true,
        },
      ],
      order: [["workload", order.toLowerCase() === "asc" ? "ASC" : "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    const result = rows.map((assoc) => ({
      name: assoc.Discipline.name,
      acronym: assoc.Discipline.acronym,
      workload: assoc.workload,
    }));

    res.status(200).json({
      disciplines: result,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Erro em searchDisciplinesByCoordinatorCourse:", error);
    res.status(500).json({
      error: "Erro ao buscar disciplinas com filtro",
      details: error.message,
    });
  }
};
