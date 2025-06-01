import db from '../../models/index.js';

export const createCalendar = async (req, res) => {
  const { type, year, period, startDate, endDate } = req.body;

  if (!type || !year || !period || !startDate || !endDate) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const existing = await db.Calendar.findOne({
      where: { type: type.toUpperCase(), year, period },
    });
    if (existing) {
      return res.status(400).json({ error: "Já existe um calendário com esses dados." });
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
      return res.status(400).json({ error: "Já existe um calendário com esses dados." });
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
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('type')), 'type']],
    });
    return res.status(200).json({
      types: types.map((t) => t.type),
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de calendário:', error);
    return res.status(500).json({ error: 'Erro ao buscar tipos de calendário.' });
  }
};

export const listCalendars = async (req, res) => {
  try {
    const calendars = await db.Calendar.findAll({
      order: [['year', 'DESC'], ['period', 'DESC']],
    });
    return res.status(200).json({ calendars });
  } catch (error) {
    console.error('Erro ao listar calendários:', error);
    return res.status(500).json({ error: 'Erro ao listar calendários.' });
  }
};