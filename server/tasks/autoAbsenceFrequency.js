import db from "../models/index.js";

const diasSemana = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const hoje = new Date();
const diaSemanaAtual = diasSemana[hoje.getDay()];

export async function autoAbsenceFrequency() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  // Verifica se hoje é feriado
  const isHoliday = await db.Holiday.findOne({ where: { date: dateStr } });
  if (isHoliday) {
    console.log("Hoje é feriado, não será registrada falta automática.");
    return;
  }

  // Busca todos os detalhes de horários de aula do dia
  const classDetails = await db.ClassScheduleDetail.findAll({
    where: { dayOfWeek: diaSemanaAtual },
    include: [
      { model: db.ClassSchedule, as: "schedule", include: [{ model: db.Course, as: "course" }] },
      { model: db.Discipline, as: "discipline" },
      { model: db.User, as: "professor" },
      { model: db.Hour, as: "hour" }
    ]
  });

  // Agrupa detalhes por professor
  const detailsByProfessor = {};
  for (const detail of classDetails) {
    const userId = detail.professor?.id;
    if (!detailsByProfessor[userId]) detailsByProfessor[userId] = [];
    detailsByProfessor[userId].push(detail);
  }

  for (const [userId, details] of Object.entries(detailsByProfessor)) {
    const professor = await db.User.findByPk(userId);
    let credits = professor?.absenceCredits || 0;

    for (const detail of details) {
      const courseId = detail.schedule?.course?.id;
      const disciplineId = detail.discipline?.id;
      const time = detail.hour?.hourStart;

      // Verifica se já existe frequência registrada para esse professor, curso, disciplina, data e horário
      const frequency = await db.Frequency.findOne({
        where: {
          userId,
          courseId,
          disciplineId,
          date: dateStr,
          time,
        }
      });

      if (!frequency) {
        if (credits > 0) {
          credits -= 1;
          continue; // Não registra falta, consome crédito
        }
        // Cria registro de falta
        await db.Frequency.create({
          userId,
          courseId,
          disciplineId,
          date: dateStr,
          time,
          latitude: null,
          longitude: null,
          isAbsence: true,
        });
      }
    }

    // Atualiza créditos do professor se foram consumidos
    if (professor && professor.absenceCredits !== credits) {
      professor.absenceCredits = credits;
      await professor.save();
    }
  }
}