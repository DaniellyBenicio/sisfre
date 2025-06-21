import db from "../models/index.js";

export const isAdminOrCoordinator = () => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const user = await db.User.findOne({ where: { id: req.userId } });
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }

      if (user.accessType !== "Administrador" && user.accessType !== "Coordenador") {
        return res.status(403).json({
          error: "Acesso negado. Apenas administradores ou coordenadores podem acessar esta rota.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Erro no middleware isAdminOrCoordinator:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  };
};

export default isAdminOrCoordinator;
