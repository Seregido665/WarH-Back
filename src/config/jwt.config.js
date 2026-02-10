const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_jwt_super_seguro";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
