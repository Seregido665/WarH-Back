const { verifyToken } = require("../config/jwt.config");
const UserModel = require("../models/User.model");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // ['Bearer', 'TOKEN']

    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido" });
    }

    const decoded = verifyToken(token);

    // -- BUSCCA USUARIO POR TOKEN --
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    } else {
      return res
        .status(500)
        .json({ message: "ErroR", error: error.message });
    }
  }
};

module.exports = {
  authenticateToken,
};
