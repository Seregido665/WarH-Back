const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso denegado: se requiere rol de administrador" });
  }
  next();
};

module.exports = {
  isAdmin,
};
