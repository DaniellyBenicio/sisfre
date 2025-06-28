'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Courses', [
      {
        name: 'Curso técnico subsequente em Administração',
        acronym: 'ADM',
        type: 'TÉCNICO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Integrado em Eletrotécnica',
        acronym: 'ELT',
        type: 'TÉCNICO INTEGRADO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bacharelado em Engenharia Elétrica',
        acronym: 'EE',
        type: 'GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bacharelado em Engenharia Mecânica',
        acronym: 'BEM',
        type: 'GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Especialização em Docência do Ensino Superior',
        acronym: 'EDS',
        type: 'PÓS-GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Integrado em Informática',
        acronym: 'INF',
        type: 'TÉCNICO INTEGRADO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Licenciatura em Física',
        acronym: 'LF',
        type: 'GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Licenciatura em Matemática',
        acronym: 'LM',
        type: 'GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Integrado em  Mecânica Industrial',
        acronym: 'MI',
        type: 'TÉCNICO INTEGRADO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bacharelado em Sistemas de Informação',
        acronym: 'BSI',
        type: 'GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mecatrônica industrial',
        acronym: 'MEI',
        type: 'GRADUAÇÃO',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Courses', null, {});
  }
};