import { Op } from "sequelize";
import db from "../models/index.js";
import {
  getDayOfWeek,
  turnIntervals,
} from "../controllers/teacher/AttendanceController.js";

export async function autoAbsenceAttendance(turno) {
  const transaction = await db.sequelize.transaction();
  try {
    const hoje = new Date().toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo",
    });
    const dateStr = hoje.split("T")[0];
    const diaSemanaAtual = getDayOfWeek(new Date(hoje));

    const isHoliday = await db.Holiday.findOne({
      where: { date: dateStr },
      transaction,
    });
    if (isHoliday) {
      console.log(
        `Hoje é feriado (${isHoliday.name} - ${isHoliday.type}). Nenhuma falta será registrada.`
      );
      await transaction.commit();
      return {
        success: false,
        message: `Hoje é feriado (${isHoliday.name} - ${isHoliday.type})`,
      };
    }

    const calendar = await db.Calendar.findOne({
      where: {
        startDate: { [Op.lte]: dateStr },
        endDate: { [Op.gte]: dateStr },
      },
      transaction,
    });
    if (!calendar) {
      console.log(
        "Nenhum calendário ativo encontrado para hoje. Nenhuma falta será registrada."
      );
      await transaction.commit();
      return {
        success: false,
        message: "Nenhum calendário ativo encontrado para hoje",
      };
    }

    const validTurns = ["MATUTINO", "VESPERTINO", "NOTURNO"];
    const turnoToProcess = turno?.toUpperCase();
    if (!validTurns.includes(turnoToProcess)) {
      console.log("Turno inválido. Use MATUTINO, VESPERTINO ou NOTURNO.");
      await transaction.commit();
      return { success: false, message: "Turno inválido" };
    }

    const turnInterval = turnIntervals[turnoToProcess];
    const [startHours, startMinutes, startSeconds] = turnInterval.start
      .split(":")
      .map(Number);
    const [endHours, endMinutes, endSeconds] = turnInterval.end
      .split(":")
      .map(Number);
    const totalStartSeconds =
      startHours * 3600 + startMinutes * 60 + startSeconds;
    const totalEndSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    const schoolSaturday = await db.SchoolSaturday.findOne({
      where: { date: dateStr },
      include: [
        {
          model: db.Calendar,
          as: "calendarSaturdays",
          through: { attributes: [] },
        },
      ],
      transaction,
    });
    let dayOfWeek = diaSemanaAtual;
    if (schoolSaturday) {
      const dayOfWeekMap = {
        segunda: "Segunda",
        terca: "Terça",
        quarta: "Quarta",
        quinta: "Quinta",
        sexta: "Sexta",
      };
      dayOfWeek = dayOfWeekMap[schoolSaturday.dayOfWeek.toLowerCase()];
      if (!dayOfWeek) {
        await transaction.commit();
        return {
          success: false,
          message: "Dia da semana inválido no sábado letivo",
        };
      }
    }

    const classDetails = await db.ClassScheduleDetail.findAll({
      where: { dayOfWeek },
      include: [
        {
          model: db.User,
          as: "professor",
        },
        {
          model: db.ClassSchedule,
          as: "schedule",
          where: { calendarId: calendar.id, isActive: true },
        },
        {
          model: db.Hour,
          as: "hour",
        },
      ],
      transaction,
    });

    console.log(`Aulas encontradas para ${dayOfWeek}: ${classDetails.length}`);

    let faltasRegistradas = 0;
    for (const detail of classDetails) {
      const classScheduleDetailId = detail.id;
      const userId = detail.professor?.id;
      const { hourStart, hourEnd } = detail.hour;

      if (!userId) {
        console.log(
          `Aula ${classScheduleDetailId} não tem professor associado. Pulando.`
        );
        continue;
      }

      const [startH, startM, startS = 0] = hourStart.split(":").map(Number);
      const [endH, endM, endS = 0] = hourEnd.split(":").map(Number);
      const classStartSeconds = startH * 3600 + startM * 60 + startS;
      const classEndSeconds = endH * 3600 + endM * 60 + endS;

      const isWithinTurn =
        classStartSeconds >= totalStartSeconds &&
        classEndSeconds <= totalEndSeconds;
      if (!isWithinTurn) {
        console.log(
          `Aula ${classScheduleDetailId} fora do turno ${turnoToProcess} (${hourStart}-${hourEnd}). Pulando.`
        );
        continue;
      }

      const attendance = await db.Attendance.findOne({
        where: {
          classScheduleDetailId,
          date: dateStr,
        },
        transaction,
      });

      if (!attendance) {
        await db.Attendance.create(
          {
            classScheduleDetailId,
            date: dateStr,
            status: "falta",
            justification: null,
            registeredBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction }
        );
        console.log(
          `Falta automática registrada para professor ${userId} em ${dateStr} (${turnoToProcess}, aula ${hourStart}-${hourEnd})`
        );
        faltasRegistradas++;
      } else {
        console.log(
          `Frequência já registrada para aula ${classScheduleDetailId} em ${dateStr}. Pulando.`
        );
      }
    }

    await transaction.commit();
    return {
      success: true,
      message: `Processamento concluído. ${faltasRegistradas} faltas registradas para o turno ${turnoToProcess} em ${dateStr}.`,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Erro ao processar faltas automáticas:", error);
    throw new Error(`Erro ao processar faltas automáticas: ${error.message}`);
  }
}
