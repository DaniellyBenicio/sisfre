import db from "../models/index.js";

const diasSemana = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export async function autoAbsenceAttendance(turno) {
  if (!turno) {
    turno = getTurnoAtual();
    if (!turno) {
      console.log("Turno não foi identificado. Nenhuma falta será registrada.");
      return;
    }
  }

  const hoje = new Date();
  const dateStr = hoje.toISOString().split("T")[0];
  const diaSemanaAtual = diasSemana[hoje.getDay()];

  const isHoliday = await db.Holiday.findOne({ where: { date: dateStr } });
  if (isHoliday) {
    console.log("Hoje é feriado, não será registrada falta automática.");
    return;
  }

  // Busca todos os detalhes de horários de aula do dia e do turno
  const classDetails = await db.ClassScheduleDetail.findAll({
    where: { dayOfWeek: diaSemanaAtual, turn: turno },
    include: [
      { model: db.User, as: "professor" }
    ]
  });

  for (const detail of classDetails) {
    const classScheduleDetailId = detail.id;
    const userId = detail.professor?.id;

    // Verifica se já existe presença registrada para esse professor, aula e data
    const attendance = await db.Attendance.findOne({
      where: {
        classScheduleDetailId,
        date: dateStr,
      }
    });

    if (!attendance) {
      await db.Attendance.create({
        classScheduleDetailId,
        date: dateStr,
        attended: false,
        registeredBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Falta automática registrada para professor ${userId} em ${dateStr} (${turno})`);
    }
  }
}

function getTurnoAtual() {
  const agora = new Date();
  const hora = agora.getHours();
  const minuto = agora.getMinutes();
  const horario = `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`;

  if (horario >= "07:00" && horario <= "11:59") return "MATUTINO";
  if (horario >= "12:59" && horario <= "17:39") return "VESPERTINO";
  if (horario >= "18:20" && horario <= "23:59") return "NOTURNO";
  if (horario >= "07:00" && horario <= "17:59") return "INTEGRADO";
  return null;
}