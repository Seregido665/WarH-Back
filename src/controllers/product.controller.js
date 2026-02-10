// controllers/product.controller.js
const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const { cloudinary } = require('../config/cloudinary.config');
const mongoose = require('mongoose');

exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;

    // Basic validation to return user-friendly errors instead of 500
    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'title, description, price and category are required' });
    }

    // Handle category: if it's not a valid ObjectId, treat it as a category name and create/find it
    let categoryId = category;
    
    if (!mongoose.Types.ObjectId.isValid(category)) {
      // It's a category name, so create it or find if it already exists
      try {
        let cat = await Category.findOne({ name: category });
        if (!cat) {
          // Create new category with provided name
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

    // If files were uploaded, add them
    if (req.files && Array.isArray(req.files)) {
      product.images = req.files.map(file => file.secure_url || file.path);
    }

    try {
      await product.save();
      const populated = await Product.findById(product._id)
        .populate('category', 'name slug')
        .populate('seller', 'name email avatar _id');
      return res.status(201).json(populated);
    } catch (saveErr) {
      // Handle mongoose validation errors neatly
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
    // Get products created by the authenticated user
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
    
    // Filter by status if provided, otherwise default to 'published' (exclude archived)
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }
    
    // Always exclude archived products from default results
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
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

    // Solo el vendedor puede eliminar su producto
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este producto' });
    }

    // Opcional: borrar imágenes de Cloudinary aquí

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
    Object.assign(product, req.body);

    // Si se subieron nuevas imágenes, reemplazarlas
    if (req.files && Array.isArray(req.files)) {
      // Opcional: eliminar imágenes antiguas de Cloudinary
      // if (product.images && product.images.length > 0) {
      //   for (const imageUrl of product.images) {
      //     // Extraer public_id de la URL (ejemplo: https://res.cloudinary.com/.../image123)
      //     const publicId = imageUrl.split('/').pop().split('.')[0];
      //     await cloudinary.uploader.destroy(publicId);
      //   }
      // }
      
      product.images = req.files.map(file => file.secure_url || file.path);
    }

    const updatedProduct = await product.save();
    const populatedProduct = await updatedProduct
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar _id');

    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

// Update product status - anyone can update status (e.g., setting to sold after purchase)
exports.updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Anyone can update the product status
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