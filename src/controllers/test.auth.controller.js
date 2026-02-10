const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");

// Controlador de registro
const register = async (req, res) => {
  try {
    const newUser = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Crear el nuevo usuario (la contraseña se hasheará automáticamente en el pre-save hook)
    const user = await UserModel.create(newUser);

    // No devolver la contraseña en la respuesta
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: userResponse,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al crear el usuario", error: err.message });
  }
};

// Controlador de login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se envíen email y contraseña
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Login exitoso - devolver datos del usuario sin la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({
      message: "Login exitoso",
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el login", error: err.message });
  }
};

module.exports = {
  register,
  login,
};
