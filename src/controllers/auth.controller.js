const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt.config");

// Controlador de registro
const register = async (req, res) => {
  try {
    const newUser = req.body;
    console.log("entro");

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Crear el nuevo usuario (la contraseña se hasheará automáticamente en el pre-save hook)
    const user = await UserModel.create(newUser);

    // Generar JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    // Respuesta sin la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(201).json({
      message: "Usuario creado correctamente",
      token,
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

    // Generar JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    // Login exitoso - devolver datos del usuario sin la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el login", error: err.message });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // req.user viene del middleware de autenticación
    const user = req.user;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json(userResponse);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener el perfil", error: err.message });
  }
};

// Refrescar token
const refreshToken = async (req, res) => {
  try {
    // req.user viene del middleware de autenticación
    const user = req.user;

    // Generar nuevo token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    res.json({
      message: "Token actualizado",
      token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al actualizar el token", error: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
};
