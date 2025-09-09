import db from "../../models/index.js";
import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const createRequest = async (req, res) => {
  const {
    userId,
    course,
    discipline,
    quantity,
    date,
    observation,
    type,
    dateAbsence,
  } = req.body;

  // Validação dos campos obrigatórios
  const missingFields = [];
  if (!userId) missingFields.push("userId");
  if (!course) missingFields.push("course");
  if (!discipline) missingFields.push("discipline");
  if (!quantity) missingFields.push("quantity");
  if (!date) missingFields.push("date");
  if (!type) missingFields.push("type");
  if (type === "reposicao" && !dateAbsence) missingFields.push("dateAbsence");

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Todos os campos obrigatórios devem ser preenchidos.",
      missingFields,
    });
  }

  // Se não for anteposição, exige pelo menos um anexo
  const annexFiles = req.files?.map((file) => file.path) || [];
  const annex = annexFiles.length > 0 ? JSON.stringify(annexFiles) : null;

  if (type !== "anteposicao" && !annex) {
    return res
      .status(400)
      .json({ error: "É obrigatório anexar pelo menos um arquivo para este tipo de solicitação." });
  }

  if (isNaN(quantity) || Number(quantity) < 1) {
    return res
      .status(400)
      .json({ error: "A quantidade deve ser um número válido maior que 0." });
  }

  if (Number(quantity) > 4) {
    return res.status(400).json({
      error: "O limite máximo de aulas para reposição/anteposição por dia é 4.",
    });
  }

  const alreadyExist = await db.ClassChangeRequest.findOne({
    where: { userId, course, discipline, date, type },
  });

  if (alreadyExist) {
    return res.status(400).json({
      error:
        "Já existe uma solicitação de reposição/anteposição para essa data e aula.",
    });
  }

  try {
    const request = await db.ClassChangeRequest.create({
      userId,
      course,
      discipline,
      type,
      quantity,
      date,
      dateAbsence: type === "reposicao" ? dateAbsence : null,
      annex,
      observation,
    });

    return res
      .status(201)
      .json({ message: "Requisição cadastrada com sucesso.", request });
  } catch (error) {
    console.error("Erro ao criar Requisição:", error);
    return res.status(500).json({ error: "Erro ao criar a Requisição." });
  }
};

export const getRequest = async (req, res) => {
  const { type } = req.query; // Filtro por type (ex: 'anteposicao')
  const coordinatorId = req.user.id; // ID do coordenador logado

  try {
    // Buscar todos os cursos onde o usuário é coordenador
    const coordinatorCourses = await db.Course.findAll({
      where: { coordinatorId: coordinatorId },
      attributes: ["name"],
    });

    // Extrair os nomes dos cursos do coordenador
    const courseNames = coordinatorCourses.map((course) => course.name);

    // Se não houver cursos associados ao coordenador, retornar vazio
    if (!courseNames.length) {
      return res.status(200).json({ requests: [] });
    }

    const whereClause = {
      course: { [db.Sequelize.Op.in]: courseNames }, // Filtra pelo nome do curso
      ...(type && { type }),
    };

    const requests = await db.ClassChangeRequest.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "professor",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const enhancedRequests = await Promise.all(
      requests.map(async (request) => {
        const plainRequest = request.get({ plain: true });

        const classDetail = await db.ClassScheduleDetail.findOne({
          where: {
            userId: plainRequest.userId,
          },
          include: [
            {
              model: db.ClassSchedule,
              as: "schedule",
              include: [
                { model: db.Class, as: "class", attributes: ["semester"] },
                {
                  model: db.Course,
                  as: "course",
                  attributes: ["acronym"],
                  where: { name: plainRequest.course },
                },
              ],
            },
            {
              model: db.Discipline,
              as: "discipline",
              where: { name: plainRequest.discipline },
            },
          ],
        });

        let acronym = "N/A";
        let semester = "N/A";

        if (classDetail) {
          acronym = classDetail.schedule.course.acronym || "N/A";
          semester = classDetail.schedule.class.semester || "N/A";
        }

        return {
          ...plainRequest,
          acronym,
          semester,
        };
      })
    );

    return res.status(200).json({ requests: enhancedRequests });
  } catch (error) {
    console.error("Erro ao listar requisições:", error);
    return res
      .status(500)
      .json({ error: "Erro ao listar requisições.", details: error.message });
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
        {
          model: db.User,
          as: "professor",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: "Requisição não encontrada." });
    }

    const classDetail = await db.ClassScheduleDetail.findOne({
      where: {
        userId: request.userId,
      },
      include: [
        {
          model: db.ClassSchedule,
          as: "schedule",
          include: [
            { model: db.Class, as: "class", attributes: ["semester"] },
            {
              model: db.Course,
              as: "course",
              attributes: ["acronym"],
              where: { name: request.course },
            },
          ],
        },
        {
          model: db.Discipline,
          as: "discipline",
          where: { name: request.discipline },
        },
      ],
    });

    let semester = "N/A";
    let acronym = "N/A";
    let disciplineName = request.discipline;

    if (classDetail) {
      semester = classDetail.schedule.class.semester;
      acronym = classDetail.schedule.course.acronym;
    }

    const response = {
      ...request.get({ plain: true }),
      acronym,
      semester,
      discipline: disciplineName,
    };

    return res.json({ request: response });
  } catch (error) {
    console.error("Erro ao buscar a Requisição:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar a Requisição.", details: error.message });
  }
};

