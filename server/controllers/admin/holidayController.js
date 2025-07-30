import db from "../../models/index.js";

//alterar type para caso seja necessário validar
//mas por hora caso não seja informado, será NACIONAL por padrão
//ver com jamires
export const createHoliday = async (req, res) => {
  const { name, date, type = "NACIONAL" } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: "Nome e data são obrigatórios." });
  }

  if (typeof name !== "string" || name.trim().length < 3) {
    return res.status(400).json({ error: "Nome do feriado deve ter pelo menos 3 caracteres." });
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return res.status(400).json({ error: "Data inválida." });
  }

  const currentYear = new Date().getFullYear();
  const holidayYear = dateObj.getFullYear();
  if (holidayYear < currentYear) {
    return res.status(406).json({ error: `Não é permitido cadastrar feriado para ano anterior a ${currentYear}.` });
  }

  const validTypes = ["NACIONAL", "ESTADUAL", "MUNICIPAL", "INSTITUCIONAL"];
  if (type && !validTypes.includes(type.toUpperCase())) {
    return res.status(400).json({ error: "Tipo de feriado inválido. Use NACIONAL, ESTADUAL, MUNICIPAL ou INSTITUCIONAL." });
  }

  const sameDate = await db.Holiday.findOne({ where: { date } });
  if (sameDate) {
    return res.status(400).json({ error: "Já existe um feriado cadastrado nesta data." });
  }

  const existing = await db.Holiday.findOne({ where: { name, date } });
  if (existing) {
    return res.status(400).json({ error: "Feriado já cadastrado para esta data." });
  }

  try {
    const holiday = await db.Holiday.create({
      name: name.trim(),
      date: dateObj.toISOString().split("T")[0],
      type: type.toUpperCase(),
    });
    res.status(201).json({ message: "Feriado cadastrado com sucesso.", holiday });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar feriado." });
  }
};

export const getHolidays = async (req, res) => {
  const { year, type } = req.query;
  const where = {};
  if (year) {
    where.date = {
      [db.Sequelize.Op.gte]: `${year}-01-01`,
      [db.Sequelize.Op.lte]: `${year}-12-31`,
    };
  }
  if (type) {
    where.type = type.toUpperCase();
  }
  try {
    const holidays = await db.Holiday.findAll({
      where,
      order: [["date", "ASC"]],
    });
    res.json({ holidays });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar feriados." });
  }
};

export const getHolidayById = async (req, res) => {
  const { id } = req.params;
  try {
    const holiday = await db.Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({ error: "Feriado não encontrado." });
    }
    res.json({ holiday });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar feriado." });
  }
};

export const updateHoliday = async (req, res) => {
  const { id } = req.params;
  const { name, date, type } = req.body;
  try {
    const holiday = await db.Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({ error: "Feriado não encontrado." });
    }
    if (name) holiday.name = name;
    if (date) holiday.date = date;
    if (type) holiday.type = type;
    await holiday.save();
    res.json({ message: "Feriado atualizado com sucesso.", holiday });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar feriado." });
  }
};

export const deleteHoliday = async (req, res) => {
  const { id } = req.params;
  try {
    const holiday = await db.Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({ error: "Feriado não encontrado." });
    }
    await holiday.destroy();
    res.json({ message: "Feriado excluído com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir feriado." });
  }
};