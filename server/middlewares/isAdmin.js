const User = require("../models/admin/User");
// Middleware para verificar se o usuário é um administrador
module.exports = async (req, res, next) => {
  const { userId } = req; // O id do usuário foi armazenado no req.userId

  try {
    const user = await User.findByPk(userId); // Recupera o usuário com o id

    if (!user || user.accessType.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ error: "Somente administradores podem realizar esta ação" });
    }
    next(); // Chama a próxima função (permitindo o acesso à rota)
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao verificar permissões do usuário" });
  }
};
