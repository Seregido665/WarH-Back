const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt.config");
const { generateToken: generateSecureToken, hashToken, compareToken } = require("../utils/tokenUtils");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../config/email.config");

// --- REGISTRO ---
const register = async (req, res) => {
  try {
    const newUser = req.body;
    console.log("entro");

    // -- POR SI EXISTE USUARIO --
    const existingUser = await UserModel.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // -- CREA TOKENDE VERIFICACIÓN --
    const verificationToken = generateSecureToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // -- NUEVO USUARIO CON TOKEN HASHEADO --
    const user = await UserModel.create({
      ...newUser,
      verificationToken: hashToken(verificationToken),
      verificationTokenExpires,
    });

    // -- GENERA TOKEN PARA LOGIN --
    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    // -- ENVIAR EMAIL DE VERIFICACION --
    try {
      await sendVerificationEmail(user.email, verificationToken, user._id);
    } catch (emailErr) {
      console.error("Error enviando email:", emailErr);
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    res.status(201).json({
      message: "Usuario creado correctamente.",
      token: jwtToken,
      user: userResponse,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al crear el usuario", error: err.message });
  }
};

// --- LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -- VALIDAR CAMPOS --
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

    // -- GENERAR TOKEN JWT --
    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
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

// -- VERIFICAR EMAIL CON TOKEN --
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = hashToken(token);

    // -- BUSCAR USUARIO CON ESE TOKEN --
    const user = await UserModel.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido" });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.json({
      message: "Email verificado exitosamente",
      user: {
        _id: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error al verificar email", error: err.message });
  }
};

// --- PEDIR NUEVA CONTRASEÑA ---
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return
    }

    // -- TOKEN DE RESET --
    const resetToken = generateSecureToken();
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // -- ENVIAR EMAIL DE RESETEO --
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      console.error("Error enviando email de recuperación:", emailErr);
    }
  } catch (err) {
    res.status(500).json({ message: "Error en solicitud de reset", error: err.message });
  }
};

// --- CAMBIAR CONTRASEÑA ---
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
    }

    const hashedToken = hashToken(token);
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  } catch (err) {
    res.status(500).json({ message: "Error al resetear contraseña", error: err.message });
  }
};

// --- OBTENER PERFIL ---
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };

    res.json(userResponse);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener el perfil", error: err.message });
  }
};

// --- REFRESCAR TOKEN --
const refreshToken = async (req, res) => {
  try {
    const user = req.user;

    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al actualizar el token", error: err.message });
  }
};

// --- ACTUALIZAR PERFIL ---
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;

    if (req.file) {
      updateData.avatar = req.file.secure_url || req.file.path;
      updateData.avatarPublicId = req.file.public_id;
    }

    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar perfil", error: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile,
};
