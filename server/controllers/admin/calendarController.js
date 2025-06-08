import db from "../../models/index.js";

export const createCalendar = async (req, res) => {
  const { type, year, period, startDate, endDate } = req.body;

  if (!type || !year || !period || !startDate || !endDate) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDateObj = new Date(startDate);
  startDateObj.setHours(0, 0, 0, 0);

  if (startDateObj < today) {
    return res.status(400).json({
      error: "A data de início não pode ser anterior à data atual.",
    });
  }

  try {
    const existing = await db.Calendar.findOne({
      where: { type: type.toUpperCase(), year, period, startDate, endDate },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Já existe um calendário com esses dados exatos." });
    }

    const duplicate = await db.Calendar.findOne({
      where: { type: type.toUpperCase(), year, period },
    });
    if (duplicate) {
      return res.status(400).json({
        error:
          "Já existe um calendário com esses dados informados. Por favor, tente novamente.",
      });
    }

    const calendar = await db.Calendar.create({
      type: type.toUpperCase(),
      year,
      period,
      startDate,
      endDate,
    });

    return res.status(201).json({
      message: "Calendário cadastrado com sucesso.",
      calendar,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ error: messages.join(" ") });
    }
    return res.status(500).json({ error: "Erro ao cadastrar calendário." });
  }
};

export const updateCalendar = async (req, res) => {
  const calendarId = req.params.id;
  const { type, year, period, startDate, endDate } = req.body;

  if (!type || !year || !period || !startDate || !endDate) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDateObj = new Date(startDate);
  startDateObj.setHours(0, 0, 0, 0);

  if (startDateObj < today) {
    return res.status(400).json({
      error: "A data de início não pode ser anterior à data atual.",
    });
  }

  try {
    const calendar = await db.Calendar.findByPk(calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendário não encontrado." });
    }

    const duplicate = await db.Calendar.findOne({
      where: {
        type: type.toUpperCase(),
        year,
        period,
        id: { [db.Sequelize.Op.ne]: calendarId },
      },
    });
    if (duplicate) {
      return res.status(400).json({
        error:
          "Já existe um calendário com esses dados informados. Por favor, tente novamente.",
      });
    }

    const existing = await db.Calendar.findOne({
      where: {
        type: type.toUpperCase(),
        year,
        period,
        startDate,
        endDate,
        id: { [db.Sequelize.Op.ne]: calendarId },
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Já existe um calendário com esses dados exatos." });
    }

    calendar.type = type.toUpperCase();
    calendar.year = year;
    calendar.period = period;
    calendar.startDate = startDate;
    calendar.endDate = endDate;
    await calendar.save();

    return res.status(200).json({
      message: "Calendário atualizado com sucesso.",
      calendar,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ error: messages.join(" ") });
    }
    return res.status(500).json({ error: "Erro ao atualizar calendário." });
  }
};

export const getCalendarTypes = async (req, res) => {
  try {
    const types = await db.Calendar.findAll({
      attributes: [
        [db.Sequelize.fn("DISTINCT", db.Sequelize.col("type")), "type"],
      ],
    });
    return res.status(200).json({
      types: types.map((t) => t.type),
    });
  } catch (error) {
    console.error("Erro ao buscar tipos de calendário:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar tipos de calendário." });
  }
};

export const listCalendars = async (req, res) => {
  try {
    const { type, year } = req.query;
    const where = {};
    if (type) where.type = type.toUpperCase();
    if (year) {
      where.startDate = {
        [db.Sequelize.Op.gte]: `${year}-01-01`,
        [db.Sequelize.Op.lte]: `${year}-12-31`,
      };
    }

    const calendars = await db.Calendar.findAll({
      where,
      order: [
        ["startDate", "DESC"],
        ["period", "DESC"],
      ],
    });
    return res.status(200).json({ calendars });
  } catch (error) {
    console.error("Erro ao listar calendários:", error);
    return res.status(500).json({ error: "Erro ao listar calendários." });
  }
};

export const deleteCalendar = async (req, res) => {
  const calendarId = req.params.id;
  try {
    const calendar = await db.Calendar.findByPk(calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendário não encontrado." });
    }
    await calendar.destroy();
    return res
      .status(200)
      .json({ message: "Calendário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir calendário:", error);
    return res.status(500).json({ error: "Erro ao excluir calendário." });
  }
};
