"use strict";
const fs = require("fs");
const { parse } = require("csv-parse/sync");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const disciplinesToInsert = [];
    const csvCombinations = new Set();
    const dbNames = new Set();
    const csvFilePath = "../server/data/disciplines.csv";

    let fileContent;
    try {
      fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
      console.log("--- Seed: Arquivo CSV de disciplinas lido com sucesso.");
    } catch (error) {
      console.error(
        `--- Seed: ERRO: Não foi possível ler o arquivo CSV em ${csvFilePath}:`,
        error.message
      );
      return;
    }

    if (fileContent.trim() === "") {
      console.warn(
        "--- Seed: Arquivo CSV está vazio. Nenhuma disciplina para adicionar."
      );
      return;
    }

    let records = [];
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ",",
        trim: true,
      });
      console.log(`--- Seed: ${records.length} registros encontrados no CSV.`);
      console.log("Registros do CSV:", records);
    } catch (parseError) {
      console.error("--- Seed: Erro ao parsear o CSV:", parseError.message);
      return;
    }

    try {
      const existingDisciplines = await queryInterface.sequelize.query(
        "SELECT name FROM disciplines",
        { type: Sequelize.QueryTypes.SELECT }
      );
      for (const d of existingDisciplines) {
        dbNames.add(d.name.toLowerCase());
      }
      console.log(
        `--- Seed: ${existingDisciplines.length} disciplinas existentes no banco.`
      );
    } catch (error) {
      console.error(
        "--- Seed: Erro ao verificar duplicidades no banco:",
        error.message
      );
    }

    for (const record of records) {
      const name = record["Nome"]?.trim();
      const acronym = record["codigo"]?.trim();

      if (!name || !acronym) {
        console.warn(
          `--- Seed: Registro ignorado por dados inválidos:`,
          record
        );
        continue;
      }

      const nameLower = name.toLowerCase();
      if (dbNames.has(nameLower)) {
        console.warn(
          `--- Seed: Nome já existe no banco (Nome: "${name}"). Ignorando.`
        );
        continue;
      }

      const acronymUpper = acronym.toUpperCase();
      const currentCombination = nameLower + "|" + acronymUpper;
      if (csvCombinations.has(currentCombination)) {
        console.warn(
          `--- Seed: Combinação duplicada no CSV (Nome: "${name}", Sigla: "${acronym}"). Ignorando.`
        );
        continue;
      }

      csvCombinations.add(currentCombination);
      dbNames.add(nameLower);

      console.log("Registro processado para inserção:", { name, acronym });

      disciplinesToInsert.push({
        name,
        acronym,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(
      `--- Seed: ${disciplinesToInsert.length} disciplinas válidas para inserção.`
    );

    if (disciplinesToInsert.length > 0) {
      try {
        await queryInterface.bulkInsert("disciplines", disciplinesToInsert, {
          ignoreDuplicates: true,
        });
        console.log("--- Seed: Inserção concluída com sucesso.");
      } catch (error) {
        console.error("--- Seed: ERRO na inserção:", error.message);
      }
    } else {
      console.log("--- Seed: Nenhuma disciplina para inserir.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("disciplines", null, {});
    console.log("--- Seed: Tabela de disciplinas limpa.");
  },
};
