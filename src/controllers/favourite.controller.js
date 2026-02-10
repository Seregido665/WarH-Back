// controllers/favourite.controller.js
const Favourite = require('../models/Favourite.model');

exports.toggleFavourite = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const existing = await Favourite.findOne({ user: req.user.id, product: productId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ message: 'Eliminado de favoritos', isFavourite: false });
    }

    const favourite = new Favourite({
      user: req.user.id,
      product: productId,
    });

    await favourite.save();
    res.status(201).json({ message: 'Añadido a favoritos', isFavourite: true });
  } catch (err) {
    next(err);
  }
};

exports.getMyFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ user: req.user.id })
      .populate('product', 'title price images status')
      .sort('-createdAt');

    res.json(favourites);
  } catch (err) {
    next(err);
  }
};