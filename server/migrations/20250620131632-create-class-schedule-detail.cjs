"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("class_schedule_details", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      classScheduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "class_schedules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      disciplineId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Disciplines",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      hourId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "hours",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      turn: {
        type: Sequelize.ENUM("MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRADO"),
        allowNull: false,
      },
      dayOfWeek: {
        type: Sequelize.ENUM("Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("class_schedule_details");
  },
};
