// controllers/review.controller.js
const Review = require('../models/Review.model');
const Order = require('../models/Order.model');

exports.createReview = async (req, res, next) => {
  try {
    const { productId, comment } = req.body;

    const review = new Review({
      comment,
      author: req.user.id,
      product: productId
    });

    await review.save();
    res.status(201).json(review);
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