export const updateRequest = async (req, res) => {
  const id = Number(req.params.id);
  const {
    userId,
    course,
    discipline,
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
      return res
        .status(400)
        .json({ error: "A quantidade deve ser maior que 0." });
    }

    if (Number(newQuantity) > 4) {
      return res
        .status(400)
        .json({ error: "O limite máximo de aulas por dia é 4." });
    } // --- DEBUG: INÍCIO ---

    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(newDate).setHours(0, 0, 0, 0);

    console.log("--- DEBUG DE DATA ---");
    console.log("Data recebida (newDate):", newDate);
    console.log("Data atual (UTC meia-noite):", new Date(today));
    console.log("Data selecionada (UTC meia-noite):", new Date(selectedDate));
    console.log("Timestamp da data atual:", today);
    console.log("Timestamp da data selecionada:", selectedDate); // --- DEBUG: FIM ---
    if (selectedDate < today) {
      return res
        .status(400)
        .json({ error: "A data não pode ser anterior à data atual." });
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

    const annexFiles = req.files?.map((file) => file.path) || []; // Corrigido: usa req.files
    const annex =
      annexFiles.length > 0
        ? JSON.stringify(annexFiles)
        : request.annex; // Corrigido: salva como JSON

    if (req.file && request.annex && fs.existsSync("public" + request.annex)) {
      fs.unlinkSync("public" + request.annex);
    }

    await request.update({
      userId: newUserId,
      course: newCourse,
      discipline,
      type: newType,
      quantity: newQuantity,
      date: newDate,
      annex,
      observation,
      validated: validated ?? request.validated,
      observationCoordinator,
    });

    return res
      .status(200)
      .json({ message: "Requisição atualizada com sucesso.", request });
  } catch (error) {
    console.error("Erro ao atualizar a requisição:", error);
    return res.status(500).json({
      error: "Erro ao atualizar a requisição.",
      details: error.message,
    });
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

    return res
      .status(200)
      .json({ message: "Requisição excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir a requisição:", error);
    return res
      .status(500)
      .json({ error: "Erro ao excluir a requisição.", details: error.message });
  }
};

export const getProfessorScheduleDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const scheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { userId },
      include: [
        {
          model: db.ClassSchedule,
          as: "schedule",
          include: [
            {
              model: db.Course,
              as: "course",
              attributes: ["id", "name", "acronym"],
            },
            { model: db.Class, as: "class", attributes: ["id", "semester"] },
          ],
        },
        { model: db.Discipline, as: "discipline", attributes: ["id", "name"] },
        { model: db.Hour, as: "hour", attributes: ["id", "hourStart"] },
        { model: db.User, as: "professor", attributes: ["id", "username"] },
      ],
      order: [["hourId", "ASC"]],
    });

    const filtered = scheduleDetails.filter(
      (detail, index, self) =>
        !self.some(
          (other, otherIndex) =>
            otherIndex < index &&
            other.dayOfWeek === detail.dayOfWeek &&
            other.disciplineId === detail.disciplineId &&
            other.schedule.classId === detail.schedule.classId &&
            Math.abs(other.hourId - detail.hourId) === 1
        )
    );

    // Para cada disciplina, buscar as datas de falta
    const cleanResult = await Promise.all(filtered.map(async (d) => {
      // Busca todos os detalhes de horário dessa disciplina para o professor
      const details = await db.ClassScheduleDetail.findAll({
        where: {
          userId: d.userId,
          disciplineId: d.disciplineId,
        },
        attributes: ["id"],
      });
      const detailIds = details.map(det => det.id);
      let absenceDates = [];
      if (detailIds.length > 0) {
        const attendances = await db.Attendance.findAll({
          where: {
            classScheduleDetailId: detailIds,
            status: "falta",
          },
          attributes: ["date"],
          order: [["date", "ASC"]],
          group: ["date"],
        });
        absenceDates = attendances.map(a => a.date);
      }
      return absenceDates.length > 0 ? {
        day: d.dayOfWeek,
        discipline: d.discipline.name,
        professor: d.professor.username,
        course: d.schedule.course.name,
        acronym: d.schedule.course.acronym,
        semester: d.schedule.class.semester,
        absenceDates,
      } : null;
    }));

    // Filtra apenas disciplinas com falta
    const filteredResult = cleanResult.filter(item => item !== null);

    const seen = new Set();
    const uniqueResult = filteredResult.filter((item) => {
      const key = `${item.discipline}|${item.professor}|${item.course}|${item.semester}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.status(200).json({ scheduleDetails: uniqueResult });
  } catch (error) {
    console.error("Erro ao buscar os detalhes da grade do professor:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar os detalhes da grade." });
  }
};

export const getProfessorScheduleDetailsAnteposition = async (req, res) => {
  try {
    const userId = req.user.id;

    const scheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { userId },
      include: [
        {
          model: db.ClassSchedule,
          as: "schedule",
          include: [
            {
              model: db.Course,
              as: "course",
              attributes: ["id", "name", "acronym"],
            },
            { model: db.Class, as: "class", attributes: ["id", "semester"] },
          ],
        },
        { model: db.Discipline, as: "discipline", attributes: ["id", "name"] },
        { model: db.Hour, as: "hour", attributes: ["id", "hourStart"] },
        { model: db.User, as: "professor", attributes: ["id", "username"] },
      ],
      order: [["hourId", "ASC"]],
    });

    const filtered = scheduleDetails.filter(
      (detail, index, self) =>
        !self.some(
          (other, otherIndex) =>
            otherIndex < index &&
            other.dayOfWeek === detail.dayOfWeek &&
            other.disciplineId === detail.disciplineId &&
            other.schedule.classId === detail.schedule.classId &&
            Math.abs(other.hourId - detail.hourId) === 1
        )
    );

    const cleanResult = filtered.map((d) => ({
      day: d.dayOfWeek,
      discipline: d.discipline.name,
      professor: d.professor.username,
      course: d.schedule.course.name,
      acronym: d.schedule.course.acronym,
      semester: d.schedule.class.semester,
    }));

    const seen = new Set();
    const uniqueResult = cleanResult.filter((item) => {
      const key = `${item.discipline}|${item.professor}|${item.course}|${item.semester}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.status(200).json({ scheduleDetails: uniqueResult });
  } catch (error) {
    console.error("Erro ao buscar os detalhes da grade do professor:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar os detalhes da grade." });
  }
};

