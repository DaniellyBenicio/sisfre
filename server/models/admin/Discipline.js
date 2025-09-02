// models/Discipline.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Discipline extends Model {
    static associate(models) {
      Discipline.belongsToMany(models.Course, {
        through: "courseDisciplines",
        foreignKey: "disciplineId",
        otherKey: "courseId",
        as: "courses",
      });

      Discipline.belongsToMany(models.User, {
        through: "teacherCourseDisciplines",
        foreignKey: "disciplineId",
        otherKey: "userId",
        as: "teachers",
      });

      Discipline.hasMany(models.ClassScheduleDetail, {
        foreignKey: "disciplineId",
        as: "scheduleDetails",
      });
    }
  }

  Discipline.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },
      acronym: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 10],
          is: /^[a-zA-Z0-9]+$/,
        },
      },
    },
    {
      sequelize,
      modelName: "Discipline",
    }
  );

  return Discipline;
};
