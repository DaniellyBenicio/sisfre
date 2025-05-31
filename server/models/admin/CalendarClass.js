import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class CalendarClass extends Model {
    static associate(models) {
      CalendarClass.belongsTo(models.Calendar, {
        foreignKey: "calendarId",
        as: "calendar",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      CalendarClass.belongsTo(models.Class, {
        foreignKey: "classId",
        as: "class",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  CalendarClass.init(
    {
      calendarId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      classId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      dateStart: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dateEnd: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "CalendarClass",
      tableName: "calendarClasses",
      timestamps: true,
    }
  );

  return CalendarClass;
};
