import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Calendar extends Model {
    static associate(models) {
      Calendar.belongsToMany(models.Class, {
        through: models.CalendarClass, 
        foreignKey: "calendarId",
        otherKey: "classId",
        as: "classes",
      });

      Calendar.belongsToMany(models.Course, {
        through: "calendarCourses", 
        foreignKey: "calendarId",
        otherKey: "courseId",
        as: "courses",
      });
    }
  }

  Calendar.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isValidType(value) {
            const allowed = ["CONVENCIONAL", "REGULAR", "PÓS-GREVE", "OUTRO"];

            if (!allowed.includes(value.toUpperCase()) && value.length < 3) {
              throw new Error("Tipo de calendário inválido ou muito curto.");
            }
          },
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 2020,
        },
      },
      period: {
        type: DataTypes.ENUM("1", "2"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Calendar",
      tableName: "calendar",
      timestamps: true,
    }
  );

  return Calendar;
};
