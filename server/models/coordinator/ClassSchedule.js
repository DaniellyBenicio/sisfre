import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class ClassSchedule extends Model {
    static associate(models) {
      ClassSchedule.belongsTo(models.Calendar, {
        foreignKey: "calendarId",
        as: "calendar",
      });

      ClassSchedule.belongsTo(models.Class, {
        foreignKey: "classId",
        as: "class",
      });

      ClassSchedule.belongsTo(models.Discipline, {
        foreignKey: "disciplineId",
        as: "discipline",
      });

      ClassSchedule.belongsTo(models.User, {
        foreignKey: "professorId",
        as: "professor",
      });

      ClassSchedule.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });

      ClassSchedule.belongsTo(models.Hour, {
        foreignKey: "hourId",
        as: "hour",
      });
    }
  }

  ClassSchedule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      calendarId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Calendars",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Classes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      disciplineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Disciplines",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      professorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      dayOfWeek: {
        type: DataTypes.ENUM("Segunda", "Terça", "Quarta", "Quinta", "Sexta"),
        allowNull: false,
      },
      hourId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Hours",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "ClassSchedule",
      tableName: "class_schedules",
      timestamps: true,
    }
  );

  return ClassSchedule;
};
