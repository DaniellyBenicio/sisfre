import db from "../../models/index.js";

export const createSchoolSaturday = async (req, res) => {
  try {
    const { date, dayOfWeek, calendarId } = req.body;
    if (!calendarId) {
      return res.status(400).json({ error: "O ID do calendário é obrigatório." });
    }
    if (!dayOfWeek) {
      return res.status(400).json({ error: "O dia da semana é obrigatório." });
    }
    if (!["segunda", "terca", "quarta", "quinta", "sexta"].includes(dayOfWeek)) {
      return res.status(400).json({
        error: 'O dia da semana deve ser "segunda", "terca", "quarta", "quinta" ou "sexta".',
      });
    }

    const dateParts = date.split('-');
    if (dateParts.length !== 3 || dateParts.some(part => isNaN(Number(part)))) {
      return res.status(400).json({ error: "Formato de data inválido. Use YYYY-MM-DD." });
    }

    const [year, month, day] = dateParts.map(Number);
    const inputDate = new Date(year, month - 1, day);
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({ error: "A data fornecida é inválida." });
    }
    if (inputDate.getDay() !== 6) {
      return res.status(400).json({ error: "A data informada deve ser um sábado." });
    }

    const calendar = await db.Calendar.findByPk(calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendário não encontrado." });
    }

    const calendarStartDate = new Date(calendar.startDate);
    const calendarEndDate = new Date(calendar.endDate);
    if (inputDate < calendarStartDate || inputDate > calendarEndDate) {
      return res.status(400).json({
        error: "A data do sábado letivo deve estar dentro do intervalo do calendário.",
      });
    }

    const existingSchoolSaturday = await db.SchoolSaturday.findOne({
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          where: { id: calendarId },
          through: { attributes: [] },
        },
      ],
      where: { date },
    });

    if (existingSchoolSaturday) {
      return res.status(400).json({
        error: "Já existe um sábado letivo com esta data para o calendário informado.",
      });
    }

    const schoolSaturday = await db.SchoolSaturday.create({
      date,
      dayOfWeek,
    });

    await schoolSaturday.addCalendarSaturdays(calendar);

    return res.status(201).json({
      message: "Sábado letivo criado e associado ao calendário com sucesso.",
      schoolSaturday,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ error: messages.join(" ") });
    }
    return res.status(500).json({ error: "Erro ao criar sábado letivo." });
  }
};

export const updateSchoolSaturday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, dayOfWeek, calendarId } = req.body;

    const schoolSaturday = await db.SchoolSaturday.findByPk(id);
    if (!schoolSaturday) {
      return res.status(404).json({ error: "Sábado letivo não encontrado." });
    }

    if (date) {
      const dateParts = date.split('-');
      if (dateParts.length !== 3 || dateParts.some(part => isNaN(Number(part)))) {
        return res.status(400).json({ error: "Formato de data inválido. Use YYYY-MM-DD." });
      }

      const [year, month, day] = dateParts.map(Number);
      const inputDate = new Date(year, month - 1, day);
      if (isNaN(inputDate.getTime())) {
        return res.status(400).json({ error: "A data fornecida é inválida." });
      }
      if (inputDate.getDay() !== 6) {
        return res.status(400).json({ error: "A data informada deve ser um sábado." });
      }

      const calendar = await db.Calendar.findByPk(calendarId || schoolSaturday.calendarId);
      if (!calendar) {
        return res.status(404).json({ error: "Calendário não encontrado." });
      }
      const calendarStartDate = new Date(calendar.startDate);
      const calendarEndDate = new Date(calendar.endDate);
      if (inputDate < calendarStartDate || inputDate > calendarEndDate) {
        return res.status(400).json({
          error: "A data do sábado letivo deve estar dentro do intervalo do calendário.",
        });
      }

      const existingSchoolSaturday = await db.SchoolSaturday.findOne({
        include: [
          {
            model: db.Calendar,
            as: "calendarSaturdays",
            where: { id: calendarId || schoolSaturday.calendarId },
            through: { attributes: [] },
          },
        ],
        where: { date, id: { [db.Sequelize.Op.ne]: id } },
      });

      if (existingSchoolSaturday) {
        return res.status(400).json({
          error: "Já existe um sábado letivo com esta data para o calendário informado.",
        });
      }
    }

    if (dayOfWeek) {
      if (!["segunda", "terca", "quarta", "quinta", "sexta"].includes(dayOfWeek)) {
        return res.status(400).json({
          error: 'O dia da semana deve ser "segunda", "terca", "quarta", "quinta" ou "sexta".',
        });
      }
    }

    if (calendarId) {
      const calendar = await db.Calendar.findByPk(calendarId);
      if (!calendar) {
        return res.status(404).json({ error: "Calendário não encontrado." });
      }
    }

    await schoolSaturday.update({
      date: date || schoolSaturday.date,
      dayOfWeek: dayOfWeek || schoolSaturday.dayOfWeek,
    });

    if (calendarId) {
      await schoolSaturday.setCalendarSaturdays([calendarId]);
    }

    return res.status(200).json({
      message: "Sábado letivo atualizado com sucesso.",
      schoolSaturday,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ error: messages.join(" ") });
    }
    return res.status(500).json({ error: "Erro ao atualizar sábado letivo." });
  }
};

