const { Sequelize } = require("sequelize");
const User = require("../../models/admin/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { randomBytes } = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Email recebido:", email);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "E-mail não encontrado." });
    }

    const token = randomBytes(20).toString("hex");
    const expires = Date.now() + 3600000;

    await user.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    const encodedEmail = encodeURIComponent(
      Buffer.from(email).toString("base64")
    );
    const passwordResetLink = `http://localhost:3001/resetPassword/${token}?expires=${expires}&email=${encodedEmail}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SisFre - Redefinição de Senha",
      html: `
        <p>Olá, ${user.username || "Usuário"},</p>
        <p>Você solicitou a redefinição de sua senha no Sistema de Frequência (SisFre). Clique no link abaixo para criar uma nova senha. Este link é válido por 1 hora:</p>
        <p><a href="${passwordResetLink}">Redefinir Senha</a></p>
        <p>Se você não solicitou essa alteração, por favor, ignore este e-mail ou entre em contato com o suporte do SisFre.</p>
        <p>Atenciosamente,<br>Equipe SisFre</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "E-mail de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error("Erro no forgotPassword:", error);
    return res
      .status(500)
      .json({ message: "Erro ao solicitar recuperação de senha!" });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.params;
  const { expires, email } = req.query;

  if (
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword ||
    newPassword.length < 6
  ) {
    return res.status(400).json({
      message:
        "Senhas inválidas ou diferentes. A senha deve ter pelo menos 6 caracteres.",
    });
  }

  if (Date.now() > Number(expires)) {
    return res.status(400).json({ message: "Token expirado." });
  }

  if (!email) {
    return res.status(400).json({ message: "E-mail não fornecido." });
  }

  try {
    const decodedEmail = Buffer.from(
      decodeURIComponent(email),
      "base64"
    ).toString("ascii");
    const user = await User.findOne({
      where: {
        email: decodedEmail,
        resetPasswordToken: token,
        resetPasswordExpires: { [Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Usuário não encontrado ou token inválido." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      senha: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return res
      .status(200)
      .json({ message: "Senha redefinida com sucesso no SisFre!" });
  } catch (error) {
    console.error("Erro no resetPassword:", error);
    return res.status(500).json({ message: "Erro ao redefinir a senha!" });
  }
};
