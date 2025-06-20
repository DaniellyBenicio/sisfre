import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Holiday extends Model {}
  Holiday.init(
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
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('NACIONAL', 'ESTADUAL', 'MUNICIPAL', 'INSTITUCIONAL'),
        allowNull: false,
        defaultValue: 'NACIONAL',
      },
    },
    {
      sequelize,
      modelName: "Holiday",
      tableName: "holidays",
    }
  );
  return Holiday;
};