'use strict';

const { addDays } = require('date-fns');

function getEaster(year) {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

function format(date) {
  return date.toISOString().split("T")[0];
}

function getNationalHolidays(year) {
  const easter = getEaster(year);
  return [
    { name: "Ano Novo", date: `${year}-01-01` },
    { name: "Carnaval", date: format(addDays(easter, -47)) },
    { name: "Paixão de Cristo", date: format(addDays(easter, -2)) },
    { name: "Páscoa", date: format(easter) },
    { name: "Tiradentes", date: `${year}-04-21` },
    { name: "Dia do Trabalho", date: `${year}-05-01` },
    { name: "Corpus Christi", date: format(addDays(easter, 60)) },
    { name: "Independência do Brasil", date: `${year}-09-07` },
    { name: "Nossa Senhora Aparecida", date: `${year}-10-12` },
    { name: "Finados", date: `${year}-11-02` },
    { name: "Proclamação da República", date: `${year}-11-15` },
    { name: "Natal", date: `${year}-12-25` },
  ];
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const years = [2025, 2026];
    const holidays = [];
    const now = new Date();

    for (const year of years) {
      for (const h of getNationalHolidays(year)) {
        holidays.push({
          name: h.name,
          date: h.date,
          type: "NACIONAL",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert('Holidays', holidays, {});
  },

  async down(queryInterface, Sequelize) {
    const years = [2025, 2026];
    const Op = Sequelize.Op;
    const dates = years.flatMap(year => getNationalHolidays(year).map(h => h.date));
    await queryInterface.bulkDelete('Holidays', {
      date: { [Op.in]: dates },
      type: "NACIONAL"
    }, {});
  }
};