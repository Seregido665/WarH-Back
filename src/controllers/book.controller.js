const BookModel = require("../models/Book.model");
const UserModel = require("../models/User.model");
const { cloudinary } = require("../config/cloudinary.config");

module.exports.getBooks = (req, res, next) => {
  BookModel.find()
    .populate("user")
    .then((books) => {
      res.json(books);
    })
    .catch((err) => {
      console.log("entro", err);
      res.json(err);
    });
};

module.exports.searchBooks = (req, res, next) => {
  const authorQuery = req.query.author;

  BookModel.findOne({ author: authorQuery })
    .then((books) => {
      res.json(books);
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports.getBookById = (req, res, next) => {
  const id = req.params.id;

  BookModel.findById(id)
    .then((book) => {
      res.json(book);
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports.createBook = (req, res, next) => {
  const newBook = req.body;
  console.log("REQ.FILE", req.file);
  // Si se subió una imagen, agregar la URL y el public_id
  if (req.file) {
    newBook.image = req.file.path; // URL de Cloudinary
  }

  BookModel.create(newBook)
    .then((bookCreated) => {
      res
        .status(201)
        .json({ message: "Libro creado exitosamente", book: bookCreated });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error al crear libro", error: err.message });
    });
};

module.exports.deleteBook = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Obtener el libro para eliminar la imagen de Cloudinary
    const book = await BookModel.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }
    // Si el libro tiene una imagen, eliminarla de Cloudinary
    if (book.imagePublicId) {
      await cloudinary.uploader.destroy(book.imagePublicId);
    }

    // Eliminar el libro de la base de datos
    await BookModel.findByIdAndDelete(id);

    res.json({ message: "Libro eliminado exitosamente" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al eliminar libro", error: err.message });
  }
};

// Si el libro tiene imagen, eliminarla de Cloudinary
module.exports.updateBook = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Si se subió una nueva imagen
    if (req.file) {
      // Obtener el libro actual para eliminar la imagen anterior
      const currentBook = await BookModel.findById(id);

      // Si el libro tiene una imagen anterior, eliminarla de Cloudinary
      if (currentBook && currentBook.imagePublicId) {
        await cloudinary.uploader.destroy(currentBook.imagePublicId);
      }

      // Agregar la nueva imagen
      updates.image = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    const updatedBook = await BookModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    res.json({ message: "Libro actualizado exitosamente", book: updatedBook });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al actualizar libro", error: err.message });
  }
};

module.exports.updateBook = (req, res, next) => {
  const id = req.params.id;
  const updates = req.body;

  BookModel.findByIdAndUpdate(id, updates, { new: true })
    .then((updatedBook) => {
      res.json(updatedBook);
    })
    .catch((err) => {
      res.json(err);
    });
};
