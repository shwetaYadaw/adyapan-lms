const express   = require("express");
const router    = express.Router();
const protect   = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createLesson,
  getLessons,
  getLessonById,
} = require("../controllers/lessonController");

// Public
router.get("/single/:id",  getLessonById);
router.get("/:courseId",   getLessons);

// Admin only
router.post("/", protect, adminOnly, createLesson);

module.exports = router;