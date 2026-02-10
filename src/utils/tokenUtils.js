const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/**
 * Generar un token aleatorio seguro
 * @returns {string} Token aleatorio
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hashear un token (para almacenamiento seguro)
 * @param {string} token - Token a hashear
 * @returns {string} Token hasheado
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Comparar un token plano con su versión hasheada
 * @param {string} plainToken - Token plano
 * @param {string} hashedToken - Token hasheado
 * @returns {boolean} True si coinciden
 */
const compareToken = (plainToken, hashedToken) => {
  return hashToken(plainToken) === hashedToken;
};

module.exports = {
  generateToken,
  hashToken,
  compareToken,
};
