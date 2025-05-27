// models/Discipline.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Discipline extends Model {
    static associate(models) {
      Discipline.belongsToMany(models.Course, {
        through: "CourseDisciplines",
        foreignKey: "disciplineId",
        otherKey: "courseId",
        as: "courses",
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
          len: [3, 50],
        },
      },
      acronym: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [2, 10],
          is: /^[a-zA-Z0-9]+$/,
        },
      },
      workload: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
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
