"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teacherCourseDisciplines", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "teacherCourseDisciplines",
      ["courseId", "userId", "disciplineId"],
      {
        unique: true,
        name: "unique_teacher_course_discipline",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("teacherCourseDisciplines");
  },
};