export const listAllSchoolSaturdays = async (req, res) => {
  try {
    const schoolSaturdays = await db.SchoolSaturday.findAll({
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          through: { attributes: [] },
          attributes: ['id', 'year', 'period', 'type'],
        },
      ],
      order: [['date', 'ASC']],
    });

    return res.status(200).json({
      message: "Sábados letivos listados com sucesso.",
      schoolSaturdays,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar sábados letivos." });
  }
};

export const filterSchoolSaturdays = async (req, res) => {
  try {
    const { calendarId, year, dayOfWeek } = req.query;
    const where = {};

    if (year) {
      if (isNaN(year) || year < 2000 || year > 2100) {
        return res.status(400).json({ error: "O ano deve ser um número válido entre 2000 e 2100." });
      }
      where.date = {
        [db.Sequelize.Op.gte]: `${year}-01-01`,
        [db.Sequelize.Op.lte]: `${year}-12-31`,
      };
    }
    if (dayOfWeek) {
      if (!["segunda", "terca", "quarta", "quinta", "sexta"].includes(dayOfWeek)) {
        return res.status(400).json({
          error: 'O dia da semana deve ser "segunda", "terca", "quarta", "quinta" ou "sexta".',
        });
      }
      where.dayOfWeek = dayOfWeek;
    }

    const schoolSaturdays = await db.SchoolSaturday.findAll({
      where,
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          where: calendarId ? { id: calendarId } : {},
          through: { attributes: [] },
          attributes: ['id', 'year', 'period', 'type'],
        },
      ],
      order: [['date', 'ASC']],
    });

    return res.status(200).json({
      message: "Sábados letivos filtrados com sucesso.",
      schoolSaturdays,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao filtrar sábados letivos." });
  }
};

export const getSchoolSaturdayById = async (req, res) => {
  try {
    const { id } = req.params;

    const schoolSaturday = await db.SchoolSaturday.findByPk(id, {
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          through: { attributes: [] },
          attributes: ['id', 'year', 'period', 'type'],
        },
      ],
    });

    if (!schoolSaturday) {
      return res.status(404).json({ error: "Sábado letivo não encontrado." });
    }

    return res.status(200).json({
      message: "Sábado letivo encontrado com sucesso.",
      schoolSaturday,
    });
  } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar sábado letivo." });  }
};
export const deleteSchoolSaturday = async (req, res) => {
  try {
    const { id } = req.params;

    const schoolSaturday = await db.SchoolSaturday.findByPk(id);
    if (!schoolSaturday) {
      return res.status(404).json({ error: "Sábado letivo não encontrado." });
    }

    await schoolSaturday.setCalendarSaturdays([]);

    await schoolSaturday.destroy();

    return res.status(200).json({
      message: "Sábado letivo excluído com sucesso.",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};