const { cloudinary } = require("../config/cloudinary.config");

/**
 * Subir una o múltiples imágenes a Cloudinary
 * Acepta:
 * - req.file para una sola imagen (fieldname: avatar)
 * - req.files para múltiples imágenes (fieldname: images)
 */
exports.uploadImages = async (req, res, next) => {
  try {
    const uploadedImages = [];

    // Caso 1: Una sola imagen (avatar)
    if (req.file) {
      uploadedImages.push({
        url: req.file.secure_url || req.file.path,
        public_id: req.file.public_id,
        fieldname: req.file.fieldname || "avatar",
      });
    }

    // Caso 2: Múltiples imágenes (products)
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        uploadedImages.push({
          url: file.secure_url || file.path,
          public_id: file.public_id,
          fieldname: file.fieldname || "images",
        });
      });
    }

    // Caso 3: Múltiples imágenes con fieldnames específicos
    if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
      Object.keys(req.files).forEach((fieldname) => {
        const fileArray = Array.isArray(req.files[fieldname])
          ? req.files[fieldname]
          : [req.files[fieldname]];

        fileArray.forEach((file) => {
          uploadedImages.push({
            url: file.secure_url || file.path,
            public_id: file.public_id,
            fieldname: fieldname,
          });
        });
      });
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({ message: "No se subieron imágenes" });
    }

    res.status(201).json({
      message: "Imágenes subidas correctamente",
      images: uploadedImages,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Eliminar una imagen de Cloudinary por public_id
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: "public_id requerido" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({ message: "Imagen eliminada correctamente" });
    } else {
      res.status(400).json({ message: "No se pudo eliminar la imagen" });
    }
  } catch (err) {
    next(err);
  }
};