export const approveAnteposition = async (req, res) => {
  const requestId = req.params.id; // Corrigido: ler ID de params, não body

  try {
    const request = await db.ClassChangeRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (request.validated === 1) {
      return res
        .status(400)
        .json({ error: "Esta anteposição já foi validada." });
    }

    if (request.type === "anteposicao") {
      const professor = await db.User.findByPk(request.userId);
      if (professor) {
        professor.absenceCredits += Number(request.quantity) || 1;
        await professor.save();
      }
    }

    request.validated = 1;
    await request.save();

    return res.status(200).json({
      message: "Anteposição aprovada e créditos concedidos ao professor.",
    });
  } catch (err) {
    console.error("Erro ao aprovar anteposição:", err);
    return res
      .status(500)
      .json({ error: "Erro ao aprovar anteposição.", details: err.message });
  }
};

export const approveReposition = async (req, res) => {
  const requestId = req.params.id; // Corrigido: ler ID de params

  try {
    const request = await db.ClassChangeRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (request.validated === 1) {
      return res.status(400).json({ error: "Esta reposição já foi validada." });
    }

    if (request.type === "reposicao") {
      const professor = await db.User.findByPk(request.userId);
      if (professor) {
        professor.absenceCredits += Number(request.quantity) || 1;
        await professor.save();
      }

      // Remover falta em Attendance
      // Buscar o ClassScheduleDetail correspondente
      const classDetail = await db.ClassScheduleDetail.findOne({
        where: {
          userId: request.userId,
        },
        include: [
          {
            model: db.Discipline,
            as: "discipline",
            where: { name: request.discipline },
          },
        ],
      });

      if (classDetail) {
        // Buscar falta na tabela Attendance
        const attendance = await db.Attendance.findOne({
          where: {
            classScheduleDetailId: classDetail.id,
            date: request.date,
            status: "falta",
          },
        });
        if (attendance) {
          // Atualiza o status da falta para "presença"
          attendance.status = "presença";
          await attendance.save();
        }
      }
    }

    request.validated = 1;
    await request.save();

    return res.status(200).json({
      message: "Reposição aprovada, créditos concedidos e falta removida.",
    });
  } catch (err) {
    console.error("Erro ao aprovar reposição:", err);
    return res
      .status(500)
      .json({ error: "Erro ao aprovar reposição.", details: err.message });
  }
};

