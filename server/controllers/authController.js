import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    // Verifica se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET não está definido nas variáveis de ambiente."
      );
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: userWithoutPassword.username,
        accessType: user.accessType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor durante o login." });
  }
};
