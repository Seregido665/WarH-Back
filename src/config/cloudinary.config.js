const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// -- CONFIGURACIÓN DE CLOUDINARY --
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -- CONFIGURACIÓN DE MULTER DE CLOUDINARY --
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "warh/products",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 600, height: 600, crop: "limit" }],
  },
});

// -- ESPECIAL PARA AVATARES --
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "warh/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

// -- MULTER CONFIG --
const upload = multer({ storage });
const uploadAvatar = multer({ storage: avatarStorage });
const uploadMultiple = multer({ storage }); // PARA VARIAS IMAGENES

module.exports = {
  cloudinary,
  upload,
  uploadAvatar,
  uploadMultiple,
};
