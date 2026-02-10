const express = require("express");
const router = express.Router();

const booksController = require("../controllers/book.controller");
const usersController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const librariesController = require("../controllers/library.controller");
const chatController = require("../controllers/chat.controller");
const messageController = require("../controllers/message.controller");
const { upload } = require("./cloudinary.config");
const {
  authenticateToken,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

/* AUTHENTICATION ROUTES */

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authenticateToken, authController.getProfile);
router.post("/refresh-token", authenticateToken, authController.refreshToken);

/* BOOKS ROUTES */
router.get("/books", authenticateToken, booksController.getBooks);
router.get("/books/search", authenticateToken, booksController.searchBooks);
router.get("/books/:id", booksController.getBookById);
router.post(
  "/books",
  authenticateToken,
  upload.single("image"), /// esto es lo mas importante de multer
  booksController.createBook,
);
router.delete("/books/:id", authenticateToken, booksController.deleteBook);
router.patch(
  "/books/:id",
  authenticateToken,
  upload.single("image"),
  booksController.updateBook,
);

/* USERS ROUTES (Legacy - mantener para compatibilidad) */

router.get("/users", authenticateToken, usersController.getUsers);
router.get("/users/:id", usersController.getUserById);

/* LIBRARIES ROUTES */

router.get("/libraries", librariesController.getLibraries);

/* CHATS ROUTES */
router.post("/chats", authenticateToken, chatController.createChat);
router.get("/chats/:id", authenticateToken, chatController.getChatById);

/* MESSAGES ROUTES */
router.post("/messages", authenticateToken, messageController.createMessage);

module.exports = router;
