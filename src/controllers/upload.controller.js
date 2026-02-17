const { cloudinary } = require("../config/cloudinary.config");

exports.uploadImages = async (req, res, next) => {
  try {
    const uploadedImages = [];

    // -- PARA UNA SOLA IMAGEN --
    if (req.file) {
      uploadedImages.push({
        url: req.file.secure_url || req.file.path,
        public_id: req.file.public_id,
        fieldname: req.file.fieldname || "avatar",
      });
    }

    // -- PARA MAS DE UNA --
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        uploadedImages.push({
          url: file.secure_url || file.path,
          public_id: file.public_id,
          fieldname: file.fieldname || "images",
        });
      });
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({ message: "No se subieron imágenes" });
    }
  } catch (err) {
    next(err);
  }
};

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
