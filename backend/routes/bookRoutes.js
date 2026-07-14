const express = require("express");

const {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


router.get("/", getAllBooks);

router.post("/", protect, adminOnly, createBook);

router.put("/:id", protect, adminOnly, updateBook);

router.delete("/:id", protect, adminOnly, deleteBook);


module.exports = router;