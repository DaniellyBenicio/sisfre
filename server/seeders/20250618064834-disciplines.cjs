"use strict";
const fs = require("fs");
const { parse } = require("csv-parse/sync");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const disciplinesToInsert = [];
    const csvCombinations = new Set();
    const dbCombinations = new Set();
    const csvFilePath = "../server/data/disciplines.csv";

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

    try {
      const existingDisciplines = await queryInterface.sequelize.query(
        "SELECT name, acronym FROM disciplines",
        { type: Sequelize.QueryTypes.SELECT }
      );
      for (const d of existingDisciplines) {
        dbCombinations.add(
          `${d.name.toLowerCase()}|${d.acronym.toUpperCase()}`
        );
      }

    } catch (error) {
    }

    for (const record of records) {
      const name = record["Nome"]?.trim();
      const acronym = record["codigo"]?.trim();

      if (!name || !acronym) {
        continue;
      }

      const nameLower = name.toLowerCase();
      const acronymUpper = acronym.toUpperCase();
      const currentCombination = `${nameLower}|${acronymUpper}`;

      if (dbCombinations.has(currentCombination)) {
        continue;
      }

      if (csvCombinations.has(currentCombination)) {

        continue;
      }

      csvCombinations.add(currentCombination);
      dbCombinations.add(currentCombination);

      disciplinesToInsert.push({
        name,
        acronym,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }


    if (disciplinesToInsert.length > 0) {
      try {
        await queryInterface.bulkInsert("disciplines", disciplinesToInsert, {
          ignoreDuplicates: true,
        });
      } catch (error) {
      }
    } else {
      console.log("--- Seed: Nenhuma disciplina para inserir.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("disciplines", null, {});
  },
};
