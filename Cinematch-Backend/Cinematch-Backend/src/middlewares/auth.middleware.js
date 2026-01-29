const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('🔐 Auth middleware executado');

  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');
  console.log('Token recebido:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Erro ao validar token:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
