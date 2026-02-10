const nodemailer = require("nodemailer");

// Configuración del transporter de Nodemailer
// Para producción, usa variables de entorno con credenciales SMTP reales
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // Gmail, Outlook, etc. o usar host/port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Alternativa: para testing con Ethereal (fake SMTP)
  // host: process.env.EMAIL_HOST,
  // port: process.env.EMAIL_PORT,
  // auth: {
  //   user: process.env.EMAIL_USER,
  //   pass: process.env.EMAIL_PASSWORD,
  // },
});

/**
 * Enviar email de verificación
 * @param {string} email - Email del usuario
 * @param {string} token - Token de verificación
 * @param {string} userId - ID del usuario
 */
const sendVerificationEmail = async (email, token, userId) => {
  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verifica tu email - WarH",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Bienvenido a WarH!</h2>
        <p>Haz clic en el siguiente enlace para verificar tu email:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verificar Email
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">Este enlace expira en 24 horas.</p>
      </div>
    `,
    text: `Verifica tu email aquí: ${verificationUrl}\n\nEste enlace expira en 24 horas.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a: ${email}`);
  } catch (err) {
    console.error("Error al enviar email de verificación:", err);
    throw new Error("No se pudo enviar el email de verificación");
  }
};

/**
 * Enviar email de reset de contraseña
 * @param {string} email - Email del usuario
 * @param {string} token - Token de reset
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Recupera tu contraseña - WarH",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recuperar Contraseña</h2>
        <p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
        <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Cambiar Contraseña
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">Este enlace expira en 1 hora.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, ignora este email.</p>
      </div>
    `,
    text: `Recupera tu contraseña aquí: ${resetUrl}\n\nEste enlace expira en 1 hora.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de recuperación enviado a: ${email}`);
  } catch (err) {
    console.error("Error al enviar email de recuperación:", err);
    throw new Error("No se pudo enviar el email de recuperación");
  }
};

module.exports = {
  transporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
