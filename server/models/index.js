// models/index.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
import config from "../config/config.js";

const db = {};

async function initializeDatabase() {
  let sequelize;
  const dbConfig = config[env];

  if (dbConfig.use_env_variable) {
    sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
  } else {
    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      dbConfig
    );
  }

  // Função para carregar modelos recursivamente
  async function loadModels(directory) {
    const files = await fs.readdir(directory, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(directory, file.name);
      if (file.isDirectory()) {
        // Carrega modelos em subpastas
        await loadModels(filePath);
      } else if (
        file.name.indexOf(".") !== 0 &&
        file.name !== basename &&
        file.name.endsWith(".js") &&
        file.name.indexOf(".test.js") === -1
      ) {
        const modelPath = path.join(directory, file.name);
        const modelURL = new URL(`file://${modelPath}`).href;
        console.log("Carregando modelo:", modelPath);
        const model = (await import(modelURL)).default(
          sequelize,
          Sequelize.DataTypes
        );
        console.log("Modelo carregado:", model.name);
        db[model.name] = model;
      }
    }
  }

  // Carrega modelos do diretório models/ e subpastas
  await loadModels(__dirname);

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  // Teste a conexão com o banco de dados
  await sequelize.authenticate();
  console.log("Conexão com o banco de dados estabelecida com sucesso!");

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}

export default await initializeDatabase();
