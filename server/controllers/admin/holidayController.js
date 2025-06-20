import db from "../../models/index.js";

//alterar type para caso seja necessário validar
//mas por hora caso não seja informado, será NACIONAL por padrão
//ver com jamires
export const createHoliday = async (req, res) => {
  const { name, date, type = "NACIONAL" } = req.body;
  if (!name || !date) {
    return res.status(400).json({ error: "Nome e data são obrigatórios." });
  }
  try {
    const existing = await db.Holiday.findOne({ where: { name, date } });
    if (existing) {
      return res.status(400).json({ error: "Feriado já cadastrado para esta data." });
    }
    const holiday = await db.Holiday.create({ name, date, type });
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