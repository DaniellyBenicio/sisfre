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

      ClassSchedule.belongsTo(models.Course, { 
        foreignKey: "courseId", 
        as: "course",
      });

      ClassSchedule.hasMany(models.ClassScheduleDetail, {
        foreignKey: "classScheduleId",
        as: "details",
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
      turn: {
        type: DataTypes.ENUM("MATUTINO", "VESPERTINO", "NOTURNO"),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
