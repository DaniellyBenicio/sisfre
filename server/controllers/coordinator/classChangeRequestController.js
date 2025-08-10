import { error } from "console";
import db from "../../models/index.js";
import fs from "fs";

export const createRequest = async (req, res) => {
  const { userId, course, discipline, hour, quantity, date, observation, type } = req.body;

  if (!userId || !course || !discipline || !hour || !quantity || !date || !type) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  if (isNaN(quantity) || Number(quantity) < 1) {
    return res.status(400).json({ error: "A quantidade deve ser um número válido maior que 0." });
  }

  if (Number(quantity) > 4) {
    return res
      .status(400)
      .json({ error: "O limite máximo de aulas para reposição/anteposição por dia é 4." });
  }

  const alreadyExist = await db.ClassChangeRequest.findOne({
    where: { userId, course, discipline, date, type },
  });

  if (alreadyExist) {
    return res.status(400).json({
      error: "Já existe uma solicitação de reposição/anteposição para essa data e aula.",
    });
  }

  const annex = req.file ? `/uploads/class_change_request/${req.file.filename}` : null;

  try {
    const request = await db.ClassChangeRequest.create({
      userId,
      course,
      discipline,
      hour,
      type,
      quantity,
      date,
      annex,
      observation,
    });

    return res.status(201).json({ message: "Requisição cadastrada com sucesso.", request });
  } catch (error) {
    console.error("Erro ao criar Requisição:", error);
    return res.status(500).json({ error: "Erro ao criar a Requisição." });
  }
};

export const getRequest = async (req, res) => {
  try {
    const requests = await db.ClassChangeRequest.findAll({
      include: [
        { model: db.User, as: "professor", attributes: ["id", "username", "email"] }
      ],
      order: [["date", "DESC"]],
    });

    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar requisições.", details: error.message });
  }
};

export const getRequestById = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "O ID deve ser um número válido." });
  }

  try {
    const request = await db.ClassChangeRequest.findByPk(id, {
      include: [
        { model: db.User, as: "professor", attributes: ["id", "username", "email"] },
        { model: db.CourseClass, as: "disciplinaclasse" },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: "Requisição não encontrada." });
    }

    return res.json({ request });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar a Requisição." });
  }
};

export const updateRequest = async (req, res) => {
  const id = Number(req.params.id);
  const {
    userId,
    course,
    discipline,
    hour,
    type,
    quantity,
    date,
    observation,
    validated,
    observationCoordinator,
  } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const request = await db.ClassChangeRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: "Requisição não encontrada." });
    }

    const newQuantity = quantity ?? request.quantity;
    const newDate = date ?? request.date;
    const newCourse = course ?? request.course;
    const newUserId = userId ?? request.userId;
    const newType = type ?? request.type;

    if (isNaN(newQuantity) || Number(newQuantity) < 1) {
      return res.status(400).json({ error: "A quantidade deve ser maior que 0." });
    }

    if (Number(newQuantity) > 4) {
      return res.status(400).json({ error: "O limite máximo de aulas por dia é 4." });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(newDate).setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ error: "A data não pode ser anterior à data atual." });
    }

    const group = await db.CourseClass.findByPk(newCourse);
    if (!group || !group.isActive) {
      return res.status(400).json({ error: "Turma inexistente ou inativa." });
    }

    const conflitante = await db.ClassChangeRequest.findOne({
      where: {
        userId: newUserId,
        course: newCourse,
        date: newDate,
        type: newType,
      },
    });

    if (conflitante && conflitante.id !== id) {
      return res.status(400).json({
        error: "Já existe outra solicitação para essa data, aula e tipo.",
      });
    }

    const annex = req.file
      ? `/uploads/class_change_request/${req.file.filename}`
      : request.annex;

    if (req.file && request.annex && fs.existsSync("public" + request.annex)) {
      fs.unlinkSync("public" + request.annex);
    }

    await request.update({
      userId: newUserId,
      course: newCourse,
      discipline,
      hour,
      type: newType,
      quantity: newQuantity,
      date: newDate,
      annex,
      observation,
      validated: validated ?? request.validated,
      observationCoordinator,
    });

    return res.status(200).json({ message: "Requisição atualizada com sucesso.", request });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar a requisição.", details: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "O ID deve ser um número válido." });
  }

  try {
    const request = await db.ClassChangeRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: "Requisição não encontrada." });
    }

    if (request.annex && fs.existsSync("public" + request.annex)) {
      fs.unlinkSync("public" + request.annex);
    }

    await request.destroy();

    return res.status(200).json({ message: "Requisição excluída com sucesso." });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir a requisição." });
  }
};

//fazer alterações nesse para buscar os detalhes do professor.
export const getProfessorScheduleDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const scheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { userId },
      include: [
        {model: db.ClassSchedule,as: "schedule", include: [
            {
              model: db.Course,
              as: "course",
              attributes: ["id", "name"]
            }
          ]
        },
        { model: db.Discipline, as: "discipline", attributes: ["id", "name"] },
        { model: db.Hour, as: "hour", attributes: ["id", "hourStart", "hourEnd"]},
        { model: db.User, as: "professor", attributes: ["id", "username"] }
      ]
    });

    return res.status(200).json({ scheduleDetails });
  } catch (error) {
    console.error("Erro ao buscar os detalhes da grade do professor:", error);
    return res.status(500).json({ error: "Erro ao buscar os detalhes da grade." });
  }
};

export const approveAnteposition = async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await db.ClassChangeRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (request.validated === 1) {
      return res.status(400).json({ error: "Esta anteposição já foi validada." });
    }

    // Verifica se é anteposição
    if (request.type === "anteposicao") {
      // Incrementa crédito do professor pela quantidade de aulas
      const professor = await db.User.findByPk(request.userId);
      if (professor) {
        professor.absenceCredits += Number(request.quantity) || 1;
        await professor.save();
      }
    }

    // Atualiza status da solicitação
    request.validated = 1;
    await request.save();

    return res.status(200).json({ message: "Anteposição aprovada e créditos concedidos ao professor." });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao aprovar anteposição.", details: error.message });
  }
};

