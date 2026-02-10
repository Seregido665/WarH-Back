const { verifyToken } = require("../config/jwt.config");
const UserModel = require("../models/User.model");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // ['Bearer', 'TOKEN']

    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido" });
    }

    // Verificar el token
    const decoded = verifyToken(token);

    // Buscar el usuario en la base de datos
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Agregar el usuario al request para uso en otros middlewares/controladores
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
        .json({ message: "Error del servidor", error: error.message });
    }
  }
};

module.exports = {
  authenticateToken,
};
