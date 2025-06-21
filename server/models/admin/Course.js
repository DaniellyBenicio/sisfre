// models/Course.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsTo(models.User, {
        as: "coordinator",
        foreignKey: "coordinatorId",
      });

      Course.belongsToMany(models.Class, {
        through: "CourseClass",
        foreignKey: "courseId",
        otherKey: "classId",
        as: "classes",
      });

      Course.belongsToMany(models.Discipline, {
        through: "CourseDisciplines",
        foreignKey: "courseId",
        otherKey: "disciplineId",
        as: "disciplines",
      });

      Course.belongsToMany(models.User, {
        through: "teacherCourseDisciplines",
        foreignKey: "courseId",
        otherKey: "userId",
        as: "teachers",
      });

      Course.belongsToMany(models.Discipline, {
        through: "teacherCourseDisciplines",
        foreignKey: "courseId",
        otherKey: "disciplineId",
        as: "taughtDisciplines",
      });

      Course.belongsToMany(models.Calendar, {
        through: "calendarCourses", 
        foreignKey: "courseId",
        otherKey: "calendarId",
        as: "calendar", 
      });

      Course.hasMany(models.ClassSchedule, { 
        foreignKey: "courseId", 
        as: "classSchedules", 
      });
    }
  }

  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      acronym: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM(
          "GRADUAÇÃO",
          "TÉCNICO",
          "INTEGRADO",
          "TÉCNICO INTEGRADO",
          "MESTRADO",
          "DOUTORADO",
          "EAD",
          "PROEJA",
          "ESPECIALIZAÇÃO",
          "EXTENSÃO",
          "RESIDÊNCIA",
          "SEQUENCIAL",
          "PÓS-DOUTORADO",
          "PÓS-GRADUAÇÃO",
          "CURSO LIVRE"
        ),
        allowNull: false,
      },
      coordinatorId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Course",
    }
  );

  return Course;
};
