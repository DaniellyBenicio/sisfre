import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Calendar extends Model {
    static associate(models) {
      Calendar.belongsToMany(models.Class, {
        through: "CalendarClass",
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

      Calendar.belongsToMany(models.SchoolSaturday, {
        through: "calendarSaturday",
        foreignKey: "calendarId",
        otherKey: "schoolsaturdad",
        as: "schoolCalendarSaturdays",
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
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterStartDate(value) {
            if (new Date(value) <= new Date(this.startDate)) {
              throw new Error(
                "A data de fim deve ser posterior à data de início."
              );
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Calendar",
      tableName: "calendar",
      timestamps: true,
      indexes: [{ unique: true, fields: ["type", "year", "period"] }],
    }
  );

  return Calendar;
};
