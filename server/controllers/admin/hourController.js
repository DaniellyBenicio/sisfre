import db from "../../models/index.js";
import { Op } from "sequelize";

export const getHours = async (req, res) => {
  const { turn } = req.query; 
  try {
    if (!turn) {
      return res.status(400).json({
        error: "O turno é obrigatório.",
      });
    }

    const turnIntervals = {
      MATUTINO: { start: "07:00:00", end: "11:59:59" },
      VESPERTINO: { start: "12:00:00", "end": "17:59:59" },
      NOTURNO: { start: "18:00:00", end: "23:59:59" },
    };

    if (!turnIntervals[turn]) {
      return res.status(400).json({
        error: "Turno inválido. Use: MATUTINO, VESPERTINO ou NOTURNO.",
      });
    }

    const hours = await db.Hour.findAll({
      where: {
        hourStart: { [Op.gte]: turnIntervals[turn].start },
        hourEnd: { [Op.lte]: turnIntervals[turn].end },
      },
      attributes: ["id", "hourStart", "hourEnd"],
      order: [["hourStart", "ASC"]], 
    });

    const result = hours.map((hour) => ({
      id: hour.id,
      hourStart: hour.hourStart,
      hourEnd: hour.hourEnd,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro em getHours:", error);
    return res.status(500).json({
      error: "Erro ao buscar horários",
      details: error.message,
    });
  }
};

export const getScheduleHours = async (req, res) => {
  const { classScheduleId } = req.params;
  try {
    const scheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { classScheduleId },
      include: [
        {
          model: db.Hour,
          as: "hour",
          attributes: ["id", "hourStart", "hourEnd"],
        },
      ],
    });

    const hours = scheduleDetails.map((detail) => ({
      id: detail.hour.id,
      hourStart: detail.hour.hourStart,
      hourEnd: detail.hour.hourEnd,
      dayOfWeek: detail.dayOfWeek,
    }));

    return res.status(200).json(hours);
  } catch (error) {
    console.error("Erro em getScheduleHours:", error);
    return res.status(500).json({
      error: "Erro ao buscar horários da grade",
      details: error.message,
    });
  }
};