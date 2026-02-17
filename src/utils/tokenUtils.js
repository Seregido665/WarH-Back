const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// --- GENERAR TOKEN ---
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// --- HASHEAR TOKEN ---
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const compareToken = (plainToken, hashedToken) => {
  return hashToken(plainToken) === hashedToken;
};

module.exports = {
  generateToken,
  hashToken,
  compareToken,
};
