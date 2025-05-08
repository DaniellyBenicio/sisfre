const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Obtém o cabeçalho Authorization
  const token = authHeader && authHeader.split(" ")[1]; // Extrai o token do cabeçalho

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Armazena o ID do usuário no objeto req
    req.userId = decoded.id;

    next(); // Continua para o próximo middleware ou rota
  } catch (error) {
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
};
