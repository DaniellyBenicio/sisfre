import db from "../../models/index.js";

export const createSchoolSaturday = async (req, res) => {
  try {
    const { date, dayOfWeek, calendarId } = req.body;
    if (!calendarId) {
      return res
        .status(400)
        .json({ error: "O ID do calendário é obrigatório." });
    }

    if (!dayOfWeek) {
      return res
        .status(400)
        .json({ error: "O dia da semana (dayOfWeek) é obrigatório." });
    }

    if (!["segunda", "terca", "quarta", "quinta", "sexta"].includes(dayOfWeek)) {
      return res.status(400).json({
          error:
            'O dia da semana deve ser "segunda", "terca", "quarta", "quinta" ou "sexta".',
        });
    }

    const [year, month, day] = date.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day);
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({ error: "A data fornecida é inválida." });
    }
    if (inputDate.getDay() !== 6) {
      return res
        .status(400)
        .json({ error: "A data informada deve ser um sábado." });
    }

    const calendar = await db.Calendar.findByPk(calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendário não encontrado." });
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
        error:
          "Já existe um sábado letivo com esta data para o calendário informado.",
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
    return res.status(400).json({ error: error.message });
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
      const [year, month, day] = date.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      if (isNaN(inputDate.getTime())) {
        return res.status(400).json({ error: "A data fornecida é inválida." });
      }
      if (inputDate.getDay() !== 6) {
        return res
          .status(400)
          .json({ error: "A data informada deve ser um sábado." });
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
          error:
            "Já existe um sábado letivo com esta data para o calendário informado.",
        });
      }
    }

    if (dayOfWeek) {
      if (!["segunda", "terca", "quarta", "quinta", "sexta"].includes(dayOfWeek)) {
        return res.status(400).json({
          error:
            'O dia da semana deve ser "segunda", "terca", "quarta", "quinta" ou "sexta".',
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
    return res.status(400).json({ error: error.message });
  }
};

export const listSchoolSaturdays = async (req, res) => {
  try {
    const { calendarId } = req.query;

    const where = {};
    if (calendarId) {
      where.id = calendarId;
    }

    const schoolSaturdays = await db.SchoolSaturday.findAll({
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          where: calendarId ? { id: calendarId } : {},
          through: { attributes: [] },
          attributes: ['id', 'year', 'period'],
        },
      ],
    });

    return res.status(200).json({
      message: "Sábados letivos listados com sucesso.",
      schoolSaturdays,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
          attributes: ['id', 'year', 'period'],
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
    return res.status(400).json({ error: error.message });
  }
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