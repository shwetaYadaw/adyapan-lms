const express   = require("express");
const router    = express.Router();
const protect   = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createCourse,
  getCourses,
  getCourseById,
} = require("../controllers/courseController");

// Public
router.get("/",    getCourses);
router.get("/:id", getCourseById);

// Admin only
router.post("/", protect, adminOnly, createCourse);

module.exports = router;