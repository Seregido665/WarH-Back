const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt.config");
const { generateToken: generateSecureToken, hashToken, compareToken } = require("../utils/tokenUtils");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../config/email.config");

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

    // Generar token de verificación
    const verificationToken = generateSecureToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear el nuevo usuario con token hasheado
    const user = await UserModel.create({
      ...newUser,
      verificationToken: hashToken(verificationToken),
      verificationTokenExpires,
    });

    // Generar JWT token para sesión
    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail(user.email, verificationToken, user._id);
    } catch (emailErr) {
      console.error("Error enviando email:", emailErr);
      // No fallar la creación del usuario si falla el email
    }

    // Respuesta sin la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    res.status(201).json({
      message: "Usuario creado correctamente. Verifica tu email.",
      token: jwtToken,
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

    // Opcional: Descomentar si quieres requerir verificación de email
    // if (!user.emailVerified) {
    //   return res.status(403).json({ message: "Verifica tu email para continuar" });
    // }

    // Generar JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    // Login exitoso
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

// Verificar email con token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hashear el token recibido para comparar
    const hashedToken = hashToken(token);

    // Buscar usuario con este token
    const user = await UserModel.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Marcar como verificado
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

// Solicitar reset de contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no por seguridad
      return res.json({
        message: "Si el email existe, se enviará un enlace de recuperación",
      });
    }

    // Generar token de reset
    const resetToken = generateSecureToken();
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token hasheado
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      // Loguear el error pero no fallar la petición para no filtrar existencia de emails
      console.error("Error enviando email de recuperación (SMTP):", emailErr);
      // Continuar y responder éxito para mantener flujo UX incluso si el servicio de email falla
    }

    res.json({
      message: "Si el email existe, se enviará un enlace de recuperación",
    });
  } catch (err) {
    res.status(500).json({ message: "Error en solicitud de reset", error: err.message });
  }
};

// Cambiar contraseña con token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
    }

    // Hashear el token recibido para comparar
    const hashedToken = hashToken(token);

    // Buscar usuario con este token
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (err) {
    res.status(500).json({ message: "Error al resetear contraseña", error: err.message });
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

// Actualizar perfil con avatar
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;

    // Si se subió una imagen, agregarla
    if (req.file) {
      // Si ya tiene avatar, eliminarlo de Cloudinary (opcional)
      // if (user.avatarPublicId) {
      //   await cloudinary.uploader.destroy(user.avatarPublicId);
      // }
      updateData.avatar = req.file.secure_url || req.file.path;
      updateData.avatarPublicId = req.file.public_id;
    }

    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

    res.json({
      message: "Perfil actualizado",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
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
