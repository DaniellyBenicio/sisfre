"use strict";
const fs = require("fs");
const { parse } = require("csv-parse/sync");

const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+(i|ii|iii|iv|v|1|2|3|4|5)$/i, "")
    .trim()
    .toLowerCase();
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const engenhariaEletricaCourseId = 10; 
    const courseDisciplinesToInsert = [];
    const csvCombinations = new Set();
    const dbCombinations = new Set();
    const csvFilePath = "../server/data/disciplines-information-systems.csv";
    let fileContent;
    try {
      fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
    } catch (error) {
      return; 
    }

    if (fileContent.trim() === "") {
      return;
    }

    let records = [];
    try {
      records = parse(fileContent, {
        columns: true, 
        skip_empty_lines: true,
        delimiter: ",",
        trim: true,
        relax_column_count: true,
        skip_lines_with_error: true,
      });
    } catch (parseError) {
      return; 
    }

    const existingDisciplines = await queryInterface.sequelize.query(
      "select id, name, acronym from disciplines",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const disciplineMap = new Map(); 
    for (const d of existingDisciplines) {
      const key = `${normalizeString(d.name)}|${normalizeString(d.acronym)}`;
      disciplineMap.set(key, d.id);
    }

    try {
      const existingCourseDisciplines = await queryInterface.sequelize.query(
        `SELECT
            cd."disciplineId",
            d.name,
            d.acronym
         FROM "CourseDisciplines" AS cd
         JOIN disciplines AS d ON cd."disciplineId" = d.id
         WHERE cd."courseId" = :courseId`,
        {
          replacements: { courseId: engenhariaEletricaCourseId },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      for (const cd of existingCourseDisciplines) {
        const normalizedName = normalizeString(cd.name);
        const normalizedAcronym = normalizeString(cd.acronym);
        dbCombinations.add(`${normalizedName}|${normalizedAcronym}`);
      }
    } catch (error) {

    }

    for (const record of records) {
      const name = record["Nome"]?.trim();
      const acronym = record["codigo"]?.trim();
      const workload = parseInt(record["cargaHoraria"], 10); 

      if (!name || !acronym || isNaN(workload)) {
        continue;
      }

      const normalizedName = normalizeString(name);
      const normalizedAcronym = normalizeString(acronym);
      const currentCombination = `${normalizedName}|${normalizedAcronym}`;

      if (dbCombinations.has(currentCombination)) {
        continue;
      }

      if (csvCombinations.has(currentCombination)) {
        continue;
      }

      const disciplineId = disciplineMap.get(currentCombination);

      if (disciplineId) {
        csvCombinations.add(currentCombination);
        dbCombinations.add(currentCombination);

        courseDisciplinesToInsert.push({
          courseId: engenhariaEletricaCourseId,
          disciplineId: disciplineId,
          workload: workload,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        console.warn(
          `Disciplina '${name}' (${acronym}) não encontrada na tabela 'disciplines'. Não será associada ao curso ID ${engenhariaEletricaCourseId}.`
        );
      }
    }

    if (courseDisciplinesToInsert.length > 0) {
      try {
        await queryInterface.bulkInsert(
          "CourseDisciplines",
          courseDisciplinesToInsert,
          {
            ignoreDuplicates: true, 
          }
        );
      } catch (error) {
      }
    } else {
    }
  },

  async down(queryInterface, Sequelize) {
    const courseIdToDelete = 10; 
    await queryInterface.bulkDelete(
      "CourseDisciplines",
      { courseId: courseIdToDelete },
      {}
    );
    console.log(
      `Registros para o curso Sistemas de Informação removidos com sucesso.`
    );
  },
};