export const negateReposition = async (req, res) => {
  const requestId = req.params.id; // Corrigido: ler ID de params
  const { observationCoordinator } = req.body; // Corrigido: ler observationCoordinator do body

  try {
    const request = await db.ClassChangeRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (request.validated === 2) {
      return res.status(400).json({ error: "Esta reposição já foi negada." });
    }


  request.validated = 2;
  request.observationCoordinator = observationCoordinator || request.observationCoordinator; // Usa o novo se enviado
  // Limpa o campo dateAbsence ao rejeitar para permitir nova solicitação
  await request.save();

    return res.status(200).json({
      message: "Reposição negada ao professor, créditos não serão adicionados.",
    });
  } catch (err) {
    console.error("Erro ao negar reposição:", err);
    return res
      .status(500)
      .json({ error: "Erro ao negar reposição.", details: err.message });
  }
};

export const negateAnteposition = async (req, res) => {
  const requestId = req.params.id; // Corrigido: ler ID de params
  const { observationCoordinator } = req.body; // Corrigido: ler observationCoordinator do body

  try {
    const request = await db.ClassChangeRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: "Solicitação não encontrada." });
    }

    if (request.validated === 2) {
      return res.status(400).json({ error: "Esta anteposição já foi negada." });
    }

    request.validated = 2;
    request.observationCoordinator =
      observationCoordinator || request.observationCoordinator; // Usa o novo se enviado
    await request.save();

    return res
      .status(200)
      .json({ message: "Anteposição negada ao professor." });
  } catch (err) {
    console.error("Erro ao negar anteposição:", err);
    return res
      .status(500)
      .json({ error: "Erro ao negar anteposição.", details: err.message });
  }
};

export const getRequestsByProfessor = async (req, res) => {
  const { userId, type } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "O userId é obrigatório." });
  }

  try {
    const whereClause = { userId };
    if (type) {
      whereClause.type = type;
    }

    const requests = await db.ClassChangeRequest.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "professor",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const enhancedRequests = await Promise.all(
      requests.map(async (request) => {
        const plainRequest = request.get({ plain: true });

        const classDetail = await db.ClassScheduleDetail.findOne({
          where: {
            userId: plainRequest.userId,
          },
          include: [
            {
              model: db.ClassSchedule,
              as: "schedule",
              include: [
                { model: db.Class, as: "class", attributes: ["semester"] },
                {
                  model: db.Course,
                  as: "course",
                  attributes: ["acronym"],
                  where: { name: plainRequest.course },
                },
              ],
            },
            {
              model: db.Discipline,
              as: "discipline",
              where: { name: plainRequest.discipline },
            },
          ],
        });

        let acronym = "N/A";
        let semester = "N/A";

        if (classDetail) {
          acronym = classDetail.schedule.course.acronym || "N/A";
          semester = classDetail.schedule.class.semester || "N/A";
        }

        return {
          ...plainRequest,
          acronym,
          semester,
        };
      })
    );

    return res.status(200).json({ requests: enhancedRequests });
  } catch (error) {
    console.error("Erro ao listar requisições do professor:", error);
    return res
      .status(500)
      .json({ error: "Erro ao listar requisições.", details: error.message });
  }
};

export const getOwnRequests = async (req, res) => {
  const { type } = req.query;
  const userId = req.user.id;

  try {
    const whereClause = { userId };
    if (type) {
      whereClause.type = type;
    }

    const requests = await db.ClassChangeRequest.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "professor",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const enhancedRequests = await Promise.all(
      requests.map(async (request) => {
        const plainRequest = request.get({ plain: true });

        const classDetail = await db.ClassScheduleDetail.findOne({
          where: {
            userId: plainRequest.userId,
          },
          include: [
            {
              model: db.ClassSchedule,
              as: "schedule",
              include: [
                { model: db.Class, as: "class", attributes: ["semester"] },
                {
                  model: db.Course,
                  as: "course",
                  attributes: ["acronym"],
                  where: { name: plainRequest.course },
                },
              ],
            },
            {
              model: db.Discipline,
              as: "discipline",
              where: { name: plainRequest.discipline },
            },
          ],
        });

        let acronym = "N/A";
        let semester = "N/A";

        if (classDetail) {
          acronym = classDetail.schedule.course.acronym || "N/A";
          semester = classDetail.schedule.class.semester || "N/A";
        }

        return {
          ...plainRequest,
          acronym,
          semester,
        };
      })
    );

    return res.status(200).json({ requests: enhancedRequests });
  } catch (error) {
    console.error("Erro ao listar requisições do professor:", error);
    return res
      .status(500)
      .json({ error: "Erro ao listar requisições.", details: error.message });
  }
};