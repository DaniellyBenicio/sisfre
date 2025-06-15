import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Hour extends Model {
    static associate(models) {
      Hour.hasMany(models.ClassSchedule, {
        foreignKey: "hourId",
        as: "schedules",
      });
    }
  }

  Hour.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      hourStart: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      hourEnd: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          isAfterStartTime(value) {
            if (new Date(`2000-01-01 ${value}`) <= new Date(`2000-01-01 ${this.hourStart}`)) {
              throw new Error("O horário de fim deve ser posterior ao horário de início.");
            }
          },
        },
      },
      turnId: {
        type: DataTypes.ENUM("Manhã", "Tarde", "Noite"),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Hour",
      tableName: "hours",
    }
  );

  return Hour;
};