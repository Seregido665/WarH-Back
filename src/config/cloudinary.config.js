const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración del storage de Multer con Cloudinary (por defecto)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "warh/products",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// Configuración específica para avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "warh/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

// Middlewares de Multer
const upload = multer({ storage });
const uploadAvatar = multer({ storage: avatarStorage });
const uploadMultiple = multer({ storage }); // Para múltiples imágenes

module.exports = {
  cloudinary,
  upload,
  uploadAvatar,
  uploadMultiple,
};
