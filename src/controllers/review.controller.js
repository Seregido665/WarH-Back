// controllers/review.controller.js
const Review = require('../models/Review.model');
const Order = require('../models/Order.model');

exports.createReview = async (req, res, next) => {
  try {
    const { productId, comment } = req.body;

    // -- MAXIMO 3 POR USUARIO EN UN MISMO PRODUCTO --
    const existingCount = await Review.countDocuments({ product: productId, author: req.user.id });
    if (existingCount >= 3) {
      return res.status(400).json({ message: 'Has alcanzado el límite de 3 reseñas por este producto' });
    }

    const review = new Review({
      comment,
      author: req.user.id,
      product: productId
    });

    await review.save();
    const populated = await Review.findById(review._id).populate('author', 'name');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByProduct = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('author', 'name')
      .sort('-createdAt');

    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

    // Solo el autor puede eliminar su reseña
    if (review.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reseña' });
    }

    await review.deleteOne();
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    next(err);
  }
};