import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

const generateCode = async (username, User) => {
  if (!username || typeof username !== "string" || username.trim() === "") {
    return "XXX";
  }

  const parts = username.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const cleanedFirstName = firstName.replace(/[^A-Za-zÀ-ÿ]/g, '').toUpperCase();
  const allAlphaLetters = username.replace(/[^A-Za-zÀ-ÿ]/g, '').toUpperCase().split('');
  const fallbackAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let firstLetter = "X";
  let secondLetter = "X";
  let thirdLetterCandidate = "X";


  if (cleanedFirstName.length > 0) {
      firstLetter = cleanedFirstName[0];
  } else if (allAlphaLetters.length > 0) {
      firstLetter = allAlphaLetters[0]; 
  }

  if (parts.length > 1) { 
      const secondWord = parts[1];
      const cleanedSecondWord = secondWord.replace(/[^A-Za-zÀ-ÿ]/g, '').toUpperCase();
      secondLetter = cleanedSecondWord[0] || "X";

      const lettersUsed = [firstLetter, secondLetter];
      const availableLetters = allAlphaLetters.filter(l => !lettersUsed.includes(l));
      
      if (availableLetters.length > 0) {
          thirdLetterCandidate = availableLetters[Math.floor(Math.random() * availableLetters.length)];
      } else if (allAlphaLetters.length > 0) {
          thirdLetterCandidate = allAlphaLetters[Math.floor(Math.random() * allAlphaLetters.length)]; 
      } else {
          thirdLetterCandidate = fallbackAlphabet[Math.floor(Math.random() * fallbackAlphabet.length)];
      }

  } else { 

      if (cleanedFirstName.length >= 2) {
          secondLetter = cleanedFirstName[1];
      } else {
          const availableLetters = allAlphaLetters.filter(l => l !== firstLetter);
          if (availableLetters.length > 0) {
              secondLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
          } else {
              secondLetter = "X"; 
          }
      }

      if (cleanedFirstName.length >= 3) {
          thirdLetterCandidate = cleanedFirstName[2];
      } else {
          const lettersUsed = [firstLetter, secondLetter];
          const availableLetters = allAlphaLetters.filter(l => !lettersUsed.includes(l));
          if (availableLetters.length > 0) {
              thirdLetterCandidate = availableLetters[Math.floor(Math.random() * availableLetters.length)];
          } else if (allAlphaLetters.length > 0) { 
              thirdLetterCandidate = allAlphaLetters[Math.floor(Math.random() * allAlphaLetters.length)];
          } else {
              thirdLetterCandidate = fallbackAlphabet[Math.floor(Math.random() * fallbackAlphabet.length)];
          }
      }
  }

  if (firstLetter === "X") firstLetter = fallbackAlphabet[0];
  if (secondLetter === "X") secondLetter = fallbackAlphabet[1]; 
  if (thirdLetterCandidate === "X") thirdLetterCandidate = fallbackAlphabet[2];

  const baseAcronymPrefix = firstLetter + secondLetter;
  let candidateAcronym = baseAcronymPrefix + thirdLetterCandidate;

  const existingUserInitial = await User.findOne({ where: { acronym: candidateAcronym } });
  if (!existingUserInitial) {
    return candidateAcronym;
  }

  const MAX_RANDOM_ATTEMPTS = 10;
  for (let i = 0; i < MAX_RANDOM_ATTEMPTS; i++) {
    let randomThirdLetter;
    if (allAlphaLetters.length > 0) {
      randomThirdLetter = allAlphaLetters[Math.floor(Math.random() * allAlphaLetters.length)];
    } else {
      randomThirdLetter = fallbackAlphabet[Math.floor(Math.random() * fallbackAlphabet.length)];
    }
    candidateAcronym = baseAcronymPrefix + randomThirdLetter;
    const existingUser = await User.findOne({ where: { acronym: candidateAcronym } });
    if (!existingUser) {
      return candidateAcronym;
    }
  }

  console.warn(
    `Não foi possível encontrar uma sigla única aleatória para "${username}". Tentando sufixo numérico.`
  );

  const MAX_SEQUENTIAL_ATTEMPTS = 99;
  for (let suffix = 1; suffix <= MAX_SEQUENTIAL_ATTEMPTS; suffix++) {
    candidateAcronym = baseAcronymPrefix + suffix.toString();

    if (candidateAcronym.length > 3) {
      continue;
    }

    const existingUser = await User.findOne({ where: { acronym: candidateAcronym } });
    if (!existingUser) {
      return candidateAcronym;
    }
  }

  console.error(
    `ERRO CRÍTICO: Não foi possível encontrar uma sigla única para o usuário: "${username}" após ${MAX_RANDOM_ATTEMPTS} tentativas aleatórias e ${MAX_SEQUENTIAL_ATTEMPTS} tentativas sequenciais. Retornando fallback genérico.`
  );
  return baseAcronymPrefix + 'F'; 
};

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Course, {
        foreignKey: "coordinatorId",
        as: "coordinatedCourse",
      });

      User.belongsToMany(models.Discipline, {
        through: "teacherCourseDisciplines",
        foreignKey: "userId",
        otherKey: "disciplineId",
        as: "disciplines",
      });

      User.belongsToMany(models.Course, {
        through: "teacherCourseDisciplines",
        foreignKey: "userId",
        otherKey: "courseId",
        as: "coursesTaught",
      });

      User.hasMany(models.ClassScheduleDetail, {
        foreignKey: "userId",
        as: "scheduleDetails",
      });
    }
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
        type: DataTypes.STRING(3),
        allowNull: true,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
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
