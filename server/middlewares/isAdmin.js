import dbPromise from '../models/index.js';

export default async (req, res, next) => {
  const { userId } = req; 

  try {
    const db = await dbPromise; // Resolve a promessa para acessar os modelos
    const user = await db.User.findByPk(userId); // Recupera o usuário com o id

    if (!user || user.accessType.toLowerCase() !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Somente administradores podem realizar esta ação' });
    }
    next(); // Chama a próxima função (permitindo o acesso à rota)
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Erro ao verificar permissões do usuário' });
  }
};