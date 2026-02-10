const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const categoryController = require("../controllers/category.controller");
const reviewController = require("../controllers/review.controller");
const favouriteController = require("../controllers/favourite.controller");
const orderController = require("../controllers/order.controller");
const uploadController = require("../controllers/upload.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { uploadMultiple, uploadAvatar } = require("../config/cloudinary.config");

/* AUTHENTICATION ROUTES */
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authenticateToken, authController.getProfile);
router.post("/refresh-token", authenticateToken, authController.refreshToken);
router.post("/verify-email/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.patch("/profile", authenticateToken, uploadAvatar.single("avatar"), authController.updateProfile);

/* UPLOAD ROUTES */
router.post("/upload", authenticateToken, uploadMultiple.single("avatar"), uploadController.uploadImages);
router.post("/upload/multiple", authenticateToken, uploadMultiple.array("images", 10), uploadController.uploadImages);
router.delete("/upload/image", authenticateToken, uploadController.deleteImage);

/* PRODUCT ROUTES */
router.get("/products", productController.getProducts);
router.get("/products/seller/mine", authenticateToken, productController.getUserProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", authenticateToken, uploadMultiple.array("images"), productController.createProduct);
router.patch("/products/:id/status", authenticateToken, productController.updateProductStatus);
router.patch("/products/:id", authenticateToken, uploadMultiple.array("images"), productController.updateProduct);
router.delete("/products/:id", authenticateToken, productController.deleteProduct);

/* CATEGORY ROUTES */
router.get("/categories", categoryController.getCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.post("/categories", authenticateToken, categoryController.createCategory);
router.patch("/categories/:id", authenticateToken, categoryController.updateCategory);
router.delete("/categories/:id", authenticateToken, categoryController.deleteCategory);

/* REVIEW ROUTES */
router.post("/reviews", authenticateToken, reviewController.createReview);
router.get("/products/:productId/reviews", reviewController.getReviewsByProduct);
router.delete("/reviews/:id", authenticateToken, reviewController.deleteReview);

/* FAVOURITE ROUTES */
router.post("/favourites", authenticateToken, favouriteController.toggleFavourite);
router.get("/favourites", authenticateToken, favouriteController.getMyFavourites);

/* ORDER ROUTES */
router.post("/orders", authenticateToken, orderController.createOrder);
router.get("/orders/seller", authenticateToken, orderController.getSellerOrders);
router.get("/orders", authenticateToken, orderController.getMyOrders);
router.patch("/orders/:id", authenticateToken, orderController.updateOrderStatus);

module.exports = router;
