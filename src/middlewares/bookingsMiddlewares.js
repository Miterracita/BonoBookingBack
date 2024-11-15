const crypto = require("crypto");

const generateCode = () => {
  // Genera un código aleatorio usando crypto
  return crypto.randomBytes(4).toString("hex").toUpperCase();  // Ejemplo: 'A1B2C3D4'
};

module.exports = { generateCode };
