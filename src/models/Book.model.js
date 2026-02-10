const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
    },
    image: {
      type: String, // URL de la imagen en Cloudinary
      default: null,
    },
    imagePublicId: {
      type: String, // ID público de Cloudinary para poder eliminar la imagen
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id; // copiar _id en id
        delete ret._id; // eliminar _id
      },
    },
  },
);

module.exports = mongoose.model("Book", bookSchema);
