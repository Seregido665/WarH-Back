const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const { cloudinary } = require('../config/cloudinary.config');
const mongoose = require('mongoose');

exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;
    let categoryId = category;
    
    if (!mongoose.Types.ObjectId.isValid(category)) {
      try {
        let cat = await Category.findOne({ name: category });
        if (!cat) {
          // -- CREA NUEVA CATEGORIA SI NO EXISTE --
          const slug = category.toLowerCase().replace(/\s+/g, '-');
          cat = await Category.create({ name: category, slug });
        }
        categoryId = cat._id;
      } catch (catErr) {
        return res.status(400).json({ message: 'Error processing category', error: catErr.message });
      }
    }

    const product = new Product({
      title,
      description,
      price,
      category: categoryId,
      seller: req.user.id,
    });

    if (req.files && Array.isArray(req.files)) {
      product.images = req.files.map(file => file.secure_url || file.path);
    }

    try {
      await product.save();
      const populated = await Product.findById(product._id)
        .populate('category', 'name slug')
        .populate('seller', 'name email avatar _id');
      res.status(201).json(populated);
    } catch (saveErr) {
      if (saveErr.name === 'ValidationError') {
        const errors = Object.keys(saveErr.errors).reduce((acc, key) => {
          acc[key] = saveErr.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({ message: 'Validation failed', errors });
      }
      return next(saveErr);
    }
  } catch (err) {
    next(err);
  }
};

exports.getUserProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const products = await Product.find({ seller: userId })
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar _id')
      .sort('-createdAt');

    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, status, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }
    
    if (!status || status === 'published') {
      query.status = 'published';
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar _id')
      .sort(sort)
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar _id')
      .populate('reviews');

    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // -- SOLO EL VENDEDOR --
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este producto' });
    }

    await product.deleteOne();
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // Solo el vendedor puede actualizar su producto
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este producto' });
    }

    // Actualizar datos básicos
    const { title, description, price, category } = req.body;
    
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    
    // Manejar la categoría
    if (category) {
      let categoryId = category;
      
      if (!mongoose.Types.ObjectId.isValid(category)) {
        try {
          let cat = await Category.findOne({ name: category });
          if (!cat) {
            const slug = category.toLowerCase().replace(/\s+/g, '-');
            cat = await Category.create({ name: category, slug });
          }
          categoryId = cat._id;
        } catch (catErr) {
          return res.status(400).json({ message: 'Error processing category', error: catErr.message });
        }
      }
      product.category = categoryId;
    }

    // -- REEMPLAZAR POR LAS NUEVAS IMÁGENES ---
    if (req.files && Array.isArray(req.files)) {      
      product.images = req.files.map(file => file.secure_url || file.path);
    }

    await product.save();
    
    const updatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar _id');

    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

// -- ACTUALIZAR STATUS --
exports.updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    product.status = status;
    const updatedProduct = await product.save();

    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar _id');

    res.json(populatedProduct);
  } catch (err) {
    next(err);
  }
};