const express = require("express");
const router = express.Router();

const booksController = require("../controllers/book.controller");

/* BOOKS ROUTES */

router.get("", booksController.getBooks);
router.get("/:id", booksController.getBookById);
router.get("/search", booksController.searchBooks);
router.post("/", booksController.createBook);
router.delete("/:id", booksController.deleteBook);
router.patch("/:id", booksController.updateBook);

module.exports = router;
