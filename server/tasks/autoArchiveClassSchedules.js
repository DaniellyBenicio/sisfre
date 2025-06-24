import db from "../models/index.js";
export const autoArchiveClassSchedules = async (calendarId) => {
  const transaction = await db.sequelize.transaction();
  try {
    const calendar = await db.Calendar.findByPk(calendarId, { transaction });

    if (!calendar) {
      await transaction.commit();
      return { success: false, message: 'Nenhum horário para arquivar' };
    }

    const today = new Date();
    if (new Date(calendar.endDate) > today) {
      await transaction.commit();
      return { success: false, message: 'Nenhum horário para arquivar' };
    }

    const [updatedRows] = await db.ClassSchedule.update(
      { isActive: false },
      {
        where: {
          calendarId: calendar.id,
          isActive: true,
        },
        transaction,
      }
    );

    await transaction.commit();
    if (updatedRows === 0) {
      return { success: true, message: 'Nenhum horário para arquivar' };
    }

    return { success: true, message: 'Horários arquivados com sucesso' };
  } catch (error) {
    await transaction.rollback();
    throw new Error('Erro ao arquivar horários');
  }
};

export default autoArchiveClassSchedules;