// models/User.js
import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

const generateCode = async (username, User) => {
  if (!username || typeof username !== "string") return "XX";
  const parts = username.trim().split(/\s+/);
  const firstName = parts[0] || "";
  if (!firstName) return "XX";

  const firstLetter = firstName[0]?.toUpperCase() || "X";

  const allLetters = username.replace(/\s+/g, "").toUpperCase().split("");
  if (allLetters.length === 0) return firstLetter + "X";

  const randomIndex = Math.floor(Math.random() * allLetters.length);
  const secondLetter = allLetters[randomIndex];

  let acronym = firstLetter + secondLetter;

  let suffix = 1;
  let uniqueAcronym = acronym;
  while (await User.findOne({ where: { acronym: uniqueAcronym } })) {
    const newRandomIndex = Math.floor(Math.random() * allLetters.length);
    uniqueAcronym = firstLetter + allLetters[newRandomIndex];
    if (suffix++ > 10) {
      uniqueAcronym = firstLetter + "X";
      break;
    }
  }

  return uniqueAcronym;
};

export default (sequelize) => {
  class User extends Model {
    static associate(models) {}
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      acronym: {
        type: DataTypes.STRING(2),
        allowNull: true,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accessType: {
        type: DataTypes.ENUM("Professor", "Coordenador", "Admin"),
        allowNull: false,
        defaultValue: "Professor",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeCreate(async (user) => {
    user.acronym = await generateCode(user.username, User);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  });

  User.beforeUpdate(async (user) => {
    if (user.changed("username")) {
      user.acronym = await generateCode(user.username, User);
    }
  });

  return User;
};
